# API Integration — GPRO

Read this skill before working with the GPRO API (client, types, endpoints, testing).

## Overview

The app fetches game data from the [GPRO Public API](https://api.gpro.net). All API interaction is centralized in `src/lib/gpro/`.

## Authentication

The GPRO API token is stored in the **database** (Vercel Postgres / Neon), not in environment variables. The Settings page form (`SettingsApiKeyForm`) allows the user to save and update the token. The API client reads the token from the database at request time.

## Directory structure

```
src/lib/gpro/
├── client.ts          # API client — wraps all HTTP requests
├── types.ts           # TypeScript types matching API responses
└── __fixtures__/      # Sample API responses (JSON) for tests
    └── race-result.json
```

## API client (`client.ts`)

A module that wraps all HTTP requests to the GPRO API. Instead of writing `fetch("https://api.gpro.net/...")` in every component, call typed functions like `getRaceData()`, `getCarSetup()`.

Responsibilities:
- Set auth headers (read token from DB)
- Handle HTTP errors consistently
- Retry on transient failures (5xx, network errors)
- Respect rate limits
- Return typed responses

## Type definitions (`types.ts`)

TypeScript interfaces/types that match the GPRO API response shapes. Keep in sync with the [API documentation](https://api.gpro.net).

## Error handling

- Wrap all API calls in try/catch.
- Distinguish between:
  - **Auth errors (401/403)** — token invalid or expired, surface to user
  - **Rate limit (429)** — retry after delay
  - **Server errors (5xx)** — retry up to 3 times with exponential backoff
  - **Client errors (4xx)** — do not retry, surface error message
- Never swallow errors silently.

## Testing

- **Always** mock API calls in tests using MSW.
- Never call the real GPRO API from tests.
- MSW handlers: `src/test/msw/handlers.ts`
- Fixtures: `src/lib/gpro/__fixtures__/` — JSON files with realistic sample API responses.
- When adding a new API endpoint, add both:
  1. A fixture file with a sample response
  2. An MSW handler that returns the fixture

## Reference

- API documentation: [https://api.gpro.net](https://api.gpro.net)
- Token management: [https://app.gpro.net/apiaccess](https://app.gpro.net/apiaccess)
