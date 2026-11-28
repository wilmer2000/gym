# gym

Hybrid application (web/PWA) built with **Angular 21** (standalone components,
signals-based architecture). UI text is in Spanish.

## Stack

- **Angular 21**: standalone components, `OnPush`, inline
  `template:`/`styles:` (larger markup uses a sibling `.html` with
  `templateUrl`), `app.config.ts` (no `.module` files).
- **Tailwind v4** via `@tailwindcss/postcss`: utility classes without the
  `u-` prefix (`w-56`, `py-8`, `bg-gray-950`); theme tokens live in
  `src/styles.css`.
- **SQLite** (`sql.js`), executed in the browser and persisted as a binary
  in IndexedDB (the wasm is copied from `node_modules/sql.js/dist/` to
  `db/` at build time).
- Additional dependencies: `@bryllim/workout-guide` (the app's base
  framework), `@ng-icons/core` + `@ng-icons/huge-icons` (icon set,
  registered via `provideIcons`), `chart.js`/`js-chart-json`, `rxjs` and
  `puppeteer` (screenshots).

## Features

The app currently has four features in `src/app/features/`: **dashboard**,
**exercises**, **plans** and **profile** (each with its own
`<name>.route.ts`; the root path redirects to the dashboard). The menu is
extensible and each feature declares the items it adds.

## Structure

```
src/app/
├── app.routes.ts         # Router: main routes (menu, features, config)
├── app.shell.html        # PWA manifest
├── app.config.ts         # App configuration and initialization
├── core/
│   ├── components/       # Layout primitives and generic visual components
│   │   ├── container/    # container, dialog, info, popover
│   │   ├── form/         # fields and form controls
│   │   ├── layout/       # base, grid, menu
│   │   ├── material/     # material design: icons, switch
│   │   ├── table/        # table
│   │   └── window/       # window
│   ├── constants/        # Global constants (menu)
│   ├── module/           # Base service for modules
│   ├── modules/
│   │   ├── analytics/    # Chart configuration (chart.js)
│   │   ├── color/        # Dynamic color palette and tokens
│   │   ├── config/       # Application configuration
│   │   ├── database/     # SQL layer: SqlDatabase, SQL services, repositories
│   │   ├── filters/      # Filters for tables and records
│   │   ├── form/         # Wrappers for forms and inputs
│   │   ├── http/         # Http calls with progress indicator
│   │   ├── icons/        # Icon registration (@ng-icons)
│   │   ├── markdown/     # Markdown to Angular Material
│   │   ├── material/     # Material: colors, direct, icons
│   │   ├── menu/         # Menu and items
│   │   ├── metrics/      # Metrics and units
│   │   ├── navigation/   # Browser history
│   │   ├── records/      # Base record
│   │   ├── records-table/# Table of records
│   │   ├── search/       # Database search
│   │   ├── table/        # Cell, column, row, virtualization
│   │   ├── table-pager/  # Table with pagination
│   │   ├── template/     # Base templates (HTML)
│   │   ├── time/         # Time: calendars, dates, times
│   │   └── websocket/    # WebSockets
│   ├── prompts/          # Prompts (UI and CLI)
│   ├── repository/       # Shared repository contracts
│   ├── routes/           # Shared routes
│   ├── services/         # storage
│   └── shared/           # Shared interfaces
├── features/             # Features: dashboard, exercises, plans, profile
│   └── <name>/           # components/, plus constants/ schemas/ interfaces/
│                          repositories/ pipes/ utils/ as needed, and <name>.route.ts
└── shared/
    └── components/       # Reusable presentational components: badge, disc, drag-list, section, week
```

## Data model

- **`SqlDatabase`** (`core/modules/database/services/sql-database.ts`) keeps
  one SQLite `Database` per connection in memory, persisted as a binary in
  IndexedDB (`sqlite_store`), under its `dbKey`; the wasm module is loaded
  once and shared by both connections.
- Each feature declares its schema next to it; SQL services bind them to a
  connection: `gym_main` (`MAIN_SCHEMA`, in `features/plans/schema.ts`) and
  `gym_exercises` (`EXERCISES_SCHEMA`, in `features/exercises/schema.ts`).
  Migrations are declared together with the schema (e.g.
  `PLAN_EXERCISES_SETS_MIGRATION`).
- Repositories extend `RepositoryBase<T>` (in `core/modules/database/repository/`)
  and declare only: table, default order, id column and row conversions
  (`toRow()`/`fromRow()`); SQL generation, bulk save and persistence live
  in the base.
- `app.config.ts` initializes the database at startup with `intiDatabase`
  (sic).
- `ConfigService` is the documented exception: it calls `SqlDatabase`
  directly to backup/restore the binary.

## Requirements

- Use the **core** components and modules (see `src/app/core/`) instead of
  creating or installing equivalents.
- Features follow the structure of `src/app/features/`: one folder per
  feature with its `*.route.ts` and its own components, schemas and
  services.
- Use the **core modules** (`filters`, `form`, `table`, `table-pager`,
  `records-table`, `menu`, `navigation`, `search`, `time`, `color`, …) with
  their conventions.
- Forms use the wrappers of `core/modules/form/`; tables use `Table`/`TablePager`
  (or `RecordsTable`) with `Filter[]` from `core/modules/filters/`.
- Add tables in the feature's `schema.ts` and bind them in a SQL service
  (extension of `SqlDatabase`); register the database initialization in
  `app.config.ts`.
- Reusable presentational components go in `src/app/shared/components/`
  (e.g. `app-badge` for icon + label chips: `<app-badge [icon]="…" [label]="…" [color]="…" />`,
  color defaults to `bg-gray-600/30`).
- Feature pipes live in `features/<name>/pipes/` (standalone, one file per
  concern; e.g. `exercise.pipe.ts` exports `exerciseType`, `exerciseTypeIcon`,
  `exerciseEquipment` and `exerciseEquipmentIcon`).

## Development

- `npm run serve` → `localhost:8080`.
- `npm run build-sql`: copy the `sql.wasm` file from `node_modules/sql.js/dist/`
  to `db/` (`db/sql.wasm`). The `serve`/`start` targets already run it.
- `npm run run`: prepare the PWA (`build-sql`) and execute it.

## Build

- Production builds (`npm run build`) register an Angular service worker
  (`ngsw-config.json`); `PwaUpdate` (`src/app/PwaUpdate/`) asks the user to
  reload when a new version is ready.
- `ng deploy` serves the generated `dist/` folder; `--preview` is available.
