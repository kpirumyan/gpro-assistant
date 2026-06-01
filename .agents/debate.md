# Debate Execution Guide

This guide defines how automated debates between subagents must be executed.
There are two execution modes:
1. **Live Mode**: Triggered by the user via the `/debate` command. The debate is streamed directly to the chat.
2. **Silent Mode**: Triggered automatically by the Orchestrator during background tasks to resolve architectural or technical disagreements without interrupting the user.

<debate_workflow>
  <phase name="Preparation">
    1. Parse the prompt or current context to identify the **Topic**, the **Number of Iterations** (N), and the **Roles** of the two participants. If N is not specified, use N = 5. If Roles are not specified, default to `Reviewer` and `Coder`.
    2. Read the corresponding role definitions from `.agents/roles/<RoleName>.md` (e.g., `.agents/roles/reviewer.md` and `.agents/roles/coder.md`).
    3. Use the `define_subagent` tool to create the two subagents. Set `enable_write_tools: true` (to allow them to run RAG commands if their role permits it), `enable_subagent_tools: false`, and `enable_mcp_tools: false`. Give them names corresponding to their roles (e.g., `agent_1` and `agent_2`).
    4. **System Prompt for each agent**:
       - Inject the full contents of their specific `.agents/roles/<RoleName>.md` file so they fully adopt their persona.
       - Append the following debate context: "You are participating in a technical debate. You must defend your choices or critique the opponent's choices strictly from the perspective of your role.
       
       <rule id="universal_debate_rule" severity="CRITICAL">
       1. **Objective Truth**: You MUST NOT dispute established facts (e.g., official documentation, language syntax, clear logic, or existing codebase). If the opponent cites an indisputable fact, you MUST acknowledge the fact itself. However, you are completely free to argue against *how* that fact applies to the current architectural problem. Do not invent absurd edge cases or deny reality to keep the argument going.
       2. **Constructive Agreement**: If the opponent finds a real bug or proves a critical flaw in your logic, you must acknowledge it and concede that specific point rather than defending a bad decision 'on principle'.

       **Mode Restriction**: You are operating in a discussion-only mode. Your ONLY goal is to debate and argue your position. You have access to terminal tools ONLY to run RAG commands (`npm run ask-next-rag` / `npm run ask-react-rag`) if your role permits it to verify facts. You MUST NOT attempt to write code, modify source files, run modifying terminal commands, or create commits.
       </rule>

       Reply in the same language as the provided topic prompt."

    5. Use the `invoke_subagent` tool to start both subagents. Provide Agent 1 with the initial topic/code to analyze, and tell Agent 2 to wait for the first critique/argument. **CRITICAL RULE**: Agent 1 MUST always be the first one to speak and initiate the debate.
  </phase>

  <phase name="Facilitation">
    For exactly N iterations (1 iteration = Agent 1 message + Agent 2 message), do the following:
    1. Wait for Agent 1's message.
    2. **Handling Output**:
       - **Live Mode (`/debate`)**: Stream Agent 1's message to the user immediately in the chat.
       - **Silent Mode**: Do NOT output to chat. Save the message in memory for the final summary.
    3. **Active Observer (Fact-Check Intervention)**: Before forwarding the message to Agent 2, analyze it against the *Safe Intervention Boundaries*:
       - If the agent is stubbornly denying an indisputable fact (e.g., direct quote from documentation or codebase), you MUST intervene by sending a message to Agent 1: *"Neutral Reminder: according to [Source/Docs], [Fact] works like this. Please acknowledge this fact in your argumentation."*
       - **Safe Intervention Boundaries**: You can ONLY intervene if the fact is 100% provable. If there is even 1% ambiguity or it's a matter of architectural taste, you MUST stay silent. You MUST NOT take sides, suggest solutions, or influence the architectural choice during the debate loop.
    4. Use `send_message` to forward Agent 1's message (and any corrections) to Agent 2.
    5. Wait for Agent 2's message.
    6. **Handling Output**:
       - **Live Mode (`/debate`)**: Stream Agent 2's message to the user immediately in the chat.
       - **Silent Mode**: Do NOT output to chat. Save the message in memory.
    7. **Active Observer (Fact-Check Intervention)**: Apply the same Fact-Check Intervention logic to Agent 2's message.
    8. Use `send_message` to forward Agent 2's message back to Agent 1 (unless it is the final iteration).

    *CRITICAL*: You must yield your turn and let the system wake you up when a subagent replies. Do not simulate the debate yourself.
  </phase>

  <phase name="Final Verdict">
    Once all N iterations are complete:
    1. Use the `manage_subagents` tool to kill the subagents (`Action: "kill_all"`).
    2. Assume the persona of the **Orchestrator** and **Judge**. You must not modify code during this verdict phase. You may consult RAG librarians before making your decision if necessary (see `.agents/skills/rag-for-react-next-docs.md`).
    3. **Output & Logging**:
       - **Live Mode (`/debate`)**: Output your final verdict in the chat in the same language as the topic prompt. Summarize the technical merits of both sides and make a final, authoritative architectural decision based on the application's context.
       - **Silent Mode**:
         1. Create a log file in `.agents/logs/`.
         2. Filename format: `[role1_short]_vs_[role2_short]_[topic_slug]_[timestamp].md` (e.g., `arch_vs_cod_ssr_1717200561.md`). Use abbreviated roles (arch, cod, test, rev) to keep names short.
         3. File Content: Write a highly structured, punchy Markdown summary followed by the full raw transcript. DO NOT write a boring wall of text for the summary. Use bullet points and concise statements. Structure:
            - **Context**: 1-2 sentences on what was debated.
            - **Positions**: Bulleted list of core arguments for each side (max 2-3 short bullets per side).
            - **Key Clashes**: Where exactly they disagreed (short bullets).
            - **Interventions**: Notes on any instances where an agent tried to deny objective facts and the Orchestrator had to intervene (or "None" if there were no interventions).
            - **Verdict**: The Orchestrator's final decision and the concrete reason why.
            
            ---
            
            **Raw Transcript**:
            Append the full, chronological log of all messages exchanged during the debate, including any "Neutral Reminder" interventions made by the Orchestrator. 
            MANDATORY FORMATTING: You must visually separate each message using a horizontal rule (`---`) followed by a clear header (e.g., `### 🗣️ **Reviewer**:`).
         4. Tell the user in chat: "I conducted a background debate on [topic]. The winner is [Choice]. Log saved to [path]."
  </phase>

  <escalation_protocol>
    <description>This protocol defines how normal coding cycles (Tester vs Coder, Reviewer vs Coder) are escalated into debates to prevent infinite loops.</description>
    <step name="Fast Lane">
      Normal cycles (TDD loop or Code Review loop) run without debates. The Critic (Tester/Reviewer) provides feedback, and the Actor (Coder) implements it. This loop has a STRICT LIMIT of exactly 3 iterations.
    </step>
    <step name="Freeze and Escalate">
      If the Critic is still not satisfied after the 3rd iteration, the Orchestrator MUST freeze the coding process. The Orchestrator immediately launches a Silent Mode Debate between the two specific roles involved (e.g., Tester vs Coder, or Reviewer vs Coder). The Critic acts as Agent 1 and speaks first.
    </step>
    <step name="Resolution and Resume">
      After the debate completes its iterations, the Orchestrator reads the log and renders a final Verdict. The Orchestrator then resumes the original workflow:
      - If the Coder won: The phase is marked complete, move to the next phase (e.g. from Review to Terminal Audit).
      - If the Critic won: The Orchestrator gives the Coder an unappealable directive based on the debate's outcome, forcing the Coder to implement it exactly as decided.
    </step>
  </escalation_protocol>
</debate_workflow>