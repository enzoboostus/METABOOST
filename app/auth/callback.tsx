import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

export default function AuthCallback() {
  const didRun = useRef(false);
  const [msg, setMsg] = useState('Connexion en cours…');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web' || didRun.current) return;
    didRun.current = true;

    (async () => {
      try {
        const { supabase } = await import('@/lib/supabase');

        const url = new URL(window.location.href);

        const errorParam = url.searchParams.get('error');
        if (errorParam) {
          const msg = url.searchParams.get('error_description') || errorParam;
          setMsg(msg);
          setIsError(true);
          return;
        }

        setMsg('Échange du code…');
        let session: any = null;

        // Path 1: session already exchanged by Supabase SDK
        const { data: s1 } = await supabase.auth.getSession();
        if (s1?.session) {
          session = s1.session;
        } else {
          // Path 2: manual exchange
          const code = url.searchParams.get('code');
          if (code) {
            const { data: s2, error: exchErr } = await supabase.auth.exchangeCodeForSession(code);
            if (exchErr) {
              setMsg(exchErr.message);
              setIsError(true);
              return;
            }
            session = s2?.session;
          }
        }

        if (!session) {
          // Path 3: wait for onAuthStateChange
          setMsg('Finalisation…');
          await new Promise<void>((resolve, reject) => {
            const t = setTimeout(() => reject(new Error('Délai dépassé. Réessaie.')), 8000);
            const { data: { subscription } } = supabase.auth.onAuthStateChange((ev, sess) => {
              if (ev === 'SIGNED_IN' && sess) {
                session = sess;
                clearTimeout(t);
                subscription.unsubscribe();
                resolve();
              }
            });
          });
        }

        if (!session) {
          setMsg('Session introuvable.');
          setIsError(true);
          return;
        }

        setMsg('✓ Connecté !');

        const { data: profile } = await supabase.from('profiles')
          .select('id, name')
          .eq('id', session.user.id)
          .maybeSingle();

        const dest = profile?.name ? '/(tabs)/' : '/onboarding?from_auth=1';
        setTimeout(() => { window.location.href = dest; }, 600);

      } catch (e: any) {
        setMsg(e?.message || 'Erreur inattendue.');
        setIsError(true);
      }
    })();
  }, []);

  return (
    <View style={styles.root}>
      {isError ? (
        <>
          <View style={styles.errIcon}><Text style={styles.errX}>✕</Text></View>
          <Text style={styles.errTitle}>Connexion échouée</Text>
          <Text style={styles.errSub}>{msg}</Text>
          <TouchableOpacity style={styles.btn} onPress={() => router.replace('/onboarding' as any)}>
            <Text style={styles.btnTxt}>Retour</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <ActivityIndicator size="large" color="#00C8D4" style={{ marginBottom: 20 }} />
          <Text style={styles.loadTxt}>{msg}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#111318', alignItems: 'center', justifyContent: 'center', padding: 32 },
  loadTxt: { fontSize: 15, fontWeight: '600', color: '#fff', textAlign: 'center' },
  errIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#2D1B1B', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  errX: { fontSize: 22, color: '#EF4444', fontWeight: '700' },
  errTitle: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 8, textAlign: 'center' },
  errSub: { fontSize: 13, color: '#EF4444', textAlign: 'center', lineHeight: 20, marginBottom: 28 },
  btn: { backgroundColor: '#00C8D4', borderRadius: 100, paddingVertical: 14, paddingHorizontal: 32 },
  btnTxt: { fontSize: 15, fontWeight: '700', color: '#111318' },
});
