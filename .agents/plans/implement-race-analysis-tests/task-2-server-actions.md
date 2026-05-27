# Task 2: Server Actions

Create the Server Actions necessary to connect the UI to the Service layer securely.

## Subtasks
- [x] Write unit tests for server actions.
- [x] Implement `getLatestSyncedRaceAction()` to fetch the most recent race from the local database for UI defaults.
- [x] Implement `prepareSyncAction(fromSeason, fromRace, toSeason, toRace)` wrapping the `prepareSync` service.
- [x] Implement `syncRaceBatchAction(races)` wrapping the `syncRacesBatch` service.
- [x] Ensure proper error handling and returning standard `SyncRacesState` equivalent types.
