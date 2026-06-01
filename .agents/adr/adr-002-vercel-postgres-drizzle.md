# ADR-002: Vercel Postgres (Neon) + Drizzle ORM

**Context**: App needs to persist race data, credentials, and derived analytics.

**Decision**: Vercel Postgres (Neon) for the database, Drizzle ORM for type-safe queries and migrations.

**Consequence**: Zero infrastructure management. Free tier sufficient for single-user.
