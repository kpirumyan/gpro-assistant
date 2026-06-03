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
  ecosystemPromptTokens: number;
  ecosystemCompletionTokens: number;
  ecosystemTotalTokens: number;
  ecosystemStepsCount: number;
  ecosystemUserRequestsCount: number;
  ecosystemModelResponsesCount: number;
  ecosystemToolUsage: Record<string, number>;
  incomingMessages: Record<string, number>;
  ecosystemIncomingMessages: Record<string, number>;
}

export function getChatNameFromMessage(msg: TranscriptMessage): string | null {
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
  return null;
}

export function extractChatName(messages: TranscriptMessage[]): string | null {
  for (const msg of messages) {
    const name = getChatNameFromMessage(msg);
    if (name) return name;
  }
  return null;
}

export function processSubagentMessage(
  msg: TranscriptMessage, 
  subagentMap: Map<string, string>, 
  pendingSubagentNames: string[]
): void {
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
        const recipientId = (call.args.Recipient as string).replace(/^["']|["']$/g, '');
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
    pendingSubagentNames.length = 0;
  }
}

export function extractSubagents(messages: TranscriptMessage[]): SubagentInfo[] {
  const subagentMap = new Map<string, string>();
  const pendingSubagentNames: string[] = [];

  for (const msg of messages) {
    processSubagentMessage(msg, subagentMap, pendingSubagentNames);
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

export async function analyzeSession(filePath: string, recursive = true, visited: Set<string> = new Set(), isSubagent = false): Promise<SessionData> {
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
  const pendingSubagentNames: string[] = [];

  let promptTokens = 0;
  let completionTokens = 0;
  let userRequestsCount = 0;
  let modelResponsesCount = 0;
  const toolUsage: Record<string, number> = {};
  const incomingMessagesById: Record<string, number> = {};

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

    if (!chatName) {
      const name = getChatNameFromMessage(msg);
      if (name) {
        chatName = name;
      }
    }

    processSubagentMessage(msg, subagentMap, pendingSubagentNames);

    if (msg.type === 'USER_INPUT') {
      if (isSubagent) {
        incomingMessagesById['Main Agent'] = (incomingMessagesById['Main Agent'] || 0) + 1;
        if (!subagentMap.has('Main Agent')) {
          subagentMap.set('Main Agent', 'Main Agent');
        }
      } else {
        userRequestsCount++;
      }
    }
    if (msg.source === 'MODEL') modelResponsesCount++;
    if (msg.type === 'AGENT_MESSAGE' && msg.source) {
      incomingMessagesById[msg.source] = (incomingMessagesById[msg.source] || 0) + 1;
      if (!subagentMap.has(msg.source)) {
        subagentMap.set(msg.source, `Unknown (${msg.source})`);
      }
    }
    
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

  const incomingMessages: Record<string, number> = {};
  for (const [id, count] of Object.entries(incomingMessagesById)) {
    const name = subagentMap.get(id) || id;
    incomingMessages[name] = (incomingMessages[name] || 0) + count;
  }

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
    subagents,
    ecosystemPromptTokens: promptTokens,
    ecosystemCompletionTokens: completionTokens,
    ecosystemTotalTokens: promptTokens + completionTokens,
    ecosystemStepsCount: stepsCount,
    ecosystemUserRequestsCount: userRequestsCount,
    ecosystemModelResponsesCount: modelResponsesCount,
    ecosystemToolUsage: { ...toolUsage },
    incomingMessages,
    ecosystemIncomingMessages: { ...incomingMessages }
  };

  if (recursive && sessionData.subagents.length > 0) {
    const brainDir = path.dirname(sessionDir);
    for (const sub of sessionData.subagents) {
      if (visited.has(sub.id)) continue;
      
      try {
        const subPath = path.join(brainDir, sub.id, '.system_generated', 'logs', 'transcript.jsonl');
        const subData = await analyzeSession(subPath, true, visited, true);
        sub.stats = subData;
        
        sessionData.ecosystemPromptTokens += subData.ecosystemPromptTokens;
        sessionData.ecosystemCompletionTokens += subData.ecosystemCompletionTokens;
        sessionData.ecosystemTotalTokens += subData.ecosystemTotalTokens;
        sessionData.ecosystemStepsCount += subData.ecosystemStepsCount;
        sessionData.ecosystemUserRequestsCount += subData.ecosystemUserRequestsCount;
        sessionData.ecosystemModelResponsesCount += subData.ecosystemModelResponsesCount;
        
        for (const [tool, count] of Object.entries(subData.ecosystemToolUsage)) {
          sessionData.ecosystemToolUsage[tool] = (sessionData.ecosystemToolUsage[tool] || 0) + count;
        }

        for (const [sender, count] of Object.entries(subData.ecosystemIncomingMessages)) {
          sessionData.ecosystemIncomingMessages[sender] = (sessionData.ecosystemIncomingMessages[sender] || 0) + count;
        }
      } catch (err: unknown) {
         if (typeof err === 'object' && err !== null && 'code' in err && (err as { code?: string }).code === 'ENOENT') {
            // ignore ENOENT
         } else {
           console.error(`Warning: Could not analyze subagent ${sub.id}:`, err instanceof Error ? err.message : err);
         }
      }
    }
  }

  return sessionData;
}

function formatTokens(tokens: number): string {
  if (tokens >= 1000000) {
    return (tokens / 1000000).toFixed(2) + 'M';
  }
  if (tokens >= 1000) {
    return (tokens / 1000).toFixed(2) + 'K';
  }
  return tokens.toString();
}

export async function generateReport(sessionData: SessionData): Promise<string> {
  const toolsRows = Object.entries(sessionData.toolUsage)
    .sort((a, b) => b[1] - a[1])
    .map(([tool, count]) => `| ${tool} | ${count} |`)
    .join('\n');

  const ecoToolsRows = Object.entries(sessionData.ecosystemToolUsage)
    .sort((a, b) => b[1] - a[1])
    .map(([tool, count]) => `| ${tool} | ${count} |`)
    .join('\n');

  const incomingMsgsStr = Object.keys(sessionData.incomingMessages).length > 0 
    ? Object.entries(sessionData.incomingMessages).map(([s, c]) => `${s}: ${c}`).join(', ')
    : 'None';

  const ecoIncomingMsgsStr = Object.keys(sessionData.ecosystemIncomingMessages).length > 0 
    ? Object.entries(sessionData.ecosystemIncomingMessages).map(([s, c]) => `${s}: ${c}`).join(', ')
    : 'None';

  const subagentsList = sessionData.subagents.length > 0
    ? sessionData.subagents.map(s => {
        if (s.stats) {
          const toolsStr = Object.keys(s.stats.toolUsage).length > 0 
            ? Object.entries(s.stats.toolUsage).map(([t, c]) => `${t}: ${c}`).join(', ') 
            : 'None';
          const incomingMsgs = Object.keys(s.stats.incomingMessages).length > 0
            ? Object.entries(s.stats.incomingMessages).map(([sender, count]) => `${sender}: ${count}`).join(', ')
            : '';
          const incomingMsgsPart = incomingMsgs ? `, Incoming Messages: ${incomingMsgs}` : '';
          return `- **${s.name}** (${s.id})\n  - Duration: ${s.stats.durationSec} seconds\n  - Tokens: Prompt: ${formatTokens(s.stats.promptTokens)}, Completion: ${formatTokens(s.stats.completionTokens)}, Total: ${formatTokens(s.stats.totalTokens)}\n  - Turns: Total Steps: ${s.stats.stepsCount}, User Requests: ${s.stats.userRequestsCount}, Model Responses: ${s.stats.modelResponsesCount}${incomingMsgsPart}\n  - Tools: ${toolsStr}`;
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
- **Prompt Tokens:** ${formatTokens(sessionData.promptTokens)} (Main Agent) / ${formatTokens(sessionData.ecosystemPromptTokens)} (Ecosystem Total)
- **Completion Tokens:** ${formatTokens(sessionData.completionTokens)} (Main Agent) / ${formatTokens(sessionData.ecosystemCompletionTokens)} (Ecosystem Total)
- **Total Tokens:** ${formatTokens(sessionData.totalTokens)} (Main Agent) / ${formatTokens(sessionData.ecosystemTotalTokens)} (Ecosystem Total)

## Turn Statistics
**(Main Agent)**
- **Total Steps:** ${sessionData.stepsCount}
- **User Requests:** ${sessionData.userRequestsCount}
- **Model Responses:** ${sessionData.modelResponsesCount}
- **Incoming Messages:** ${incomingMsgsStr}

**(Ecosystem Total)**
- **Total Steps:** ${sessionData.ecosystemStepsCount}
- **User Requests:** ${sessionData.ecosystemUserRequestsCount}
- **Model Responses:** ${sessionData.ecosystemModelResponsesCount}
- **Incoming Messages:** ${ecoIncomingMsgsStr}

## Tools Usage (Main Agent)
| Tool | Count |
|---|---|
${toolsRows || '| No tools used | 0 |'}

## Tools Usage (Ecosystem Total)
| Tool | Count |
|---|---|
${ecoToolsRows || '| No tools used | 0 |'}

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
