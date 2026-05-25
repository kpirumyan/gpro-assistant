# Database

Read this skill before making schema changes, writing queries, or configuring migrations.

## Stack

- **Provider**: Vercel Postgres (powered by [Neon](https://neon.tech))
- **ORM**: [Drizzle ORM](https://orm.drizzle.team)
- **Migrations**: Drizzle Kit

## Directory structure

```
src/lib/db/
├── index.ts            # Database client (drizzle instance)
└── schema.ts           # Table definitions (Drizzle schema)

drizzle/                # Generated migration files (managed by Drizzle Kit)
drizzle.config.ts       # Drizzle Kit configuration
```

## Environment variables

Connection details are in `.env.local` (not committed). Template in `.env.example`:

```
DATABASE_URL=           # Pooled connection (recommended for most uses)
DATABASE_URL_UNPOOLED=  # Direct connection (for migrations)
PGHOST=
PGHOST_UNPOOLED=
PGUSER=
PGDATABASE=
PGPASSWORD=
```

Use `DATABASE_URL` for the app runtime. Use `DATABASE_URL_UNPOOLED` for Drizzle Kit migrations (migrations require a direct connection, not pooled).

## Schema conventions

### Naming

- **Database columns**: `snake_case` (e.g., `created_at`, `api_token`)
- **TypeScript fields**: `camelCase` (Drizzle maps automatically)
- **Table names**: plural `snake_case` (e.g., `race_results`, `car_setups`)

### Standard columns

Every table should include:

```ts
id: serial("id").primaryKey(),
createdAt: timestamp("created_at").defaultNow().notNull(),
updatedAt: timestamp("updated_at").defaultNow().notNull(),
```

### Example schema

```ts
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

## Queries

- Use Drizzle's type-safe query builder. Avoid raw SQL.
- Place query functions in `src/lib/db/` or in the relevant domain module (e.g., `src/lib/gpro/`).
- Always handle errors — wrap DB calls in try/catch.

## Migrations

```bash
# Generate a migration from schema changes
npx drizzle-kit generate

# Apply migrations to the database
npx drizzle-kit migrate

# Open Drizzle Studio (database browser)
npx drizzle-kit studio
```

- Run migrations against `DATABASE_URL_UNPOOLED` (direct connection).
- Commit migration files in `drizzle/` to git.
- Never edit generated migration files manually.

## Testing

- Unit tests for query functions should use MSW or test database.
- For integration tests, consider transaction rollback pattern: wrap each test in a transaction and roll back after.
- Never run tests against the production database.

## When to extend this skill

- When adding a new table: update the schema example section
- When adopting a caching layer (e.g., Vercel KV): add a caching section
- When adding Vercel Blob for file storage: add a storage section
