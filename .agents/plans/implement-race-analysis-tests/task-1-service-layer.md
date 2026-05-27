# Task 1: Service Layer & Tests

Implement the core logic and tests for generating race ranges, checking the database, and syncing a batch of races.

## Subtasks
- [ ] Implement `generateRaceRange(fromSeason, fromRace, toSeason, toRace)` to generate a flat chronological array of `{season, race}` pairs.
- [ ] Implement `getExistingRacesInRange` to execute a single optimized `SELECT` query returning existing races.
- [ ] Implement `prepareSync(fromSeason, fromRace, toSeason, toRace)` that combines the above to return an array of missing races.
- [ ] Write unit tests for `prepareSync` and `generateRaceRange` using `vi.mock()`.
- [ ] Implement `syncRacesBatch(token, racesToFetch)` replacing the old `syncRaceHistory`.
- [ ] Write unit tests for `syncRacesBatch` ensuring it maps data correctly and handles GPRO API errors (e.g., 404 Not Found).
