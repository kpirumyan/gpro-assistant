import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
import 'dotenv/config';

// Load .env.local manually if dotenv/config didn't pick it up
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
}

interface RagResponse {
  status: 'success' | 'error' | 'unreachable';
  answer?: string;
  errorDetails?: string;
  sessionId?: string;
}

const SESSION_FILE = path.resolve(process.cwd(), '.agents/rag-sessions/web-guidance.json');

function exitWithJson(data: RagResponse) {
  console.log(JSON.stringify(data, null, 2));
  if (data.status !== 'success') {
    process.exitCode = 1;
  }
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
  const slug = process.env.ANYTHINGLLM_WEB_WORKSPACE_SLUG;

  if (!apiKey || !baseUrl || !slug) {
    return exitWithJson({
      status: 'error',
      errorDetails: 'Missing environment variables: ANYTHINGLLM_API_KEY, ANYTHINGLLM_BASE_URL, ANYTHINGLLM_WEB_WORKSPACE_SLUG'
    });
  }

  // Handle session (threadSlug)
  let sessionId: string | undefined;

  // Ensure directory exists
  const sessionDir = path.dirname(SESSION_FILE);
  if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
  }

  if (isNew) {
    sessionId = `rag-session-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    fs.writeFileSync(SESSION_FILE, JSON.stringify({ sessionId }));
  } else {
    if (fs.existsSync(SESSION_FILE)) {
      try {
        const sessionData = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'));
        sessionId = sessionData.sessionId;
      } catch {
        // Ignore parse errors
      }
    }
    
    // If no session existed, create one
    if (!sessionId) {
      sessionId = `rag-session-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      fs.writeFileSync(SESSION_FILE, JSON.stringify({ sessionId }));
    }
  }

  // Check if workspace has documents
  try {
    const checkUrl = `${baseUrl.replace(/\/$/, '')}/api/v1/workspace/${slug}`;
    const checkResponse = await fetch(checkUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!checkResponse.ok) {
      return exitWithJson({
        status: 'error',
        errorDetails: `Failed to verify workspace "${slug}". API returned HTTP ${checkResponse.status}`
      });
    }

    const wsData = await checkResponse.json();
    const documents = wsData.workspace?.[0]?.documents;

    if (!documents || documents.length === 0) {
      return exitWithJson({
        status: 'error',
        errorDetails: `CRITICAL ERROR: Workspace "${slug}" has 0 documents! The RAG database is empty. Please upload the documentation files to AnythingLLM.`
      });
    }
  } catch (error: unknown) {
    const err = error as Error;
    return exitWithJson({
      status: 'unreachable',
      errorDetails: `Failed to connect to AnythingLLM to verify workspace documents: ${err.message || String(error)}`
    });
  }

  const url = `${baseUrl.replace(/\/$/, '')}/api/v1/workspace/${slug}/chat`;
  const bodyPayload: Record<string, string> = {
    message: query,
    mode: 'chat',
  };

  if (sessionId) {
    bodyPayload.sessionId = sessionId;
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
    exitWithJson({
      status: 'success',
      answer,
      sessionId
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
