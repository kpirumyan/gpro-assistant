<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Product context

This is a single-user app for personal use. It will use one GPRO API key to fetch game data, visualize it, generate derived data, write results to the database, and analyze the collected data.

## Context Exclusion

You must always respect the exclusions defined in `.agentignore`. Never read, search, list, analyze, or include in your context any files or directories matching the patterns in `.agentignore` (such as `node_modules`, `.next`, `.cursor`, `.vscode`, `package-lock.json`, etc.) unless the user explicitly requests you to do so.

## Testing

Before adding or changing tests, read [TESTING.md](TESTING.md) for stack, layout, and deferred backlog.

This project follows a TDD-first workflow: prefer writing or updating a failing test before changing implementation code, then make the smallest change needed to pass.

TDD workflow note: after writing the failing test(s), stop and wait for explicit user confirmation before implementing the code that makes them pass.

**Never change tests to make a fix pass.** If `npm run test` fails while fixing a bug or implementing a change, fix the application code (or fixtures/MSW mocks), not the test assertions or expectations. Only edit tests when the user explicitly asks to add, update, or remove test coverage — not as a shortcut to green CI.

## Git commits

Before any `git commit` (local or when the user asks you to commit):

1. Run `npm run test` and `npm run lint` — both must pass.
2. If either fails, fix the issues and re-run; do not commit until green. On test failures, fix application code — **never** alter tests to make them pass (see Testing above).

A Husky `pre-commit` hook runs the same checks automatically for all commits.

## Language Rules

- **English only**: All comments in the source code (inside files) and Git commit messages must ALWAYS be in English. This rule does NOT apply to the chat conversation with the user, which should be in the user's language.

