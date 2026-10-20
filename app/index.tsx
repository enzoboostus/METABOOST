import { Redirect, useLocalSearchParams } from 'expo-router';

export default function Index() {
  const params = useLocalSearchParams();

  // Supabase sends OAuth errors/codes to Site URL — forward to auth/callback
  if (params.error || params.code) {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return <Redirect href={`/auth/callback?${qs}` as any} />;
  }

  // Always start on the landing/login screen — onboarding.tsx handles session detection
  return <Redirect href="/onboarding" />;
}
