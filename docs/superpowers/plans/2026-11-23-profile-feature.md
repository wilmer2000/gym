# Feature profile (MVP) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Perfil único editable y CRUD de mediciones, persistidos en `gym_main`, sin gráficas.

**Architecture:** `profile` y `measurements` se agregan a `MAIN_SCHEMA`; repositorios sobre `MainSqlService`; un `ProfileService` intermedio (Component → Service → Repository). La vista de perfil y el formulario son rutas hijas; las mediciones son una lista de tarjetas con dialog de `ModalService`.

**Tech Stack:** Angular 21 standalone, signals, OnPush, Tailwind v4, sql.js, `@ng-icons`.

**Spec:** `docs/superpowers/specs/2026-11-23-profile-feature-design.md`

## Global Constraints

- Todo el texto visible en español; código en inglés.
- Sin dependencias nuevas ni componentes equivalentes a `core/`.
- Componentes no importan repositorios ni `SqlDatabase`.
- `gym_main` ya contiene planes; perfil y mediciones se suman ahí. `intiDatabase` y `app.config.ts` no cambian.
- No hay runner de tests en el repo: cada tarea se verifica con `npx ng build --configuration development` y, al final, con `npm start` en el navegador.
- Sin gráficas ni cálculos derivados.
- `profile.id` siempre es `1`.

## Review Focus

- Guardar el perfil con campos vacíos: debe bloquear y mostrar un error claro, no persistir `0`/`NaN`.
- Rango de fechas invertido en mediciones: no debe romper la lista; se muestran todas o ninguna, nunca un error.
- Medición sin `bodyFat`/`notes`: se guarda `NULL`, la tarjeta no muestra "null".
- Primera visita: el perfil sembrado debe verse con "Sin completar", no con ceros.
- Borrar una medición: la confirmación debe eliminar solo esa fila y refrescar la lista.

---

### Task 1: Modelo, schema, repositorios y servicio

**Files:**
- Create: `src/app/features/profile/interfaces/profile.ts`
- Create: `src/app/features/profile/schema.ts`
- Create: `src/app/features/profile/repositories/profile.repository.ts`
- Create: `src/app/features/profile/repositories/measurement.repository.ts`
- Create: `src/app/features/profile/services/profile.service.ts`
- Modify: `src/app/core/modules/database/services/main-sql.service.ts`

**Interfaces:**
- Produces: `Profile`, `Measurement`, `MeasurementInput`, `ProfileSex`, `ProfileGoal`, `ProfileExperienceLevel`; `ProfileRepository`, `MeasurementRepository`; `ProfileService` con `profileId`, `getProfile()`, `saveProfile(profile)`, `listMeasurements(range?)`, `saveMeasurement(input)`, `removeMeasurement(id)`.
- Consumes: `RepositoryBase<T>`, `MainSqlService`, `DateRange`.

- [ ] **Step 1: Crear las interfaces**

`Profile`: `id: number`, `name: string`, `surname: string`, `birthDate: string | null`, `sex: ProfileSex`, `height: number | null`, `goal: ProfileGoal`, `experienceLevel: ProfileExperienceLevel`, `trainingDaysPerWeek: number`, `targetWeight: number | null`, `targetCalories: number | null`, `targetProtein: number | null`.
`Measurement`: `id: number`, `profileId: number`, `date: string`, `weight: number`, `bodyFat: number | null`, `notes: string | null`.
`MeasurementInput` = `Omit<Measurement, 'id'> & { id?: number }`.
`ProfileSex = 'M' | 'F' | 'otro'`; `ProfileGoal = 'perder_grasa' | 'ganar_musculo' | 'mantener'`; `ProfileExperienceLevel = 'principiante' | 'intermedio' | 'avanzado'`.

- [ ] **Step 2: Crear `PROFILE_SCHEMA` y `PROFILE_SEED`**

Tablas `profile` y `measurements` según el spec. `profile.birth_date`, `height`, `target_weight`, `target_calories` y `target_protein` admiten `NULL`; sus `CHECK` usan `IS NULL OR` el rango. `measurements.weight > 0`, `body_fat` entre 0 y 100 o `NULL`, FK con `ON DELETE CASCADE`. Índice `idx_measurements_profile_date (profile_id, date DESC)`. El seed inserta con `INSERT OR IGNORE` la fila `(1, '', '', NULL, 'otro', NULL, 'mantener', 'principiante', 3, NULL, NULL, NULL)`.

- [ ] **Step 3: Implementar los repositorios**

