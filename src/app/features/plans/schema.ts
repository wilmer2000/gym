export const MAIN_SCHEMA = `
CREATE TABLE IF NOT EXISTS plans (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT    NOT NULL,
  description   TEXT,
  active        INTEGER NOT NULL DEFAULT 1,
  schedule_mode TEXT    NOT NULL DEFAULT 'weekly',
  start_date    INTEGER,
  end_date      INTEGER,
  created_at    INTEGER NOT NULL,
  updated_at    INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_plans_active ON plans(active);

CREATE TABLE IF NOT EXISTS plan_exercises (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  plan_id     INTEGER NOT NULL,
  exercise_id TEXT    NOT NULL,
  reps        INTEGER NOT NULL CHECK (reps > 0),
  sort_order  INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_plan_exercises_plan ON plan_exercises(plan_id, sort_order);

CREATE TABLE IF NOT EXISTS plan_weekdays (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  plan_id     INTEGER NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
  UNIQUE (plan_id, day_of_week)
);

CREATE TABLE IF NOT EXISTS plan_dates (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  plan_id       INTEGER NOT NULL,
  specific_date INTEGER NOT NULL,
  FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
  UNIQUE (plan_id, specific_date)
);
`;
