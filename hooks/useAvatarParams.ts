import { useUserStore } from '@/store/userStore';

export interface AvatarParams {
  bodyWidth: number;    // 0.7 - 1.4 (largeur globale)
  waistWidth: number;   // 0.6 - 1.5 (largeur abdominale)
  toneLevel: number;    // 0 - 1 (tonus musculaire)
  posture: number;      // 0 - 1 (posture droite)
  stepSlim: number;     // 0 - 1 (affinement par les pas)
  bmi: number;
}

export function useAvatarParams(): AvatarParams {
  const { getCurrentMeasure, profile, sessions, weekSteps } = useUserStore((s) => ({
    getCurrentMeasure: s.getCurrentMeasure,
    profile: s.profile,
    sessions: s.sessions,
    weekSteps: s.weekSteps,
  }));

  const measure = getCurrentMeasure();

  const weight = measure?.weight ?? 75;
  const waist = measure?.waist ?? 85;
  const height = profile.height ?? 175;

  const bmi = weight / ((height / 100) ** 2);

  // Body width: BMI influence
  // BMI 18.5 = thin (0.8), 25 = normal (1.0), 35 = overweight (1.35)
  const bodyWidth = Math.max(0.7, Math.min(1.4, 0.4 + bmi * 0.024));

  // Waist width relative to a reference of 80cm
  const waistWidth = Math.max(0.6, Math.min(1.5, waist / 80));

  // Tone: based on sessions in last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentSessions = sessions.filter(
    (s) => new Date(s.date) > thirtyDaysAgo
  ).length;
  const toneLevel = Math.min(1, recentSessions / 12); // 12 séances = max tone

  // Posture: based on avg effort of recent sessions
  const recentEffort =
    recentSessions > 0
      ? sessions
          .filter((s) => new Date(s.date) > thirtyDaysAgo)
          .reduce((acc, s) => acc + s.effort, 0) / recentSessions
      : 0;
  const posture = Math.min(1, recentEffort / 8);

  // Step slim: every 10k steps -> 0.5% slimmer, capped at 5%
  const stepSlim = Math.min(0.05, (weekSteps / 10000) * 0.005);

  return { bodyWidth, waistWidth, toneLevel, posture, stepSlim, bmi };
}
