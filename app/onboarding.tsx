import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Dimensions, Animated, Platform, Alert, ScrollView,
  KeyboardAvoidingView,
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

interface GoalDef {
  key: Goal;
  label: string;
  sub: string;
  color: string;
  icon: React.ReactNode;
}

const GOALS: GoalDef[] = [
  {
    key: 'weightloss',
    label: 'Perte de poids',
    sub: 'Brûler les graisses & affiner ma silhouette',
    color: '#FF6B35',
    icon: <Flame size={26} color="#FF6B35" strokeWidth={1.8} />,
  },
  {
    key: 'muscle',
    label: 'Prise de muscle',
    sub: 'Gagner en masse musculaire & puissance',
    color: Colors.accent,
    icon: <TrendingUp size={26} color={Colors.accent} strokeWidth={1.8} />,
  },
  {
    key: 'maintain',
    label: 'Maintien & Forme',
    sub: 'Rester tonique & en bonne santé',
    color: Colors.teal,
    icon: <Shield size={26} color={Colors.teal} strokeWidth={1.8} />,
  },
];

const glass: any = {
  backgroundColor: 'rgba(255,255,255,0.055)',
  borderWidth: 0.5,
  borderColor: 'rgba(255,255,255,0.12)',
  ...(Platform.OS === 'web' ? { backdropFilter: 'blur(16px)' } : {}),
};

