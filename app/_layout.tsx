import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View, Text } from 'react-native';
import { Colors } from '@/constants/theme';
import InstallBanner from '@/components/InstallBanner';
import { useUserStore } from '@/store/userStore';

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
    // Load God Mode config + user data from Supabase on startup
    loadConfig();
    loadFromSupabase();
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
          </Stack>
        </AppInit>
        <InstallBanner />
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
