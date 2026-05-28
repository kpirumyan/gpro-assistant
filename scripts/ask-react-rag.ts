import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

// Load .env.local manually if dotenv/config didn't pick it up
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  import('dotenv').then(dotenv => dotenv.config({ path: envLocalPath }));
}

interface RagResponse {
  status: 'success' | 'error' | 'unreachable';
  answer?: string;
  errorDetails?: string;
  threadSlug?: string;
}

const SESSION_FILE = path.resolve(process.cwd(), '.agents/rag-sessions/react.json');

function exitWithJson(data: RagResponse) {
  console.log(JSON.stringify(data, null, 2));
  process.exit(data.status === 'success' ? 0 : 1);
}

async function main() {
  const args = process.argv.slice(2);
  const isNew = args.includes('--new');
  const query = args.filter((a) => a !== '--new').join(' ');

  if (!query) {
    return exitWithJson({ status: 'error', errorDetails: 'No query provided' });
  }

  const apiKey = process.env.ANYTHINGLLM_API_KEY;
  const baseUrl = process.env.ANYTHINGLLM_BASE_URL;
  const slug = process.env.ANYTHINGLLM_WORKSPACE_SLUG;

  if (!apiKey || !baseUrl || !slug) {
    return exitWithJson({
      status: 'error',
      errorDetails: 'Missing environment variables: ANYTHINGLLM_API_KEY, ANYTHINGLLM_BASE_URL, ANYTHINGLLM_WORKSPACE_SLUG'
    });
  }

  // Handle session (threadSlug)
  let threadSlug: string | undefined;

  // Ensure directory exists
  const sessionDir = path.dirname(SESSION_FILE);
  if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
  }

  if (isNew) {
    if (fs.existsSync(SESSION_FILE)) {
      fs.unlinkSync(SESSION_FILE);
    }
  } else if (fs.existsSync(SESSION_FILE)) {
    try {
      const sessionData = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'));
      threadSlug = sessionData.threadSlug;
    } catch {
      // Ignore parse errors, just start a new thread
    }
  }

  const url = `${baseUrl.replace(/\/$/, '')}/api/v1/workspace/${slug}/chat`;
  const bodyPayload: Record<string, string> = {
    message: query,
    mode: 'chat',
  };

  if (threadSlug) {
    bodyPayload.threadSlug = threadSlug;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bodyPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      return exitWithJson({
        status: 'error',
        errorDetails: `HTTP ${response.status}: ${errorText}`
      });
    }

    const data = await response.json();
    const answer = data.textResponse;

    // Save the thread string if we got one so conversation continues
    if (data.chatId || data.id) {
        // AnythingLLM returns a chat structure, sometimes the threadSlug is returned inside a thread object
    }
    // AnythingLLM usually uses the same thread or returns thread info.
    // If it returns a thread identifier, we'd save it here.
    // Let's inspect the response thread structure.
    
    exitWithJson({
      status: 'success',
      answer,
      threadSlug // Just echoing back what we sent, since anythingllm API auto-resolves thread by slug
    });

  } catch (error: unknown) {
    const err = error as Error;
    return exitWithJson({
      status: 'unreachable',
      errorDetails: err.message || String(error)
    });
  }
}

main();
