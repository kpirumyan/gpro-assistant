# Next.js Patterns

Read this skill before creating routes, components, or data fetching logic.

<mindset role="Next.js Performance Architect">
  Focus on server-first rendering, hydration efficiency, and strict adherence to App Router paradigms. Push logic to the server. No unnecessary client-side weight or `useEffect` abuse.
</mindset>

> **Critical**: This project uses Next.js 16. APIs may differ from training data.
> Always read `node_modules/next/dist/docs/` before implementing new patterns.

<critical_constraints>
  <rule id="no_suppressions" severity="FATAL">
    <description>Strict No-Workarounds Policy</description>
    <action>As a strict project rule, **no suppressions or workarounds are allowed** anywhere in the codebase (including `eslint-disable` for hook dependencies, `@ts-ignore`, or `suppressHydrationWarning`). Always fix the underlying issue.</action>
  </rule>
  <rule id="use_effect_hydration" severity="CRITICAL">
    <description>Client Components & useEffect</description>
    <action>**Never** use `useEffect` for initial data fetching or setting default state on mount if that data can be fetched on the server.</action>
    <action>**Instead**, fetch the data in the parent Server Component and pass it down as initial props to the Client Component. Use these props to initialize state (e.g., `useState(initialData)`).</action>
    <action>`useEffect` should only be used for synchronization with external systems, subscriptions, or reacting to client-side state changes, NOT for initial hydration or avoiding Server Components.</action>
  </rule>
</critical_constraints>

## App Router

This project uses the App Router exclusively. No Pages Router.

### Route structure

```
src/app/
├── layout.tsx          # Root layout (fonts, nav, global styles)
├── page.tsx            # Home page (/)
├── globals.css         # Global styles + Tailwind imports
├── favicon.ico
├── fuel/page.tsx       # /fuel
├── tires/page.tsx      # /tires
├── setup/page.tsx      # /setup
└── settings/
    ├── page.tsx        # /settings
    └── page.test.tsx   # Settings page tests
```

### Adding a new route

1. Create `src/app/{route}/page.tsx`
2. Export a default function component
3. Use `PageShell` for consistent layout
4. Add navigation link in `src/components/AppNav.tsx`

## Components

### Server vs. Client

<component_rules>
  <rule id="default_server">**Default**: Server Components (no directive needed)</rule>
  <rule id="when_to_use_client">
    **Client**: Add `"use client"` at the top only when the component needs:
    - `useState`, `useEffect`, or other React hooks
    - Browser APIs (`localStorage`, `window`)
    - Event handlers (`onClick`, `onChange`)
    - Third-party client-only libraries
  </rule>
</component_rules>

### React Documentation

- Always refer to React documentation when in doubt about hooks or component lifecycle.
- If React documentation is available in `node_modules` (e.g., `node_modules/react/`), read it from there.
- If not available locally, search the official React documentation.

### Shared components (`src/components/`)

| Component | Purpose |
|-----------|---------|
| `AppNav` | Top navigation bar with active state |
| `PageShell` | Page wrapper with title + description |
| `SettingsApiKeyForm` | API key input form |

### Creating new components

- Place in `src/components/` if reusable across pages
- Place in `src/app/{route}/` if page-specific
- Co-locate tests as `ComponentName.test.tsx`
- Use TypeScript props types (no `any`)

## Domain logic (`src/lib/`)

Business logic lives here, **not** in components or pages. Keep pages thin — they compose components and call `src/lib/` functions.

```
src/lib/
├── README.md           # Convention notes
├── gpro/               # GPRO API client, types, fixtures
├── db/                 # Database client, schema (Drizzle)
└── calculators/        # Fuel, tire, setup calculation logic
```

## Data fetching

- **Server Components**: fetch data directly (async component functions)
- **Server Actions**: for mutations (form submissions, DB writes)
- **Route Handlers**: `src/app/api/{route}/route.ts` for REST endpoints if needed

## Styling

- **Tailwind CSS v4** with `@tailwindcss/postcss`
- Import: `@import "tailwindcss"` in `globals.css`
- Theme: custom inline via `@theme inline` in `globals.css`
- Fonts: Geist Sans (`--font-geist-sans`) + Geist Mono (`--font-geist-mono`) via `next/font/google`
- Dark mode: `prefers-color-scheme` media query + `dark:` Tailwind variants
- Color palette: zinc-based (zinc-50 through zinc-950)

## Metadata and SEO

```tsx
export const metadata: Metadata = {
  title: "Page Title — GPRO Assistant",
  description: "Page description for SEO",
};
```

Every page should export a `metadata` object. Use descriptive titles and descriptions.
