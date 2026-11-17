# Gym

Angular app with data stored in the browser: SQLite (`sql.js`) persisted as a binary in IndexedDB. There is no backend.

## Stack

- Angular 21 (standalone components, signals, `OnPush`, `@if`/`@for` control flow).
- Tailwind CSS v4 via `@tailwindcss/postcss` (utility classes without the `u-` prefix), theme tokens in `src/styles.css`.
- `sql.js` as the in-browser SQLite engine; the `.wasm` is copied to `db/` at build time.
- `chart.js` for charts.
- `papaparse` to read the bank CSVs.
- `rxjs` for CSV parsing and modal/service worker events.
- Service worker (`ngsw-config.json`) in the production build (PWA).

## Features

- 6-digit PIN lock, stored in `localStorage` and requested on every launch.
- Local SQLite database, created at startup and persisted in IndexedDB.
- Settings: storage usage, download/import `.sqlite` backup, change PIN and delete account.
- PWA new-version prompt with reload.
- Base components for tables, filters, forms and charts, ready for features (there are no features yet).

## Structure

```
src/app/
├── core/
│   ├── components/        layout (base, header, menu), chart, pwa-update
│   ├── modules/
│   │   ├── config/        backup usage, export/import, delete account
│   │   ├── filters/       reusable filters (Filter, Filters)
│   │   ├── form/          input, selector, search-select, range-date, toggle, text-area
│   │   ├── login/         PIN, PIN change, access guard
│   │   ├── modal/         ModalService and base modal
│   │   └── table/         Table, TablePager, Pager, dynamic pipe
│   ├── repository/        RepositoryBase: CRUD and bulk save
│   ├── services/          SqlService (sql.js + IndexedDB), AuthService, StorageService, CsvService
│   └── utils/             date.util.ts
├── shared/
│   └── components/        container, records-table
├── app.config.ts          providers, service worker and SQLite startup
└── app.routes.ts          /login and protected layout with /config
```

Interfaces, types and enums owned by a module live inside it (`interfaces/`, `pipes/`, `guards/`); shared code lives in `shared/`.

## Data model

- `SqlService.createTables()` defines the schema; it is empty today.
- Repositories extend `RepositoryBase<T>` and only declare `table`, `defaultOrder`, `idColumn`, `toRow()` and `fromRow()`.
- Dates are stored as epoch milliseconds.
- `save()` inserts in bulk inside a transaction and persists the binary.
- The backup is validated by its `SQLite format 3` header before replacing the database.

## Requirements

Node.js 20+ and npm 11.

## Development

```bash
npm install
npm start
```

The app runs at `http://localhost:4200/`.

## Build

```bash
npm run build
```

Emits the artifacts to `dist/gym`, including `db/sql-wasm.wasm` copied from `node_modules/sql.js/dist/`.
