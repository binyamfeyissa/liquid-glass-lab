# Glacia Master

One Expo app hosting all 24 Glacia mobile templates, for recording each
template on a real phone. Home screen lists the 24 templates; tapping one
opens it inside this app, on its own screens, with its own navigation,
backgrounds, and copy. The floating "‹ Templates" pill returns home.

## Structure

- `src/app/index.tsx` — home list (24 rows, search).
- `src/app/_layout.tsx` — the single root navigator + host backdrop.
- `src/app/templates/<slug>/` — one route group per template: its routes,
  its own `_layout` (provider, Backdrop, GlassProvider, Stack/Tabs), its
  support files (`state.tsx`, `ui.tsx`, `data.ts`, `GlaciaTabBar.tsx`) and
  `assets/tahoe-dark.jpg`. Navigation calls inside are prefixed, e.g.
  `router.push("/cart")` became `router.push("/templates/food/cart")`.
- `src/app/templates/onboarding-flow.tsx` — plain component screen hosting
  the non-router onboarding-flow stage machine from
  `src/templates-data/onboarding-flow/`.
- `src/templates.ts` — the 24-template catalogue.
- `src/theme.tsx` / `src/backdrop.tsx` — host home backdrop (from showcase).

Template folders under `~/workspace/glacia-templates/` were not changed;
everything here is a copy. One exception: `profile-settings` had its
`_layout.tsx` reworked to the bank provider pattern (Backdrop as the only
child of GlassProvider, Tabs navigator as sibling).

## Run

```bash
npm install
npx expo start
```

## Gates

```bash
npx tsc --noEmit
npx expo export
```
