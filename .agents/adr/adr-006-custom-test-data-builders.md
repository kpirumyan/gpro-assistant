# ADR-006: Custom Test Data Builders for Database Mocks

**Context**: Need a standardized, type-safe way to mock database entities (Drizzle schemas) in tests without massive inline object boilerplate.

**Decision**: Implement custom Factory functions (Test Data Builders) in `src/test/factories.ts` using plain TypeScript.

**Alternatives considered**: Using `fishery` + `faker`. Rejected for now to avoid unnecessary dependencies, as the project's data structures are mostly numerical and straightforward.

**Consequence**: Test files are much cleaner. If schemas become deeply relational in the future, the `.build()` interface can easily be swapped to use `fishery` under the hood.
