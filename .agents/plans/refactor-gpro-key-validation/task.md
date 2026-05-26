# Tasks

- [ ] Update `src/lib/db/schema.ts` to drop `isValid` and `verifiedAt`.
- [ ] Run `npm run db:generate` and `npm run db:migrate`.
- [ ] Update `src/lib/db/queries.ts` (remove TTL, update types, fix `getGproCredentials`, `upsertGproCredentials`).
- [ ] Update `src/app/settings/page.tsx` (remove wrapper, suspense).
- [ ] Update `src/app/settings/actions.ts` (update `upsertGproCredentials` call).
- [ ] Update `src/components/SettingsApiKeyForm.tsx` (remove `isKeyValid`, check submit button disabled state).
- [ ] Update `src/lib/gpro/client.ts` to throw a specific `AuthError` or identifiable string for 401/403.
- [ ] Update `src/app/driver/actions.ts`, `src/app/car/actions.ts`, `src/app/fuel/actions.ts` to return an auth error code if applicable.
- [ ] Update `DriverPanel.tsx`, `CarPanel.tsx`, `FuelSyncPanel.tsx` to render a link to `/settings` for auth errors.
- [ ] Update tests in `src/app/settings/page.test.tsx` and anywhere else needed.
- [ ] Run `npm run test` and `npm run lint`.
- [ ] Manual review and code review checklist.
