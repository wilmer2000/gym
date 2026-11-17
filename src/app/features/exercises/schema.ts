export const EXERCISES_SCHEMA = `
  CREATE TABLE IF NOT EXISTS exercises (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    name              TEXT    NOT NULL,
    description       TEXT,
    primary_muscle    TEXT    NOT NULL,
    secondary_muscles TEXT    NOT NULL DEFAULT '[]',
    equipment         TEXT    NOT NULL,
    record_type       TEXT    NOT NULL DEFAULT 'weight_reps',
    instructions      TEXT,
    notes             TEXT,
    created_at        INTEGER NOT NULL,
    updated_at        INTEGER NOT NULL
  );
  
  CREATE INDEX IF NOT EXISTS idx_exercises_primary_muscle ON exercises(primary_muscle);
  CREATE INDEX IF NOT EXISTS idx_exercises_equipment      ON exercises(equipment);
  CREATE INDEX IF NOT EXISTS idx_exercises_name           ON exercises(name COLLATE NOCASE);
  
  CREATE TABLE IF NOT EXISTS exercise_media (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    exercise_id INTEGER NOT NULL,
    type        TEXT    NOT NULL,
    url         TEXT    NOT NULL,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  INTEGER NOT NULL,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
  );
  
  CREATE INDEX IF NOT EXISTS idx_exercise_media_exercise ON exercise_media(exercise_id, sort_order);
`;
