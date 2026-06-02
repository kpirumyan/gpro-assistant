import fs from 'fs/promises';
import { createReadStream } from 'fs';
import * as readline from 'readline';
import { encode } from 'gpt-tokenizer';
import path from 'path';
import os from 'os';

const REPORTS_DIR_NAME = '.analytics-reports';

export interface ToolCall {
  name: string;
  args?: {
    SubagentId?: string;
    Subagents?: string | unknown[];
    Recipient?: string;
    [key: string]: unknown;
  };
}

export interface TranscriptMessage {
  type?: string;
  source?: string;
  content?: string;
  created_at?: string;
  tool_calls?: ToolCall[];
  [key: string]: unknown;
}

export interface SubagentInfo {
  id: string;
  name: string;
  stats?: SessionData;
}

export interface SessionData {
  chatName: string | null;
  sessionId: string;
  startedAt: string;
  completedAt: string;
  durationSec: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  stepsCount: number;
  userRequestsCount: number;
  modelResponsesCount: number;
  toolUsage: Record<string, number>;
  subagents: SubagentInfo[];
}

export function extractChatName(messages: TranscriptMessage[]): string | null {
  for (const msg of messages) {
    if (msg.type === 'USER_INPUT' && msg.content) {
      const match = msg.content.match(/Chat Name:\s*(.+)/i);
      if (match) {
        return match[1].trim();
      }
      
      const reqMatch = msg.content.match(/<USER_REQUEST>\s*([\s\S]*?)\s*<\/USER_REQUEST>/);
      if (reqMatch) {
         const firstLine = reqMatch[1].trim().split('\n')[0];
         return firstLine.length > 50 ? firstLine.substring(0, 47) + '...' : firstLine;
      }
    }
  }
  return null;
}

export function extractSubagents(messages: TranscriptMessage[]): SubagentInfo[] {
  const subagentMap = new Map<string, string>();
  let pendingSubagentNames: string[] = [];

  for (const msg of messages) {
    if (msg.type === 'PLANNER_RESPONSE' && msg.tool_calls) {
      for (const call of msg.tool_calls) {
        if (call.name === 'invoke_subagent' && call.args && call.args.Subagents) {
          try {
            const subagentsList = typeof call.args.Subagents === 'string' 
              ? JSON.parse(call.args.Subagents)
              : call.args.Subagents;
              
            if (Array.isArray(subagentsList)) {
              for (const s of subagentsList) {
                pendingSubagentNames.push(s.Role || s.TypeName || 'Unknown Role');
              }
            } else {
              pendingSubagentNames.push('Unknown Role');
            }
          } catch {
            pendingSubagentNames.push('Unknown Role');
          }
        } else if (call.name === 'send_message' && call.args && call.args.Recipient) {
          const recipientId = call.args.Recipient as string;
          if (!subagentMap.has(recipientId)) {
             subagentMap.set(recipientId, 'Unknown (Message Recipient)');
          }
        }
      }
    } else if (msg.type === 'INVOKE_SUBAGENT' && msg.content) {
      const regex = /"conversationId":\s*"([^"]+)"/g;
      let match;
      while ((match = regex.exec(msg.content)) !== null) {
        const id = match[1];
        const name = pendingSubagentNames.shift() || 'Unknown Role';
        if (!subagentMap.has(id)) {
          subagentMap.set(id, name);
        }
      }
      pendingSubagentNames = [];
    }
  }
  return Array.from(subagentMap.entries()).map(([id, name]) => ({ id, name }));
}

export function resolveTranscriptPath(arg: string): string {
  if (arg.includes('/') || arg.includes('\\') || arg.endsWith('.jsonl')) {
    return path.resolve(arg);
  }
  const brainPath = process.env.GEMINI_BRAIN_PATH || path.join(os.homedir(), '.gemini', 'antigravity', 'brain');
  return path.join(brainPath, arg, '.system_generated', 'logs', 'transcript.jsonl');
}

