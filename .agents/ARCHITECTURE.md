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
│   ├── ARCHITECTURE.md         # This file
│   ├── plugins/                # Agent plugins (chrome-devtools, modern-web-guidance)
│   └── skills/                 # Skill files loaded by agent on demand
│       ├── testing-rules.md
│       ├── api-integration-rules.md
│       ├── code-review-checklist.md
│       ├── ui-styling-rules.md
│       ├── db-conventions.md
│       └── rag-for-react-next-docs.md
├── drizzle/                    # Generated DB migration files (future)
├── scripts/                    # Utility scripts (e.g., RAG integration)
│   └── ask-react-rag.ts
├── public/                     # Static assets
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout (fonts, nav, body)
│   │   ├── page.tsx            # Home (/)
│   │   ├── globals.css         # Global styles + Tailwind
│   │   ├── driver/
│   │   │   ├── _components/    # Driver-specific UI components
│   │   │   ├── page.tsx        # /driver
│   │   │   └── actions.ts      # Server actions for driver data
│   │   ├── car/
│   │   │   ├── _components/    # Car-specific UI components
│   │   │   ├── page.tsx        # /car
│   │   │   └── actions.ts      # Server actions for car data
│   │   ├── fuel/
│   │   │   ├── _components/    # Fuel-specific UI components
│   │   │   └── page.tsx        # /fuel
│   │   ├── tires/page.tsx      # /tires (placeholder)
│   │   ├── setup/page.tsx      # /setup (placeholder)
│   │   └── settings/
│   │       ├── _components/    # Settings-specific UI components
│   │       ├── page.tsx        # /settings
│   │       └── page.test.tsx   # Settings tests
│   ├── components/             # Shared React components
│   │   ├── AppNav.tsx          # Navigation bar
│   │   ├── PageShell.tsx       # Page wrapper (title + description)
│   │   ├── ClientDate.tsx      # Date formatter component
│   │   └── StatBar.tsx         # Reusable gradient stat bar
│   ├── lib/                    # Domain logic (keep pages thin)
│   │   ├── gpro/               # GPRO API client, types, fixtures
│   │   ├── db/                 # Database client + schema
│   │   ├── constants.ts        # Shared application-level constants
│   │   └── calculators/        # Fuel, tire, setup calculations (future)
│   └── test/                   # Test utilities
│       ├── factories.ts        # Database Test Data Builders
│       └── msw/                # MSW mock server for tests
│           ├── handlers.ts
│           └── server.ts
├── AGENTS.md                   # Agent rules (always loaded)
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

<architecture_patterns>
  <pattern id="server_first_rendering">
    <name>Server-first rendering</name>
    <description>Pages are Server Components by default. Only add `"use client"` when the component needs hooks, browser APIs, or event handlers.</description>
  </pattern>
  
  <pattern id="thin_pages_rich_lib">
    <name>Thin pages, rich lib</name>
    <description>Pages (`src/app/**/page.tsx`) compose components and call domain logic. Business logic lives in `src/lib/`.</description>
  </pattern>
  
  <pattern id="db_api_token">
    <name>GPRO API token in database</name>
    <description>The API token is stored in the database (not `.env.local`). The Settings page form writes/reads it. This allows the user to update it without redeploying.</description>
  </pattern>
  
  <pattern id="tdd_first">
    <name>TDD-first development</name>
    <description>Tests are written before (or alongside) production code. Tests must never be weakened to make a fix pass.</description>
  </pattern>
  
  <pattern id="test_data_builders">
    <name>Test Data Builders for Database</name>
    <description>When mocking database entities for unit or component tests, we use the Factory pattern (Test Data Builders) located in `src/test/factories.ts`. This ensures mock objects are strictly typed against Drizzle ORM schemas and reduces boilerplate.</description>
  </pattern>
  
  <pattern id="colocation_of_diagrams">
    <name>Co-location of architecture diagrams</name>
    <description>For complex domain logic, calculators, and services (especially inside `src/lib/`), we maintain a `README.md` containing public API documentation and Mermaid architecture diagrams directly within the service's directory. This keeps the design close to the implementation.</description>
  </pattern>
</architecture_patterns>

## Architecture Decision Records (ADR)

### ADR-001: Antigravity as sole development agent

**Context**: Multiple AI tools (Cursor, Aider, Claude Code) were trialed, creating configuration conflicts.
**Decision**: Use only Antigravity. All agent config lives in AGENTS.md + `.agents/skills/`.
**Consequence**: Single source of truth for agent behavior. CLAUDE.md and other tool configs removed.

### ADR-002: Vercel Postgres (Neon) + Drizzle ORM

**Context**: App needs to persist race data, credentials, and derived analytics.
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

### ADR-005: Co-location of architecture diagrams

**Context**: Complex business logic (like calculators or API synchronizations) is hard to maintain without visual architecture diagrams, but global documentation folders easily get out of sync.
**Decision**: Keep Mermaid diagrams and documentation inside the specific service directories in `src/lib/` (e.g. in a local `README.md`).
**Consequence**: Diagrams are highly visible to developers touching the code, raising the likelihood of keeping them updated.

### ADR-006: Custom Test Data Builders for Database Mocks

**Context**: Need a standardized, type-safe way to mock database entities (Drizzle schemas) in tests without massive inline object boilerplate.
**Decision**: Implement custom Factory functions (Test Data Builders) in `src/test/factories.ts` using plain TypeScript.
**Alternatives considered**: Using `fishery` + `faker`. Rejected for now to avoid unnecessary dependencies, as the project's data structures are mostly numerical and straightforward.
**Consequence**: Test files are much cleaner. If schemas become deeply relational in the future, the `.build()` interface can easily be swapped to use `fishery` under the hood.

### ADR-007: Local RAG Integration via CLI Scripts

**Context**: The agent (Antigravity) needs access to specific framework documentation (e.g., React 19) without consuming massive token context or hallucinating features.
**Decision**: Use AnythingLLM as a local RAG server. Create domain-specific CLI scripts (e.g., `npm run ask-react-rag`) that the agent can invoke to query the workspace.
**Consequence**: The agent can autonomously retrieve precise, version-matched documentation. It enforces a JSON-only response format for programmatic parsing and maintains conversation threads in `.agents/rag-sessions/` to allow follow-up clarifications.

### ADR-008: XML tags for agent instructions

**Context**: AI agents (like Antigravity) sometimes miss critical constraints or rules when they are buried in plain markdown text.
**Decision**: Use XML tags (e.g., `<rule severity="CRITICAL">`, `<workflow>`, `<constraints>`) to wrap important instructions, checklists, and workflows in `.agents/skills/` and `AGENTS.md`.
**Consequence**: The agent parses these explicit structures more reliably, significantly reducing the chance of ignoring critical rules or hallucinating behaviors.
