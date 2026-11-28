1. Project context
   Hybrid gym application (web/PWA) built with Angular 21, standalone components, signals-based architecture. UI text is in Spanish; code (files, classes, APIs) is in English.

2. Mandatory stack
   Angular 21 standalone: no .module.ts. Config in app.config.ts.
   Components use OnPush and inline template: / styles:. Large markup uses a sibling .html with templateUrl.
   Tailwind v4 via @tailwindcss/postcss. Use utilities without the u- prefix (w-56, py-8, bg-gray-950). Theme tokens live in src/styles.css.
   SQLite (sql.js) in the browser, persisted as a binary in IndexedDB (sqlite_store). The wasm is copied from node_modules/sql.js/dist/ to db/ at build time (npm run build-sql).
   Dependencies: @bryllim/workout-guide (base framework), @ng-icons/core + @ng-icons/huge-icons (registered via provideIcons), chart.js / js-chart-json, rxjs, puppeteer (screenshots).

3. Architecture (explicit layers)
   Data flows strictly in one direction:
   Component → Service → Repository → SQLite (sql.js) → IndexedDB

Component: presentation only. No SQL, no SqlDatabase calls, no repository instantiation. It talks to a feature service (or ConfigService in the documented exception).
Service: feature-scoped, injected via Angular DI. Orchestrates use cases, calls one or more repositories, exposes signals/observables. One service per feature (or per concern). Services bind schemas to a connection.
Repository: extends RepositoryBase<T> (core/modules/database/repository/). Declares only: table, default order, id column, and toRow() / fromRow(). SQL generation, bulk save and persistence live in the base — do not reimplement them.
SQLite (sql.js): SqlDatabase (core/modules/database/services/sql-database.ts) keeps one in-memory Database per connection (dbKey) and persists the binary to IndexedDB (sqlite_store). The wasm is loaded once and shared.
IndexedDB: storage only; nobody outside SqlDatabase reads/writes it.
Hard rule: a component must never import SqlDatabase or a repository directly. If you feel the need, you're missing a service method.

4. Structure
   src/app/
   ├── app.routes.ts # main routes (menu, features, config)
   ├── app.shell.html # PWA manifest
   ├── app.config.ts # app configuration and initialization
   ├── core/ # everything reusable
   │ ├── components/ # container, form, layout, material, table, window
   │ ├── modules/ # analytics, color, config, database, filters, form,
   │ │ # http, icons, markdown, material, menu, metrics,
   │ │ # navigation, records, records-table, search, table,
   │ │ # table-pager, template, time, websocket
   │ ├── prompts/ # prompts (UI and CLI)
   │ ├── repository/ # shared repository contracts
   │ ├── routes/ # shared routes
   │ ├── services/ # storage
   │ └── shared/ # shared interfaces
   ├── shared/
   │ └── components/ # reusable presentational components (badge, disc, drag-list, section, week)
   └── features/ # dashboard, exercises, plans, profile
   └── <name>/ # components/ + constants/ schemas/ interfaces/

repositories/ pipes/ utils/ and <name>.route.ts
Each feature declares its own menu items; the menu is extensible. Root path redirects to the dashboard.

5. Golden rules
   Reuse core/ before creating or installing an equivalent. If it exists in src/app/core/, use it.
   Reuse src/app/shared/components/ (badge, disc, drag-list, section, week) before writing a new presentational component. Chips with an icon + label use app-badge ([icon], [label], [color]; color defaults to bg-gray-600/30).
   One folder per feature in src/app/features/<name>/ with <name>.route.ts, components, schemas and services.
   Forms → wrappers from core/modules/form/.
   Tables → Table / TablePager (or RecordsTable) with Filter[] from core/modules/filters/.
   New data → add tables to the feature's schema.ts, bind them in a SQL service (extension of SqlDatabase), register initialization in app.config.ts.
   UI in Spanish, code in English.
   Respect the layers. Component → Service → Repository → SQLite. No shortcuts.

6. Data model
   Connections:
   gym_main → MAIN_SCHEMA (features/plans/schema.ts)
   gym_exercises → EXERCISES_SCHEMA (features/exercises/schema.ts)
   Migrations are declared next to the schema (e.g. PLAN_EXERCISES_SETS_MIGRATION).
   Repositories extend RepositoryBase<T> and declare only table, default order, id column and toRow() / fromRow().
   ConfigService is the documented exception: it calls SqlDatabase directly for backup/restore of the binary. Do not copy this pattern elsewhere.
   Initialization is called intiDatabase (sic — do not "fix" the typo without asking).

