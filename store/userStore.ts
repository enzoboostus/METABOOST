import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

export type Gender = 'male' | 'female';
export type Feeling = 'top' | 'medium' | 'tired';

export interface BodyMeasure {
  date: string;
  weight: number;
  waist: number;
}

export interface Session {
  id: string;
  date: string;
  effort: number;
  feeling: Feeling;
  steps: number;
}

export interface MealLog {
  id: string;
  date: string;
  photo: string;
  analysis: string;
  category: 'balanced' | 'rich' | 'protein' | 'light' | 'unknown';
}

export interface UserProfile {
  name: string;
  gender: Gender;
  height: number;
  onboardingDone: boolean;
}

// App config loaded from Supabase (God Mode)
export interface AppConfig {
  daily_step_goal: number;
  daily_calorie_goal: number;
  kcal_per_step: number;
  session_base_kcal: number;
  session_effort_kcal: number;
  meal_kcal_balanced: number;
  meal_kcal_rich: number;
  meal_kcal_protein: number;
  meal_kcal_light: number;
  meal_kcal_unknown: number;
  waist_baseline_male: number;
  waist_baseline_female: number;
  bmi_reference: number;
  tone_sessions_max: number;
  posture_effort_max: number;
  avatar_male_slim: string;
  avatar_male_athletic: string;
  avatar_male_full: string;
  avatar_female_slim: string;
  avatar_female_athletic: string;
  avatar_female_full: string;
}

const DEFAULT_CONFIG: AppConfig = {
  daily_step_goal: 10000,
  daily_calorie_goal: 2500,
  kcal_per_step: 0.04,
  session_base_kcal: 180,
  session_effort_kcal: 28,
  meal_kcal_balanced: 550,
  meal_kcal_rich: 800,
  meal_kcal_protein: 640,
  meal_kcal_light: 360,
  meal_kcal_unknown: 480,
  waist_baseline_male: 80,
  waist_baseline_female: 70,
  bmi_reference: 22,
  tone_sessions_max: 12,
  posture_effort_max: 8,
  avatar_male_slim:       'https://i.ibb.co/SD438mhX/IMG-5045.png',
  avatar_male_athletic:   'https://i.ibb.co/SDvdfGB6/IMG-5044.png',
  avatar_male_full:       'https://i.ibb.co/VYkF2X0n/IMG-5043.png',
  avatar_female_slim:     'https://i.ibb.co/0VpncpQm/IMG-5072.png',
  avatar_female_athletic: 'https://i.ibb.co/gZ1TQDHz/IMG-5073.png',
  avatar_female_full:     'https://i.ibb.co/Qjh86N44/IMG-5074.png',
};

// Generate a stable local user ID
function getLocalUserId(): string {
  return 'local-user';
}

interface UserState {
  profile: UserProfile;
  measures: BodyMeasure[];
  initialMeasure: BodyMeasure | null;
  sessions: Session[];
  meals: MealLog[];
  todaySteps: number;
  weekSteps: number;
  config: AppConfig;
  syncedToSupabase: boolean;

  setProfile: (profile: Partial<UserProfile>) => void;
  addMeasure: (measure: BodyMeasure) => void;
  setInitialMeasure: (measure: BodyMeasure) => void;
  addSession: (session: Session) => void;
  addMeal: (meal: MealLog) => void;
  setSteps: (today: number, week: number) => void;
  completeOnboarding: () => void;
  getCurrentMeasure: () => BodyMeasure | null;
  syncToSupabase: () => Promise<void>;
  loadFromSupabase: () => Promise<void>;
  loadConfig: () => Promise<void>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: {
        name: '',
        gender: 'male',
        height: 175,
        onboardingDone: false,
      },
      measures: [],
      initialMeasure: null,
      sessions: [],
      meals: [],
      todaySteps: 0,
      weekSteps: 0,
      config: DEFAULT_CONFIG,
      syncedToSupabase: false,

      setProfile: (partial) =>
        set((state) => ({ profile: { ...state.profile, ...partial } })),

      addMeasure: (measure) => {
        set((state) => ({ measures: [...state.measures, measure] }));
        // Sync to Supabase
        const userId = getLocalUserId();
        supabase.from('body_measures').insert({
          id: `${userId}-${measure.date}`,
          user_id: userId,
          date: measure.date,
          weight_kg: measure.weight,
          waist_cm: measure.waist,
        }).then(({ error }) => { if (error) console.warn('Supabase measure sync:', error.message); });
      },

      setInitialMeasure: (measure) => set({ initialMeasure: measure }),

      addSession: (session) => {
        set((state) => ({ sessions: [session, ...state.sessions] }));
        // Sync to Supabase
        const userId = getLocalUserId();
        supabase.from('sessions').insert({
          id: session.id,
          user_id: userId,
          date: session.date,
          effort: session.effort,
          feeling: session.feeling,
          steps: session.steps,
        }).then(({ error }) => { if (error) console.warn('Supabase session sync:', error.message); });
      },