export async function analyzeSession(filePath: string, recursive = true, visited: Set<string> = new Set()): Promise<SessionData> {
  try {
    await fs.access(filePath);
  } catch {
    throw new Error(`Transcript file not found: ${filePath}`);
  }

  const sessionDir = path.dirname(path.dirname(path.dirname(filePath)));
  const sessionId = path.basename(sessionDir);
  
  visited.add(sessionId);

  let chatName: string | null = null;
  const subagentMap = new Map<string, string>();
  let pendingSubagentNames: string[] = [];

  let promptTokens = 0;
  let completionTokens = 0;
  let userRequestsCount = 0;
  let modelResponsesCount = 0;
  const toolUsage: Record<string, number> = {};

  let currentPromptTokens = 0;
  let stepsCount = 0;
  
  let startedAt = '';
  let completedAt = '';

  const fileStream = createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (line.trim().length === 0) continue;
    
    const msg: TranscriptMessage = JSON.parse(line);
    stepsCount++;
    
    if (!startedAt && msg.created_at) {
      startedAt = msg.created_at;
    }
    if (msg.created_at) {
      completedAt = msg.created_at;
    }

    if (!chatName && msg.type === 'USER_INPUT' && msg.content) {
      const match = msg.content.match(/Chat Name:\s*(.+)/i);
      if (match) {
        chatName = match[1].trim();
      } else {
        const reqMatch = msg.content.match(/<USER_REQUEST>\s*([\s\S]*?)\s*<\/USER_REQUEST>/);
        if (reqMatch) {
           const firstLine = reqMatch[1].trim().split('\n')[0];
           chatName = firstLine.length > 50 ? firstLine.substring(0, 47) + '...' : firstLine;
        }
      }
    }

    if (msg.type === 'PLANNER_RESPONSE' && msg.tool_calls) {
      for (const call of msg.tool_calls) {
        if (call.name === 'invoke_subagent' && call.args && call.args.Subagents) {
          try {
            const subagentsList = typeof call.args.Subagents === 'string' 
              ? JSON.parse(call.args.Subagents)
              : call.args.Subagents;
              
            if (Array.isArray(subagentsList)) {
              for (const s of subagentsList) {
                pendingSubagentNames.push(s.Role || s.TypeName || 'Unknown Role');
              }
            } else {
              pendingSubagentNames.push('Unknown Role');
            }
          } catch {
            pendingSubagentNames.push('Unknown Role');
          }
        } else if (call.name === 'send_message' && call.args && call.args.Recipient) {
          const recipientId = call.args.Recipient as string;
          if (!subagentMap.has(recipientId)) {
             subagentMap.set(recipientId, 'Unknown (Message Recipient)');
          }
        }
      }
    } else if (msg.type === 'INVOKE_SUBAGENT' && msg.content) {
      const regex = /"conversationId":\s*"([^"]+)"/g;
      let match;
      while ((match = regex.exec(msg.content)) !== null) {
        const id = match[1];
        const name = pendingSubagentNames.shift() || 'Unknown Role';
        if (!subagentMap.has(id)) {
          subagentMap.set(id, name);
        }
      }
      pendingSubagentNames = [];
    }

    if (msg.type === 'USER_INPUT') userRequestsCount++;
    if (msg.source === 'MODEL') modelResponsesCount++;
    
    if (msg.tool_calls) {
      for (const call of msg.tool_calls) {
        toolUsage[call.name] = (toolUsage[call.name] || 0) + 1;
      }
    }

    const msgText = JSON.stringify(msg);
    const tokens = encode(msgText).length;

    // Note: Accumulating promptTokens this way is a rough approximation of the context window size
    // during the conversation. It is not an exact API token billing logic.
    if (msg.source === 'MODEL') {
      completionTokens += tokens;
      promptTokens += currentPromptTokens;
      currentPromptTokens += tokens;
    } else {
      currentPromptTokens += tokens;
    }
  }

  if (stepsCount === 0) {
    throw new Error('Empty transcript');
  }

  if (!startedAt) startedAt = new Date().toISOString();
  if (!completedAt) completedAt = new Date().toISOString();

  const durationSec = Math.round((new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 1000);

  const subagents = Array.from(subagentMap.entries()).map(([id, name]) => ({ id, name }));

  const sessionData: SessionData = {
    chatName,
    sessionId,
    startedAt,
    completedAt,
    durationSec,
    promptTokens,
    completionTokens,
    totalTokens: promptTokens + completionTokens,
    stepsCount,
    userRequestsCount,
    modelResponsesCount,
    toolUsage,
    subagents
  };

  if (recursive && sessionData.subagents.length > 0) {
    const brainDir = path.dirname(sessionDir);
    for (const sub of sessionData.subagents) {
      if (visited.has(sub.id)) continue;
      
      try {
        const subPath = path.join(brainDir, sub.id, '.system_generated', 'logs', 'transcript.jsonl');
        const subData = await analyzeSession(subPath, true, visited);
        sub.stats = subData;
        
        sessionData.promptTokens += subData.promptTokens;
        sessionData.completionTokens += subData.completionTokens;
        sessionData.totalTokens += subData.totalTokens;
        sessionData.stepsCount += subData.stepsCount;
        sessionData.userRequestsCount += subData.userRequestsCount;
        sessionData.modelResponsesCount += subData.modelResponsesCount;
        
        for (const [tool, count] of Object.entries(subData.toolUsage)) {
          sessionData.toolUsage[tool] = (sessionData.toolUsage[tool] || 0) + count;
        }
      } catch (err: unknown) {
         if (typeof err === 'object' && err !== null && 'code' in err && (err as { code?: string }).code === 'ENOENT') {
            // ignore ENOENT
         } else {
           console.warn(`Warning: Could not analyze subagent ${sub.id}:`, err instanceof Error ? err.message : err);
         }
      }
    }
  }

  return sessionData;
}

