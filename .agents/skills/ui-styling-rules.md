# UI Patterns

Read this skill before building or modifying user interface components.

## Design system

### Colors

Zinc-based palette with dark mode support:

| Usage       | Light              | Dark                |
|-------------|--------------------|--------------------|
| Background  | `zinc-50` / white  | `zinc-950`         |
| Foreground  | `zinc-900`         | `zinc-50`          |
| Muted text  | `zinc-600`         | `zinc-400`         |
| Borders     | `zinc-200`         | `zinc-800`         |
| Cards       | white              | `zinc-900/60`      |
| Interactive | `zinc-900` bg      | `zinc-50` bg       |

Dark mode is driven by `prefers-color-scheme` media query. Use `dark:` variants in Tailwind classes.

### Typography

- Primary: Geist Sans (`font-sans` / `--font-geist-sans`)
- Monospace: Geist Mono (`font-mono` / `--font-geist-mono`)
- Loaded via `next/font/google` in root layout

### Spacing and sizing

- Max content width: `max-w-5xl` with `px-4` horizontal padding
- Page padding: `py-10`
- Component spacing: use Tailwind `space-y-*` and `gap-*` utilities

## Layout components

### `PageShell`

Wraps every page with consistent title + description:

```tsx
<PageShell title="Page Title" description="What this page does.">
  {/* page content */}
</PageShell>
```

All pages must use `PageShell`.

### `AppNav`

Top navigation bar. When adding a new page:

1. Add route to the `links` array in `src/components/AppNav.tsx`
2. Active state is automatic (based on `usePathname`)

## Form patterns

Follow the pattern established in `SettingsApiKeyForm`:

- Wrap in `<section>` with card styling
- Use `<label>` with `htmlFor` linking to input `id`
- Validation with error messages (`role="alert"`)
- Success messages (`role="status"`)
- Styled inputs with focus ring transitions
- Clear button with `aria-label`

### Input styling

```
rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900
outline-none transition
focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10
dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50
dark:focus:border-zinc-50 dark:focus:ring-zinc-50/10
```

### Button styling

```
rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white
transition hover:bg-zinc-700
focus:outline-none focus:ring-2 focus:ring-zinc-900/20
dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200
```

## Accessibility

- Semantic HTML: `<header>`, `<nav>`, `<main>`, `<section>`, `<form>`
- Every form input has a visible `<label>`
- Error messages use `role="alert"`
- Success/status messages use `role="status"`
- Interactive elements have `aria-label` when text content is insufficient
- Keyboard navigation: all interactive elements reachable via Tab
- Color contrast: zinc palette meets WCAG AA by default

## Responsive design

- Mobile-first approach: base styles for mobile, `sm:` / `md:` / `lg:` for larger screens
- Navigation wraps on small screens (`flex-wrap`)
- Content max-width prevents ultra-wide layouts

## Animation

- Use Tailwind `transition` and `transition-colors` for hover/focus states
- Keep animations subtle — no flashy effects
- Prefer CSS transitions over JavaScript animations
