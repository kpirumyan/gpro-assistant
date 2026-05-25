# GPRO Assistant

Next.js app for collecting, visualizing, and analyzing data from the [GPRO Public API](https://api.gpro.net/).

## Pages

| Route       | Description                 |
| ----------- | --------------------------- |
| `/`         | Home                        |
| `/fuel`     | Fuel consumption calculator |
| `/tires`    | Tire wear calculator        |
| `/setup`    | Car setup                   |
| `/settings` | App settings                |

## Prerequisites

- Node.js 20+
- npm
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) database (Neon)

## Setup

```bash
npm install
cp .env.example .env.local
```

Add your Vercel Postgres connection details to `.env.local` (get them from Vercel Dashboard → Storage → your database).

The GPRO API token is configured in the app's Settings page and stored in the database.

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command                 | Description               |
| ----------------------- | ------------------------- |
| `npm run dev`           | Start dev server          |
| `npm run build`         | Production build          |
| `npm run start`         | Start production server   |
| `npm run lint`          | Run ESLint                |
| `npm run lint:fix`      | Run ESLint with auto-fix  |
| `npm run format`        | Format with Prettier      |
| `npm run format:check`  | Check Prettier formatting |
| `npm run test`          | Run tests (Vitest)        |
| `npm run test:watch`    | Run tests in watch mode   |
| `npm run test:coverage` | Run tests with coverage   |

## Testing

Vitest + React Testing Library + MSW. Every `git commit` runs `npm run test` and `npm run lint` via Husky (`pre-commit` hook). To skip in an emergency: `git commit --no-verify`.

## Architecture

See **[ARCHITECTURE.md](ARCHITECTURE.md)** for project structure, data flow, patterns, and architecture decision records.

## Deploy (Vercel)

1. Push to [GitHub](https://github.com/kpirumyan/gpro-assistant).
2. Import the repository in [Vercel](https://vercel.com) (Framework: Next.js).
3. Connect Vercel Postgres (Neon) in Project → Storage.

Production deploys run automatically on push to the default branch.

## API reference

- Documentation: [https://api.gpro.net](https://api.gpro.net)
- Token: [https://app.gpro.net/apiaccess](https://app.gpro.net/apiaccess)