export async function generateReport(sessionData: SessionData): Promise<string> {
  const toolsRows = Object.entries(sessionData.toolUsage)
    .sort((a, b) => b[1] - a[1])
    .map(([tool, count]) => `| ${tool} | ${count} |`)
    .join('\n');

  const subagentsList = sessionData.subagents.length > 0
    ? sessionData.subagents.map(s => {
        if (s.stats) {
          const toolsStr = Object.keys(s.stats.toolUsage).length > 0 
            ? Object.entries(s.stats.toolUsage).map(([t, c]) => `${t}: ${c}`).join(', ') 
            : 'None';
          return `- **${s.name}** (${s.id})\n  - Duration: ${s.stats.durationSec} seconds\n  - Tokens: Prompt: ${s.stats.promptTokens}, Completion: ${s.stats.completionTokens}, Total: ${s.stats.totalTokens}\n  - Turns: Total Steps: ${s.stats.stepsCount}, User Requests: ${s.stats.userRequestsCount}, Model Responses: ${s.stats.modelResponsesCount}\n  - Tools: ${toolsStr}`;
        } else {
          return `- ${s.name} (${s.id})`;
        }
      }).join('\n\n')
    : 'None';

  return `# Agent Session Analytics Report

## Summary
- **Chat Name:** ${sessionData.chatName || 'Unknown'}
- **Session ID:** ${sessionData.sessionId}
- **Started At:** ${sessionData.startedAt}
- **Completed At:** ${sessionData.completedAt}
- **Duration:** ${sessionData.durationSec} seconds

## Token Usage
- **Prompt Tokens:** ${sessionData.promptTokens}
- **Completion Tokens:** ${sessionData.completionTokens}
- **Total Tokens:** ${sessionData.totalTokens}

## Turn Statistics
- **Total Steps:** ${sessionData.stepsCount}
- **User Requests:** ${sessionData.userRequestsCount}
- **Model Responses:** ${sessionData.modelResponsesCount}

## Tools Usage
| Tool | Count |
|---|---|
${toolsRows || '| No tools used | 0 |'}

## Subagents Tree
${subagentsList}
`;
}

async function findLatestSession(): Promise<string> {
  const brainPath = process.env.GEMINI_BRAIN_PATH || path.join(os.homedir(), '.gemini', 'antigravity', 'brain');
  const dirs = await fs.readdir(brainPath, { withFileTypes: true });
  const sessions = dirs.filter(d => d.isDirectory());
  
  let latestDir = '';
  let maxTime = 0;

  for (const session of sessions) {
    const sessionPath = path.join(brainPath, session.name);
    try {
      const transcriptPath = path.join(sessionPath, '.system_generated', 'logs', 'transcript.jsonl');
      const stats = await fs.stat(transcriptPath);
      if (stats.mtimeMs > maxTime) {
        maxTime = stats.mtimeMs;
        latestDir = sessionPath;
      }
    } catch {
      // skip if no transcript.jsonl
    }
  }

  if (!latestDir) throw new Error('No sessions found');
  
  return path.join(latestDir, '.system_generated', 'logs', 'transcript.jsonl');
}

if (typeof process !== 'undefined' && require.main === module) {
  (async () => {
    try {
      const args = process.argv.slice(2);
      let targetPath = '';
      let outputFilenameOverride: string | null = null;

      for (let i = 0; i < args.length; i++) {
        if (args[i] === '--name' && i + 1 < args.length) {
          outputFilenameOverride = args[i + 1];
          i++;
        } else if (!args[i].startsWith('--')) {
          targetPath = args[i];
        }
      }

      if (!targetPath) {
        targetPath = await findLatestSession();
      } else {
        targetPath = resolveTranscriptPath(targetPath);
      }
      
      const sessionData = await analyzeSession(targetPath);
      
      const report = await generateReport(sessionData);
      
      const reportsDir = path.join(process.cwd(), REPORTS_DIR_NAME);
      await fs.mkdir(reportsDir, { recursive: true });
      
      let filename = `report-${sessionData.sessionId}.md`;
      if (outputFilenameOverride) {
        if (outputFilenameOverride.endsWith('.md')) {
          filename = outputFilenameOverride;
        } else {
          filename = `report-${outputFilenameOverride}.md`;
        }
      }
      const reportPath = path.join(reportsDir, filename);
      await fs.writeFile(reportPath, report, 'utf-8');
      
      console.log(`Report generated successfully at ${reportPath}`);
    } catch (err) {
      console.error('Error running analytics:', err instanceof Error ? err.message : err);
      process.exit(1);
    }
  })();
}
