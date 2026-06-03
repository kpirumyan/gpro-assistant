# Agent Workflow

<agent-workflow>
  <description>Tasks follow these phases:</description>
  <phase name="Plan" requires_approval="true">
    <action>Execute Architecture Planning: create an implementation plan. If `/dual-arch` is active, generate Draft A and Draft B as separate artifacts and wait for the user to review them.</action>
    <delegates-to agent="Architect" task="create-plan" />
    <rule id="plan_documentation_section" severity="MANDATORY">The implementation plan should include a "Documentation Updates" section. It should explicitly state whether the task introduces new patterns, files, directories, or libraries, and what updates will be made to any `.agents/` files (e.g. `ARCHITECTURE.md`, `skills`, `roles`). If no updates are needed, it should prove why.</rule>
  </phase>
  <phase name="Post-Approval Setup" requires_approval="false">
    <action>Create directory `.agents/plans/<worktree-name>/` and save the approved plan there under its unique descriptive filename (e.g., `plan-[feature-or-issue-description].md`).</action>
    <rule id="unique_plan_filenames" severity="MANDATORY">Use unique descriptive filenames for plans. Do not use a generic `implementation_plan.md` to prevent overwriting previous plans.</rule>
  </phase>
  <phase name="Implement" requires_approval="false">
    <action>Following True TDD: write failing (red) tests based strictly on the approved plan. Once tests fail as expected, implement the feature/fix to pass the tests. If database schema changes are made, run migrations (`npm run db:generate` and `npm run db:migrate`).</action>
    <delegates-to agent="Tester" task="write-failing-tests" after="none" max_iterations="3" on_exceed="escalation-protocol" />
    <delegates-to agent="Coder" task="implement-feature" after="Tester" max_iterations="3" on_exceed="escalation-protocol" />
  </phase>
  <phase name="Test" requires_approval="true">
    <action>Run `npm run precommit`. Show results. Stop and wait for user approval.</action>
  </phase>
  <phase name="Review" requires_approval="false">
    <action>Run the code review checklist (see `.agents/rules/code-review.md`). Fix any issues found. If unresolved after max iterations, trigger the Escalation Protocol (Silent Mode Debate) as defined in `.agents/debate.md`.</action>
    <delegates-to agent="Reviewer" task="review-code" after="none" max_iterations="3" on_exceed="escalation-protocol" />
    <delegates-to agent="Coder" task="fix-review-issues" after="Reviewer" max_iterations="3" on_exceed="escalation-protocol" />
    <rule id="review_escalation_verdict" severity="MANDATORY">Upon rendering an escalation verdict: if Coder wins, move to next phase; if Reviewer wins, issue unappealable directive to Coder and resume coding.</rule>
  </phase>
  <phase name="Terminal Audit" requires_approval="false">
    <action>Read your `scratch/` directory to review any terminal errors logged during the session, AND review terminal error reports provided by subagents in their messages. Document any significant errors or workarounds as short Terminal Workaround Records (TWR) in `.agents/terminal-workarounds/` and link them in `.agents/rules/terminal.md`.</action>
    <rule id="terminal_audit_required" severity="MANDATORY">Before concluding any task, read the scratchpad and subagent messages to review terminal errors. Document significant errors or workarounds encountered during the session.</rule>
  </phase>
</agent-workflow>
