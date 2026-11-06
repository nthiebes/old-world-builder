# CLAUDE.md

Old World Builder is an army list builder for Warhammer: The Old World (https://old-world-builder.com). It's a client-only React PWA with no backend. Lists live in `localStorage`, with optional Dropbox sync.

## Commands

Package manager: **yarn** (Berry, `nodeLinker: node-modules`).

- `yarn dev`: Vite dev server (`--host`)
- `yarn test`: Vitest (watch mode; use `yarn test --run` for a single run)
- `yarn test --run src/utils/validation.test.js`: run one test file
- `yarn build`: production build into `build/` (with sourcemaps)
- `yarn deploy`: runs tests and the build, then publishes `build/` to GitHub Pages (`public/CNAME`)
- Lint: no script exists. Run `npx eslint <files>` (flat config in `eslint.config.mjs`)
- Format: Prettier, configured in `.prettierrc` (double quotes, no trailing commas, always parenthesize arrow params). Run `npx prettier --write <files>`

CI (`.github/workflows/ci.yml`) runs only `yarn test` on PRs to `main`, using Node 22.

## Stack

React 17, Redux Toolkit, react-router-dom **v5** (`Switch`/`Route`, not v6 APIs), react-intl, react-helmet-async, react-beautiful-dnd, Workbox service worker, Sentry, Vite 7, and Vitest. The source is plain JavaScript/JSX with no TypeScript.

## Layout

- `src/App.jsx`: all routes. Mobile and desktop use **separate route trees**: `isMobile` is set from a `max-width: 1279px` media query, and desktop renders nested two-column routes. A new route usually needs to be added in both trees.
- `src/pages/<name>/`: one folder per page: `Name.jsx`, `Name.css`, and an `index.js` re-export. `src/components/<name>/` follows the same pattern.
- `src/state/`: Redux slices (`lists`, `army`, `items`, `errors`, `rulesIndex`, `settings`, `login`). The store is configured in `src/store.js`.
- `src/utils/`: domain logic. The most important files:
  - `points.js`: points calculation for units and lists
  - `validation.js` + `validation-checks.js`: list validation (composition rules, general, BSB, and so on)
  - `rules.js`: per-army and per-composition category limits (percentages, unit min/max)
  - `army.js`: turns a fetched dataset into army data (`getArmyData`)
  - `unit.jsx`: unit helpers (names, unit strength, items)
  - `list.js`: persists lists to `localStorage`
  - `dropbox-auth-and-synchronization.js`: Dropbox login and sync (auto-sync every 30s while the tab is visible)
  - `magic-item-limitations.js`: rules for which magic items a unit may take
  - Tests sit next to their source as `*.test.js`
- `src/i18n/*.json`: UI strings for en, de, fr, es, it, pl, cn.
- `src/components/rules-index/`: links rule names to the external rules index (`rules-index-export.json` + `rules-map.js`).
- `docs/datasets.md`: **reference for the dataset JSON format.** Read it before editing army data.

## Army data (most commits touch this)

- `src/assets/the-old-world.json` is the game-system manifest: armies, `armyComposition` options (Armies of Infamy and others), allowed `items` categories, `allies`, `mercenaries`, and optional `versions` per composition.
- `public/games/the-old-world/<army-id>.json` holds the unit datasets (`characters`, `core`, `special`, `rare`, `mercenaries`, `allies`), and `magic-items.json` holds the magic items. These are **fetched at runtime** and are not bundled.
- `public/games/the-old-world/1.5/` holds older dataset versions, which lists can pin through `versions`. `public/games/warhammer-fantasy/` holds legacy WHFB data.
- Fetches append `?v=<version>`, where the version is `VITE_VERSION`, which `.env` sets from `$npm_package_version`. **Bump `version` in `package.json` when you change dataset files** so the service worker and browser caches pick up the change (see recent "fix …" commits).
- Localized fields follow the `name_<lang>` pattern (`name_en`, `name_de`, `name_fr`, `name_es`, `name_it`, `name_pl`, `name_cn`). `name_en` is required and acts as the fallback. Keep IDs kebab-case and unique.
- Users can load custom game systems and datasets (`owb.systems` and `owb.datasets` in `localStorage`, see `utils/game-systems.js`). Keep the format backwards compatible.

## Conventions

- Named exports for components (`export const Editor = () => …`).
- Every user-facing string goes through react-intl (`FormattedMessage` / `intl.formatMessage`). When you add a key, add it to **all seven** `src/i18n/*.json` files (English text is fine as a placeholder).
- `localStorage` keys are prefixed `owb.` (`owb.lists`, `owb.settings`, …). Space is limited, and the rule-description cache shares the same quota.
- Changelog entries go in `src/pages/changelog/Changelog.jsx`, with any i18n keys they need added to every language file.
- Page titles and canonical links are set with `<Helmet>` on each page.
