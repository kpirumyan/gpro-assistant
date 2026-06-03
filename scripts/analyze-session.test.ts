import { describe, it, expect, vi } from 'vitest';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import fs from 'fs/promises';

let mockParentContent = '';
let mockSubagentContent = '';

vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs')>();
  const { Readable } = await import('stream');
  const mocked = {
    ...actual,
    createReadStream: (p: unknown, options: unknown) => {
      if (typeof p === 'string' && p.includes('parent-session')) {
        return Readable.from([mockParentContent]);
      }
      if (typeof p === 'string' && p.includes('sub-123')) {
        return Readable.from([mockSubagentContent]);
      }
      return actual.createReadStream(p as import('fs').PathLike, options as Parameters<typeof import('fs').createReadStream>[1]);
    }
  };
  return {
    ...mocked,
    default: mocked
  };
});

vi.mock('fs/promises', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs/promises')>();
  const mocked = {
    ...actual,
    access: async (p: unknown, mode: unknown) => {
      if (typeof p === 'string' && (p.includes('parent-session') || p.includes('sub-123'))) {
        return;
      }
      return actual.access(p as import('fs').PathLike, mode as number);
    }
  };
  return {
    ...mocked,
    default: mocked
  };
});

import { 
  analyzeSession, 
  extractChatName, 
  extractSubagents,
  resolveTranscriptPath,
  generateReport,
  SessionData
} from './analyze-session';

