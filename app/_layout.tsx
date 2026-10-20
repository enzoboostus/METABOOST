import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { Colors } from '@/constants/theme';
import { useUserStore } from '@/store/userStore';
import { supabase } from '@/lib/supabase';

const BLANK_PROFILE = { name: '', gender: 'male' as const, height: 175, onboardingDone: false, goal: null as any, age: null, birthDate: '' };

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: string | null }> {
  constructor(props: any) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { error: error?.message || String(error) };
  }
  render() {
    if (this.state.error) {
      return (
        <View style={{ flex: 1, backgroundColor: '#111', justifyContent: 'center', padding: 20 }}>
          <Text style={{ color: 'red', fontSize: 14, fontFamily: 'monospace' }}>
            {this.state.error}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

function AppInit({ children }: { children: React.ReactNode }) {
  const { loadConfig, loadFromSupabase } = useUserStore();

  useEffect(() => {
    loadConfig();

    // Single source of truth for auth: onAuthStateChange
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        // Valid session → restore profile + data from Supabase
        loadFromSupabase();
      } else if (event === 'INITIAL_SESSION' || event === 'SIGNED_OUT') {
        // No session on startup or after logout → wipe stale state, show login
        try { if (Platform.OS === 'web') localStorage.clear(); } catch {}
        useUserStore.setState({ isRestoring: false, supabaseUserId: null, profile: BLANK_PROFILE });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={[styles.root, { backgroundColor: Colors.background }]}>
        <StatusBar style="light" backgroundColor={Colors.background} />
        <AppInit>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}>
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="god-mode" />
            <Stack.Screen name="legal" />
            <Stack.Screen name="auth" />
          </Stack>
        </AppInit>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
