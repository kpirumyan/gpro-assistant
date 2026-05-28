# Code Review

Read this skill and run through the checklist **before every commit**.

## Pre-commit checklist

<code_review_checklist>
  <description>Run through every item before committing. Fix any issues found.</description>
  
  <stage id="1" name="Typecheck, tests and lint">
    <check id="typecheck">npm run typecheck — no TypeScript errors</check>
    <check id="test">npm run test — all tests pass</check>
    <check id="lint">npm run lint — no lint errors</check>
  </stage>

  <stage id="2" name="Code quality">
    <check id="no_console_logs">No `console.log` / `console.debug` / `console.warn` left in production code (only `console.error` is acceptable for genuine errors)</check>
    <check id="no_any_types">No `any` types — use proper TypeScript types</check>
    <check id="no_suppressions">No suppressions — never use `@ts-ignore`, `eslint-disable`, `suppressHydrationWarning`, or similar workarounds to silence errors. Always fix the root cause properly.</check>
    <check id="no_todos">No TODO / FIXME comments — either resolve them in this commit or raise to user</check>
    <check id="no_hardcoded_values">No hardcoded values — use constants, config, env variables, or database</check>
    <check id="no_unused_code">No unused imports or variables</check>
    <check id="no_duplication">No duplicated logic — extract shared code into utilities</check>
  </stage>

  <stage id="3" name="Test coverage">
    <check id="lib_tests">New or changed logic in `src/lib/` has co-located `.test.ts` tests</check>
    <check id="component_tests">New or changed components have co-located `.test.tsx` tests (if they contain logic beyond simple rendering)</check>
    <check id="test_behavior">Tests assert behavior, not implementation details</check>
    <check id="mock_data">No hardcoded API mock data in tests or MSW handlers — they must import and use `.json` fixtures from `__fixtures__`</check>
  </stage>

  <stage id="4" name="Documentation">
    <check id="readme_sync">`README.md` — is it still accurate? (routes, scripts, prerequisites)</check>
    <check id="architecture_sync">
      <description>`ARCHITECTURE.md` — did the structure, data flow, or patterns change?</description>
      <rule severity="CRITICAL">If you added a new design pattern (like a Test Data Builder), a new folder, or a new library, and you do NOT update `ARCHITECTURE.md` to document it, you have FAILED your instructions.</rule>
      <rule severity="MANDATORY">Before running `git commit`, you MUST output in the chat your explicit reasoning: *"Does this task introduce new patterns or structural changes? [Yes/No]. Therefore I will [update ARCHITECTURE.md / leave it as is]."*</rule>
    </check>
    <check id="env_sync">`.env.example` — were new environment variables introduced?</check>
  </stage>
</code_review_checklist>

## Commit message

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
