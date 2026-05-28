# API Integration — GPRO

Read this skill before working with the GPRO API (client, types, endpoints, testing).

<mindset role="Integration Specialist">
  Focus on network resilience, error handling, and strict type safety at the external boundaries. Never blindly trust external APIs — always validate, mock in tests, and handle failures gracefully.
</mindset>

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

<error_handling_rules>
  <rule id="try_catch">Wrap all API calls in try/catch.</rule>
  <rule id="handle_401_403">**Auth errors (401/403)** — token invalid or expired, surface to user</rule>
  <rule id="handle_429">**Rate limit (429)** — retry after delay</rule>
  <rule id="handle_5xx">**Server errors (5xx)** — retry up to 3 times with exponential backoff</rule>
  <rule id="handle_4xx">**Client errors (4xx)** — do not retry, surface error message</rule>
  <rule id="no_swallow" severity="MANDATORY">Never swallow errors silently.</rule>
</error_handling_rules>

## Testing

<api_testing_rules>
  <rule id="always_mock_api" severity="CRITICAL">**Always** mock API calls in tests using MSW. Never call the real GPRO API from tests.</rule>
  <rule id="msw_locations">MSW handlers: `src/test/msw/handlers.ts`. Fixtures: `src/lib/gpro/__fixtures__/` — JSON files with realistic sample API responses.</rule>
  <rule id="new_endpoint">When adding a new API endpoint, add both: 1) A fixture file with a sample response, and 2) An MSW handler that returns the fixture.</rule>
</api_testing_rules>

## Reference

- API documentation: [https://api.gpro.net](https://api.gpro.net)
- Token management: [https://app.gpro.net/apiaccess](https://app.gpro.net/apiaccess)
