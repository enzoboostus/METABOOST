import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Dimensions, Animated, Platform, Alert, ScrollView,
  KeyboardAvoidingView, Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Flame, TrendingUp, Shield, ChevronRight, ScanLine } from 'lucide-react-native';
import { useShallow } from 'zustand/react/shallow';
import { useUserStore, Gender, Goal } from '@/store/userStore';
import { supabase } from '@/lib/supabase';
import { Colors, Spacing, Radius } from '@/constants/theme';
import * as Haptics from 'expo-haptics';

const { width: W, height: H } = Dimensions.get('window');

type Step = 'login' | 'welcome' | 'goal' | 'measures';
const STEPS: Step[] = ['login', 'welcome', 'goal', 'measures'];
const PROGRESS: Record<Step, number> = { login: 0, welcome: 0.33, goal: 0.66, measures: 1 };

interface GoalDef { key: Goal; label: string; sub: string; color: string; icon: React.ReactNode }
const GOALS: GoalDef[] = [
  { key: 'weightloss', label: 'Perte de poids',   sub: 'Brûler les graisses & affiner ta silhouette', color: '#FF6B35',    icon: <Flame      size={22} color="#FF6B35"    strokeWidth={2} /> },
  { key: 'muscle',     label: 'Prise de muscle',   sub: 'Gagner en masse musculaire & puissance',      color: Colors.accent, icon: <TrendingUp size={22} color={Colors.accent} strokeWidth={2} /> },
  { key: 'maintain',   label: 'Maintien & Forme',  sub: 'Rester tonique & en pleine santé',            color: Colors.teal,  icon: <Shield     size={22} color={Colors.teal}  strokeWidth={2} /> },
];

const ROW1 = [
  { key: 'weight', label: 'Poids',  desc: 'Poids actuel',   unit: 'kg', ph: '75'  },
  { key: 'height', label: 'Taille', desc: 'Ta hauteur',     unit: 'cm', ph: '175' },
  { key: 'waist',  label: 'Ventre', desc: 'Tour de ventre', unit: 'cm', ph: '80'  },
];
const ROW2 = [
  { key: 'thigh', label: 'Cuisse', desc: 'Tour de cuisse', unit: 'cm', ph: '55' },
  { key: 'arm',   label: 'Bras',   desc: 'Tour de bras',   unit: 'cm', ph: '32' },
];

