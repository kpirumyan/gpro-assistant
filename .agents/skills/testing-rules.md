# Testing

Read this skill before writing, reviewing, or debugging tests.

<mindset role="QA Lead">
  Tests must assert behavior, not implementation details. Show no mercy to production code. Ensure test reliability, use precise mocks, and follow TDD rigidly. Tests should break only when requirements change.
</mindset>

## Stack

- **Vitest** — test runner
- **@testing-library/react** — component tests
- **@testing-library/jest-dom** — DOM matchers (`import "@testing-library/jest-dom/vitest"` in setup)
- **MSW** — mock `https://api.gpro.net` without real network
- **@testing-library/user-event** — simulating user interactions

Not installed: Jest, Playwright, Cypress.

## Commands

| Command                 | Description                            |
| ----------------------- | -------------------------------------- |
| `npm run typecheck`     | Check TypeScript types (`tsc --noEmit`) |
| `npm run test`          | Run all tests once                     |
| `npm run test:watch`    | Watch mode (use while developing)      |
| `npm run test:coverage` | Run with coverage report (`coverage/`) |

## File layout

| Path                                     | Purpose                                                            |
| ---------------------------------------- | ------------------------------------------------------------------ |
| `vitest.config.ts`                       | Vitest config, `@/*` alias, jsdom                                  |
| `vitest.setup.ts`                        | jest-dom matchers, MSW server lifecycle                            |
| `src/lib/`                               | Domain logic (calculators, GPRO client) — primary unit-test target |
| `src/**/*.test.ts` / `src/**/*.test.tsx`  | Co-located unit and component tests next to the code they cover    |
| `src/test/msw/`                          | MSW handlers and server for HTTP mocks                             |
| `src/lib/gpro/__fixtures__/`             | Sample API responses (JSON) used by MSW handlers in tests          |

## TDD workflow

<tdd_workflow>
  <step id="1">Write a failing test that describes the expected behavior.</step>
  <step id="2">Write the minimal code to make the test pass.</step>
  <step id="3">Refactor if needed — tests must still pass.</step>
  <step id="4" severity="MANDATORY">Deliver test + code together; do not pause between writing test and code.</step>
</tdd_workflow>

## Rules

<testing_rules>
  <rule id="never_weaken_tests" severity="CRITICAL">**Never change tests to make a fix pass.** Fix production code (or MSW mocks / fixtures) instead.</rule>
  <rule id="explicit_test_edits">Only edit tests when the user explicitly asks to add, update, or remove test coverage.</rule>
  <rule id="co_locate_lib_tests">Every new module in `src/lib/` should have a co-located `.test.ts` file.</rule>
  <rule id="co_locate_components">Component tests go in a co-located `.test.tsx` file next to the component.</rule>
  <rule id="single_source_mocks" severity="CRITICAL">
    <description>**Single Source of Truth for Mocks**</description>
    <action>All mock data for external APIs must be stored as `.json` files in `__fixtures__`. MSW handlers and test assertions MUST import these fixtures. Never use inline, hardcoded mock response objects.</action>
  </rule>
  <rule id="database_mocks" severity="CRITICAL">
    <description>**Database Mocks**</description>
    <action>When mocking database entities (Drizzle schemas), always use the Test Data Builder factories from `src/test/factories.ts` (e.g., `buildRaceAnalysis()`). Never use inline, hardcoded mock database objects.</action>
  </rule>
  <rule id="avoid_redundant_tests">
    <description>**Avoid Redundant Tests when Writing**</description>
    <action>Do not write redundant or unnecessary tests — avoid duplicate test cases covering identical scenarios, testing trivial code without logic (like static rendering of fixed props), or testing obsolete behavior.</action>
  </rule>
</testing_rules>

## MSW patterns

- Handlers live in `src/test/msw/handlers.ts`.
- Server setup in `src/test/msw/server.ts`.
- `vitest.setup.ts` starts/stops the server automatically.
- Add new handlers when integrating new GPRO API endpoints.
- Fixtures (sample responses) in `src/lib/gpro/__fixtures__/` as JSON files.

## Coverage

- Provider: V8
- Reporters: text + html
- Includes: `src/**/*.{ts,tsx}`
- Excludes: test files and `src/test/` directory

## Pre-commit

Husky runs `npm run precommit` → `npm run typecheck`, `npm run test`, then `npm run lint` on every `git commit`. If any fails, the commit is blocked. Skip only in emergencies: `git commit --no-verify`.

## Backlog (deferred)

Implement when the corresponding trigger occurs:

| Trigger                                                      | Task                                                                                                 |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| First form on `/fuel` or token flow in `/settings`           | Unit tests in `src/lib/calculators/`, RTL tests for the form                                         |
| GPRO API integration                                         | MSW handlers in `src/test/msw/handlers.ts`, fixtures in `src/lib/gpro/__fixtures__/`                 |
| Stable user journey (save token, calculator input → result)  | Playwright E2E: `@playwright/test`, `playwright.config.ts`, `e2e/smoke.spec.ts`, script `test:e2e`   |
| PR checks needed                                             | GitHub Actions workflow: `npm ci` → `npm run test` (optional E2E on `main`)                          |
