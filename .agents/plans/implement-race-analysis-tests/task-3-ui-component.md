# Task 3: UI Component

Update the UI to implement the two-step Sync process with filtering and client-side batching.

## Subtasks
- [ ] Convert `FuelSyncPanel` to a Client Component (`"use client"`).
- [ ] Add filter state (`fromSeason`, `fromRace`, `toSeason`, `toRace`).
- [ ] Add a `useEffect` hook to fetch `getLatestSyncedRaceAction` and set default filter values on mount.
- [ ] Implement step 1 logic: calling `prepareSyncAction` on "Sync" click and displaying the confirmation message showing the API cost.
- [ ] Implement step 2 logic: the loop chunking the missing races array, calling `syncRaceBatchAction`, updating progress state, and checking for cancellation.
- [ ] Build the Progress Bar UI and "Cancel" button.
