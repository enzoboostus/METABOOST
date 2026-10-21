import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

export default function AuthCallback() {
  const didRun = useRef(false);

  // Force dark background before any React paint — eliminates white flash
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    document.body.style.background = '#111318';
    document.documentElement.style.background = '#111318';
  }

  useEffect(() => {
    if (Platform.OS !== 'web' || didRun.current) return;
    didRun.current = true;

    (async () => {
      try {
        const { supabase } = await import('@/lib/supabase');

        const url = new URL(window.location.href);

        // Error from Google/Supabase
        const errorParam = url.searchParams.get('error');
        if (errorParam) {
          const msg = url.searchParams.get('error_description') || errorParam;
          show('❌ ' + msg);
          setTimeout(() => { window.location.href = '/'; }, 4000);
          return;
        }

        // Try to get session that Supabase may have already exchanged
        show('Échange du code…');
        let session: any = null;

        // First try: session might already be ready (detectSessionInUrl processed it)
        const { data: s1 } = await supabase.auth.getSession();
        if (s1?.session) {
          session = s1.session;
        } else {
          // Second try: manual exchange (detectSessionInUrl: false path)
          const code = url.searchParams.get('code');
          if (code) {
            const { data: s2, error: exchErr } = await supabase.auth.exchangeCodeForSession(code);
            if (exchErr) {
              show('❌ ' + exchErr.message);
              setTimeout(() => { window.location.href = '/'; }, 4000);
              return;
            }
            session = s2?.session;
          }
        }

        if (!session) {
          // Last resort: wait up to 8s for onAuthStateChange SIGNED_IN
          show('Finalisation…');
          await new Promise<void>((resolve, reject) => {
            const t = setTimeout(() => reject(new Error('Délai dépassé')), 8000);
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
          show('❌ Session introuvable. Retour…');
          setTimeout(() => { window.location.href = '/'; }, 3000);
          return;
        }

        show('✓ Connecté !');

        // Check if profile already exists
        const { supabase: sb } = await import('@/lib/supabase');
        const { data: profile } = await sb.from('profiles')
          .select('id, name')
          .eq('id', session.user.id)
          .maybeSingle();

        const dest = profile?.name ? '/(tabs)/' : '/onboarding?from_auth=1';
        setTimeout(() => { window.location.href = dest; }, 600);

      } catch (e: any) {
        show('❌ ' + (e?.message || 'Erreur inattendue'));
        setTimeout(() => { window.location.href = '/'; }, 4000);
      }
    })();
  }, []);

  return null; // background + spinner handled by pure DOM below
}

function show(msg: string) {
  if (typeof document === 'undefined') return;
  const el = document.getElementById('__cb_msg');
  if (el) el.textContent = msg;
}

// Inject a pure-DOM spinner that is guaranteed to appear regardless of React
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    #__cb_overlay {
      position: fixed; inset: 0; background: #111318;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      z-index: 9999; font-family: -apple-system, sans-serif;
    }
    #__cb_spinner {
      width: 44px; height: 44px; border: 4px solid rgba(0,200,212,0.2);
      border-top-color: #00C8D4; border-radius: 50%;
      animation: spin 0.9s linear infinite; margin-bottom: 20px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    #__cb_msg { color: #fff; font-size: 15px; font-weight: 600; }
  `;
  document.head.appendChild(style);

  const overlay = document.createElement('div');
  overlay.id = '__cb_overlay';
  overlay.innerHTML = `<div id="__cb_spinner"></div><div id="__cb_msg">Connexion en cours…</div>`;
  document.body.appendChild(overlay);
}