describe('Agent Session Analytics Script', () => {
  const fixturePath = path.join(__dirname, '__fixtures__', 'mock-transcript.jsonl');

  describe('resolveTranscriptPath', () => {
    it('should build an absolute path if only a session ID is provided', () => {
      const originalEnv = process.env.GEMINI_BRAIN_PATH;
      process.env.GEMINI_BRAIN_PATH = '/mock/brain';
      try {
        const result = resolveTranscriptPath('1234-5678');
        expect(result).toBe(path.join('/mock/brain', '1234-5678', '.system_generated', 'logs', 'transcript.jsonl'));
      } finally {
        process.env.GEMINI_BRAIN_PATH = originalEnv;
      }
    });

    it('should resolve to absolute path if a filename or path with separators is provided', () => {
      const result1 = resolveTranscriptPath('transcript.jsonl');
      expect(result1).toBe(path.resolve('transcript.jsonl'));

      const result2 = resolveTranscriptPath('./some/path/file.jsonl');
      expect(result2).toBe(path.resolve('./some/path/file.jsonl'));
    });
  });

  describe('analyzeSession', () => {
    it('should correctly parse the transcript and return aggregated session data', async () => {
      const data = await analyzeSession(fixturePath);
      
      // Token calculations
      expect(data.promptTokens).toMatchSnapshot();
      expect(data.completionTokens).toMatchSnapshot();
      expect(data.totalTokens).toBe(data.promptTokens + data.completionTokens);

      // Step counts
      expect(data.stepsCount).toBe(53); // 0 to 52
      expect(data.userRequestsCount).toBe(1);
      expect(data.modelResponsesCount).toBe(26);
      
      // Tool counts
      expect(data.toolUsage).toBeDefined();
      expect(data.toolUsage['view_file']).toBe(24);
      expect(data.toolUsage['invoke_subagent']).toBe(1);
      expect(data.toolUsage['grep_search']).toBe(1);

      // Subagent extraction should return SubagentInfo objects
      expect(data.subagents).toContainEqual({ id: 'subagent-999', name: 'Reviewer' });
      
      // Chat name extraction
      expect(data.chatName).toBe('Optimize Database Schema');

      // Ecosystem stats (since subagent stats failed to load, they equal base stats)
      expect(data.ecosystemPromptTokens).toBe(data.promptTokens);
      expect(data.ecosystemCompletionTokens).toBe(data.completionTokens);
      expect(data.ecosystemTotalTokens).toBe(data.totalTokens);
      expect(data.ecosystemStepsCount).toBe(data.stepsCount);
      expect(data.ecosystemUserRequestsCount).toBe(data.userRequestsCount);
      expect(data.ecosystemModelResponsesCount).toBe(data.modelResponsesCount);
      expect(data.ecosystemToolUsage).toEqual(data.toolUsage);
      expect(data.incomingMessages).toBeDefined();
      expect(data.ecosystemIncomingMessages).toBeDefined();
    });

    it('should throw an error if the transcript file does not exist', async () => {
      await expect(analyzeSession('non-existent-path.jsonl')).rejects.toThrow();
    });

    it('should not aggregate subagent stats into parent base stats, but should aggregate into ecosystem stats, sanitize recipientId, and parse incoming messages', async () => {
      const parentPath = path.resolve('/mock/brain/parent-session/.system_generated/logs/transcript.jsonl');

      mockParentContent = [
        JSON.stringify({ type: 'USER_INPUT', source: 'USER', content: 'Chat Name: Parent Session\nGo', created_at: '2026-06-03T10:00:00Z' }),
        JSON.stringify({ type: 'PLANNER_RESPONSE', source: 'MODEL', tool_calls: [{ name: 'invoke_subagent', args: { Subagents: JSON.stringify([{ Role: 'Coder' }]) } }], created_at: '2026-06-03T10:01:00Z' }),
        JSON.stringify({ type: 'INVOKE_SUBAGENT', source: 'SYSTEM', content: '{"conversationId":"sub-123"}', created_at: '2026-06-03T10:01:05Z' }),
        // Send message with quotes in recipientId to test sanitization
        JSON.stringify({ type: 'PLANNER_RESPONSE', source: 'MODEL', tool_calls: [{ name: 'send_message', args: { Recipient: '"sub-123"' } }], created_at: '2026-06-03T10:01:10Z' }),
        JSON.stringify({ type: 'PLANNER_RESPONSE', source: 'MODEL', tool_calls: [{ name: 'send_message', args: { Recipient: "\'sub-123\'" } }], created_at: '2026-06-03T10:01:12Z' }),
        // Incoming messages from sub-123 (known) and sub-999 (unknown)
        JSON.stringify({ type: 'AGENT_MESSAGE', source: 'sub-123', content: 'Hello parent', created_at: '2026-06-03T10:02:00Z' }),
        JSON.stringify({ type: 'AGENT_MESSAGE', source: 'sub-999', content: 'Hello stranger', created_at: '2026-06-03T10:02:05Z' })
      ].join('\n');

      mockSubagentContent = [
        JSON.stringify({ type: 'USER_INPUT', source: 'USER', content: 'Chat Name: Sub Session\nWork', created_at: '2026-06-03T10:01:15Z' }),
        JSON.stringify({ type: 'PLANNER_RESPONSE', source: 'MODEL', tool_calls: [{ name: 'write_to_file', args: {} }], created_at: '2026-06-03T10:01:20Z' }),
        JSON.stringify({ type: 'AGENT_MESSAGE', source: 'parent-session', content: 'Sub incoming', created_at: '2026-06-03T10:01:25Z' })
      ].join('\n');

      try {
        const data = await analyzeSession(parentPath, true);

        // Verify base stats contain ONLY parent stats (do NOT aggregate subagent stats)
        expect(data.stepsCount).toBe(7);
        expect(data.userRequestsCount).toBe(1);
        expect(data.modelResponsesCount).toBe(3);

        // Verify ecosystem stats DO aggregate subagent stats
        expect(data.ecosystemStepsCount).toBe(10); // 7 parent + 3 sub
        expect(data.ecosystemUserRequestsCount).toBe(1); // 1 parent (subagent USER_INPUT is converted to incoming message)
        expect(data.ecosystemModelResponsesCount).toBe(4); // 3 parent + 1 sub

        // Verify subagent info has stats populated and NOT aggregated to parent's base
        expect(data.subagents).toHaveLength(2); // sub-123 and sub-999 (from unknown send_message or agent messages)
        const sub123 = data.subagents.find(s => s.id === 'sub-123');
        expect(sub123).toBeDefined();
        expect(sub123?.name).toBe('Coder');
        expect(sub123?.stats).toBeDefined();
        expect(sub123?.stats?.stepsCount).toBe(3);

        // Verify sanitization: no duplicate subagent with quotes in name/ID should be present
        const duplicateSub = data.subagents.find(s => s.id.includes('"') || s.id.includes("\'"));
        expect(duplicateSub).toBeUndefined();

        // Verify incoming messages parsing & grouping in base parent stats
        expect(data.incomingMessages).toBeDefined();
        expect(data.incomingMessages['Coder']).toBe(1);
        
        const unknownKeys = Object.keys(data.incomingMessages).filter(k => k !== 'Coder');
        expect(unknownKeys.length).toBe(1);
        expect(data.incomingMessages[unknownKeys[0]]).toBe(1);

        // Verify incoming messages aggregation in ecosystem stats
        expect(data.ecosystemIncomingMessages).toBeDefined();
        expect(data.ecosystemIncomingMessages['Coder']).toBe(1);
        expect(data.ecosystemIncomingMessages[unknownKeys[0]]).toBe(1);
        
        // The subagent's incoming message from parent-session should be aggregated
        const parentSessionKey = Object.keys(data.ecosystemIncomingMessages).find(k => k.includes('parent-session') || k.includes('Unknown'));
        expect(parentSessionKey).toBeDefined();
        
        // Subagent's USER_INPUT is logged as incoming message from Main Agent
        expect(data.ecosystemIncomingMessages['Main Agent']).toBe(1);

      } finally {
        mockParentContent = '';
        mockSubagentContent = '';
      }
    });
  });

  describe('extractChatName', () => {
    it('should extract chat name from system or explicit user messages', () => {
      const messages = [
        { type: 'USER_INPUT', content: 'Chat Name: Feature X\nUser request: Implement X' }
      ];
      expect(extractChatName(messages)).toBe('Feature X');
    });

    it('should extract chat name ignoring extra spaces', () => {
      const messages = [
        { type: 'USER_INPUT', content: 'Chat Name:    Bugfix Y  \nSome other text' }
      ];
      expect(extractChatName(messages)).toBe('Bugfix Y');
    });

    it('should return null if chat name is not found', () => {
      const messages = [
        { type: 'USER_INPUT', content: 'User request: Implement X' }
      ];
      expect(extractChatName(messages)).toBeNull();
    });
  });

  describe('extractSubagents', () => {
    it('should extract subagents combining tool calls and INVOKE_SUBAGENT messages', () => {
      const messages = [
        { 
          type: 'PLANNER_RESPONSE', 
          tool_calls: [{ 
            name: 'invoke_subagent', 
            args: { Subagents: JSON.stringify([{ Role: 'Reviewer' }]) } 
          }]
        },
        {
          type: 'INVOKE_SUBAGENT',
          content: '{"conversationId":"sub-123"}'
        },
        { 
          type: 'PLANNER_RESPONSE', 
          tool_calls: [{ 
            name: 'send_message', 
            args: { Recipient: 'sub-456' } 
          }]
        }
      ];
      const subagents = extractSubagents(messages);
      expect(subagents).toContainEqual({ id: 'sub-123', name: 'Reviewer' });
      expect(subagents).toContainEqual({ id: 'sub-456', name: 'Unknown (Message Recipient)' });
    });

    it('should handle fallback if subagent name cannot be parsed', () => {
      const messages = [
        { 
          type: 'PLANNER_RESPONSE', 
          tool_calls: [{ 
            name: 'invoke_subagent', 
            args: { Subagents: 'invalid-json' } 
          }]
        },
        {
          type: 'INVOKE_SUBAGENT',
          content: '{"conversationId":"sub-789"}'
        }
      ];
      const subagents = extractSubagents(messages);
      expect(subagents).toContainEqual({ id: 'sub-789', name: 'Unknown Role' });
    });

    it('should return an empty array if no subagents were invoked', () => {
      const messages = [
        { 
          type: 'PLANNER_RESPONSE', 
          tool_calls: [{ name: 'grep_search', args: { Query: 'function' } }]
        }
      ];
      const subagents = extractSubagents(messages);
      expect(subagents).toEqual([]);
    });

    it('should deduplicate subagent IDs', () => {
      const messages = [
        { 
          type: 'PLANNER_RESPONSE', 
          tool_calls: [{ name: 'send_message', args: { Recipient: 'sub-111' } }]
        },
        { 
          type: 'PLANNER_RESPONSE', 
          tool_calls: [{ name: 'send_message', args: { Recipient: 'sub-111' } }]
        }
      ];
      const subagents = extractSubagents(messages);
      expect(subagents).toEqual([{ id: 'sub-111', name: 'Unknown (Message Recipient)' }]);
    });

    it('should sanitize recipientId in send_message tool calls (strip single and double quotes)', () => {
      const messages = [
        { 
          type: 'PLANNER_RESPONSE', 
          tool_calls: [{ 
            name: 'send_message', 
            args: { Recipient: '"sub-123"' } 
          }]
        },
        { 
          type: 'PLANNER_RESPONSE', 
          tool_calls: [{ 
            name: 'send_message', 
            args: { Recipient: "'sub-456'" } 
          }]
        }
      ];
      const subagents = extractSubagents(messages);
      expect(subagents).toContainEqual({ id: 'sub-123', name: 'Unknown (Message Recipient)' });
      expect(subagents).toContainEqual({ id: 'sub-456', name: 'Unknown (Message Recipient)' });
    });
  });

  describe('generateReport', () => {
    it('should include detailed subagent statistics when sub.stats is available', async () => {
      const mockSessionData = {
        chatName: 'Test Chat',
        sessionId: 'test-session',
        startedAt: '2026-06-02T10:00:00.000Z',
        completedAt: '2026-06-02T10:05:00.000Z',
        durationSec: 300,
        promptTokens: 100,
        completionTokens: 50,
        totalTokens: 150,
        stepsCount: 10,
        userRequestsCount: 2,
        modelResponsesCount: 8,
        toolUsage: {},
        ecosystemPromptTokens: 1100,
        ecosystemCompletionTokens: 550,
        ecosystemTotalTokens: 1650,
        ecosystemStepsCount: 20,
        ecosystemUserRequestsCount: 4,
        ecosystemModelResponsesCount: 16,
        ecosystemToolUsage: { 'write_to_file': 5, 'view_file': 3 },
        incomingMessages: { 'Reviewer': 1 },
        ecosystemIncomingMessages: { 'Reviewer': 1 },
        subagents: [
          {
            id: 'sub-1',
            name: 'Coder',
            // testing new feature
            stats: {
              durationSec: 120,
              promptTokens: 1000,
              completionTokens: 500,
              totalTokens: 1500,
              stepsCount: 10,
              userRequestsCount: 2,
              modelResponsesCount: 8,
              toolUsage: { 'write_to_file': 5, 'view_file': 3 },
              ecosystemPromptTokens: 1000,
              ecosystemCompletionTokens: 500,
              ecosystemTotalTokens: 1500,
              ecosystemStepsCount: 10,
              ecosystemUserRequestsCount: 2,
              ecosystemModelResponsesCount: 8,
              ecosystemToolUsage: { 'write_to_file': 5, 'view_file': 3 },
              incomingMessages: {},
              ecosystemIncomingMessages: {},
            }
          },
          {
             id: 'sub-2',
             name: 'Reviewer'
             // no stats available
          }
        ]
      } as SessionData;

      const report = await generateReport(mockSessionData);
      
      // Should include detailed stats for sub-1
      expect(report).toMatch(/Duration:\s*120\s*seconds/);
      expect(report).toMatch(/Prompt:\s*1.00K,\s*Completion:\s*500,\s*Total:\s*1.50K/);
      expect(report).toContain('write_to_file');
      
      // Should include fallback for sub-2
      expect(report).toContain('- Reviewer (sub-2)');
    });
  });

  describe('CLI Execution', () => {
    const execPromise = util.promisify(exec);

    it('should override the output filename instead of chatName when --name is used', async () => {
      const overrideName = `test-override-${Date.now()}`;
      const reportsDir = path.join(process.cwd(), '.analytics-reports');
      
      // Execute the script using tsx
      await execPromise(`npx tsx scripts/analyze-session.ts ${fixturePath} --name ${overrideName}`);
      
      // The output filename should be either 'override-name.md' or 'report-override-name.md'
      // according to the plan
      const files = await fs.readdir(reportsDir);
      const createdFile = files.find((f: string) => f.includes(overrideName) && f.endsWith('.md'));
      
      expect(createdFile).toBeDefined();
      
      if (createdFile) {
        const filePath = path.join(reportsDir, createdFile);
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          
          // The chat name inside the file should remain the original one (Optimize Database Schema)
          // rather than being replaced by overrideName.
          expect(content).toContain('**Chat Name:** Optimize Database Schema');
          expect(content).not.toContain(`**Chat Name:** ${overrideName}`);
        } finally {
          // Cleanup
          await fs.unlink(filePath);
        }
      }
    }, 15000);
  });
});
