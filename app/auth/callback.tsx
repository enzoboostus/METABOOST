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

    async function handleCallback() {
      try {
        const url = new URL(window.location.href);

        // ── Case 1: OAuth error returned by Apple / Supabase ──────────────────
        const errorParam = url.searchParams.get('error');
        const errorDesc  = url.searchParams.get('error_description');
        if (errorParam) {
          throw new Error(errorDesc || errorParam);
        }

        // ── Case 2: PKCE flow — Supabase sends back a `code` query param ──────
        // This is the standard Supabase v2 OAuth / PKCE exchange.
        const code = url.searchParams.get('code');
        if (!code) {
          throw new Error(
            'Aucun code d\'autorisation reçu dans l\'URL. ' +
            'Vérifie que le provider Apple est bien activé dans le dashboard Supabase.'
          );
        }

        // Exchange the code for a real session (PKCE verifier stored in localStorage by the SDK)
        const { data: { session }, error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeErr) throw exchangeErr;
        if (!session) throw new Error('Session nulle après l\'échange du code.');

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

        // ── Upsert profile with real Supabase auth user ID ──────────────────
        const { error: upsertErr } = await supabase.from('profiles').upsert({
          id: user.id,
          name: firstName,
          gender,
          height_cm: height,
          age: age ?? null,
          birth_date: birthDate || null,
          email: user.email || null,
        });
        if (upsertErr) console.warn('Profile upsert:', upsertErr.message);

        // ── Update Zustand store ─────────────────────────────────────────────
        setSupabaseUserId(user.id);
        setProfile({ name: firstName, gender, height, age, birthDate });

        // ── Clean up localStorage ────────────────────────────────────────────
        try { localStorage.removeItem('metaboost-pending-onboarding'); } catch {}

        // ── Clean up the URL (remove ?code= to avoid double-exchange on refresh)
        window.history.replaceState({}, document.title, '/auth/callback');

        setStatus('success');
        setTimeout(() => {
          router.replace('/onboarding?from_auth=1' as any);
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
          <ActivityIndicator size="large" color="#0D1117" style={{ marginBottom: 20 }} />
          <Text style={styles.loadingTxt}>
            {status === 'success' ? 'Connexion réussie ✓' : 'Finalisation de la connexion…'}
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
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingTxt: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D1117',
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
    backgroundColor: '#FEF2F2',
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
    color: '#0D1117',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSub: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  retryBtn: {
    backgroundColor: '#0D1117',
    borderRadius: 100,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  retryTxt: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
