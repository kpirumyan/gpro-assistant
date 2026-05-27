# Race Analysis Sync

This is the main checklist for the Race Analysis Sync feature implementation.
Tasks are broken down into separate files to build logic step-by-step.

- [x] **Task 1: Service Layer** (`src/lib/services/race-analysis.service.ts`)
  - [x] Create `generateRaceRange(fromSeason, fromRace, toSeason, toRace)`
  - [x] Create `getExistingRacesInRange(fromSeason, fromRace, toSeason, toRace)`
  - [x] Create `prepareSync(...)` returning only missing races.
  - [x] Create `syncRacesBatch(token, missingRaces)` handling chunks and DB transaction.
- [x] **Task 2: Server Actions** (`src/app/fuel/actions.ts`)
- [x] Task 3: [UI Component](./task-3-ui-component.md)

