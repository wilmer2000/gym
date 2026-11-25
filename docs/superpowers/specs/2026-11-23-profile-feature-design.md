# Feature profile (MVP) — diseño

## Intención

Agregar a gym el perfil del usuario (`profile`, una fila) y el historial de mediciones corporales (`measurements`, serie temporal), sin gráficas. Todos los datos de usuario viven en **`gym_main`**; la única conexión separada sigue siendo `gym_exercises` (catálogo fijo). Esto mantiene backup, reset y medidor de uso existentes sin cambios.

## Decisiones acordadas

- **Una sola base de usuario:** `profile` y `measurements` se suman a `gym_main`. No se crea `gym_profile`, ni `ProfileSqlService`, ni se toca `intiDatabase`/`app.config.ts`.
- La fila de `profile` se siembra con `id = 1` (`INSERT OR IGNORE`). La vista siempre la encuentra; el formulario actualiza esa fila.
- **Mediciones como lista de tarjetas**, no tabla. Se descarta `Table`/`TablePager` para esta pantalla; se usa `app-range-date` para el rango de fechas y el dialog de `ModalService` para alta/edición/borrado.
- El dialog de medición sigue el patrón de `ExerciseSelectionForm`: recibe `data` con una fila escribible, valida con `ModalService.guard(...)` y el opener persiste al recibir `action === 'ok'`.
- **Capa obligatoria** (`AGENTS.md`): Component → `ProfileService` → repositories. Ningún componente importa repositorios.
- Campos numéricos y fecha de nacimiento **nullable**: `NULL` significa "sin completar". La vista muestra "Sin completar"; el formulario exige valores válidos al guardar.
- Formularios con los wrappers de `core/modules/form` (`app-input`, `app-selector`, `app-text-area`).
- Sin dependencias nuevas ni componentes equivalentes a los de core.

## Modelo de datos

`src/app/features/profile/schema.ts`:

- `PROFILE_SCHEMA`: crea `profile` y `measurements` con índices.
  - `profile`: `id` PK (siempre 1), `name` TEXT NOT NULL, `surname` TEXT NOT NULL, `birth_date` TEXT NULL, `sex` TEXT NOT NULL (`M`/`F`/`otro`), `height` REAL NULL, `goal` TEXT NOT NULL (`perder_grasa`/`ganar_musculo`/`mantener`), `experience_level` TEXT NOT NULL (`principiante`/`intermedio`/`avanzado`), `training_days_per_week` INTEGER NOT NULL (1–7), `target_weight` REAL NULL, `target_calories` INTEGER NULL, `target_protein` INTEGER NULL. Los `CHECK` permiten `NULL` o el rango/enum válido.
  - `measurements`: `id` PK autoincrement, `profile_id` FK → `profile(id)` `ON DELETE CASCADE`, `date` TEXT NOT NULL (ISO `YYYY-MM-DD`), `weight` REAL NOT NULL, `body_fat` REAL NULL (0–100), `notes` TEXT NULL.
  - Índice `idx_measurements_profile_date ON measurements(profile_id, date DESC)`.
- `PROFILE_SEED`: `INSERT OR IGNORE INTO profile (id, name, surname, birth_date, sex, height, goal, experience_level, training_days_per_week, target_weight, target_calories, target_protein) VALUES (1, '', '', NULL, 'otro', NULL, 'mantener', 'principiante', 3, NULL, NULL, NULL);`
- Sin migración en v1: las tablas son nuevas. Se agregará `PROFILE_MEASUREMENTS_MIGRATION` cuando exista un cambio real de columnas.

`src/app/features/profile/interfaces/profile.ts`: `Profile`, `Measurement`, `ProfileSex`, `ProfileGoal`, `ProfileExperienceLevel`, con los numéricos/fecha como `| null` cuando corresponda. Valores persistidos tal como los define el spec.

## Persistencia

- `repositories/profile.repository.ts`: `RepositoryBase<Profile>` sobre `MainSqlService`; tabla `profile`, orden `name`, id `id`, `toRow`/`fromRow`.
- `repositories/measurement.repository.ts`: `RepositoryBase<Measurement>` sobre `MainSqlService`; tabla `measurements`, orden `date DESC, id DESC`, `toRow`/`fromRow`, `listByProfile(profileId, { from?, to? })` con `WHERE profile_id = ?` y rango opcional por `date` (comparación de ISO).
- `services/profile.service.ts`: único punto de acceso para componentes. Expone:
  - `PROFILE_ID = 1`.
  - `getProfile(): Profile | null`.
  - `saveProfile(profile: Profile): void` (actualiza; crea si faltara la fila).
  - `measurements(range?: DateRange): Measurement[]`.
  - `saveMeasurement(input): void` (alta o edición).
  - `removeMeasurement(id: number): void`.
- `core/modules/database/services/main-sql.service.ts`: `schema = MAIN_SCHEMA + PROFILE_SCHEMA` y `seed = PROFILE_SEED`. `intiDatabase` y `app.config.ts` quedan igual.
- Backup, reset y uso ya cubren `gym_main`; `ConfigService` no se modifica.

## UI y rutas

- `profile.route.ts`: reemplazar el stub. Ruta `profile` con `canActivate: [canAccess]` y hijos: `''` → view, `'edit'` → form, `'measurements'` → lista. El ítem "Perfil" del menú ya existe; no se toca.
- `components/profile-view/`: `app-container` con título "nombre apellido" (o "Tu perfil" si está vacío); tarjetas con sexo, nacimiento, altura, objetivo, nivel, días/semana, peso objetivo, calorías y proteína traducidos al español, o "Sin completar". Botones "Editar" y "Mediciones".
- `components/profile-form/`: formulario de edición con señales; valida requeridos y rangos (altura 1–300, días 1–7, peso/calorías/proteína > 0, fecha válida); guarda con `ProfileService.saveProfile()` y vuelve a `/profile`. Botón Cancelar.
- `components/measurements-list/`: `app-container` "Mediciones"; header con botón "Nueva medición"; `app-range-date` con rango vacío inicial (sin filtro = todas); lista `@for` de tarjetas con fecha, peso, % grasa y notas, más editar/borrar por fila (iconos `@ng-icons`, `app-button`). Borrar pide confirmación con `ModalService` y recarga.
- `components/measurement-form/`: contenido del dialog, campos fecha (`type="date"`), peso (number), % grasa (number, opcional 0–100) y notas (textarea); escribe la fila en `data.row` al validar.
- `constants/profile.constant.ts`: mapas de etiquetas en español para sexo, objetivo, nivel y días.
- Textos en español; utilidades Tailwind sin prefijo; OnPush y signals.

## Fuera de alcance

- Gráficas (evolución de peso/% grasa, objetivo vs real).
- IMC/BMR/TDEE y cálculos derivados.
- Perímetros, % músculo/agua, presión, FC, sueño, pasos, salud/alergias, macros completos, avatar.
- Multiusuario: el perfil es la fila `id = 1`.

## Criterios de aceptación

- Compila (`npm start` / `npx ng build`; `npm run serve` no está definido en `package.json`).
- "Perfil" abre la vista y muestra el perfil sembrado con placeholders.
- El perfil se edita, persiste y sobrevive a recargar.
- Se crean, editan y borran mediciones; la lista queda ordenada por fecha descendente y el rango filtra.
- Backup/reset siguen funcionando e incluyen perfil y mediciones, porque están en `gym_main`.
- Sin dependencias nuevas, sin duplicar componentes de core, sin código de gráficas.
- Todo el texto visible en español.
