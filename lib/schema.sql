-- ═══════════════════════════════════════════════════════════
-- METABOOST — Schéma Supabase complet
-- Exécuter dans : Supabase > SQL Editor > New query
-- ═══════════════════════════════════════════════════════════

-- ── Profils utilisateurs ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL DEFAULT 'Athlète',
  gender      TEXT NOT NULL DEFAULT 'male' CHECK (gender IN ('male','female')),
  height_cm   NUMERIC NOT NULL DEFAULT 175,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Mesures corporelles (historique) ─────────────────────────
CREATE TABLE IF NOT EXISTS body_measures (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id     TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date        TIMESTAMPTZ DEFAULT NOW(),
  weight_kg   NUMERIC NOT NULL,
  waist_cm    NUMERIC NOT NULL
);

-- ── Séances d'entraînement ────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id     TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date        TIMESTAMPTZ DEFAULT NOW(),
  effort      INTEGER NOT NULL CHECK (effort BETWEEN 1 AND 10),
  feeling     TEXT NOT NULL CHECK (feeling IN ('top','medium','tired')),
  steps       INTEGER NOT NULL DEFAULT 0
);

-- ── Repas analysés ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS meals (
  id             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id        TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date           TIMESTAMPTZ DEFAULT NOW(),
  photo_url      TEXT NOT NULL DEFAULT '',
  category       TEXT NOT NULL CHECK (category IN ('balanced','rich','protein','light','unknown')),
  analysis_label TEXT NOT NULL DEFAULT ''
);

-- ── Programmes d'entraînement (God Mode) ─────────────────────
CREATE TABLE IF NOT EXISTS programs (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title       TEXT NOT NULL,
  tag         TEXT NOT NULL DEFAULT '',
  meta        TEXT NOT NULL DEFAULT '',
  level       TEXT NOT NULL DEFAULT 'Débutant',
  image_url   TEXT NOT NULL DEFAULT '',
  category    TEXT NOT NULL DEFAULT 'Tous',
  active      BOOLEAN NOT NULL DEFAULT true,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Configuration globale de l'app (God Mode) ─────────────────
CREATE TABLE IF NOT EXISTS app_config (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT ''
);

-- ── Valeurs par défaut de la config ───────────────────────────
INSERT INTO app_config (key, value, description) VALUES
  ('daily_step_goal',        '10000',  'Objectif pas quotidien'),
  ('daily_calorie_goal',     '2500',   'Objectif calorique journalier (kcal)'),
  ('kcal_per_step',          '0.04',   'Calories brûlées par pas'),
  ('session_base_kcal',      '180',    'Base calories par séance'),
  ('session_effort_kcal',    '28',     'Calories supplémentaires par point d''effort'),
  ('meal_kcal_balanced',     '550',    'Kcal repas équilibré'),
  ('meal_kcal_rich',         '800',    'Kcal repas riche'),
  ('meal_kcal_protein',      '640',    'Kcal repas protéiné'),
  ('meal_kcal_light',        '360',    'Kcal repas léger'),
  ('meal_kcal_unknown',      '480',    'Kcal repas inconnu'),
  ('waist_baseline_male',    '80',     'Tour de taille baseline homme (cm)'),
  ('waist_baseline_female',  '70',     'Tour de taille baseline femme (cm)'),
  ('bmi_reference',          '22',     'IMC de référence "normal"'),
  ('tone_sessions_max',      '12',     'Séances max pour tonus (sur 30j)'),
  ('posture_effort_max',     '8',      'Effort max pour posture (sur 10)'),
  ('avatar_male_slim',       'https://i.ibb.co/SD438mhX/IMG-5045.png', 'Photo avatar homme slim'),
  ('avatar_male_athletic',   'https://i.ibb.co/SDvdfGB6/IMG-5044.png', 'Photo avatar homme athletic'),
  ('avatar_male_full',       'https://i.ibb.co/VYkF2X0n/IMG-5043.png', 'Photo avatar homme full'),
  ('avatar_female_slim',     'https://i.ibb.co/0VpncpQm/IMG-5072.png', 'Photo avatar femme slim'),
  ('avatar_female_athletic', 'https://i.ibb.co/gZ1TQDHz/IMG-5073.png', 'Photo avatar femme athletic'),
  ('avatar_female_full',     'https://i.ibb.co/Qjh86N44/IMG-5074.png', 'Photo avatar femme full')
ON CONFLICT (key) DO NOTHING;

-- ── Programmes par défaut ─────────────────────────────────────
INSERT INTO programs (title, tag, meta, level, image_url, category, sort_order) VALUES
  ('INTENSIVE SCULPT',  'Cardio & Renforcement', '4 séances / sem · 35 min', 'Confirmé',  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800', 'Cardio',     1),
  ('POWER STRENGTH',    'Force & Masse',         '3 séances / sem · 50 min', 'Avancé',    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800', 'Force',      2),
  ('FLEX & MOBILITY',   'Souplesse & Récup',     '5 séances / sem · 20 min', 'Débutant',  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800', 'Souplesse',  3),
  ('CORE GAINAGE',      'Gainage & Stabilité',   '4 séances / sem · 25 min', 'Interméd.', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800', 'Gainage',    4)
ON CONFLICT DO NOTHING;

-- ── Désactiver RLS (app sans auth pour l'instant) ─────────────
ALTER TABLE profiles     DISABLE ROW LEVEL SECURITY;
ALTER TABLE body_measures DISABLE ROW LEVEL SECURITY;
ALTER TABLE sessions     DISABLE ROW LEVEL SECURITY;
ALTER TABLE meals        DISABLE ROW LEVEL SECURITY;
ALTER TABLE programs     DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_config   DISABLE ROW LEVEL SECURITY;
