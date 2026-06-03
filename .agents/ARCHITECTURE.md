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
│   ├── adr/                    # Architecture Decision Records
│   ├── ARCHITECTURE.md         # This file
│   ├── plugins/                # Agent plugins (chrome-devtools)
│   └── rules/                  # On-demand rule files loaded by trigger
│       ├── api-integration.md
│       ├── code-review.md
│       ├── database.md
│       ├── documentation.md
│       ├── interaction-modes.md
│       ├── rag-usage.md
│       ├── terminal.md
│       ├── testing.md
│       ├── ui-styling.md
│       ├── workflow.md
│       └── xml-standard.md
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
│   │   ├── Sidebar.tsx         # Collapsible sidebar navigation
│   │   ├── SidebarTooltip.tsx  # CSS tooltip for collapsed sidebar icons
│   │   ├── PageShell.tsx       # Page wrapper (title + description)
│   │   ├── ClientDate.tsx      # Date formatter component
│   │   └── StatBar.tsx         # Reusable gradient stat bar
│   ├── lib/                    # Domain logic (keep pages thin)
│   │   ├── gpro/               # GPRO API client, types, fixtures
│   │   ├── db/                 # Database client + schema
│   │   ├── nav-links.ts        # Navigation link definitions (icons + routes)
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

## Domain Models

- **Raw Race Data**: The raw JSON output from GPRO API for a specific race.
- **Race Analytics**: Derived data for specific components (e.g. Fuel, Tyres). Stored in `race_fuel_analytics` and `race_tyre_analytics`. Aggregated either per stint or for the full race.

## Key patterns

<architecture-patterns>
  <pattern id="single_component_per_file">
    <name>Single component per file</name>
    <description>Never have multiple React components in one file. Each component should be extracted to its own file.</description>
  </pattern>
  
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
  
  <pattern id="client_state_persistence">
    <name>Client state persistence via useLocalStorage hook</name>
    <description>For persisting client-side UI state (like sidebar expansion or fuel unit selection), we use the custom `useLocalStorage` hook located in `src/hooks/useLocalStorage.ts`. This hook safely handles hydration, prevents cascading renders, and wraps access in `try/catch` to prevent crashes in strict browser environments (e.g. Safari private mode).</description>
  </pattern>
</architecture-patterns>

## Architecture Decision Records (ADR)

The project's architectural decisions are documented as standalone ADR markdown files in the [.agents/adr/](.agents/adr/) directory:

- [ADR-001: Antigravity as sole development agent](.agents/adr/adr-001-antigravity-development-agent.md)
- [ADR-002: Vercel Postgres (Neon) + Drizzle ORM](.agents/adr/adr-002-vercel-postgres-drizzle.md)
- [ADR-003: TDD-first workflow](.agents/adr/adr-003-tdd-workflow.md)
- [ADR-004: Conventional Commits](.agents/adr/adr-004-conventional-commits.md)
- [ADR-005: Co-location of architecture diagrams](.agents/adr/adr-005-co-location-diagrams.md)
- [ADR-006: Custom Test Data Builders for Database Mocks](.agents/adr/adr-006-custom-test-data-builders.md)
- [ADR-007: Local RAG Integration via CLI Scripts](.agents/adr/adr-007-local-rag-integration.md)
- [ADR-008: XML tags for agent instructions](.agents/adr/adr-008-xml-tags-instructions.md)
- [ADR-009: Universal Fuel Consumption Unit (L/km)](.agents/adr/adr-009-universal-fuel-consumption-unit.md)
- [ADR-010: Transition from Context Plugins to On-Demand RAG](.agents/adr/adr-010-rag-over-plugins.md)
- [ADR-011: XML Standard Specification as Permanent Reference](.agents/adr/adr-011-xml-standard-spec.md)
