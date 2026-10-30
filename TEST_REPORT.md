# LUXE — Test report

**Verification date:** 25 October 2026 · **Build:** production (`pnpm build`, prerendered) served by `vite preview` at http://127.0.0.1:4175/

## Results

| Check                           | Result                                                                                                                        |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| TypeScript (`tsc -b`)           | Passed                                                                                                                        |
| Production build (`pnpm build`) | Passed (client build, SSR build, prerender)                                                                                   |
| Unit / component (Vitest)       | 18 / 18 passed                                                                                                                |
| Browser (Playwright, Edge)      | 22 / 22 passed against the production preview; 22 / 22 against the dev server                                                 |
| Accessibility (axe-core)        | 0 violations for `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa` on the page, product dialog, lightbox and mobile menu |
| Formatting (Prettier)           | Passed                                                                                                                        |
| Production smoke test           | HTTP 200, no browser errors, no external requests, dialog and form passed                                                     |
| CSP from `vercel.json`          | 0 violations when the header is applied locally                                                                               |

## Regression coverage for the audit findings

- Dialogs are centred on desktop and form a bottom sheet on phones; the title never overlaps the photo.
- No visible text below 12 px at 375, 390, 768, 1024, 1440 and 1920 px.
- The hero headline never overlaps the hero photograph at those widths, and the mobile hero spans the full width.
- The hero is prerendered and its image is fully opaque from the first paint.
- Every photograph is used once and appears in `sources.json` with the Unsplash License.
- No paragraph or slogan is repeated on the page.
- Each product card has exactly one keyboard stop.
- Enquiring about a piece closes the dialog, moves focus to the form and pre-fills it.
- The mobile menu moves focus to the chosen section; the desktop nav marks the active section.
- The lightbox supports buttons, arrow keys, Home/End, swipe, Escape and focus return.
- Reveals finish under normal motion and nothing is hidden under reduced motion.
- No horizontal overflow, broken images or console errors at all six widths.

## Lab performance sample

Headless Edge, cold cache, 3 runs each, local server (no CDN). Mobile profile: 390 × 844, ~1.6 Mbps / 150 ms latency, 4× CPU slowdown.

| Profile          | FCP          | LCP            | CLS | Long-task time over 50 ms | Transfer |
| ---------------- | ------------ | -------------- | --- | ------------------------- | -------- |
| Desktop 1440     | 144–168 ms   | 144–168 ms     | 0   | 4–8 ms                    | ~360 kB  |
| Mobile throttled | 992–1,028 ms | 1,008–1,044 ms | 0   | 171–187 ms                | ~349 kB  |

Bundle: JS 355 kB (113.7 kB gzip), CSS 25.9 kB (6.2 kB gzip), HTML 2.2 kB plus prerendered markup.

These are lab samples, not Lighthouse scores or field data. Lighthouse was not available in this environment.

## Limits

- Browsers: Microsoft Edge (Chromium) only. Safari, iOS Safari, Firefox, physical devices and screen readers were not tested.
- Scroll-driven parallax uses CSS `animation-timeline` and only runs in browsers that support it.
- The Vercel headers were checked locally; no deployment was made.
