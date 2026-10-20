import { Redirect, useLocalSearchParams } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useUserStore } from '@/store/userStore';

export default function Index() {
  const onboardingDone = useUserStore((s) => s.profile.onboardingDone);
  const isRestoring = useUserStore((s) => s.isRestoring);
  const params = useLocalSearchParams();
  // Supabase sends OAuth errors to Site URL (root) — forward to auth/callback to handle them
  if (params.error || params.code) {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return <Redirect href={`/auth/callback?${qs}` as any} />;
  }
  // Wait for Supabase session restore before deciding where to route
  if (isRestoring) {
    return <View style={{ flex: 1, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color="#fff" /></View>;
  }
  return <Redirect href={onboardingDone ? '/(tabs)/' : '/onboarding'} />;
}
