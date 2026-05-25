<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Product context

Single-user Next.js app for personal use. Fetches game data from the GPRO API, visualizes it, generates derived analytics, writes results to the database (Vercel Postgres / Neon), and presents analysis. The GPRO API token is stored in the database (not in env variables).

## Workflow

Every non-trivial task follows five phases:

1. **Plan** — Research the task, create an implementation plan artifact. **Stop and wait for user approval.**
2. **Implement** — Write code following project conventions. TDD-first internally: write the test, then the code to pass it — deliver both together without pausing between them. If database schema changes are made, generate and apply migrations (`npm run db:generate` and `npm run db:migrate`).
3. **Test** — Run `npm run test` and `npm run lint`. Show results. **Stop and wait for user approval.**
4. **Review** — Run the code review checklist (see `.agents/skills/code-review.md`). Fix any issues found.
5. **Commit** — Conventional Commits format. One commit = one logical change. Feature + its tests = one commit.

For trivial tasks (typo fix, config tweak), skip the plan phase but still test and review.

## Interaction mode

**Current: interactive** — stop after plan, after tests, before commit. The user will switch to a dual-mode (autonomous for simple tasks) when ready, via explicit request or `/goal`.

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