`ProfileRepository extends RepositoryBase<Profile>`: `sqlite = inject(MainSqlService)`, `table = 'profile'`, `defaultOrder = 'name COLLATE NOCASE ASC'`; `toRow`/`fromRow` con snake_case.
`MeasurementRepository extends RepositoryBase<Measurement>`: tabla `measurements`, `defaultOrder = 'date DESC, id DESC'`; `listByProfile(profileId: number, range?: DateRange): Measurement[]` con `WHERE profile_id = ?` más `date >= ?` / `date <= ?` solo si el extremo no está vacío; `save(input: MeasurementInput): void` con `UPDATE` si `input.id` o `INSERT` si no.

- [ ] **Step 4: Implementar `ProfileService`**

`@Injectable({ providedIn: 'root' })`, inyecta ambos repos. `profileId = 1`; `getProfile()` usa `findById('1')`; `saveProfile()` usa `create` si no existe o `update`; `listMeasurements(range?)` delega; `saveMeasurement()` y `removeMeasurement()` delegan.

- [ ] **Step 5: Componer el schema en `MainSqlService`**

`schema = `${MAIN_SCHEMA}\n${PROFILE_SCHEMA}``; `seed = PROFILE_SEED`. `migrate()` no cambia.

- [ ] **Step 6: Verificar**

Run: `npx ng build --configuration development`
Expected: build exitoso, sin errores de tipos.

---

### Task 2: Etiquetas y rutas

**Files:**
- Create: `src/app/features/profile/constants/profile.constant.ts`
- Modify: `src/app/features/profile/profile.route.ts`

**Interfaces:**
- Produces: `SEX_LABELS`, `GOAL_LABELS`, `LEVEL_LABELS`, `DAYS_LABELS`, `WEEKDAY_OPTIONS` (opcional si se usa selector de días).
- Consumes: componentes creados en tareas 3–5 y `canAccess`.

- [ ] **Step 1: Crear los mapas de etiquetas**

`Record<ProfileSex, string>`: M → "Masculino", F → "Femenino", otro → "Otro". Objetivo: "Perder grasa", "Ganar músculo", "Mantener". Nivel: "Principiante", "Intermedio", "Avanzado". Días: 1–7 con "1 día", "2 días"… o solo el número con "días/semana" en la etiqueta.

- [ ] **Step 2: Reescribir `profile.route.ts`**

Ruta `profile`, `canActivate: [canAccess]`, hijos: `''` → `ProfileViewPage`, `'edit'` → `ProfileFormPage`, `'measurements'` → `MeasurementsListPage`. Cada uno con `loadComponent`.

- [ ] **Step 3: Verificar**

Run: `npx ng build --configuration development`
Expected: build exitoso (los componentes existirán al terminar la tarea 5; si se ejecuta antes, fallará por imports; ejecutar esta tarea al final).

---

### Task 3: Vista de perfil

**Files:**
- Create: `src/app/features/profile/components/profile-view/profile-view.component.ts`
- Create: `src/app/features/profile/components/profile-view/profile-view.component.html`

**Interfaces:**
- Consumes: `ProfileService`, `Container`, `RouterLink`, `NgIcon`, etiquetas.
- Produces: `ProfileViewPage`.

- [ ] **Step 1: Implementar el componente**

OnPush, `profile = signal(this.profileService.getProfile())`, `fullName` computado con fallback "Tu perfil". Métodos `sex()`, `goal()`, `level()` que devuelven la etiqueta o "Sin completar"; `value(number|null, suffix)` devuelve `—`/texto si es `null`.

- [ ] **Step 2: Implementar la plantilla**

`app-container` con `[title]="fullName()"`. Header: botón "Editar" (`routerLink="/profile/edit"`) y "Mediciones" (`routerLink="/profile/measurements"`), iconos `hugePencil` / `hugeWorkoutRun`. Debajo, `app-section` "Datos personales" y "Objetivos" con pares etiqueta/valor; fecha formateada `dd/MM/yyyy`; altura "175 cm", peso "70 kg", calorías "2000 kcal", proteína "150 g".

- [ ] **Step 3: Verificar**

Run: `npx ng build --configuration development`
Expected: build exitoso.

---

### Task 4: Formulario de perfil

**Files:**
- Create: `src/app/features/profile/components/profile-form/profile-form.component.ts`
- Create: `src/app/features/profile/components/profile-form/profile-form.component.html`

