# Agent Workflow

<agent-workflow>
  <description>Tasks follow these phases:</description>
  <phase name="Plan" requires_approval="true">
    <action>Execute Architecture Planning: Invoke **Chief Architect** subagent to create an implementation plan under a unique descriptive filename (e.g., `plan-[feature-or-issue-description].md` to avoid overwriting existing plans). (If `/dual-arch` is used, invoke two architects, generate Draft A and Draft B as separate files with unique names, and wait for the user to review and analyze them).</action>
    <mandatory>The implementation plan MUST include a "Documentation Updates" section. It MUST explicitly state whether the task introduces new patterns, files, directories, or libraries, and what updates will be made to any `.agents/` files (e.g. `ARCHITECTURE.md`, `skills`, `roles`). If no updates are needed, it must prove why.</mandatory>
  </phase>
  <phase name="Post-Approval Setup" requires_approval="false">
    <action>Create directory `.agents/plans/<worktree-name>/` and save the approved plan there under its unique descriptive filename (e.g., `plan-[feature-or-issue-description].md`). Never use a generic `implementation_plan.md` inside this directory to prevent overwriting previous plans.</action>
  </phase>
  <phase name="Implement" requires_approval="false">
    <action>Following True TDD: First, invoke the **Tester** subagent to write failing (red) tests based strictly on the approved plan. Once tests are written and fail as expected, invoke the **Coder** subagent to implement the feature/fix to pass the tests. If database schema changes are made, run migrations (`npm run db:generate` and `npm run db:migrate`). STRICT LIMIT: Max 3 iterations of feedback between Tester and Coder. If unresolved, trigger Escalation Protocol.</action>
  </phase>
  <phase name="Test" requires_approval="true">
    <action>Run `npm run precommit`. Show results. Stop and wait for user approval.</action>
  </phase>
  <phase name="Review" requires_approval="false">
    <action>Invoke the **Reviewer** subagent to run the code review checklist (see `.agents/rules/code-review.md`). Then invoke the **Coder** to fix any issues found. STRICT LIMIT: Max 3 iterations of feedback. If the Reviewer is still not satisfied, trigger the Escalation Protocol (Silent Mode Debate) as defined in `.agents/debate.md`. Upon rendering a verdict, you MUST Resume Workflow: if Coder wins, move to next phase; if Reviewer wins, issue unappealable directive to Coder and resume coding.</action>
  </phase>
  <phase name="Terminal Audit" requires_approval="false">
    <action>MANDATORY CLOSING PHASE: Before concluding the task, you MUST review all terminal command logs from the current session. If you encountered any errors or had to use any workarounds, you MUST document them as short ADR-like files in `.agents/terminal-workarounds/` and link them in `.agents/rules/terminal.md`.</action>
  </phase>
</agent-workflow>
