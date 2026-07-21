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
    // Supabase JS client automatically exchanges the URL code/fragment for a session.
    // We listen for the SIGNED_IN event which fires once the exchange completes.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event !== 'SIGNED_IN' || !session) return;
      subscription.unsubscribe();

      try {
        const user = session.user;

        // ── Read pending onboarding data saved before the OAuth redirect ──
        let pending: {
          userName?: string;
          gender?: string;
          height?: string;
          birthDay?: string;
          birthMonth?: string;
          birthYear?: string;
        } = {};

        if (Platform.OS === 'web') {
          try {
            const raw = localStorage.getItem('metaboost-pending-onboarding');
            if (raw) pending = JSON.parse(raw);
          } catch {}
        }

        // ── Resolve first name ──
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

        // ── Upsert profile in Supabase with the real auth user ID ──
        const { error: upsertErr } = await supabase.from('profiles').upsert({
          id: user.id,
          name: firstName,
          gender,
          height_cm: height,
          age: age ?? null,
          birth_date: birthDate || null,
          email: user.email || null,
        });

        if (upsertErr) console.warn('Profile upsert error:', upsertErr.message);

        // ── Update local Zustand store ──
        setSupabaseUserId(user.id);
        setProfile({ name: firstName, gender, height, age, birthDate });

        // ── Clean up localStorage ──
        if (Platform.OS === 'web') {
          try { localStorage.removeItem('metaboost-pending-onboarding'); } catch {}
        }

        setStatus('success');

        // Brief success pause, then continue to measures step
        setTimeout(() => {
          router.replace('/onboarding?from_auth=1' as any);
        }, 700);

      } catch (e: any) {
        console.error('Auth callback error:', e);
        setErrorMsg(e?.message || 'Erreur lors de la connexion.');
        setStatus('error');
      }
    });

    // Safety timeout: if no event fires in 8s, something went wrong
    const timeout = setTimeout(() => {
      if (status === 'loading') {
        setErrorMsg('La connexion a pris trop de temps. Réessaie.');
        setStatus('error');
      }
    }, 8000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  return (
    <View style={styles.root}>
      {status === 'error' ? (
        <>
          <Text style={styles.errorIcon}>✕</Text>
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
  errorIcon: {
    fontSize: 36,
    color: '#EF4444',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0D1117',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSub: {
    fontSize: 14,
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
