# Task 2: Server Actions

Create the Server Actions necessary to connect the UI to the Service layer securely.

## Subtasks
- [ ] Implement `getLatestSyncedRaceAction()` to fetch the most recent race from the local database for UI defaults.
- [ ] Implement `prepareSyncAction(fromSeason, fromRace, toSeason, toRace)` wrapping the `prepareSync` service.
- [ ] Implement `syncRaceBatchAction(races)` wrapping the `syncRacesBatch` service.
- [ ] Ensure proper error handling and returning standard `SyncRacesState` equivalent types.
