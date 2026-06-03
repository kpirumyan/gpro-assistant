# Interaction Modes

Read this file when the user activates a slash command (`/goal`, `/grill-me`, `/discuss`, `/ask`, `/quick-fix`, `/dual-arch`, `/debate`).

<interaction-modes current_mode="ask">
  <description>The agent must support the following interaction modes, controlled by user commands. Default is `ask` unless another mode is explicitly specified. Always respect this mode and do not proceed to automatic fixes or execution if in `/grill-me` or `/ask` mode.</description>
  <mode command="/goal">
    <description>Switch the agent to autonomous mode. The agent will run tasks autonomously without stopping for intermediate approvals until the final goal is met (uses the full Workflow).</description>
  </mode>
  <mode command="/grill-me">
    <description>Switch the agent to interactive mode. Uses the full Workflow, but stops for user approval after the **Plan** phase and after the **Test** phase.</description>
  </mode>
  <mode command="/discuss">
    <description>Switch the agent to discussion mode. The user wants to brainstorm, ask questions, or conceptually discuss a problem with you directly. Do not invoke subagents or write code during the discussion. The final goal of the discussion is to create a uniquely named implementation plan artifact (e.g., `plan-[description].md`) that captures the summary and decisions of the dialogue. Once the discussion reaches a conclusion, generate this plan.</description>
  </mode>
  <mode command="/ask">
    <description>Simple question/answer mode. The agent acts as an advisor, answers questions, and asks clarifying questions if needed. The agent MUST NOT write code, run commands, or create commits in this mode.</description>
  </mode>
  <mode command="/quick-fix">
    <description>Quick bugfix mode. The agent skips the Plan and Post-Approval Setup phases, jumps straight to delegating fixing the issue. The Orchestrator MUST dynamically choose the correct subagent based on the task: delegate to **Tester** if the fix involves tests, or delegate to **Coder** if it involves application code. After the fix is implemented, test it, and delegate review to **Reviewer**. Use this only when explicitly requested for trivial tasks.</description>
  </mode>
  <mode command="/dual-arch">
    <description>Command modifier. Instructs the agent to invoke two **Chief Architect** subagents in parallel to create Draft A and Draft B. The agent will save them as separate files and stop to let the user review and choose.</description>
  </mode>
  <mode command="/debate">
    <description>Triggers an automated debate between two subagents (Reviewer and Coder) on a specific topic. Detailed instructions on how to facilitate the debate are located in `.agents/debate.md`. The user will provide a topic and optionally the number of iterations (defaults to 3).</description>
  </mode>
  <rule id="user_questions">Whenever asking the user a question that requires a "Yes", "No", or other clear choices, you MUST use the `ask_question` tool to provide clickable buttons for the user to select their response.</rule>
</interaction-modes>
