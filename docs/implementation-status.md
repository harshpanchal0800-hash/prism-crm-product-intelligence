# Implementation status

Updated November 18, 2026 — Modern Analytical Minimalism redesign.

## Delivered

The existing eight-view React frontend now uses a light-first analytical design system. The Overview begins with compact KPIs, adoption/acquisition trends and the ordered funnel. Cohort retention, a computed executive recommendation, an inspectable product journey and the existing experiment scorecard follow. The marketing hero, particles, floating KPI labels and decorative glass backgrounds were removed.

All screens share the requested blue/teal/highlight palette, white or charcoal cards, neutral borders, system typography, restrained shadows and reusable control styles. Glass blur is limited to search results, dialogs and overlays. Saved theme preferences are preserved; new sessions default to light mode.

Chart-series buttons toggle plotted series. The compact product journey supports 2D/3D modes, meaningful bar hover, damped camera movement, and keyboard-accessible stage inspection. Mobile and reduced-motion users get the same counts in a 2D view without downloading 3D code. Closed mobile navigation is inert; Escape dismisses it and restores focus.

The queued page-exit animation could retain stale content during rapid navigation. It was replaced with a short entrance transition. A browser regression check verifies the rendered view matches the selected route.

## Preserved scope

The seeded dataset, event generator, analytical calculations, cohort maturity rules, funnel ordering, experiment method, filters, navigation destinations, metric dialogs and JSON export are unchanged. No packages were added or upgraded. No backend/API integrations existed in the repository; none were invented or removed. The original portfolio narrative remains in original-case-study.md.

## Final verification

| Check | Result |
| --- | --- |
| npm run build | Passed: strict TypeScript and production Vite build |
| npm test | Passed: all 7 analytical invariant/edge-case tests |
| npx playwright test | Passed: all 3 production-preview browser tests |
| Desktop | Eight routes, chart toggles, 2D/3D switching, keyboard stage selection, filters, dialog Escape, report export, theme persistence, sidebar collapse |
| Mobile | 390px Overview, inert navigation, Escape and focus restoration, cohort layout, no 3D network request |
| Responsive layouts | All eight views at 900px tablet and 360px narrow mobile: no page-level horizontal overflow |
| Reduced motion | No canvas on mobile or desktop; no Spatial bundle requested on the tested mobile path |
| Runtime exceptions | No page errors observed in the desktop regression run |
| Visual review | Current light/dark desktop and light mobile screenshots captured; inspected light/dark palette, layout and 3D rendering |

The optional spatial bundle is about 920 KB minified / 249 KB gzip, so Vite retains its large-chunk warning. It is dynamically imported; the HTML has no spatial preload. Rendering is on demand, DPR is capped at 1.5, and the scene contains no particles, external models or textures. The main JavaScript is about 387 KB minified / 124 KB gzip. These are build observations, not physical-device performance measurements.

## Known limits

This remains a synthetic portfolio frontend. Database persistence, SQL query suite, authentication, messaging, external CRM/analytics/LLM integrations, actual randomized experiments and production monitoring remain outside the implemented scope. Labels and methodological disclosures remain visible.

Verification used Chromium desktop/mobile emulation. Physical-device GPU behavior, Safari/Firefox, screen readers and a formal accessibility audit were not checked. No remote deployment or Git push was performed.

Dependencies were unchanged in this redesign. The previous runtime audit found zero vulnerabilities; the previous full audit reported four high-severity development dependency findings in the picomatch/fdir/tinyglobby/Vite chain. Those baseline findings remain documented and were not hidden by a forced downgrade.

See design-system.md for the palette, component rules, interaction behavior and responsive decisions.

