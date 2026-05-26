# Tasks

- [x] Update `src/lib/db/schema.ts` to drop `isValid` and `verifiedAt`.
- [x] Run `npm run db:generate` and `npm run db:migrate`.
- [x] Update `src/lib/db/queries.ts` (remove TTL, update types, fix `getGproCredentials`, `upsertGproCredentials`).
- [x] Update `src/app/settings/page.tsx` (remove wrapper, suspense).
- [x] Update `src/app/settings/actions.ts` (update `upsertGproCredentials` call).
- [x] Update `src/components/SettingsApiKeyForm.tsx` (remove `isKeyValid`, check submit button disabled state).
- [x] Update `src/lib/gpro/client.ts` to throw a specific `AuthError` or identifiable string for 401/403.
- [x] Update `src/app/driver/actions.ts`, `src/app/car/actions.ts`, `src/app/fuel/actions.ts` to return an auth error code if applicable.
- [x] Update `DriverPanel.tsx`, `CarPanel.tsx`, `FuelSyncPanel.tsx` to render a link to `/settings` for auth errors.
- [x] Update tests in `src/app/settings/page.test.tsx` and anywhere else needed.
- [x] Run `npm run test` and `npm run lint`.
- [x] Manual review and code review checklist.