      addMeal: (meal) => {
        set((state) => ({ meals: [meal, ...state.meals] }));
        // Sync to Supabase
        const userId = getLocalUserId();
        supabase.from('meals').insert({
          id: meal.id,
          user_id: userId,
          date: meal.date,
          photo_url: meal.photo,
          category: meal.category,
          analysis_label: meal.analysis,
        }).then(({ error }) => { if (error) console.warn('Supabase meal sync:', error.message); });
      },

      setSteps: (today, week) => set({ todaySteps: today, weekSteps: week }),

      completeOnboarding: () => {
        const { profile } = get();
        set((state) => ({
          profile: { ...state.profile, onboardingDone: true },
        }));
        // Create profile in Supabase
        const userId = getLocalUserId();
        supabase.from('profiles').upsert({
          id: userId,
          name: profile.name || 'Athlète',
          gender: profile.gender,
          height_cm: profile.height,
        }).then(({ error }) => { if (error) console.warn('Supabase profile sync:', error.message); });
      },

      getCurrentMeasure: () => {
        const { measures } = get();
        if (measures.length === 0) return null;
        return measures[measures.length - 1];
      },

      // Load app config from Supabase (God Mode values)
      loadConfig: async () => {
        const { data, error } = await supabase.from('app_config').select('key, value');
        if (error || !data) return;
        const cfg: Partial<AppConfig> = {};
        for (const row of data) {
          const val = row.value;
          const numericKeys = [
            'daily_step_goal','daily_calorie_goal','kcal_per_step',
            'session_base_kcal','session_effort_kcal','meal_kcal_balanced',
            'meal_kcal_rich','meal_kcal_protein','meal_kcal_light','meal_kcal_unknown',
            'waist_baseline_male','waist_baseline_female','bmi_reference',
            'tone_sessions_max','posture_effort_max',
          ];
          (cfg as any)[row.key] = numericKeys.includes(row.key) ? parseFloat(val) : val;
        }
        set((state) => ({ config: { ...state.config, ...cfg } }));
      },

      // Full sync: push all local data to Supabase
      syncToSupabase: async () => {
        const { profile, measures, sessions, meals } = get();
        const userId = getLocalUserId();

        // Upsert profile
        await supabase.from('profiles').upsert({
          id: userId,
          name: profile.name || 'Athlète',
          gender: profile.gender,
          height_cm: profile.height,
        });

        // Upsert all measures
        if (measures.length > 0) {
          await supabase.from('body_measures').upsert(
            measures.map((m) => ({
              id: `${userId}-${m.date}`,
              user_id: userId,
              date: m.date,
              weight_kg: m.weight,
              waist_cm: m.waist,
            }))
          );
        }

        // Upsert all sessions
        if (sessions.length > 0) {
          await supabase.from('sessions').upsert(
            sessions.map((s) => ({
              id: s.id,
              user_id: userId,
              date: s.date,
              effort: s.effort,
              feeling: s.feeling,
              steps: s.steps,
            }))
          );
        }

        // Upsert all meals
        if (meals.length > 0) {
          await supabase.from('meals').upsert(
            meals.map((m) => ({
              id: m.id,
              user_id: userId,
              date: m.date,
              photo_url: m.photo,
              category: m.category,
              analysis_label: m.analysis,
            }))
          );
        }

        set({ syncedToSupabase: true });
      },

      // Load data from Supabase (used on app start)
      loadFromSupabase: async () => {
        const userId = getLocalUserId();
        const [measRes, sesRes, mealRes] = await Promise.all([
          supabase.from('body_measures').select('*').eq('user_id', userId).order('date'),
          supabase.from('sessions').select('*').eq('user_id', userId).order('date', { ascending: false }),
          supabase.from('meals').select('*').eq('user_id', userId).order('date', { ascending: false }),
        ]);

        const updates: Partial<UserState> = {};

        if (measRes.data && measRes.data.length > 0) {
          updates.measures = measRes.data.map((m) => ({
            date: m.date,
            weight: m.weight_kg,
            waist: m.waist_cm,
          }));
        }
        if (sesRes.data && sesRes.data.length > 0) {
          updates.sessions = sesRes.data.map((s) => ({
            id: s.id,
            date: s.date,
            effort: s.effort,
            feeling: s.feeling as Feeling,
            steps: s.steps,
          }));
        }
        if (mealRes.data && mealRes.data.length > 0) {
          updates.meals = mealRes.data.map((m) => ({
            id: m.id,
            date: m.date,
            photo: m.photo_url,
            analysis: m.analysis_label,
            category: m.category,
          }));
        }

        if (Object.keys(updates).length > 0) set(updates);
      },
    }),
    {
      name: 'metaboost-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
