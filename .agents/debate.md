# `/debate` Command Execution Guide

When the user triggers the `/debate` command, you MUST execute an automated debate between two subagents (Reviewer and Coder) following this exact workflow:

## 1. Preparation
1. Parse the user's prompt to identify the **Topic** and the **Number of Iterations** (N). If N is not specified, use N = 5.
2. Use the `define_subagent` tool to create two subagents (set `enable_write_tools: true`, `enable_subagent_tools: false`, and `enable_mcp_tools: false`):
   - **reviewer_agent**: "You are the Reviewer. You strictly criticize the provided code or architectural decision, finding flaws, bugs, and UX issues. You are operating in `/ask` mode: you MUST NOT write code, modify files, run modifying terminal commands, or create commits. You have access to terminal tools solely for using RAG librarians if you need to consult documentation (read `.agents/skills/rag-for-react-next-docs.md` for instructions on how to use them). I am your boss (the Chief Architect). Reply in the same language as the provided topic prompt."
   - **coder_agent**: "You are the Coder. You wrote this code/decision. You must defend your technical choices against the Reviewer's critiques. You are operating in `/ask` mode: you MUST NOT write code, modify files, run modifying terminal commands, or create commits. You have access to terminal tools solely for using RAG librarians if you need to consult documentation (read `.agents/skills/rag-for-react-next-docs.md` for instructions on how to use them). I am your boss (the Chief Architect). Reply in the same language as the provided topic prompt."
3. Use the `invoke_subagent` tool to start both subagents. Provide the Reviewer with the initial topic/code to analyze, and tell the Coder to wait for the first critique. **CRITICAL RULE**: The Reviewer MUST always be the first one to speak and initiate the debate.

## 2. Facilitation (The Loop)
For exactly N iterations (1 iteration = Reviewer critique + Coder defense), do the following:
1. Wait for the Reviewer's message.
2. **Stream to Chat**: Output the Reviewer's message to the user immediately in the chat.
3. Use `send_message` to forward the Reviewer's critique to the Coder.
4. Wait for the Coder's message.
5. **Stream to Chat**: Output the Coder's message to the user immediately in the chat.
6. Use `send_message` to forward the Coder's defense back to the Reviewer (unless it is the final iteration).

*CRITICAL*: You must yield your turn and let the system wake you up when a subagent replies. Output each reply to the user as soon as it arrives to create a live streaming experience. Do not simulate the debate yourself.

## 3. Final Verdict
Once all N iterations are complete:
1. Use the `manage_subagents` tool to kill the subagents (`Action: "kill_all"`).
2. Assume the persona of the **Chief Architect** and **Judge**. You are operating in `/ask` mode and must not modify code. You may also consult RAG librarians before making your decision if necessary (see `.agents/skills/rag-for-react-next-docs.md`).
3. Output your final verdict in the chat in the same language as the topic prompt. Summarize the technical merits of both sides and make a final, authoritative architectural decision based on the application's context (e.g., Next.js App Router, SSG, performance, etc.).