<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Product context

Single-user Next.js app for personal use. Fetches game data from the GPRO API, visualizes it, generates derived analytics, writes results to the database (Vercel Postgres / Neon), and presents analysis. The GPRO API token is stored in the database (not in env variables).

## Workflow

Tasks follow these phases (used by `/grill-me` and `/goal` modes):

1. **Plan** — Research the task, create an implementation plan artifact. **Stop and wait for user approval.**
2. **Post-Approval Setup** — Once the plan is approved, perform the following setup steps:
   - Create a directory in `.agents/plans/` named after the current git worktree/branch (e.g., `.agents/plans/<worktree-name>`).
   - Save the approved `implementation_plan.md` in that directory.
   - Create and save the `task.md` checklist in that directory.
   - Create and save a Mermaid diagram (e.g., `diagram.md`) representing the architecture/plan in that directory, formatted so it can be viewed using the Mermaid Previewer extension in VS Code.
3. **Implement** — Write code following project conventions. TDD-first internally: write the test, then the code to pass it — deliver both together without pausing between them. If database schema changes are made, generate and apply migrations (`npm run db:generate` and `npm run db:migrate`).
4. **Test** — Run `npm run typecheck`, `npm run test`, and `npm run lint` (or simply `npm run precommit`). Show results. **Stop and wait for user approval.**
5. **Review** — Run the code review checklist (see `.agents/skills/code-review.md`). Fix any issues found.
6. **Commit** — Conventional Commits format. One commit = one logical change. Feature + its tests = one commit.

Do NOT automatically decide to skip the Plan/Setup phases and commit right away unless the user explicitly provides the `/quick-fix` command.

## Interaction mode

The agent must support the following interaction modes, controlled by user commands:
- `/goal` — Switch the agent to autonomous mode. The agent will run tasks autonomously without stopping for intermediate approvals until the final goal is met (uses the full Workflow).
- `/grill-me` — Switch the agent to interactive mode. Uses the full Workflow, but stops for user approval after the **Plan** phase, after the **Test** phase, and before committing.
- `/ask` — Simple question/answer mode. The agent acts as an advisor, answers questions, and asks clarifying questions if needed. The agent MUST NOT write code, run modifying commands, or create commits in this mode.
- `/quick-fix` — Quick bugfix mode. The agent skips the Plan and Post-Approval Setup phases, jumps straight to fixing the issue, tests it, and commits it. Use this only when explicitly requested for trivial tasks.

**User Questions Rule:** Whenever asking the user a question that requires a "Yes" or "No" answer (or similar clear choices), you MUST use the `ask_question` tool to provide clickable buttons for the user to select their response.

**Current Mode: ask** (default unless another mode is explicitly specified in the conversation or request). Always respect this mode and do not proceed to automatic fixes or execution if in `/grill-me` or `/ask` mode.

## Error handling

When a command, build, or test fails: attempt up to **3 automatic fix cycles**. After 3 failures, **stop** and report the issue with context. Never loop indefinitely.

## Commit conventions

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat(scope):` — new feature
- `fix(scope):` — bug fix
- `refactor(scope):` — restructuring without behavior change
- `test(scope):` — adding or updating tests
- `docs(scope):` — documentation changes only
- `chore(scope):` — tooling, dependencies, config

**Never change tests to make a fix pass.** Fix application code instead. Only edit tests when the user explicitly asks to add, update, or remove test coverage.

## Context exclusion

Respect `.agentignore`. Never read, search, list, or analyze files matching those patterns unless the user explicitly asks.

## Language rules

- **English only**: all source code comments and Git commit messages.
- Chat conversation & artifacts (implementation plans, walkthroughs, etc.): user's language.

## Terminal rules

- Always use Git Bash terminal on Windows (via `& "C:\Program Files\Git\bin\bash.exe" -c "..."`) for running commands instead of Windows PowerShell or default `bash` (which resolves to WSL bash where Windows Node.js/npm is missing).

## Environment rules

- If operating in a git worktree and `.env.local` is missing, you MUST automatically copy `.env.local` from the original parent repository (read the `.git` file to find the original path) before running any commands that require environment variables (like `npm run db:migrate`).

## Architecture

Read `ARCHITECTURE.md` before making structural changes. **Update it** when the project structure, data flow, or key patterns change. This file is the agent's "memory" between sessions.

## Documentation maintenance

At commit time, check whether these files need updating:
- `README.md` — routes, scripts, prerequisites
- `ARCHITECTURE.md` — structure, patterns, decisions
- `.env.example` — new environment variables

## Skills

Detailed instructions live in `.agents/skills/`. Read the relevant skill before starting the corresponding work.

| Skill | File | When to read |
|-------|------|-------------|
| Testing | `testing.md` | Writing or reviewing tests |
| API Integration | `api-integration.md` | Working with GPRO API |
| Next.js Patterns | `nextjs-patterns.md` | Creating routes, components, data fetching |
| Code Review | `code-review.md` | Before every commit |
| UI Patterns | `ui-patterns.md` | Building or modifying UI |
| Database | `database.md` | Schema changes, queries, migrations |
