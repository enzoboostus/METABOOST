import { Redirect, useLocalSearchParams } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useUserStore } from '@/store/userStore';

export default function Index() {
  const onboardingDone = useUserStore((s) => s.profile.onboardingDone);
  const profileName = useUserStore((s) => s.profile.name);
  const supabaseUserId = useUserStore((s) => s.supabaseUserId);
  const isRestoring = useUserStore((s) => s.isRestoring);
  const params = useLocalSearchParams();

  // Supabase sends OAuth errors to Site URL (root) — forward to auth/callback to handle them
  if (params.error || params.code) {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return <Redirect href={`/auth/callback?${qs}` as any} />;
  }

  // If name + userId are stored, user already onboarded — no need to wait
  const alreadyOnboarded = onboardingDone || !!(profileName && supabaseUserId);

  // Wait for Supabase session restore only if we have no local signal
  if (!alreadyOnboarded && isRestoring) {
    return <View style={{ flex: 1, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color="#fff" /></View>;
  }

  return <Redirect href={alreadyOnboarded ? '/(tabs)/' : '/onboarding'} />;
}