export default function Onboarding() {
  const [step, setStep]       = useState<Step>('login');
  const [userName, setUserName] = useState('');
  const [gender, setGender]   = useState<Gender>('male');
  const [goal, setGoal]       = useState<Goal>(null);
  const [height, setHeight]   = useState('175');
  const [weight, setWeight]   = useState('');
  const [waist, setWaist]     = useState('');

  const fadeAnim     = useRef(new Animated.Value(1)).current;
  const slideAnim    = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const { setProfile, addMeasure, setInitialMeasure, completeOnboarding } = useUserStore(
    useShallow((s) => ({
      setProfile:         s.setProfile,
      addMeasure:         s.addMeasure,
      setInitialMeasure:  s.setInitialMeasure,
      completeOnboarding: s.completeOnboarding,
    }))
  );

  // If coming back from Google OAuth redirect, skip login step
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const raw = session.user.user_metadata?.full_name
          || session.user.user_metadata?.name
          || session.user.email?.split('@')[0]
          || '';
        setUserName(raw.split(' ')[0]);
        transitionTo('welcome', false);
      }
    });
  }, []);

  function transitionTo(next: Step, animate = true) {
    if (!animate) { setStep(next); return; }
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -24, duration: 180, useNativeDriver: true }),
    ]).start(() => {
      setStep(next);
      slideAnim.setValue(24);
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(progressAnim, {
          toValue: PROGRESS[next],
          duration: 500,
          useNativeDriver: false,
        }),
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
      options: {
        redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
      },
    });
    if (error) {
      Alert.alert('Google non configuré', 'Active Google dans Supabase Auth pour utiliser cette option.');
    }
  }

  function finish() {
    const h  = parseFloat(height) || 175;
    const w  = parseFloat(weight) || 75;
    const wa = parseFloat(waist)  || 80;
    setProfile({ name: userName.trim() || 'Athlète', gender, height: h, goal });
    const measure = { date: new Date().toISOString(), weight: w, waist: wa };
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
      <LinearGradient
        colors={['#0D1535', '#060E1C', '#08111F']}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
      {/* Top ambient glow */}
      <View style={styles.glow} />

      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        {/* Progress bar */}
        {step !== 'login' && (
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
          </View>
        )}

        <Animated.View
          style={[{ flex: 1 }, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <ScrollView
              contentContainerStyle={{ flexGrow: 1 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >

              {/* ════════════════════ LOGIN ════════════════════ */}
              {step === 'login' && (
                <View style={styles.screen}>
                  {/* Logo block */}
                  <View style={styles.logoBlock}>
                    <View style={styles.logoBg}>
                      <Text style={styles.logoEmoji}>⚡</Text>
                    </View>
                    <Text style={styles.logoTitle}>METABOOST</Text>
                    <Text style={styles.logoSub}>Ta transformation commence ici.</Text>
                  </View>

                  {/* Auth options */}
                  <View style={styles.authBlock}>
                    {/* Google button */}
                    <TouchableOpacity
                      style={styles.googleBtn}
                      onPress={handleGoogleLogin}
                      activeOpacity={0.88}
                    >
                      <View style={styles.googleIcon}>
                        <Text style={styles.googleG}>G</Text>
                      </View>
                      <Text style={styles.googleTxt}>Continuer avec Google</Text>
                    </TouchableOpacity>

                    {/* Divider */}
                    <View style={styles.divider}>
                      <View style={styles.dividerLine} />
                      <Text style={styles.dividerTxt}>ou</Text>
                      <View style={styles.dividerLine} />
                    </View>

                    {/* Manual continue */}
                    <TouchableOpacity
                      style={styles.manualBtn}
                      onPress={() => transitionTo('welcome')}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.manualTxt}>Entrer mon prénom →</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.legal}>
                    En continuant, tu acceptes nos conditions d'utilisation et notre politique de confidentialité.
                  </Text>
                </View>
              )}

              {/* ════════════════════ WELCOME ════════════════════ */}
              {step === 'welcome' && (
                <View style={styles.screen}>
                  <View style={styles.welcomeBlock}>
                    <View style={styles.waveRing}>
                      <Text style={{ fontSize: 38 }}>👋</Text>
                    </View>
                    <Text style={styles.welcomeSuper}>Ravi de t'accueillir,</Text>
                    <TextInput
                      style={styles.welcomeName}
                      value={userName}
                      onChangeText={setUserName}
                      placeholder="Ton prénom"
                      placeholderTextColor={Colors.textTertiary}
                      autoFocus={!userName}
                      returnKeyType="done"
                      autoCapitalize="words"
                    />
                    <Text style={styles.welcomeTagline}>Prêt pour ta transformation ? 🔥</Text>

                    {/* Genre pills */}
                    <View style={styles.genderRow}>
                      {([
                        { key: 'male' as Gender, label: '♂  Homme' },
                        { key: 'female' as Gender, label: '♀  Femme' },
                      ]).map((g) => (
                        <TouchableOpacity
                          key={g.key}
                          style={[styles.genderPill, gender === g.key && styles.genderPillActive]}
                          onPress={() => { setGender(g.key); Haptics.selectionAsync?.(); }}
                          activeOpacity={0.8}
                        >
                          <Text style={[styles.genderPillTxt, gender === g.key && styles.genderPillTxtActive]}>
                            {g.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <TouchableOpacity style={styles.ctaBtn} onPress={goNext} activeOpacity={0.88}>
                    <Text style={styles.ctaTxt}>C'est parti</Text>
                    <ChevronRight size={20} color="#333" strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>
              )}

              {/* ════════════════════ GOAL ════════════════════ */}
              {step === 'goal' && (
                <View style={styles.screen}>
                  <View>
                    <Text style={styles.screenTitle}>Quel est ton objectif ?</Text>
                    <Text style={styles.screenSub}>Choisis ce qui te correspond le mieux</Text>
                  </View>

                  <View style={styles.goalList}>
                    {GOALS.map((g) => {
                      const active = goal === g.key;
                      return (
                        <TouchableOpacity
                          key={String(g.key)}
                          style={[styles.goalCard, active && { borderColor: g.color + '55' }]}
                          onPress={() => { setGoal(g.key); Haptics.selectionAsync?.(); }}
                          activeOpacity={0.85}
                        >
                          {active && (
                            <LinearGradient
                              colors={[g.color + '22', 'transparent']}
                              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                              style={[StyleSheet.absoluteFill, { borderRadius: Radius.xl }]}
                            />
                          )}
                          <View style={[styles.goalIcon, { borderColor: active ? g.color + '44' : 'rgba(255,255,255,0.08)' }]}>
                            {g.icon}
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.goalLabel, active && { color: Colors.text }]}>{g.label}</Text>
                            <Text style={styles.goalSub}>{g.sub}</Text>
                          </View>
                          <View style={[styles.check, active && { backgroundColor: g.color, borderColor: g.color }]}>
                            {active && <Text style={{ color: '#fff', fontSize: 11, fontWeight: '900' }}>✓</Text>}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <TouchableOpacity
                    style={[styles.ctaBtn, !goal && styles.ctaBtnDisabled]}
                    onPress={goal ? goNext : undefined}
                    activeOpacity={0.88}
                  >
                    <Text style={styles.ctaTxt}>Continuer</Text>
                    <ChevronRight size={20} color="#333" strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>
              )}

              {/* ════════════════════ MEASURES ════════════════════ */}
              {step === 'measures' && (
                <View style={styles.screen}>
                  <View>
                    <Text style={styles.screenTitle}>Tes mesures de départ</Text>
                    <Text style={styles.screenSub}>
                      Ces données calibrent ton avatar. Tu peux les modifier à tout moment dans ton profil.
                    </Text>
                  </View>

                  <View style={styles.measuresList}>
                    {[
                      { label: 'Poids', unit: 'kg', value: weight, set: setWeight, placeholder: '75' },
                      { label: 'Taille', unit: 'cm', value: height, set: setHeight, placeholder: '175' },
                      { label: 'Tour de taille', unit: 'cm', value: waist, set: setWaist, placeholder: '80' },
                    ].map(({ label, unit, value, set, placeholder }) => (
                      <View key={label} style={styles.measureRow}>
                        <Text style={styles.measureLbl}>{label}</Text>
                        <View style={styles.measureRight}>
                          <TextInput
                            style={styles.measureInput}
                            value={value}
                            onChangeText={set}
                            keyboardType="decimal-pad"
                            placeholder={placeholder}
                            placeholderTextColor={Colors.textTertiary}
                          />
                          <Text style={styles.measureUnit}>{unit}</Text>
                        </View>
                      </View>
                    ))}
                  </View>

                  {/* Scanner (Beta) */}
                  <TouchableOpacity
                    style={styles.scanBtn}
                    onPress={() => Alert.alert('Bêta', 'Scanner mon ticket de balance — disponible très prochainement ✨')}
                    activeOpacity={0.8}
                  >
                    <ScanLine size={17} color={Colors.teal} strokeWidth={1.8} />
                    <Text style={styles.scanTxt}>Scanner mon ticket de balance</Text>
                    <View style={styles.betaBadge}>
                      <Text style={styles.betaTxt}>BÊTA</Text>
                    </View>
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

  glow: {
    position: 'absolute',
    top: -60,
    alignSelf: 'center',
    width: W * 0.85,
    height: 280,
    borderRadius: 999,
    backgroundColor: 'rgba(226,209,179,0.07)',
    ...(Platform.OS === 'web' ? { filter: 'blur(60px)' } as any : {}),
  },

  progressTrack: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.07)',
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.full,
    overflow: 'hidden',
    marginTop: 4,
    marginBottom: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: Radius.full,
    ...(Platform.OS === 'web' ? { boxShadow: '0 0 8px rgba(226,209,179,0.6)' } as any : {}),
  },

  screen: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    justifyContent: 'space-between',
    minHeight: H - 120,
  },

  // ── Login ──────────────────────────────────────────
  logoBlock: { alignItems: 'center', paddingTop: H * 0.07 },
  logoBg: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(226,209,179,0.12)',
    borderWidth: 0.5,
    borderColor: 'rgba(226,209,179,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    ...(Platform.OS === 'web' ? { boxShadow: '0 0 40px rgba(226,209,179,0.18)' } as any : {}),
  },
  logoEmoji: { fontSize: 44 },
  logoTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: 5,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  logoSub: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },

  authBlock: { gap: Spacing.sm },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: Radius.full,
    paddingVertical: 17,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    ...(Platform.OS === 'web' ? { boxShadow: '0 4px 28px rgba(0,0,0,0.3)' } as any : {}),
  },
  googleIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleG:  { color: '#fff', fontSize: 15, fontWeight: '900' },
  googleTxt:{ flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: '#111', letterSpacing: 0.1 },

  divider:     { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  dividerLine: { flex: 1, height: 0.5, backgroundColor: 'rgba(255,255,255,0.10)' },
  dividerTxt:  { fontSize: 12, color: Colors.textSecondary },

  manualBtn: {
    borderRadius: Radius.full,
    paddingVertical: 15,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(12px)' } as any : {}),
  },
  manualTxt: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },

  legal: {
    fontSize: 10,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 15,
    paddingBottom: Spacing.xs,
  },

  // ── Welcome ────────────────────────────────────────
  welcomeBlock: { alignItems: 'center', gap: Spacing.md, paddingTop: H * 0.05 },
  waveRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  welcomeSuper:   { fontSize: 17, color: Colors.textSecondary, fontWeight: '300' },
  welcomeName: {
    fontSize: 46,
    fontWeight: '900',
    color: Colors.accent,
    textAlign: 'center',
    letterSpacing: -1.5,
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(226,209,179,0.28)',
    paddingBottom: Spacing.sm,
    width: '100%',
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}),
  },
  welcomeTagline: { fontSize: 18, color: Colors.text, fontWeight: '400', textAlign: 'center' },
  genderRow:      { flexDirection: 'row', gap: Spacing.sm, width: '100%', marginTop: Spacing.sm },
  genderPill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
  },
  genderPillActive:    { backgroundColor: Colors.accent, borderColor: Colors.accent },
  genderPillTxt:       { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  genderPillTxtActive: { color: '#333', fontWeight: '800' },

  // ── Goal ──────────────────────────────────────────
  screenTitle: { fontSize: 30, fontWeight: '900', color: Colors.text, letterSpacing: -0.8, marginBottom: Spacing.xs },
  screenSub:   { fontSize: 14, color: Colors.textSecondary, lineHeight: 21, marginBottom: Spacing.lg },

  goalList: { gap: Spacing.sm, flex: 1, justifyContent: 'center' },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    overflow: 'hidden',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(12px)' } as any : {}),
  },
  goalIcon: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalLabel:      { fontSize: 16, fontWeight: '700', color: Colors.textSecondary, marginBottom: 3 },
  goalSub:        { fontSize: 12, color: Colors.textTertiary, lineHeight: 17 },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Measures ──────────────────────────────────────
  measuresList: { gap: Spacing.sm },
  measureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(10px)' } as any : {}),
  },
  measureLbl:       { fontSize: 15, fontWeight: '500', color: Colors.text },
  measureRight:     { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  measureInput: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.accent,
    textAlign: 'right',
    minWidth: 72,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}),
  },
  measureUnit: { fontSize: 13, color: Colors.textSecondary, fontWeight: '400' },

  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 0.5,
    borderColor: Colors.teal + '40',
    backgroundColor: 'rgba(0,200,212,0.06)',
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  scanTxt:   { flex: 1, fontSize: 13, fontWeight: '600', color: Colors.teal },
  betaBadge: { backgroundColor: Colors.teal + '20', paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.sm, borderWidth: 0.5, borderColor: Colors.teal + '40' },
  betaTxt:   { fontSize: 8, fontWeight: '900', color: Colors.teal, letterSpacing: 1.5 },

  // ── CTA ───────────────────────────────────────────
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.accent,
    borderRadius: Radius.full,
    paddingVertical: 18,
    ...(Platform.OS === 'web' ? { boxShadow: '0 8px 32px rgba(226,209,179,0.22)' } as any : {}),
  },
  ctaBtnDisabled: { opacity: 0.38 },
  ctaTxt: { fontSize: 17, fontWeight: '800', color: '#333333', letterSpacing: 0.2 },
  skipBtn: { alignItems: 'center', paddingVertical: Spacing.sm },
  skipTxt: { fontSize: 13, color: Colors.textTertiary },
});
