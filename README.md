# LUXE — Furniture for slower rooms

A self-initiated website for a fictional European furniture studio, designed and built as an Upwork portfolio project. LUXE presents a six-piece collection, three signature pieces, a materials story and a photographic journal.

**This is a demonstration.** Product names, dimensions, materials and prices are invented. Photography is licensed stock used for illustration, not LUXE products or client work. The consultation form validates in the browser and never sends or stores anything. There is no checkout, analytics, backend or account system.

## Local preview

Requirements: Node.js **22.12 or later** and pnpm **11.25.0**.

```sh

pnpm install --frozen-lockfile
pnpm build
pnpm preview
```

Open **http://127.0.0.1:4175/** for the production build (prerendered HTML, as deployed). For development with hot reload, run `pnpm dev` and open **http://127.0.0.1:5183/**.

If a restricted Windows environment cannot create pnpm store links:

```sh
pnpm install --frozen-lockfile --node-linker=hoisted --store-dir=node_modules/.pnpm-store
```

## Experience

- Split hero with a prerendered, preloaded photograph that is visible on first paint.
- Sticky header with an active-section indicator and a full-screen mobile menu that moves focus to the chosen section.
- Collection filters with live counts, single-stop product cards, a horizontal snap carousel on phones, and product dialogs (centred on desktop, bottom sheet on phones).
- "Enquire about this piece" closes the dialog, scrolls to the consultation form and pre-fills it.
- Signature selector with roving tabs (arrow keys, Home, End) and cross-faded photography.
- Materials and journal sections with CSS scroll-driven parallax where supported.
- Journal lightbox with previous/next buttons, arrow keys, Home/End, swipe gestures and Escape.
- Consultation form with inline errors, first-error focus and an honest local confirmation.
- Skip link, visible focus styles, minimum 12 px type, and full `prefers-reduced-motion` support.

## Technology

| Area                          | Technology                                                                                                    |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------- |
| UI                            | React 19, TypeScript 7                                                                                        |
| Tooling                       | Vite 8, pnpm, build-time prerender with `react-dom/server`                                                    |
| Styling                       | Hand-written CSS with design tokens (no CSS framework)                                                        |
| Motion                        | CSS keyframes and transitions, Intersection Observer reveals, Motion for React (`LazyMotion`) for cross-fades |
| Icons                         | Lucide React                                                                                                  |
| Typography                    | Self-hosted Cormorant Garamond and Inter variable WOFF2                                                       |
| Images                        | Local responsive WebP with `srcset`, preloaded hero, lazy loading below the fold                              |
| Unit / component tests        | Vitest, Testing Library, jsdom                                                                                |
| Browser / accessibility tests | Playwright, axe-core                                                                                          |

## Design system

| Token        | Value     | Use                                       |
| ------------ | --------- | ----------------------------------------- |
| `--ivory`    | `#F4EFE7` | Page canvas                               |
| `--paper`    | `#FAF7F2` | Dialogs and light surfaces                |
| `--stone`    | `#EBE4D9` | Alternate sections                        |
| `--ink`      | `#221D19` | Headings, buttons                         |
| `--ink-soft` | `#4B423A` | Body text                                 |
| `--muted`    | `#6D6257` | Secondary text (≥ 4.5:1 on light colours) |
| `--bronze`   | `#7A5B41` | Accents, indices, focus rings             |
| `--night`    | `#1F1A16` | Materials section, lightbox, footer       |

Type scale: body 16–17 px, labels 12 px uppercase, lead 20–26 px serif, headings fluid from 40 to 108 px. Layout uses a 1,440 px content width with fluid gutters.

## Project structure

```text
03-luxe/
  public/                  Fonts, WebP photography, source manifest, OG image
  src/
    components/            Navigation, Collection, Signature, Lookbook, Contact, Primitives
    test/                  Component, validation and content-integrity tests
    App.tsx                Page composition (hero, statement, approach, materials, footer)
    Root.tsx               Providers shared by the client and the prerender
    entry-server.tsx       Server render entry used at build time
    data.ts                Typed collection, signature and journal data
    styles.css             Tokens, layout, responsive rules, motion
  tests/                   Playwright browser, responsive and accessibility checks
  scripts/                 Asset, credit, social-image, prerender and screenshot utilities
  screenshots/             Captures at 375, 390, 768, 1024, 1440 and 1920 px
```

## Checks

```sh
pnpm typecheck
pnpm test
pnpm build
pnpm test:browser
pnpm format:check
```

On Windows the browser tests use installed Microsoft Edge (`LUXE_BROWSER_CHANNEL` overrides it). To test the production build, run `pnpm preview` and set `LUXE_BASE_URL=http://127.0.0.1:4175`. Screenshots are regenerated with `node scripts/capture_screenshots.mjs` against a running preview. See `AUDIT_REPORT.md` for measured results.

## Assets

The website makes no external requests. Photographers, photo pages and licenses are listed in `ASSET_CREDITS.md` and `public/images/sources.json`, and credited in the site footer. To regenerate images (Python with Pillow and internet access):

```sh
python scripts/prepare_assets.py
python scripts/write_credits.py
python scripts/make_social_images.py
```


## GitHub and Cloudflare Pages

Prepared as the standalone **luxe** repository. Run all commands from the cloned repository root. The package name is `luxe-furniture-concept`; it is an internal package identifier. `private: true` prevents accidental npm publication and does not make a GitHub repository private.

| Setting | Value |
| --- | --- |
| Framework | React, TypeScript and Vite with build-time prerendering |
| Package manager | pnpm 11.25.0 |
| Verified Node.js | 24.22.1 |
| Build command | `pnpm install --frozen-lockfile && pnpm run build` |
| Build output | `dist` |
| Root directory | Leave empty (repository root) |
| Required application secrets | None |

The existing `build` package script also works with `npm run build` after dependencies are installed; pnpm is used for reproducible installation from the committed lockfile. See [CLOUDFLARE_PAGES.md](CLOUDFLARE_PAGES.md) for the build environment and connection instructions.

This repository is a frontend portfolio demonstration. No hosting deployment is performed by these preparation steps.
