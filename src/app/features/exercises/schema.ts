export const EXERCISES_SCHEMA = `
CREATE TABLE IF NOT EXISTS exercises (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  equipment    TEXT NOT NULL,
  description  TEXT,
  created_at   INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_exercises_muscle ON exercises(muscle_group);
CREATE INDEX IF NOT EXISTS idx_exercises_name   ON exercises(name COLLATE NOCASE);
`;

// Fixed exercises: INSERT OR IGNORE keeps user data intact when the DB is reopened.
export function exercisesSeed(now: number = Date.now()): string {
  return `
INSERT OR IGNORE INTO exercises (id, name, muscle_group, equipment, description, created_at) VALUES
  ('squat',         'Sentadilla',            'Cuádriceps', 'barbell',    'Barra sobre trapecio, bajar hasta paralelo.', ${now}),
  ('bench_press',   'Press banca',           'Pecho',      'barbell',    'Barra al pecho, empuje vertical.',            ${now}),
  ('deadlift',      'Peso muerto',           'Isquios',    'barbell',    'Barra al suelo, extensión de cadera.',        ${now}),
  ('pull_up',       'Dominadas',             'Espalda',    'bodyweight', 'Colgado en barra, tirar hasta mentón.',       ${now}),
  ('ohp',           'Press militar',         'Hombro',     'barbell',    'Empuje vertical sobre la cabeza.',            ${now}),
  ('barbell_row',   'Remo con barra',        'Espalda',    'barbell',    'Tronco inclinado, tirar al abdomen.',         ${now}),
  ('plank',         'Plancha',               'Core',       'bodyweight', 'Isométrico apoyado en antebrazos.',           ${now}),
  ('bicep_curl',    'Curl bíceps',           'Bíceps',     'dumbbell',   'Flexión de codo con mancuerna.',              ${now}),
  ('tricep_ext',    'Extensión tríceps',     'Tríceps',    'cable',      'Extensión de codo en polea.',                 ${now}),
  ('lunge',         'Zancadas',              'Cuádriceps', 'dumbbell',   'Paso alternado con mancuernas.',              ${now}),
  ('leg_press',     'Prensa de piernas',     'Cuádriceps', 'machine',    'Empuje en prensa 45°.',                       ${now}),
  ('leg_curl',      'Curl femoral',          'Isquios',    'machine',    'Flexión de rodilla en máquina.',              ${now}),
  ('leg_ext',       'Extensión de piernas',  'Cuádriceps', 'machine',    'Extensión de rodilla en máquina.',            ${now}),
  ('calf_raise',    'Elevación gemelos',     'Gemelos',    'machine',    'Extensión de tobillo.',                       ${now}),
  ('lateral_raise', 'Elevaciones laterales', 'Hombro',     'dumbbell',   'Elevación lateral con mancuernas.',           ${now}),
  ('face_pull',     'Face pull',             'Hombro',     'cable',      'Tirón a la cara con cuerda.',                 ${now}),
  ('dip',           'Fondos',                'Pecho',      'bodyweight', 'Bajar en paralelas hasta 90°.',               ${now}),
  ('pushup',        'Flexiones',             'Pecho',      'bodyweight', 'Push-up clásico.',                            ${now}),
  ('crunch',        'Abdominales',           'Core',       'bodyweight', 'Flexión de tronco.',                          ${now}),
  ('russian_twist', 'Giro ruso',             'Core',       'bodyweight', 'Rotación de tronco con peso.',                ${now});
`;
}
