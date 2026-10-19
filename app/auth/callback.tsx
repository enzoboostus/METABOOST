import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/store/userStore';
import { useShallow } from 'zustand/react/shallow';

type Status = 'loading' | 'success' | 'error';

export default function AuthCallback() {
  const [status, setStatus] = useState<Status>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  const { setProfile } = useUserStore(
    useShallow((s) => ({ setProfile: s.setProfile }))
  );

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    async function handleCallback() {
      try {
        const url = new URL(window.location.href);

        const errorParam = url.searchParams.get('error');
        const errorDesc  = url.searchParams.get('error_description');
        if (errorParam) throw new Error(errorDesc || errorParam);

        const code = url.searchParams.get('code');
        if (!code) throw new Error("Aucun code d'autorisation reçu.");

        const { data: { session }, error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeErr) throw exchangeErr;
        if (!session) throw new Error('Session nulle après échange du code.');

        const user = session.user;

        let pending: { userName?: string; gender?: string; height?: string } = {};
        try {
          const raw = localStorage.getItem('metaboost-pending-onboarding');
          if (raw) pending = JSON.parse(raw);
        } catch {}

        const metaName = user.user_metadata?.full_name || user.user_metadata?.name || '';
        const firstName = (
          pending.userName || metaName.split(' ')[0] || user.email?.split('@')[0] || 'Athlète'
        ).trim();

        const gender = (pending.gender as 'male' | 'female') || 'male';
        const height = pending.height ? parseFloat(pending.height) : 175;

        await supabase.from('profiles').upsert({
          id: user.id,
          name: firstName,
          gender,
          height_cm: height,
          email: user.email || null,
        });

        setProfile({ name: firstName, gender, height, onboardingDone: true });

        try { localStorage.removeItem('metaboost-pending-onboarding'); } catch {}

        window.history.replaceState({}, document.title, '/auth/callback');

        setStatus('success');
        setTimeout(() => {
          router.replace('/(tabs)' as any);
        }, 700);

      } catch (e: any) {
        console.error('Auth callback error:', e);
        setErrorMsg(e?.message || 'Erreur lors de la connexion.');
        setStatus('error');
      }
    }

    handleCallback();
  }, []);

  return (
    <View style={styles.root}>
      {status === 'error' ? (
        <>
          <Text style={styles.errorTitle}>Connexion échouée</Text>
          <Text style={styles.errorSub}>{errorMsg}</Text>
          <TouchableOpacity
            onPress={() => router.replace('/onboarding' as any)}
            style={styles.retryBtn}
            activeOpacity={0.8}
          >
            <Text style={styles.retryTxt}>Retour</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <ActivityIndicator size="large" color="#FF6B35" style={{ marginBottom: 20 }} />
          <Text style={styles.loadingTxt}>
            {status === 'success' ? 'Connexion réussie ✓' : 'Connexion en cours…'}
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingTxt: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSub: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  retryBtn: {
    backgroundColor: '#FF6B35',
    borderRadius: 100,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  retryTxt: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