**Interfaces:**
- Consumes: `ProfileService`, `Container`, `Section`, `Input`, `Selector`, `Router`.
- Produces: `ProfileFormPage`.

- [ ] **Step 1: Implementar el componente**

Señales `name`, `surname`, `birthDate`, `sex`, `height`, `goal`, `experienceLevel`, `trainingDaysPerWeek`, `targetWeight`, `targetCalories`, `targetProtein`, `error`. Cargar desde `getProfile()`; si no hay, valores por defecto (`'otro'`, `'mantener'`, `'principiante'`, 3). `valid` computado: nombre/apellido no vacíos, fecha no vacía, altura 1–300, días 1–7, peso/calorías/proteína > 0, sexo/objetivo/nivel dentro de los enums. `save()`: si inválido, `error` en español y return; si no, `saveProfile({...})` y `router.navigate(['/profile'])`.

- [ ] **Step 2: Implementar la plantilla**

`app-container` "Editar perfil", header "Cancelar" → `/profile`. `form` con `app-section` "Datos personales" (`app-input` nombre, apellido, fecha `type="date"`, `app-selector` sexo, `app-input` altura number 1–300) y "Entrenamiento y objetivos" (selector objetivo, selector nivel, input días 1–7, peso objetivo, calorías, proteína). `@if (error())` párrafo. Botón submit "Guardar".

- [ ] **Step 3: Verificar**

Run: `npx ng build --configuration development`
Expected: build exitoso.

---

### Task 5: Lista de mediciones y dialog

**Files:**
- Create: `src/app/features/profile/components/measurement-form/measurement-form.component.ts`
- Create: `src/app/features/profile/components/measurements-list/measurements-list.component.ts`
- Create: `src/app/features/profile/components/measurements-list/measurements-list.component.html`

**Interfaces:**
- Consumes: `ProfileService`, `Container`, `Input`, `TextArea`, `RangeDate`, `DateRange`, `ModalService`, `NgIcon`, `Button`.
- Produces: `MeasurementForm`, `MeasurementsListPage`.

- [ ] **Step 1: Implementar `MeasurementForm`**

`data = input.required<{ row: MeasurementInput; profileId: number }>()`. Señales `date`, `weight`, `bodyFat`, `notes` inicializadas desde `data().row`. `valid` computado: fecha no vacía, peso > 0, bodyFat vacío o 0–100. En el constructor, `effect` que toma `modal.modal()?.id` y registra `guard(id, () => { if valid: data().row = {...}; return valid(); })`.
Plantilla inline: `app-input` fecha (`type="date"`), peso (`type="number"`, min 1), % grasa (`type="number"`, min 0, max 100, opcional), `app-text-area` notas.

- [ ] **Step 2: Implementar `MeasurementsListPage`**

`range = signal<DateRange>({ from: '', to: '' })`, `rows = signal<Measurement[]>([])`, `load()` desde `profileService.listMeasurements(range())`. `newMeasurement()`, `edit(m)` abren `modal.open({ title, component: MeasurementForm, data: { row, profileId }, okLabel })` y en `action$` filtrado por id/ok guardan y recargan. `remove(m)` abre modal de confirmación tipo `error` y al ok llama `removeMeasurement(m.id)` y recarga. Suscripciones con `takeUntilDestroyed`.

- [ ] **Step 3: Implementar la plantilla**

`app-container` "Mediciones"; header con botón "Nueva medición" (icono `hugePlusSign`). `app-range-date [initial]="range()" (rangeChange)="range.set($event); load()"`. Si hay filas: `@for` de tarjetas `card`/`card-body` con fecha, peso, % grasa (solo si no es null), notas (solo si existen) y botones editar (`hugePencil`) y borrar (`hugeDelete01`). Si no: "Todavía no hay mediciones."

- [ ] **Step 4: Verificar**

Run: `npx ng build --configuration development`
Expected: build exitoso.

---

### Task 6: Verificación funcional

- [ ] **Step 1: Build de desarrollo**

Run: `npx ng build --configuration development`
Expected: exitoso.

- [ ] **Step 2: Servir y probar**

Run: `npm start` (o `npx ng serve`), abrir `http://localhost:4200`.
Expected: "Perfil" en el menú; vista con placeholders; editar y guardar; recargar y ver los datos; crear, editar, filtrar por rango y borrar mediciones; recargar y ver persistencia.

- [ ] **Step 3: Revisar el diff**

Run: `git status --short && git diff --stat`
Expected: solo archivos de la feature, `main-sql.service.ts` y el diseño/plan; sin dependencias nuevas.
