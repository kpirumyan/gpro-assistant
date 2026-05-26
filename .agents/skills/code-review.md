# Code Review

Read this skill and run through the checklist **before every commit**.

## Pre-commit checklist

Run through every item before committing. Fix any issues found.

### 1. Tests and lint

- [ ] `npm run test` — all tests pass
- [ ] `npm run lint` — no lint errors

### 2. Code quality

- [ ] No `console.log` / `console.debug` / `console.warn` left in production code (only `console.error` is acceptable for genuine errors)
- [ ] No `any` types — use proper TypeScript types
- [ ] No suppressions — never use `@ts-ignore`, `eslint-disable`, `suppressHydrationWarning`, or similar workarounds to silence errors. Always fix the root cause properly.
- [ ] No TODO / FIXME comments — either resolve them in this commit or raise to user
- [ ] No hardcoded values — use constants, config, env variables, or database
- [ ] No unused imports or variables
- [ ] No duplicated logic — extract shared code into utilities

### 3. Test coverage

- [ ] New or changed logic in `src/lib/` has co-located `.test.ts` tests
- [ ] New or changed components have co-located `.test.tsx` tests (if they contain logic beyond simple rendering)
- [ ] Tests assert behavior, not implementation details

### 4. Documentation

- [ ] `README.md` — is it still accurate? (routes, scripts, prerequisites)
- [ ] `ARCHITECTURE.md` — did the structure, data flow, or patterns change?
- [ ] `.env.example` — were new environment variables introduced?

### 5. Commit message

Format: `type(scope): description`

| Type       | When                                      |
|------------|-------------------------------------------|
| `feat`     | New feature or capability                 |
| `fix`      | Bug fix                                   |
| `refactor` | Code restructuring, no behavior change    |
| `test`     | Adding or updating tests only             |
| `docs`     | Documentation changes only                |
| `chore`    | Tooling, dependencies, config             |
| `style`    | Formatting, whitespace (no logic change)  |

Rules:
- **One commit = one logical change.** Feature + its tests = one commit.
- Scope = affected area (e.g., `fuel`, `settings`, `db`, `nav`).
- Description in imperative mood: "add calculator" not "added calculator".
- English only.

## When to raise to user

Stop and report instead of committing if:
- Tests fail and 3 fix attempts didn't resolve the issue
- Architecture changes were not in the approved plan
- A decision has multiple valid approaches and no clear winner