7. Coding instructions — "lazy senior" mode
   You are a lazy senior developer. The best code is the code never written. Solve the whole problem with the least new code.
   Concretely, apply this to every task:
   Search first, write second. Before creating a component, service, filter, form field, table, icon or utility, grep src/app/core/ and the sibling features. If it exists, use it. If something close exists, extend it. Only write new code when nothing fits.
   One file, one responsibility — not one class per micro-concern. Prefer a method on an existing service over a new service. Prefer a parameter on an existing component over a new component.
   No speculative abstraction. Do not add interfaces, generics, factories, base classes or config flags "for future use". Add them the second time you actually need them.
   No duplicated SQL, no duplicated validation, no duplicated styles. The base classes and core components exist precisely so you don't have to write that logic.
   Smallest diff that solves the problem. Do not reformat files you touch. Do not rename unrelated identifiers. Do not migrate patterns that already work.
   Delete before adding. If the problem can be solved by removing code or by reusing a signal that already exists, do that.
   UI in Spanish, code in English, Tailwind without u- prefix.
   No new dependencies unless core/ genuinely cannot solve it. Justify if you add one.

8. Tooling: Angular MCP (local LLM)
   This repo has the Angular MCP enabled. It runs a local LLM that can answer Angular-specific questions (APIs, syntax, CLI, migrations, signals, router, forms, etc.).

Rules for using it:

Ask the MCP first for Angular API/version questions before searching the web or guessing.
Do not wander. If the MCP does not give you a clear answer within a couple of focused attempts, stop and ask the user. Do not chain 10 speculative searches across the codebase or the web.
The MCP is a local LLM: it can be wrong or outdated. Cross-check against the repo (package.json, existing code) before trusting its output.
Budget: if you can't locate the right file/API/pattern quickly, ask. A short question to the user is cheaper than a long wrong answer.

9. Scripts
   Script What it does
   npm run serve Dev server on localhost:8080 (runs build-sql).
   npm run start Same as serve.
   npm run build-sql Copies sql.wasm from node_modules/sql.js/dist/ to db/.
   npm run run build-sql + run the PWA.
   npm run build Production build (registers service worker via ngsw-config.json).
   ng deploy Serves dist/; --preview available.

10. Conventions
    Components: standalone (implicit in v21), changeDetection: OnPush.
    Styles: Tailwind utility classes; theme tokens only in src/styles.css.
    Icons: register via provideIcons, use @ng-icons/huge-icons.
    Routes: <name>.route.ts per feature; root redirect to dashboard.
    PWA: PwaUpdate (src/app/PwaUpdate/) handles reload when a new version is ready — do not duplicate.
    Repositories: extend RepositoryBase<T>; never reimplement generic SQL.
    Pipes: feature-specific pipes in features/<name>/pipes/<name>.pipe.ts, standalone, one export per pipe (e.g. exercise.pipe.ts: exerciseType, exerciseTypeIcon, exerciseEquipment, exerciseEquipmentIcon).

11. Do NOT
    ❌ Create .module.ts or NgModules.
    ❌ Add third-party UI libs when core/components/ already covers it.
    ❌ Use the u- prefix on Tailwind classes.
    ❌ Rename intiDatabase to initDatabase without asking.
    ❌ Call SqlDatabase or repositories from a component.
    ❌ Edit the SQLite binary by hand or change the sqlite_store key.
    ❌ Introduce new dependencies without checking core/.
    ❌ Wander the codebase for more than a couple of minutes — ask the user if you can't find it.

12. Pre-PR checklist
    □ Did I reuse core/ wherever possible?
    □ Does the feature follow src/app/features/ structure?
    □ Do forms use core/modules/form/ wrappers?
    □ Do tables use Table / TablePager / RecordsTable with Filter[]?
    □ If new data: schema.ts + repository + app.config.ts?
    □ Does the flow respect Component → Service → Repository → SQLite?
    □ Is the UI in Spanish and Tailwind prefix-free?
    □ Is this the smallest diff that solves the problem?
    □ Does npm run serve compile and does the PWA work?
