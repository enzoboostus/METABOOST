import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/store/userStore';
import { useShallow } from 'zustand/react/shallow';

type Status = 'loading' | 'success' | 'error';

function computeAge(birthDate: string): number | null {
  if (!birthDate) return null;
  const b = new Date(birthDate);
  if (isNaN(b.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - b.getFullYear();
  const md = today.getMonth() - b.getMonth();
  if (md < 0 || (md === 0 && today.getDate() < b.getDate())) age--;
  return age > 0 && age < 130 ? age : null;
}

export default function AuthCallback() {
  const [status, setStatus] = useState<Status>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  const { setProfile, setSupabaseUserId } = useUserStore(
    useShallow((s) => ({ setProfile: s.setProfile, setSupabaseUserId: s.setSupabaseUserId }))
  );

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    // Check for OAuth errors in URL immediately
    const url = new URL(window.location.href);
    const errorParam = url.searchParams.get('error');
    const errorDesc = url.searchParams.get('error_description');
    if (errorParam) {
      setErrorMsg(errorDesc || errorParam);
      setStatus('error');
      return;
    }

    // With detectSessionInUrl: true, Supabase auto-processes the ?code= param
    // and fires SIGNED_IN via onAuthStateChange — we just listen for it.
    let handled = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (handled) return;
      if (event !== 'SIGNED_IN' || !session) return;
      handled = true;

      try {
        const user = session.user;

        // ── Read pending onboarding data saved before the OAuth redirect ──────
        let pending: {
          userName?: string;
          gender?: string;
          height?: string;
          birthDay?: string;
          birthMonth?: string;
          birthYear?: string;
        } = {};
        try {
          const raw = localStorage.getItem('metaboost-pending-onboarding');
          if (raw) pending = JSON.parse(raw);
        } catch {}

        // ── Resolve first name ──────────────────────────────────────────────
        const metaName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          '';
        const firstName = (
          pending.userName ||
          metaName.split(' ')[0] ||
          user.email?.split('@')[0] ||
          'Athlète'
        ).trim();

        const gender = (pending.gender as 'male' | 'female') || 'male';
        const height = pending.height ? parseFloat(pending.height) : 175;

        const birthDate =
          pending.birthYear && pending.birthMonth && pending.birthDay
            ? `${pending.birthYear}-${pending.birthMonth.padStart(2, '0')}-${pending.birthDay.padStart(2, '0')}`
            : '';
        const age = computeAge(birthDate);

        // ── Check if profile already exists in Supabase ─────────────────────
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id, name')
          .eq('id', user.id)
          .maybeSingle();

        // ── Upsert profile with real Supabase auth user ID ──────────────────
        const { error: upsertErr } = await supabase.from('profiles').upsert({
          id: user.id,
          name: existingProfile?.name || firstName,
          gender,
          height_cm: height,
          age: age ?? null,
          birth_date: birthDate || null,
          email: user.email || null,
        });
        if (upsertErr) console.warn('Profile upsert:', upsertErr.message);

        // ── Update Zustand store ─────────────────────────────────────────────
        setSupabaseUserId(user.id);
        setProfile({ name: existingProfile?.name || firstName, gender, height, age, birthDate });

        // ── Clean up localStorage ────────────────────────────────────────────
        try { localStorage.removeItem('metaboost-pending-onboarding'); } catch {}

        setStatus('success');

        // If profile already existed → go to home, otherwise → finish onboarding
        const dest = existingProfile?.name ? '/(tabs)/' : '/onboarding?from_auth=1';
        setTimeout(() => { window.location.href = dest; }, 800);

      } catch (e: any) {
        console.error('Auth callback error:', e);
        setErrorMsg(e?.message || 'Erreur lors de la connexion.');
        setStatus('error');
      }
    });

    // Timeout fallback: if SIGNED_IN never fires within 15s, show error
    const timeout = setTimeout(() => {
      if (handled) return;
      handled = true;
      subscription.unsubscribe();
      setErrorMsg('Délai dépassé. Réessaie la connexion Google.');
      setStatus('error');
    }, 15000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  return (
    <View style={styles.root}>
      {status === 'error' ? (
        <>
          <View style={styles.errorIconWrap}>
            <Text style={styles.errorIcon}>✕</Text>
          </View>
          <Text style={styles.errorTitle}>Connexion échouée</Text>
          <Text style={styles.errorSub}>{errorMsg}</Text>
          <TouchableOpacity
            onPress={() => router.replace('/onboarding' as any)}
            style={styles.retryBtn}
            activeOpacity={0.8}
          >
            <Text style={styles.retryTxt}>Retour à l'inscription</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <ActivityIndicator size="large" color="#00C8D4" style={{ marginBottom: 20 }} />
          <Text style={styles.loadingTxt}>
            {status === 'success' ? 'Connexion réussie ✓' : 'Connexion en cours…'}
          </Text>
          {status === 'success' && (
            <Text style={styles.redirectTxt}>Redirection automatique…</Text>
          )}
        </>
      )}
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
  loadingTxt: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  redirectTxt: {
    marginTop: 8,
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  errorIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2D1B1B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  errorIcon: {
    fontSize: 22,
    color: '#EF4444',
    fontWeight: '700',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSub: {
    fontSize: 13,
    color: '#EF4444',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  retryBtn: {
    backgroundColor: '#00C8D4',
    borderRadius: 100,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  retryTxt: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111318',
  },
});
