import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

interface UserState {
  profile: UserProfile;
  measures: BodyMeasure[];
  initialMeasure: BodyMeasure | null;
  sessions: Session[];
  meals: MealLog[];
  todaySteps: number;
  weekSteps: number;

  setProfile: (profile: Partial<UserProfile>) => void;
  addMeasure: (measure: BodyMeasure) => void;
  setInitialMeasure: (measure: BodyMeasure) => void;
  addSession: (session: Session) => void;
  addMeal: (meal: MealLog) => void;
  setSteps: (today: number, week: number) => void;
  completeOnboarding: () => void;
  getCurrentMeasure: () => BodyMeasure | null;
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

      setProfile: (partial) =>
        set((state) => ({ profile: { ...state.profile, ...partial } })),

      addMeasure: (measure) =>
        set((state) => ({ measures: [...state.measures, measure] })),

      setInitialMeasure: (measure) => set({ initialMeasure: measure }),

      addSession: (session) =>
        set((state) => ({ sessions: [session, ...state.sessions] })),

      addMeal: (meal) =>
        set((state) => ({ meals: [meal, ...state.meals] })),

      setSteps: (today, week) => set({ todaySteps: today, weekSteps: week }),

      completeOnboarding: () =>
        set((state) => ({
          profile: { ...state.profile, onboardingDone: true },
        })),

      getCurrentMeasure: () => {
        const { measures } = get();
        if (measures.length === 0) return null;
        return measures[measures.length - 1];
      },
    }),
    {
      name: 'metaboost-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
