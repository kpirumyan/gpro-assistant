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

## Setup

```bash
npm install
cp .env.example .env.local
```

Add your API token to `.env.local` (get one at [https://app.gpro.net/apiaccess](https://app.gpro.net/apiaccess)):

```
GPRO_API_TOKEN=your_token_here
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command                | Description               |
| ---------------------- | ------------------------- |
| `npm run dev`          | Start dev server          |
| `npm run build`        | Production build          |
| `npm run start`        | Start production server   |
| `npm run lint`         | Run ESLint                |
| `npm run lint:fix`     | Run ESLint with auto-fix  |
| `npm run format`       | Format with Prettier      |
| `npm run format:check` | Check Prettier formatting |

## Deploy (Vercel)

1. Push to [GitHub](https://github.com/kpirumyan/gpro-assistant).
2. Import the repository in [Vercel](https://vercel.com) (Framework: Next.js).
3. Add `GPRO_API_TOKEN` in Project → Settings → Environment Variables when API integration is ready.

Production deploys run automatically on push to the default branch.

## API reference

- Documentation: [https://api.gpro.net](https://api.gpro.net)
- Token: [https://app.gpro.net/apiaccess](https://app.gpro.net/apiaccess)
