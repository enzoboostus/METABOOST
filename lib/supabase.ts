import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

export const SUPABASE_URL = 'https://ivrkzhboitfbyparwcpr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_iI-grK9y7xEBJF-aTISzWA_Sf_GPgae';

// Safari iOS clears localStorage during cross-site OAuth redirects (ITP).
// Writing to both sessionStorage + localStorage ensures the PKCE verifier survives.
const safariStorage = Platform.OS === 'web' ? {
  getItem: (key: string): string | null => {
    try { return sessionStorage.getItem(key) ?? localStorage.getItem(key); } catch { return null; }
  },
  setItem: (key: string, value: string): void => {
    try { sessionStorage.setItem(key, value); } catch {}
    try { localStorage.setItem(key, value); } catch {}
  },
  removeItem: (key: string): void => {
    try { sessionStorage.removeItem(key); } catch {}
    try { localStorage.removeItem(key); } catch {}
  },
} : undefined;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    ...(safariStorage ? { storage: safariStorage } : {}),
    flowType: 'pkce',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

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
