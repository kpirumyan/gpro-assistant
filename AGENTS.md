<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Testing

Before adding or changing tests, read [TESTING.md](TESTING.md) for stack, layout, and deferred backlog.

**Never change tests to make a fix pass.** If `npm run test` fails while fixing a bug or implementing a change, fix the application code (or fixtures/MSW mocks), not the test assertions or expectations. Only edit tests when the user explicitly asks to add, update, or remove test coverage — not as a shortcut to green CI.

## Git commits

Before any `git commit` (local or when the user asks you to commit):

1. Run `npm run test` and `npm run lint` — both must pass.
2. If either fails, fix the issues and re-run; do not commit until green. On test failures, fix application code — **never** alter tests to make them pass (see Testing above).

A Husky `pre-commit` hook runs the same checks automatically for all commits.
