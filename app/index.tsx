import React from 'react';
import { View } from 'react-native';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { useShallow } from 'zustand/react/shallow';
import { useUserStore } from '@/store/userStore';

export default function Index() {
  const params = useLocalSearchParams();
  const { isRestoring, profile, supabaseUserId } = useUserStore(
    useShallow((s) => ({ isRestoring: s.isRestoring, profile: s.profile, supabaseUserId: s.supabaseUserId }))
  );

  // Forward OAuth code/error to callback immediately — no need to wait for session restore
  if (params.error || params.code) {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return <Redirect href={`/auth/callback?${qs}` as any} />;
  }

  // Dark splash while session is being checked — prevents white flash from landing page
  if (isRestoring) {
    return <View style={{ flex: 1, backgroundColor: '#010613' }} />;
  }

  // Logged in and onboarded → main app
  if (supabaseUserId && profile.onboardingDone) {
    return <Redirect href="/(tabs)/" />;
  }

  // Not logged in or onboarding not done → landing page
  return <Redirect href="/onboarding" />;
}
