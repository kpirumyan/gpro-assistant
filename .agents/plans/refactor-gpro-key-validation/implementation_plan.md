# Optimize GPRO API Key Validation

The goal is to remove the slow, blocking validation of the API key on the settings page load and instead rely on just-in-time validation when saving the key, along with graceful error handling on pages that use the key to fetch data.

## Proposed Changes

### Database Schema and Queries
We will remove the caching logic and unused columns related to token validity.

- `schema.ts`: Drop `isValid` and `verifiedAt` columns from the `gproCredentials` table. A new database migration will be generated and applied.
- `queries.ts`: 
  - Remove `CREDENTIAL_TTL_MS` constant.
  - Update `GproCredentials` type to only include `token`.
  - Update `getGproCredentials` to simply return the stored token.
  - Update `upsertGproCredentials` to only accept and save the `token`.

### Settings Page
We will simplify the settings page by removing the wrapper component and suspense boundary that triggered the verification.

- `page.tsx`: Remove `SettingsFormWrapper` component and `<Suspense>` wrapper. Fetch credentials directly and render `<SettingsApiKeyForm hasSavedKey={hasSavedKey} />`.
- `actions.ts`: Update the call to `upsertGproCredentials` to only pass the `token`.
- `SettingsApiKeyForm.tsx`: Remove the `isKeyValid` prop. Simply display a neutral or success message if `hasSavedKey` is true. Ensure the save button is inactive if the input field is empty.

### Data Sync Pages
We will improve error messaging so users know when their token has expired.

- `client.ts` & Actions: Change the thrown error message for 401/403 responses so the UI can detect auth errors.
- `DriverPanel`, `CarPanel`, `FuelSyncPanel`: Render the error message such that "Settings" is a clickable link directing the user to `/settings` when an auth error occurs.

## Verification Plan
1. Tests: Run `npm run test` and `npm run lint`. Update failing tests, verify that the save button is disabled when empty.
2. Manual:
   - Check settings page loads instantly without spinner.
   - Enter valid key and save.
   - Simulate expired key and attempt sync, verify link to Settings works.
