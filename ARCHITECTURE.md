# Architecture

Living document describing the project structure, data flow, and key decisions. Updated automatically when the architecture changes.

## Overview

**GPRO Assistant** is a single-user Next.js 16 app that fetches racing game data from the [GPRO Public API](https://api.gpro.net), stores it in a database, and provides calculators and visualizations for race strategy.

### Tech stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Framework  | Next.js 16 (App Router)             |
| Language   | TypeScript 5                        |
| UI         | React 19 + Tailwind CSS 4           |
| Database   | Vercel Postgres (Neon) + Drizzle ORM|
| Testing    | Vitest + RTL + MSW                  |
| Linting    | ESLint 9 + Prettier                 |
| Hosting    | Vercel                              |
| Git hooks  | Husky (pre-commit: test + lint)     |

## Directory structure

```
gpro-assistant/
├── .agents/                    # Agent configuration
│   ├── plugins/                # Agent plugins (chrome-devtools, modern-web-guidance)
│   └── skills/                 # Skill files loaded by agent on demand
│       ├── testing.md
│       ├── api-integration.md
│       ├── nextjs-patterns.md
│       ├── code-review.md
│       ├── ui-patterns.md
│       └── database.md
├── drizzle/                    # Generated DB migration files (future)
├── public/                     # Static assets
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout (fonts, nav, body)
│   │   ├── page.tsx            # Home (/)
│   │   ├── globals.css         # Global styles + Tailwind
│   │   ├── fuel/page.tsx       # /fuel (placeholder)
│   │   ├── tires/page.tsx      # /tires (placeholder)
│   │   ├── setup/page.tsx      # /setup (placeholder)
│   │   └── settings/
│   │       ├── page.tsx        # /settings
│   │       └── page.test.tsx   # Settings tests
│   ├── components/             # Shared React components
│   │   ├── AppNav.tsx          # Navigation bar
│   │   ├── PageShell.tsx       # Page wrapper (title + description)
│   │   └── SettingsApiKeyForm.tsx  # API key form
│   ├── lib/                    # Domain logic (keep pages thin)
│   │   ├── gpro/               # GPRO API client, types, fixtures (future)
│   │   ├── db/                 # Database client + schema (future)
│   │   └── calculators/        # Fuel, tire, setup calculations (future)
│   └── test/
│       └── msw/                # MSW mock server for tests
│           ├── handlers.ts
│           └── server.ts
├── AGENTS.md                   # Agent rules (always loaded)
├── ARCHITECTURE.md             # This file
├── README.md                   # Project overview for humans
├── .agentignore                # Files excluded from agent context
├── .env.example                # Environment variable template
├── vitest.config.ts            # Vitest configuration
└── vitest.setup.ts             # Test setup (jest-dom, MSW lifecycle)
```

## Data flow

```
User (browser)
  │
  ▼
Next.js App (React UI)
  │
  ├──► Server Components / Server Actions
  │       │
  │       ├──► GPRO API Client (src/lib/gpro/)
  │       │       │
  │       │       ▼
  │       │    api.gpro.net (external API)
  │       │
  │       └──► Database Client (src/lib/db/)
  │               │
  │               ▼
  │            Vercel Postgres (Neon)
  │
  └──► Client Components (interactive UI)
          │
          └──► localStorage (legacy, migrating to DB)
```

## Key patterns

### Server-first rendering

Pages are Server Components by default. Only add `"use client"` when the component needs hooks, browser APIs, or event handlers.

### Thin pages, rich lib

Pages (`src/app/**/page.tsx`) compose components and call domain logic. Business logic lives in `src/lib/`.

### GPRO API token in database

The API token is stored in the database (not `.env.local`). The Settings page form writes/reads it. This allows the user to update it without redeploying.

### TDD-first development

Tests are written before (or alongside) production code. Tests must never be weakened to make a fix pass.

## Architecture Decision Records (ADR)

### ADR-001: Antigravity as sole development agent

**Context**: Multiple AI tools (Cursor, Aider, Claude Code) were trialed, creating configuration conflicts.
**Decision**: Use only Antigravity. All agent config lives in AGENTS.md + `.agents/skills/`.
**Consequence**: Single source of truth for agent behavior. CLAUDE.md and other tool configs removed.

### ADR-002: Vercel Postgres (Neon) + Drizzle ORM

**Context**: App needs to persist race data, settings, and derived analytics.
**Decision**: Vercel Postgres (Neon) for the database, Drizzle ORM for type-safe queries and migrations.
**Consequence**: Zero infrastructure management. Free tier sufficient for single-user.

### ADR-003: TDD-first workflow

**Context**: Need reliable code changes without manual regression testing.
**Decision**: Write tests before/alongside code. Never weaken tests to fix a bug.
**Consequence**: Slower initial development but higher confidence in changes.

### ADR-004: Conventional Commits

**Context**: Need readable git history and potential for automated changelogs.
**Decision**: All commits follow Conventional Commits format (`type(scope): description`).
**Consequence**: Consistent, searchable git log.
