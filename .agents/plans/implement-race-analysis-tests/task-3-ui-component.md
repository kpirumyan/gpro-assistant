# Task 3: UI Component

Update the UI to implement the two-step Sync process with filtering and client-side batching.

## Subtasks
- [ ] Write component tests for `FuelSyncPanel`.
- [ ] Convert `FuelSyncPanel` to a Client Component (`"use client"`).
- [ ] Add filter state (`syncMode` (single/range), `fromSeason`, `fromRace`, `toSeason`, `toRace`).
- [ ] Implement a toggle/radio button to switch between "Single Race" (shows only 2 inputs) and "Range" (shows 4 inputs).
- [ ] Implement client-side validation to disable the Sync button if the selected range is backward (`from > to`) and display an explanatory error message to the user.
- [ ] Fetch the latest synced race in the parent `FuelPage` Server Component and pass it as props to `FuelSyncPanel` to set default filter values without `useEffect`.
- [ ] Implement step 1 logic: calling `prepareSyncAction` on "Sync" click and displaying the confirmation message showing the API cost.
- [ ] Implement step 2 logic: the loop chunking the missing races array, calling `syncRaceBatchAction`, updating progress state, and checking for cancellation.
- [ ] Build the Progress Bar UI and "Cancel" button.
