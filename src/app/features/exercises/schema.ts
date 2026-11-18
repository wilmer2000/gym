export const EXERCISES_SCHEMA = `  CREATE TABLE IF NOT EXISTS exercises (
                                         id                TEXT PRIMARY KEY,
                                         name              TEXT NOT NULL,
                                         exercise_type     TEXT NOT NULL,
                                         equipment         TEXT NOT NULL,
                                         primary_muscle    TEXT NOT NULL,
                                         secondary_muscles TEXT NOT NULL DEFAULT '[]',
                                         description       TEXT,
                                         created_at        INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_exercises_primary_muscle ON exercises(primary_muscle);
  CREATE INDEX IF NOT EXISTS idx_exercises_equipment      ON exercises(equipment);
  CREATE INDEX IF NOT EXISTS idx_exercises_type           ON exercises(exercise_type);
  CREATE INDEX IF NOT EXISTS idx_exercises_name           ON exercises(name COLLATE NOCASE);
`;

// Catalog ids renamed to match the slugs of @bryllim/workout-guide images.
export const EXERCISE_ID_RENAMES: Record<string, string> = {
  'seated-cable-row': 'seated-row',
  'cable-crossover': 'cable-fly',
  lunge: 'walking-lunge',
};

// Fixed exercises: INSERT OR IGNORE keeps user data intact when the DB is reopened.
export function exercisesSeed(now: number = Date.now()): string {
  return `
  INSERT OR IGNORE INTO exercises (id, name, exercise_type, equipment, primary_muscle, secondary_muscles, description, created_at) VALUES
  
  -- ==========================================
  -- ESPALDA
  -- ==========================================
  ('pull-up',                   'Dominadas',                     'bodyweight_reps', 'Bodyweight', 'Back',       '["Biceps", "Forearms"]',        'Colgarse en barra y tirar hasta pasar el mentón.', ${now}),
  ('lat-pulldown',              'Jalón al pecho',                'weight_reps',     'Cable',      'Back',       '["Biceps", "Forearms"]',        'Tirar de la barra hacia el pecho en polea alta.', ${now}),
  ('seated-row',                'Remo sentado en polea',         'weight_reps',     'Cable',      'Back',       '["Biceps", "Forearms"]',        'Traccionar el maneral hacia el abdomen sentado.', ${now}),
  ('machine-row',               'Remo en máquina',               'weight_reps',     'Machine',    'Back',       '["Biceps", "Forearms"]',        'Traccionar hacia atrás con apoyo en el pecho.', ${now}),
  ('straight-arm-pulldown',     'Jalón con brazos rectos',       'weight_reps',     'Cable',      'Back',       '["Triceps", "Shoulders"]',      'Bajar la barra en polea con brazos extendidos.', ${now}),
  ('t-bar-row',                 'Remo en barra T',               'weight_reps',     'Barbell',    'Back',       '["Biceps", "Forearms"]',        'Tracción horizontal con barra anclada al suelo.', ${now}),
  
  -- ==========================================
  -- PECHO
  -- ==========================================
  ('dumbbell-bench-press',      'Press banca con mancuernas',    'weight_reps',     'Dumbbell',   'Chest',      '["Triceps", "Shoulders"]',      'Empuje acostado en banco con mancuernas.', ${now}),
  ('incline-dumbbell-press',    'Press inclinado con mancuernas','weight_reps',     'Dumbbell',   'Chest',      '["Triceps", "Shoulders"]',      'Empuje en banco inclinado con mancuernas.', ${now}),
  ('pec-deck',                  'Aperturas en máquina',          'weight_reps',     'Machine',    'Chest',      '["Shoulders"]',                 'Juntar los brazos en máquina contractora (Pec Deck).', ${now}),
  ('cable-fly',                 'Cruces de poleas',              'weight_reps',     'Cable',      'Chest',      '["Shoulders"]',                 'Juntar las manos frente al pecho usando poleas.', ${now}),
  ('dip',                       'Fondos en paralelas',           'bodyweight_reps', 'Bodyweight', 'Chest',      '["Triceps", "Shoulders"]',      'Bajar el cuerpo en paralelas y empujar hacia arriba.', ${now}),
  ('high-cable-fly',            'Aperturas en polea alta',       'weight_reps',     'Cable',      'Chest',      '["Shoulders"]',                 'Juntar las manos hacia abajo desde poleas altas.', ${now}),
  
  -- ==========================================
  -- HOMBROS
  -- ==========================================
  ('lateral-raise',             'Elevaciones laterales',         'weight_reps',     'Dumbbell',   'Shoulders',  '[]',                            'Elevar los brazos a los lados con mancuernas.', ${now}),
  ('rear-delt-fly',             'Aperturas posteriores',         'weight_reps',     'Dumbbell',   'Shoulders',  '["Back"]',                      'Elevar mancuernas hacia atrás con torso inclinado.', ${now}),
  ('front-raise',               'Elevaciones frontales',         'weight_reps',     'Dumbbell',   'Shoulders',  '[]',                            'Elevar mancuernas al frente.', ${now}),
  ('machine-shoulder-press',    'Press hombro en máquina',       'weight_reps',     'Machine',    'Shoulders',  '["Triceps"]',                   'Empujar hacia arriba en máquina guiada.', ${now}),
  ('face-pull',                 'Face pull',                     'weight_reps',     'Cable',      'Shoulders',  '["Back"]',                      'Tirar de la cuerda hacia la cara en polea alta.', ${now}),
  
  -- ==========================================
  -- BÍCEPS
  -- ==========================================
  ('incline-dumbbell-curl',     'Curl inclinado',                'weight_reps',     'Dumbbell',   'Biceps',     '["Forearms"]',                  'Flexionar codos en banco inclinado.', ${now}),
  ('concentration-curl',        'Curl concentrado',              'weight_reps',     'Dumbbell',   'Biceps',     '["Forearms"]',                  'Flexionar codo sentado con apoyo en muslo.', ${now}),
  ('cable-curl',                'Curl en polea baja',            'weight_reps',     'Cable',      'Biceps',     '["Forearms"]',                  'Flexionar codos usando polea baja.', ${now}),
  ('preacher-curl',             'Curl en banco Scott',           'weight_reps',     'Barbell',    'Biceps',     '["Forearms"]',                  'Flexionar codos con brazos apoyados en banco.', ${now}),
  ('rope-hammer-curl',          'Curl martillo en polea',        'weight_reps',     'Cable',      'Biceps',     '["Forearms"]',                  'Flexionar codos con agarre neutro usando cuerda.', ${now}),
  
  -- ==========================================
  -- TRÍCEPS
  -- ==========================================
  ('tricep-pushdown',           'Extensión de tríceps en polea', 'weight_reps',     'Cable',      'Triceps',    '[]',                            'Empujar la barra hacia abajo en polea alta.', ${now}),
  ('overhead-tricep-extension', 'Extensión sobre la cabeza',     'weight_reps',     'Cable',      'Triceps',    '[]',                            'Extender codos sobre la cabeza usando polea.', ${now}),
  ('skull-crusher',             'Rompecráneos',                  'weight_reps',     'Barbell',    'Triceps',    '[]',                            'Bajar la barra hacia la frente acostado.', ${now}),
  ('tricep-kickback',           'Patada de tríceps',             'weight_reps',     'Dumbbell',   'Triceps',    '[]',                            'Extender el brazo hacia atrás con mancuerna.', ${now}),
  ('bench-dip',                 'Fondos en banco',               'bodyweight_reps', 'Bodyweight', 'Triceps',    '["Chest", "Shoulders"]',        'Bajar el cuerpo con manos en el banco.', ${now}),
  
  -- ==========================================
  -- ZONA MEDIA (CORE)
  -- ==========================================
  ('crunch',                    'Abdominales en suelo',          'bodyweight_reps', 'Bodyweight', 'Core',       '[]',                            'Flexionar el torso hacia las rodillas.', ${now}),
  ('weighted-russian-twist',    'Giro ruso',                     'weight_reps',     'Other',      'Core',       '[]',                            'Rotar el torso sentado sosteniendo un disco.', ${now}),
  ('hanging-knee-raise',        'Elevación de rodillas',         'bodyweight_reps', 'Bodyweight', 'Core',       '["Hip Flexors"]',               'Colgarse de la barra y subir las rodillas.', ${now}),
  ('plank',                     'Plancha',                       'duration',        'Bodyweight', 'Core',       '["Shoulders"]',                 'Mantener el cuerpo recto apoyado en antebrazos.', ${now}),
  ('cable-crunch',              'Abdominales en polea',          'weight_reps',     'Cable',      'Core',       '[]',                            'Flexionar el torso hacia abajo arrodillado en polea.', ${now}),
  
  -- ==========================================
  -- PIERNAS
  -- ==========================================
  ('leg-press',                 'Prensa de piernas',             'weight_reps',     'Machine',    'Quadriceps', '["Glutes", "Hamstrings"]',      'Empujar la plataforma con las piernas.', ${now}),
  ('hack-squat',                'Sentadilla Hack',               'weight_reps',     'Machine',    'Quadriceps', '["Glutes"]',                    'Sentadilla guiada en máquina inclinada.', ${now}),
  ('leg-extension',             'Extensión de cuádriceps',       'weight_reps',     'Machine',    'Quadriceps', '[]',                            'Extender las rodillas en máquina sentado.', ${now}),
  ('leg-curl',                  'Curl femoral',                  'weight_reps',     'Machine',    'Hamstrings', '["Calves"]',                    'Flexionar las rodillas contra resistencia.', ${now}),
  ('smith-machine-squat',       'Sentadilla en Smith',           'weight_reps',     'Machine',    'Quadriceps', '["Glutes"]',                    'Sentadilla con barra guiada en rieles.', ${now}),
  ('calf-raise',                'Elevación de gemelos',          'weight_reps',     'Machine',    'Calves',     '[]',                            'Elevar los talones contra resistencia.', ${now}),
  ('hip-thrust',                'Empuje de cadera',              'weight_reps',     'Barbell',    'Glutes',     '["Hamstrings"]',                'Empujar la cadera hacia arriba con barra.', ${now}),
  ('romanian-deadlift',         'Peso muerto rumano',            'weight_reps',     'Barbell',    'Hamstrings', '["Glutes", "Back"]',            'Bajar la barra con piernas casi extendidas.', ${now}),
  ('walking-lunge',             'Zancadas',                      'weight_reps',     'Dumbbell',   'Quadriceps', '["Glutes", "Hamstrings"]',      'Dar un paso al frente y bajar la cadera.', ${now}),
  ('hip-abduction-machine',     'Abductores en máquina',         'weight_reps',     'Machine',    'Glutes',     '[]',                            'Abrir las piernas contra resistencia en máquina.', ${now});
`;
}
