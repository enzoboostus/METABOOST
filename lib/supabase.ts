import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://ivrkzhboitfbyparwcpr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_iI-grK9y7xEBJF-aTISzWA_Sf_GPgae';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Database types ───────────────────────────────────────────────────────────

export interface DBProfile {
  id: string;
  name: string;
  gender: 'male' | 'female';
  height_cm: number;
  created_at: string;
}

export interface DBBodyMeasure {
  id: string;
  user_id: string;
  date: string;
  weight_kg: number;
  waist_cm: number;
}

export interface DBSession {
  id: string;
  user_id: string;
  date: string;
  effort: number;
  feeling: 'top' | 'medium' | 'tired';
  steps: number;
}

export interface DBMeal {
  id: string;
  user_id: string;
  date: string;
  photo_url: string;
  category: 'balanced' | 'rich' | 'protein' | 'light' | 'unknown';
  analysis_label: string;
}

export interface DBProgram {
  id: string;
  title: string;
  tag: string;
  meta: string;
  level: string;
  image_url: string;
  category: string;
  active: boolean;
  sort_order: number;
}

export interface DBAppConfig {
  key: string;
  value: string;
  description: string;
}