export default function Onboarding() {
  const [step, setStep]       = useState<Step>('login');
  const [userName, setUserName] = useState('');
  const [gender, setGender]   = useState<Gender>('male');
  const [goal, setGoal]       = useState<Goal>(null);
  const [height, setHeight]   = useState('175');
  const [weight, setWeight]   = useState('');
  const [waist,  setWaist]    = useState('');
  const [thigh,  setThigh]    = useState('');
  const [arm,    setArm]      = useState('');

  const vals: Record<string, string>              = { weight, height, waist, thigh, arm };
  const sets: Record<string, (v: string) => void> = { weight: setWeight, height: setHeight, waist: setWaist, thigh: setThigh, arm: setArm };

  const fadeAnim     = useRef(new Animated.Value(1)).current;
  const slideAnim    = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const { setProfile, addMeasure, setInitialMeasure, completeOnboarding } = useUserStore(
    useShallow((s) => ({ setProfile: s.setProfile, addMeasure: s.addMeasure, setInitialMeasure: s.setInitialMeasure, completeOnboarding: s.completeOnboarding }))
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const raw = session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || '';
        setUserName(raw.split(' ')[0]);
        transitionTo('welcome', false);
      }
    });
  }, []);

  function transitionTo(next: Step, animate = true) {
    if (!animate) { setStep(next); return; }
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -18, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setStep(next);
      slideAnim.setValue(18);
      Animated.parallel([
        Animated.timing(fadeAnim,     { toValue: 1, duration: 260, useNativeDriver: true }),
        Animated.timing(slideAnim,    { toValue: 0, duration: 260, useNativeDriver: true }),
        Animated.timing(progressAnim, { toValue: PROGRESS[next], duration: 420, useNativeDriver: false }),
      ]).start();
    });
    Haptics.selectionAsync?.();
  }

  function goNext() {
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) transitionTo(STEPS[idx + 1]);
    else finish();
  }

  async function handleGoogleLogin() {
    if (Platform.OS !== 'web') return;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined },
    });
    if (error) Alert.alert('Google non configuré', 'Active Google dans Supabase Auth pour utiliser cette option.');
  }

  function finish() {
    const h  = parseFloat(height) || 175;
    const w  = parseFloat(weight) || 75;
    const wa = parseFloat(waist)  || 80;
    const th = parseFloat(thigh)  || undefined;
    const ar = parseFloat(arm)    || undefined;
    setProfile({ name: userName.trim() || 'Athlète', gender, height: h, goal });
    const measure = { date: new Date().toISOString(), weight: w, waist: wa, thigh: th, arm: ar };
    addMeasure(measure);
    setInitialMeasure(measure);
    completeOnboarding();
    Haptics.notificationAsync?.(Haptics.NotificationFeedbackType.Success);
    router.replace('/(tabs)/');
  }

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, W - Spacing.lg * 2],
  });

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#0B1628', '#060E1C', '#03080F']} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFill} />
      <View style={styles.glowA} />
      <View style={styles.glowB} />

      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        {step !== 'login' && (
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
          </View>
        )}

        <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

              {/* ══════════════ LOGIN ══════════════ */}
              {step === 'login' && (
                <View style={styles.screen}>

                  {/* Hero */}
                  <View style={styles.loginHero}>
                    <View style={styles.logoBadge}>
                      <Text style={styles.logoEmoji}>⚡</Text>
                    </View>
                    <Text style={styles.logoName}>METABOOST</Text>
                    <View style={styles.taglineBlock}>
                      <Text style={styles.tagline1}>Transforme ton corps.</Text>
                      <Text style={styles.tagline2}>Suis tes progrès.</Text>
                      <Text style={styles.tagline3}>Atteins tes objectifs.</Text>
                    </View>
                  </View>

                  {/* Pills */}
                  <View style={styles.pillsRow}>
                    {['📊 Morphologie', '💪 Entraînement', '📈 Nutrition'].map((p) => (
                      <View key={p} style={styles.pill}>
                        <Text style={styles.pillTxt}>{p}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Auth buttons */}
                  <View style={styles.authBlock}>
                    <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleLogin} activeOpacity={0.9}>
                      <View style={styles.gIcon}><Text style={styles.gLetter}>G</Text></View>
                      <Text style={styles.googleTxt}>Continuer avec Google</Text>
                    </TouchableOpacity>

                    <View style={styles.divider}>
                      <View style={styles.divLine} />
                      <Text style={styles.divTxt}>ou</Text>
                      <View style={styles.divLine} />
                    </View>

                    <TouchableOpacity style={styles.ghostBtn} onPress={() => transitionTo('welcome')} activeOpacity={0.8}>
                      <Text style={styles.ghostTxt}>Commencer sans compte</Text>
                      <ChevronRight size={15} color={Colors.textSecondary} strokeWidth={2} />
                    </TouchableOpacity>
                  </View>

                  {/* Mentions légales RGPD */}
                  <Text style={styles.legal}>
                    En continuant, tu acceptes nos{' '}
                    <Text style={styles.legalU} onPress={() => router.push('/legal/cgu')}>Conditions d'utilisation</Text>
                    {' '}et notre{' '}
                    <Text style={styles.legalU} onPress={() => router.push('/legal/privacy')}>Politique de confidentialité</Text>
                    {' '}(RGPD). Tu consens au traitement de tes données de santé (mesures corporelles) au sens de l'art. 9 du RGPD, sous le contrôle de la CNIL.{' '}
                    <Text style={styles.legalU} onPress={() => router.push('/legal/mentions')}>Mentions légales</Text>
                    {' · '}
                    <Text style={styles.legalU} onPress={() => router.push('/legal/cookies')}>Cookies</Text>.
                  </Text>
                </View>
              )}

              {/* ══════════════ WELCOME ══════════════ */}
              {step === 'welcome' && (
                <View style={styles.screenCenter}>
                  <View style={styles.welcomeBlock}>
                    <View style={styles.emojiRing}>
                      <Text style={{ fontSize: 34 }}>👋</Text>
                    </View>
                    <Text style={styles.welcomeHi}>Ravi de te rencontrer,</Text>
                    <TextInput
                      style={styles.nameInput}
                      value={userName}
                      onChangeText={setUserName}
                      placeholder="Ton prénom"
                      placeholderTextColor="rgba(226,209,179,0.28)"
                      returnKeyType="next"
                      autoCapitalize="words"
                      onSubmitEditing={() => Keyboard.dismiss()}
                    />
                    <Text style={styles.welcomeSub}>Prêt(e) à transformer ton corps ? 🔥</Text>
                    <View style={styles.genderRow}>
                      {([{ key: 'male' as Gender, sym: '♂', lbl: 'Homme' }, { key: 'female' as Gender, sym: '♀', lbl: 'Femme' }]).map((g) => (
                        <TouchableOpacity
                          key={g.key}
                          style={[styles.genderPill, gender === g.key && styles.genderOn]}
                          onPress={() => { setGender(g.key); Haptics.selectionAsync?.(); }}
                          activeOpacity={0.8}
                        >
                          <Text style={[styles.genderSym, gender === g.key && { color: '#2a2a2a' }]}>{g.sym}</Text>
                          <Text style={[styles.genderLbl, gender === g.key && styles.genderLblOn]}>{g.lbl}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <TouchableOpacity style={[styles.ctaBtn, { marginTop: 16, width: '100%' }]} onPress={goNext} activeOpacity={0.88}>
                      <Text style={styles.ctaTxt}>C'est parti !</Text>
                      <ChevronRight size={20} color="#2a2a2a" strokeWidth={2.5} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* ══════════════ GOAL ══════════════ */}
              {step === 'goal' && (
                <View style={styles.screen}>
                  <View style={styles.screenHead}>
                    <Text style={styles.screenTitle}>Ton objectif principal ?</Text>
                    <Text style={styles.screenSub}>Choisis ce qui te correspond — tu pourras changer plus tard.</Text>
                  </View>

                  <View style={styles.goalList}>
                    {GOALS.map((g) => {
                      const on = goal === g.key;
                      return (
                        <TouchableOpacity
                          key={String(g.key)}
                          style={[styles.goalCard, on && { borderColor: g.color + '55', borderWidth: 1.5 }]}
                          onPress={() => { setGoal(g.key); Haptics.selectionAsync?.(); }}
                          activeOpacity={0.85}
                        >
                          {on && (
                            <LinearGradient
                              colors={[g.color + '16', 'transparent']}
                              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                              style={[StyleSheet.absoluteFill, { borderRadius: Radius.xl }]}
                            />
                          )}
                          <View style={[styles.goalIconBox, on && { borderColor: g.color + '45', backgroundColor: g.color + '12' }]}>
                            {g.icon}
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.goalLabel, on && { color: Colors.text }]}>{g.label}</Text>
                            <Text style={styles.goalSub}>{g.sub}</Text>
                          </View>
                          <View style={[styles.goalCheck, on && { backgroundColor: g.color, borderColor: g.color }]}>
                            {on && <Text style={{ color: '#fff', fontSize: 11, fontWeight: '900' }}>✓</Text>}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <TouchableOpacity style={[styles.ctaBtn, !goal && styles.ctaOff]} onPress={goal ? goNext : undefined} activeOpacity={0.88}>
                    <Text style={styles.ctaTxt}>Continuer</Text>
                    <ChevronRight size={20} color="#2a2a2a" strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>
              )}

              {/* ══════════════ MEASURES ══════════════ */}
              {step === 'measures' && (
                <View style={styles.screen}>
                  <View style={styles.screenHead}>
                    <Text style={styles.screenTitle}>Tes mesures de départ</Text>
                    <Text style={styles.screenSub}>Ces données calibrent ton profil. Tu pourras les modifier à tout moment dans ton espace.</Text>
                  </View>

                  {/* Row 1 — requis */}
                  <View style={styles.mGrid}>
                    {ROW1.map(({ key: k, label, desc, unit, ph }) => (
                      <View key={k} style={styles.mCard}>
                        <Text style={styles.mLabel}>{label}</Text>
                        <Text style={styles.mDesc}>{desc}</Text>
                        <TextInput
                          style={styles.mInput}
                          value={vals[k]}
                          onChangeText={sets[k]}
                          keyboardType="decimal-pad"
                          placeholder={ph}
                          placeholderTextColor="rgba(226,209,179,0.22)"
                          textAlign="center"
                        />
                        <Text style={styles.mUnit}>{unit}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Séparateur optionnel */}
                  <View style={styles.optSep}>
                    <View style={styles.optLine} />
                    <Text style={styles.optTxt}>Optionnel</Text>
                    <View style={styles.optLine} />
                  </View>

                  {/* Row 2 — optionnel */}
                  <View style={[styles.mGrid, { opacity: 0.78 }]}>
                    {ROW2.map(({ key: k, label, desc, unit, ph }) => (
                      <View key={k} style={[styles.mCard, styles.mCardOpt]}>
                        <Text style={styles.mLabel}>{label}</Text>
                        <Text style={styles.mDesc}>{desc}</Text>
                        <TextInput
                          style={styles.mInput}
                          value={vals[k]}
                          onChangeText={sets[k]}
                          keyboardType="decimal-pad"
                          placeholder={ph}
                          placeholderTextColor="rgba(255,255,255,0.14)"
                          textAlign="center"
                        />
                        <Text style={styles.mUnit}>{unit}</Text>
                      </View>
                    ))}
                    <View style={styles.mFiller} />
                  </View>

                  {/* Scanner BÊTA */}
                  <TouchableOpacity
                    style={styles.scanBtn}
                    onPress={() => Alert.alert('Bientôt disponible', 'Scanner ton ticket de balance — disponible très prochainement ✨')}
                    activeOpacity={0.8}
                  >
                    <ScanLine size={16} color={Colors.teal} strokeWidth={1.8} />
                    <Text style={styles.scanTxt}>Scanner mon ticket de balance</Text>
                    <View style={styles.beta}><Text style={styles.betaTxt}>BÊTA</Text></View>
                  </TouchableOpacity>

                  {/* CTA */}
                  <View style={{ gap: Spacing.sm }}>
                    <TouchableOpacity style={styles.ctaBtn} onPress={finish} activeOpacity={0.88}>
                      <Text style={styles.ctaTxt}>Démarrer MetaBoost 🚀</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={finish} style={styles.skipBtn}>
                      <Text style={styles.skipTxt}>Passer pour l'instant</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

            </ScrollView>
          </KeyboardAvoidingView>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#060E1C' },

  glowA: {
    position: 'absolute', top: -80, alignSelf: 'center',
    width: W * 0.88, height: 300, borderRadius: 999,
    backgroundColor: 'rgba(226,209,179,0.065)',
    ...(Platform.OS === 'web' ? { filter: 'blur(72px)' } as any : {}),
  },
  glowB: {
    position: 'absolute', bottom: -80, right: -60,
    width: 260, height: 260, borderRadius: 999,
    backgroundColor: 'rgba(0,200,212,0.045)',
    ...(Platform.OS === 'web' ? { filter: 'blur(80px)' } as any : {}),
  },

  progressTrack: {
    height: 2, backgroundColor: 'rgba(255,255,255,0.07)',
    marginHorizontal: Spacing.lg, borderRadius: Radius.full,
    overflow: 'hidden', marginTop: 6,
  },
  progressFill: {
    height: '100%', backgroundColor: Colors.accent, borderRadius: Radius.full,
    ...(Platform.OS === 'web' ? { boxShadow: '0 0 10px rgba(226,209,179,0.65)' } as any : {}),
  },

  screen: {
    flex: 1, paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl, paddingBottom: Spacing.lg,
    justifyContent: 'space-between',
  },

  screenCenter: {
    flex: 1, paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg, paddingBottom: Spacing.lg,
    justifyContent: 'center',
  },

  // ── Login ────────────────────────────────────────
  loginHero: { alignItems: 'center', paddingTop: H * 0.03, gap: 16 },
  logoBadge: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: 'rgba(226,209,179,0.09)',
    borderWidth: 1, borderColor: 'rgba(226,209,179,0.22)',
    alignItems: 'center', justifyContent: 'center',
    ...(Platform.OS === 'web' ? { boxShadow: '0 0 72px rgba(226,209,179,0.2)' } as any : {}),
  },
  logoEmoji: { fontSize: 46 },
  logoName:  { fontSize: 32, fontWeight: '900', color: Colors.text, letterSpacing: 8, textTransform: 'uppercase' },
  taglineBlock: { alignItems: 'center', gap: 4, marginTop: 4 },
  tagline1: { fontSize: 18, fontWeight: '700', color: Colors.text,          letterSpacing: 0.1 },
  tagline2: { fontSize: 16, fontWeight: '400', color: Colors.textSecondary, letterSpacing: 0.1 },
  tagline3: { fontSize: 14, fontWeight: '300', color: Colors.accent,        letterSpacing: 0.1, opacity: 0.8 },

  pillsRow: { flexDirection: 'row', gap: 8, justifyContent: 'center', flexWrap: 'wrap' },
  pill: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.12)',
  },
  pillTxt: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },

  authBlock: { gap: 12 },
  googleBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: Radius.full,
    paddingVertical: 16, paddingHorizontal: Spacing.lg, gap: 10,
    ...(Platform.OS === 'web' ? { boxShadow: '0 4px 22px rgba(0,0,0,0.22)' } as any : {}),
  },
  gIcon:     { width: 26, height: 26, borderRadius: 13, backgroundColor: '#4285F4', alignItems: 'center', justifyContent: 'center' },
  gLetter:   { color: '#fff', fontSize: 14, fontWeight: '900' },
  googleTxt: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: '#111' },

  divider: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  divLine: { flex: 1, height: 0.5, backgroundColor: 'rgba(255,255,255,0.09)' },
  divTxt:  { fontSize: 11, color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 1.5 },

  ghostBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderRadius: Radius.full, paddingVertical: 15,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.11)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  ghostTxt: { fontSize: 15, fontWeight: '500', color: Colors.textSecondary },

  legal:  { fontSize: 9.5, color: Colors.textTertiary, textAlign: 'center', lineHeight: 15, paddingHorizontal: 4 },
  legalU: { color: 'rgba(226,209,179,0.55)', textDecorationLine: 'underline' },

  // ── Welcome ──────────────────────────────────────
  welcomeBlock: { alignItems: 'center', gap: 14, paddingTop: 0 },
  emojiRing: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)',
    alignItems: 'center', justifyContent: 'center',
  },
  welcomeHi: { fontSize: 16, color: Colors.textSecondary, fontWeight: '300' },
  nameInput: {
    fontSize: 40, fontWeight: '900', color: Colors.accent,
    textAlign: 'center', letterSpacing: -1,
    borderBottomWidth: 2, borderBottomColor: 'rgba(226,209,179,0.28)',
    paddingBottom: 8, width: '100%',
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}),
  },
  welcomeSub: { fontSize: 16, color: Colors.text, textAlign: 'center' },
  genderRow:  { flexDirection: 'row', gap: 10, width: '100%' },
  genderPill: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: Radius.full,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  genderOn:    { backgroundColor: Colors.accent, borderColor: Colors.accent },
  genderSym:   { fontSize: 16, color: Colors.textSecondary },
  genderLbl:   { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
  genderLblOn: { color: '#2a2a2a', fontWeight: '800' },

  // ── Goal ─────────────────────────────────────────
  screenHead:  { gap: 6, marginBottom: Spacing.sm },
  screenTitle: { fontSize: 27, fontWeight: '900', color: Colors.text, letterSpacing: -0.4 },
  screenSub:   { fontSize: 14, color: Colors.textSecondary, lineHeight: 21 },

  goalList: { gap: 10, flex: 1, justifyContent: 'center' },
  goalCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    padding: Spacing.md, borderRadius: Radius.xl, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(10px)' } as any : {}),
  },
  goalIconBox: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)',
    alignItems: 'center', justifyContent: 'center',
  },
  goalLabel: { fontSize: 16, fontWeight: '700', color: Colors.textSecondary, marginBottom: 3 },
  goalSub:   { fontSize: 12, color: Colors.textTertiary, lineHeight: 17 },
  goalCheck: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center', justifyContent: 'center',
  },

  // ── Measures ─────────────────────────────────────
  mGrid: { flexDirection: 'row', gap: 8 },
  mCard: {
    flex: 1, alignItems: 'center',
    paddingVertical: 16, paddingHorizontal: 4,
    borderRadius: Radius.xl, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    gap: 2,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(10px)' } as any : {}),
  },
  mCardOpt: { borderColor: 'rgba(255,255,255,0.06)', backgroundColor: 'rgba(255,255,255,0.03)' },
  mFiller:  { flex: 1 },
  mLabel:   { fontSize: 9, fontWeight: '800', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1.5 },
  mDesc:    { fontSize: 8, color: Colors.textTertiary, textAlign: 'center', lineHeight: 12 },
  mInput: {
    fontSize: 30, fontWeight: '900', color: Colors.accent,
    textAlign: 'center', width: '100%', paddingVertical: 6,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}),
  },
  mUnit: { fontSize: 10, color: Colors.textSecondary, fontWeight: '500' },

  optSep: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 12 },
  optLine:{ flex: 1, height: 0.5, backgroundColor: 'rgba(255,255,255,0.08)' },
  optTxt: { fontSize: 10, color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 1 },

  scanBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 13, paddingHorizontal: Spacing.md,
    borderRadius: Radius.full, marginBottom: 10,
    borderWidth: 1, borderColor: Colors.teal + '38',
    backgroundColor: 'rgba(0,200,212,0.05)',
  },
  scanTxt:  { flex: 1, fontSize: 13, fontWeight: '600', color: Colors.teal },
  beta:     { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: Colors.teal + '18', borderWidth: 0.5, borderColor: Colors.teal + '40' },
  betaTxt:  { fontSize: 8, fontWeight: '900', color: Colors.teal, letterSpacing: 1.5 },

  // ── CTA ──────────────────────────────────────────
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.accent, borderRadius: Radius.full, paddingVertical: 18,
    ...(Platform.OS === 'web' ? { boxShadow: '0 8px 30px rgba(226,209,179,0.2)' } as any : {}),
  },
  ctaOff:  { opacity: 0.35 },
  ctaTxt:  { fontSize: 17, fontWeight: '800', color: '#2a2a2a', letterSpacing: 0.2 },
  skipBtn: { alignItems: 'center', paddingVertical: Spacing.sm },
  skipTxt: { fontSize: 13, color: Colors.textTertiary },
});
