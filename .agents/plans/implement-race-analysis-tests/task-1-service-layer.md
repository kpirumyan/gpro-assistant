# Task 1: Service Layer & Tests

Implement the core logic and tests for generating race ranges, checking the database, and syncing a batch of races following TDD.

## Subtasks
- [x] Write unit tests for `generateRaceRange`.
- [x] Implement `generateRaceRange(fromSeason, fromRace, toSeason, toRace)` to generate a flat chronological array of `{season, race}` pairs.
- [x] Write unit tests for `getExistingRacesInRange`.
- [x] Implement `getExistingRacesInRange` to execute a single optimized `SELECT` query returning existing races.
- [x] Write unit tests for `prepareSync` using `vi.mock()`.
- [x] Implement `prepareSync(fromSeason, fromRace, toSeason, toRace)` that combines the above to return an array of missing races.
- [x] Write unit tests for `syncRacesBatch` handling data mapping and GPRO API errors (e.g., 404 Not Found).
- [x] Implement `syncRacesBatch(token, racesToFetch)` replacing the old `syncRaceHistory`.
