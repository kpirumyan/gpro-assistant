# Testing

Vitest + React Testing Library + MSW. Business and feature tests are added incrementally; this file tracks what is done and what is deferred.

## Commands

| Command                 | Description                            |
| ----------------------- | -------------------------------------- |
| `npm run test`          | Run all tests once                     |
| `npm run test:watch`    | Watch mode (use while developing)      |
| `npm run test:coverage` | Run with coverage report (`coverage/`) |

## Layout

| Path                                     | Purpose                                                            |
| ---------------------------------------- | ------------------------------------------------------------------ |
| `vitest.config.ts`                       | Vitest config, `@/*` alias, jsdom                                  |
| `vitest.setup.ts`                        | jest-dom matchers, MSW server lifecycle                            |
| `src/lib/`                               | Domain logic (calculators, GPRO client) - primary unit-test target |
| `src/**/*.test.ts` / `src/**/*.test.tsx` | Co-located unit and component tests next to the code they cover    |
| `src/test/msw/`                          | MSW handlers and server for HTTP mocks                             |

## Stack (current)

- **Vitest** - test runner
- **@testing-library/react** - component tests (when UI exists)
- **@testing-library/jest-dom** - DOM matchers (`import "@testing-library/jest-dom/vitest"` in setup)
- **MSW** - mock `https://api.gpro.net` without real network

Not installed: Jest, Playwright, Cypress.

## Agent rule: do not weaken tests when fixing

When fixing bugs or failed checks: **never** change test files to force a pass - fix production code instead. Change tests only when the user explicitly requests new or updated test coverage.

## Pre-commit (Husky)

On every `git commit`, Husky runs `npm run precommit` -> `npm run test` then `npm run lint`. If either fails, the commit is blocked.

Skip only when necessary: `git commit --no-verify` (not recommended).

## Backlog (deferred)

Check off items when implemented. To ask the agent: `@TESTING.md` + e.g. "add the next backlog item".

| Trigger                                                      | Task                                                                                                                                                                       |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First form on `/fuel` or token flow in `/settings`           | Unit tests in `src/lib/calculators/`, RTL tests for the form                                                                                                               |
| GPRO API integration                                         | MSW handlers in `src/test/msw/handlers.ts`, fixtures in `src/lib/gpro/__fixtures__/`                                                                                       |
| Stable user journey (save token, calculator input -> result) | Playwright: `@playwright/test`, `playwright.config.ts`, `e2e/smoke.spec.ts`, script `test:e2e`; add to `.gitignore`: `/test-results`, `/playwright-report`, `/blob-report` |
| PR checks needed                                             | GitHub Actions workflow: `npm ci` -> `npm run test` (optional E2E on `main`)                                                                                               |

### Playwright reminder

E2E is useful but was skipped at scaffold time (placeholder pages only). Add when there is real UI to exercise (settings token, calculator result on page, nav smoke).

## Reminding the agent

1. `@TESTING.md` in the chat message (most reliable).
2. "Implement the next item from TESTING.md backlog".
3. See `AGENTS.md` - testing conventions point here.
