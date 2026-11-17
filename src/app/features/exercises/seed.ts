const NOW = Date.now();

// Runs on every startup; the WHERE guards it so it only fills an empty table.
export const SEED_EXERCISES = `
INSERT INTO exercises (name, description, primary_muscle, secondary_muscles, equipment, record_type, instructions, notes, created_at, updated_at)
SELECT name, NULL, primary_muscle, secondary_muscles, equipment, record_type, instructions, NULL, ${NOW}, ${NOW}
FROM (
  SELECT 'Sentadilla' AS name, 'Cuádriceps' AS primary_muscle, '["Glúteos","Isquiotibiales"]' AS secondary_muscles, 'barbell' AS equipment, 'weight_reps' AS record_type, 'Pies al ancho de hombros, baja controlado con la espalda recta.' AS instructions
  UNION ALL SELECT 'Press banca', 'Pecho', '["Tríceps","Hombros"]', 'barbell', 'weight_reps', 'Baja la barra al pecho y empuja sin rebotar.'
  UNION ALL SELECT 'Peso muerto', 'Espalda', '["Glúteos","Isquiotibiales"]', 'barbell', 'weight_reps', 'Barra pegada al cuerpo, cadera atrás y espalda neutra.'
  UNION ALL SELECT 'Dominadas', 'Espalda', '["Bíceps"]', 'bodyweight', 'bodyweight_reps', 'Sube hasta pasar la barbilla y baja controlando.'
  UNION ALL SELECT 'Press militar', 'Hombros', '["Tríceps"]', 'barbell', 'weight_reps', 'De pie, empuja la barra sobre la cabeza sin arquear la espalda.'
  UNION ALL SELECT 'Remo con barra', 'Espalda', '["Bíceps"]', 'barbell', 'weight_reps', 'Tronco inclinado, lleva la barra al abdomen.'
  UNION ALL SELECT 'Plancha', 'Abdomen', '[]', 'bodyweight', 'time', 'Cuerpo recto y abdomen firme, sin hundir la cadera.'
  UNION ALL SELECT 'Curl bíceps', 'Bíceps', '[]', 'dumbbell', 'weight_reps', 'Codos fijos al torso, sube sin balancear.'
  UNION ALL SELECT 'Extensión tríceps', 'Tríceps', '[]', 'cable', 'weight_reps', 'Codos pegados al cuerpo, extiende completamente.'
  UNION ALL SELECT 'Zancadas', 'Cuádriceps', '["Glúteos","Isquiotibiales"]', 'dumbbell', 'weight_reps', 'Paso largo y baja la rodilla trasera hacia el suelo.'
)
WHERE NOT EXISTS (SELECT 1 FROM exercises);
`;
