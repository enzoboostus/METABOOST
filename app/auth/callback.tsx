import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Platform } from 'react-native';

export default function AuthCallback() {
  const [msg, setMsg] = useState('Connexion en cours…');

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    (async () => {
      try {
        // Dynamic import avoids any top-level crash before render
        const { supabase } = await import('@/lib/supabase');

        // Case 1: error from Google / Supabase in URL
        const url = new URL(window.location.href);
        const errorParam = url.searchParams.get('error');
        if (errorParam) {
          const desc = url.searchParams.get('error_description') || errorParam;
          setMsg('Erreur : ' + desc);
          setTimeout(() => { window.location.href = '/'; }, 3000);
          return;
        }

        // Case 2: session already exchanged by detectSessionInUrl: true
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          window.location.href = '/onboarding?from_auth=1';
          return;
        }

        // Case 3: code not yet exchanged — wait up to 10s for SIGNED_IN
        setMsg('Finalisation de la connexion…');
        let done = false;

        const timer = setTimeout(() => {
          if (done) return;
          done = true;
          window.location.href = '/';
        }, 10000);

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, sess) => {
          if (done) return;
          if (event === 'SIGNED_IN' && sess) {
            done = true;
            clearTimeout(timer);
            subscription.unsubscribe();
            window.location.href = '/onboarding?from_auth=1';
          }
        });

      } catch (e: any) {
        setMsg('Erreur inattendue. Retour…');
        setTimeout(() => { window.location.href = '/'; }, 3000);
      }
    })();
  }, []);

  return (
    <View style={styles.root}>
      <ActivityIndicator size="large" color="#00C8D4" style={{ marginBottom: 20 }} />
      <Text style={styles.txt}>{msg}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#111318',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  txt: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
