# UI Patterns

Read this skill before building or modifying user interface components.

<mindset role="UX/UI Perfectionist">
  Focus on details. Accessibility (a11y), responsive design, and pixel-perfect execution of the design system are non-negotiable. The interface must feel premium, dynamic, and flawless.
</mindset>

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
- Sidebar expanded width: `w-60` (`--sidebar-width-expanded: 15rem`)
- Sidebar collapsed width: `w-16` (`--sidebar-width-collapsed: 4rem`)

## Layout components

### `PageShell`

Wraps every page with consistent title + description:

```tsx
<PageShell title="Page Title" description="What this page does.">
  {/* page content */}
</PageShell>
```

All pages must use `PageShell`.

### `Sidebar`

Collapsible left sidebar navigation. Replaces the old `AppNav` horizontal header.

- **Client Component** (`"use client"`) — uses `useState`, `usePathname`, `localStorage`
- Toggle between expanded (icon + text) and collapsed (icon only) via hamburger button
- State persisted in `localStorage` (key: `sidebar-collapsed`), defaults to expanded on first visit
- Active page highlighted with left accent border + background
- CSS tooltips on hover when collapsed (via `SidebarTooltip`)
- Navigation links defined in `src/lib/nav-links.ts` (single source of truth)

When adding a new page:

1. Add route to the `navLinks` array in `src/lib/nav-links.ts` with `href`, `label`, and `icon`
2. Active state is automatic (based on `usePathname`)

## Form patterns

<form_rules>
  <rule id="settings_pattern">
    Follow the pattern established in `SettingsApiKeyForm`:
    - Wrap in `<section>` with card styling
    - Use `<label>` with `htmlFor` linking to input `id`
    - Validation with error messages (`role="alert"`)
    - Success messages (`role="status"`)
    - Styled inputs with focus ring transitions
    - Clear button with `aria-label`
  </rule>
</form_rules>

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

<accessibility_rules>
  <rule id="semantic_html">Semantic HTML: `<header>`, `<nav>`, `<main>`, `<section>`, `<form>`</rule>
  <rule id="form_labels" severity="MANDATORY">Every form input has a visible `<label>`</rule>
  <rule id="aria_roles">Error messages use `role="alert"`. Success/status messages use `role="status"`</rule>
  <rule id="aria_labels" severity="MANDATORY">Interactive elements have `aria-label` when text content is insufficient</rule>
  <rule id="keyboard_nav">Keyboard navigation: all interactive elements reachable via Tab</rule>
  <rule id="color_contrast">Color contrast: zinc palette meets WCAG AA by default</rule>
</accessibility_rules>

## Responsive design

- Mobile-first approach: base styles for mobile, `sm:` / `md:` / `lg:` for larger screens
- Navigation wraps on small screens (`flex-wrap`)
- Content max-width prevents ultra-wide layouts

## Animation

- Use Tailwind `transition` and `transition-colors` for hover/focus states
- Keep animations subtle — no flashy effects
- Prefer CSS transitions over JavaScript animations

## Hooks and state

<hooks_rules>
  <rule id="no_set_state_in_effect" severity="CRITICAL">
    <description>**ESLint `react-hooks/set-state-in-effect`**: calling `setState()` synchronously inside `useEffect` causes cascading renders and is flagged as a lint error.</description>
    <workaround>For post-mount DOM effects (e.g. enabling CSS transitions after hydration), use a **ref callback** + `requestAnimationFrame` instead of `useState` + `useEffect`. Example: `const enableTransition = useCallback((node) => { if (node) rAF(() => node.style.transitionDuration = '200ms'); }, [])` and pass as `ref={enableTransition}`.</workaround>
  </rule>
</hooks_rules>

