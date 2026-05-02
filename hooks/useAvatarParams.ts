import { useShallow } from 'zustand/react/shallow';
import { useUserStore } from '@/store/userStore';

export interface AvatarParams {
  bodyWidth: number;
  waistWidth: number;
  toneLevel: number;
  posture: number;
  stepSlim: number;
  bmi: number;
}

export function useAvatarParams(): AvatarParams {
  const { getCurrentMeasure, profile, sessions, weekSteps, config } = useUserStore(useShallow((s) => ({
    getCurrentMeasure: s.getCurrentMeasure,
    profile: s.profile,
    sessions: s.sessions,
    weekSteps: s.weekSteps,
    config: s.config,
  })));

  const measure = getCurrentMeasure();

  const weight = measure?.weight ?? 75;
  const waist  = measure?.waist  ?? 85;
  const height = profile.height  ?? 175;

  const bmi = weight / ((height / 100) ** 2);

  const bodyWidth = Math.max(0.7, Math.min(1.4, 0.4 + bmi * 0.024));

  const waistBaseline = profile.gender === 'female'
    ? config.waist_baseline_female
    : config.waist_baseline_male;
  const waistWidth = Math.max(0.6, Math.min(1.5, waist / waistBaseline));

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentSessions = sessions.filter(
    (s) => new Date(s.date) > thirtyDaysAgo
  ).length;
  const toneLevel = Math.min(1, recentSessions / config.tone_sessions_max);

  const recentEffort =
    recentSessions > 0
      ? sessions
          .filter((s) => new Date(s.date) > thirtyDaysAgo)
          .reduce((acc, s) => acc + s.effort, 0) / recentSessions
      : 0;
  const posture = Math.min(1, recentEffort / config.posture_effort_max);

  const stepSlim = Math.min(0.05, (weekSteps / config.daily_step_goal) * 0.005);

  return { bodyWidth, waistWidth, toneLevel, posture, stepSlim, bmi };
}
