// Profile and measurements live in gym_main: they are user data, so backup,
// reset and usage in ConfigService already cover them.
export const PROFILE_SCHEMA = `
CREATE TABLE IF NOT EXISTS profile (
  id                       INTEGER PRIMARY KEY,
  name                     TEXT    NOT NULL DEFAULT '',
  surname                  TEXT    NOT NULL DEFAULT '',
  birth_date               TEXT,
  sex                      TEXT    NOT NULL CHECK (sex IN ('M', 'F', 'otro')),
  height                   REAL             CHECK (height IS NULL OR (height >= 1 AND height <= 300)),
  goal                     TEXT    NOT NULL CHECK (goal IN ('perder_grasa', 'ganar_musculo', 'mantener')),
  experience_level         TEXT    NOT NULL CHECK (experience_level IN ('principiante', 'intermedio', 'avanzado')),
  training_days_per_week   INTEGER NOT NULL CHECK (training_days_per_week BETWEEN 1 AND 7),
  target_weight            REAL             CHECK (target_weight IS NULL OR target_weight > 0),
  target_calories          INTEGER          CHECK (target_calories IS NULL OR target_calories > 0),
  target_protein           INTEGER          CHECK (target_protein IS NULL OR target_protein > 0)
);

CREATE TABLE IF NOT EXISTS measurements (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_id  INTEGER NOT NULL,
  date        TEXT    NOT NULL,
  weight      REAL    NOT NULL CHECK (weight > 0),
  body_fat    REAL             CHECK (body_fat IS NULL OR (body_fat >= 0 AND body_fat <= 100)),
  notes       TEXT,
  FOREIGN KEY (profile_id) REFERENCES profile(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_measurements_profile_date ON measurements(profile_id, date DESC);
`;

// The profile is a single row. NULL means "not filled in yet".
export const PROFILE_SEED = `
INSERT OR IGNORE INTO profile (
  id, name, surname, birth_date, sex, height, goal, experience_level,
  training_days_per_week, target_weight, target_calories, target_protein
) VALUES (1, '', '', NULL, 'otro', NULL, 'mantener', 'principiante', 3, NULL, NULL, NULL);
`;
