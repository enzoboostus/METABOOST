import { Redirect, useLocalSearchParams } from 'expo-router';
import { useUserStore } from '@/store/userStore';

export default function Index() {
  const onboardingDone = useUserStore((s) => s.profile.onboardingDone);
  const params = useLocalSearchParams();
  // Supabase sends OAuth errors to Site URL (root) — forward to auth/callback to handle them
  if (params.error || params.code) {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return <Redirect href={`/auth/callback?${qs}` as any} />;
  }
  return <Redirect href={onboardingDone ? '/(tabs)/' : '/onboarding'} />;
}
