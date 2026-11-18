# Modern Analytical Minimalism design system

The application uses the existing React, Tailwind, Motion, Recharts and React Three Fiber stack. No dependencies were added. Data generation and analytical functions were not changed.

## Foundations

| Token | Light | Dark | Purpose |
| --- | --- | --- | --- |
| --bg | #F7F8FA | #151A23 | Main application canvas |
| --panel | #FFFFFF | #1D2531 | Analytical cards and tables |
| --border | #E2E6ED | #323D4E | Card boundaries, dividers and controls |
| --text | #202936 | #EDF1F7 | Headings and primary data |
| --muted | #586579 | #AFB9C9 | Supporting labels |
| --accent | #4769A8 | #9BB4E0 | Navigation, actions and acquisition series |
| --secondary | #65A69B | #65A69B | Activation series and retention category |
| --highlight | #E3A46D | #E3A46D | Investigation and conversion emphasis |
| --positive | #347565 | #91C4B5 | Readable positive-state text |
| --negative | #AD4949 | #E8A2A2 | Readable negative-state text |

The supplied teal and warm highlight are visual accents. Darker or lighter text variants improve contrast in status text. Values, labels, arrows and status words communicate meaning in addition to color.

System fonts avoid remote font requests. The desktop heading is 25px, card headings 14px, primary values 28px and regular body/table text 12px. Supporting captions are subordinate. Cards share an 8px radius; controls use 6px. Shared panel, KPI, table, button, badge, filter and segmented-control styles apply to all eight pages.

## Layout

A compact sidebar and a 60px top bar frame the product. The Overview heading and filters precede KPIs. Analytical rows use a wider chart/retention column and a narrower funnel/recommendation column. The journey and experiment follow the primary metrics; 3D has its own analytical panel rather than serving as a hero.

At tablet widths, analytical rows stack while KPIs remain two columns. On narrow mobile screens, a hidden inert sidebar becomes an explicit menu, tables scroll inside their panels, and the journey uses a lightweight 2D view. Browser checks cover all eight views at 900px and 360px and the complete Overview at 390px.

## Motion and interaction

Panel entrance movement is 5px over 220ms. Page transitions remain brief. There are no continuously floating labels, particles, decorative spatial backgrounds or oversized marketing gradients. Glass is used only in overlays and search results.

The 3D scene maps six organization counts to six bars. Hovering a bar or focusing/clicking a stage control selects that stage. The visible readout provides the count and share of signups. Dampened camera controls are bounded; zoom and pan are disabled. Rendering occurs on demand. A 2D toggle gives the same data without WebGL, and reduced-motion/mobile preferences prevent 3D loading entirely.

## Accessibility and limits

Controls have visible focus outlines and native semantics. Chart legend toggles expose aria-pressed. Journey inspection is possible without pointing at a canvas. The mobile menu closes with Escape and restores focus to its toggle. Metric dialogs retain native focus management and Escape handling. Native tables provide chart values alongside graphical views.

Chromium automation and visual inspection are practical checks, not a formal accessibility certification. Physical-device GPU performance, screen-reader behavior and Safari/Firefox were not tested in this delivery.
