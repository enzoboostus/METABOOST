import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Dimensions, Animated, Platform, Alert, Keyboard, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Flame, TrendingUp, Shield, ChevronRight, ScanLine,
  Activity, Users, ChevronDown, Bot,
} from 'lucide-react-native';
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
  { key: 'weightloss', label: 'Perte de poids',  sub: 'Brûler les graisses & affiner ta silhouette', color: '#FF6B35',    icon: <Flame      size={22} color="#FF6B35"    strokeWidth={2} /> },
  { key: 'muscle',    label: 'Prise de muscle',  sub: 'Gagner en masse musculaire & puissance',      color: Colors.accent, icon: <TrendingUp size={22} color={Colors.accent} strokeWidth={2} /> },
  { key: 'maintain',  label: 'Maintien & Forme', sub: 'Rester tonique & en pleine santé',            color: Colors.teal,  icon: <Shield     size={22} color={Colors.teal}  strokeWidth={2} /> },
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

const ECG_HEIGHTS = [2, 2, 2, 4, 2, 16, 3, 12, 7, 3, 2, 2, 2, 4, 2, 16, 3, 12, 7, 3, 2, 2, 2];

// ── Sub-components ────────────────────────────────────────────────────────────

function MacroBlock({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', paddingVertical: 13, borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F3F4F6', gap: 3 }}>
      <Text style={{ fontSize: 20, fontWeight: '900', color }}>{value}</Text>
      <Text style={{ fontSize: 8, fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</Text>
    </View>
  );
}

function ProgressBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <View style={{ gap: 5 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 11, fontWeight: '700', color: '#374151' }}>{label}</Text>
        <Text style={{ fontSize: 12, fontWeight: '900', color }}>{pct}%</Text>
      </View>
      <View style={{ height: 7, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden' }}>
        <View style={{ width: `${pct}%` as any, height: '100%', backgroundColor: color, borderRadius: 4 }} />
      </View>
    </View>
  );
}

function FeatureCard({ emoji, title, desc, accent }: { emoji: string; title: string; desc: string; accent: string }) {
  return (
    <View style={[styles.s2FeatureCard, { borderTopColor: accent, borderTopWidth: 2.5 }]}>
      <Text style={{ fontSize: 22, marginBottom: 6 }}>{emoji}</Text>
      <Text style={styles.s2FeatureTitle}>{title}</Text>
      <Text style={styles.s2FeatureDesc}>{desc}</Text>
    </View>
  );
}

function RapportCard({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <View style={styles.s3RapportCard}>
      <View style={styles.s3RapportInner}>
        <Text style={{ fontSize: 18 }}>{emoji}</Text>
        <View style={{ flex: 1, gap: 1 }}>
          <Text style={styles.s3RapportTitle}>{title}</Text>
          <Text style={styles.s3RapportDesc}>{desc}</Text>
        </View>
      </View>
      <ChevronRight size={13} color="rgba(255,255,255,0.2)" strokeWidth={2} />
    </View>
  );
}

// iOS-style compact push notification
function PushNotif({ title, sub }: { title: string; sub: string }) {
  return (
    <View style={styles.s4PushBanner}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5 }}>
        <View style={styles.s4PushDot} />
        <Text style={styles.s4PushApp}>METABOOST</Text>
        <Text style={styles.s4PushTime}>à l'instant</Text>
        <View style={{ flex: 1 }} />
        <View style={styles.s4PushBadge}>
          <Text style={styles.s4PushBadgeTxt}>LIVE</Text>
        </View>
      </View>
      <Text style={styles.s4PushTitle} numberOfLines={1}>{title}</Text>
      <Text style={styles.s4PushSub} numberOfLines={2}>{sub}</Text>
    </View>
  );
}

function B2BOption({ emoji, title, desc, dark }: { emoji: string; title: string; desc: string; dark?: boolean }) {
  return (
    <View style={[styles.s5OptionCard, dark && styles.s5OptionCardDark]}>
      <Text style={{ fontSize: 24 }}>{emoji}</Text>
      <Text style={[styles.s5OptionTitle, dark && { color: '#FFFFFF' }]}>{title}</Text>
      <Text style={[styles.s5OptionDesc, dark && { color: 'rgba(255,255,255,0.5)' }]}>{desc}</Text>
    </View>
  );
}

function TrustBadge({ text }: { text: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#8E9AA8' }} />
      <Text style={{ fontSize: 12, color: '#8E9AA8', fontWeight: '500', letterSpacing: 0.3 }}>{text}</Text>
    </View>
  );
}

function LogisticsStep({ icon, label, time, highlight }: { icon: string; label: string; time: string; highlight?: boolean }) {
  return (
    <View style={{ alignItems: 'center', gap: 4, flex: 1 }}>
      <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: highlight ? '#050A12' : '#F3F4F6', alignItems: 'center', justifyContent: 'center', borderWidth: highlight ? 0 : 1, borderColor: '#E5E7EB' }}>
        <Text style={{ fontSize: 18 }}>{icon}</Text>
      </View>
      <Text style={{ fontSize: 9, fontWeight: highlight ? '800' : '600', color: highlight ? '#050A12' : '#9CA3AF', textAlign: 'center', lineHeight: 13 }}>{label}</Text>
      <Text style={{ fontSize: 9, fontWeight: '600', color: highlight ? '#374151' : '#D1D5DB' }}>{time}</Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Onboarding() {
  const [step, setStep]         = useState<Step>('login');
  const [userName, setUserName] = useState('');
  const [gender, setGender]     = useState<Gender>('male');
  const [goal, setGoal]         = useState<Goal>(null);
  const [height, setHeight]     = useState('175');
  const [weight, setWeight]     = useState('');
  const [waist,  setWaist]      = useState('');
  const [thigh,  setThigh]      = useState('');
  const [arm,    setArm]        = useState('');
  const [email,  setEmail]      = useState('');
  const [emailSent, setEmailSent]       = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

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

  async function handleEmailLogin() {
    if (!email.trim()) return;
    setEmailLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined },
    });
    setEmailLoading(false);
    if (error) Alert.alert('Erreur', error.message);
    else setEmailSent(true);
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
    <View style={[styles.root, step === 'login' && styles.rootLight, Platform.OS === 'web' && styles.rootWeb]}>
      {step !== 'login' && (
        <LinearGradient colors={['#0B1628', '#060E1C', '#03080F']} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFill} />
      )}
      {step !== 'login' && <View style={styles.glowA} />}
      {step !== 'login' && <View style={styles.glowB} />}

      <SafeAreaView style={{ flex: 1 }} edges={Platform.OS === 'web' ? ['top'] : ['top', 'bottom']}>
        {step !== 'login' && (
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
          </View>
        )}
        <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

          {/* ══════════════ LOGIN — 5 SLIDES ══════════════ */}
          {step === 'login' && (
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} bounces={false} overScrollMode="never">

              {/* ════════════════════════════════════════════
                  SLIDE 1 — Accueil Premium Style TSE
              ════════════════════════════════════════════ */}
              <View style={styles.slide1}>

                {/* FOND DÉGRADÉ — blanc › gris clair › blanc, aucune coupure visible */}
                <LinearGradient
                  colors={['#FFFFFF', '#F4F6F9', '#F4F6F9', '#FFFFFF']}
                  locations={[0, 0.18, 0.78, 1]}
                  style={StyleSheet.absoluteFill}
                />

                {/* HEADER — Marque centrée */}
                <Text style={styles.s1Brand}>METABOOST</Text>

                {/* ZONE MOCKUPS — 3 téléphones style TSE */}
                <View style={styles.s1MockupsZone}>

                  {/* PHONE TOP-LEFT — Dashboard (arrière-plan, partiellement rogné) */}
                  <View style={styles.s1PhoneTopLeft}>
                    <View style={[styles.s1PhoneScreen, { backgroundColor: '#0D1117' }]}>
                      <View style={styles.s1PhoneDI} />
                      <View style={[styles.s1PhnBody, { backgroundColor: '#0D1117', gap: 6 }]}>
                        <Text style={[styles.s1PhnTitle, { color: '#FFFFFF' }]}>Aujourd'hui</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <View style={[styles.s1CalRing, { width: 46, height: 46, borderRadius: 23, borderTopColor: '#E2AA27', borderRightColor: '#E2AA27' }]}>
                            <Text style={[styles.s1CalNum, { transform: [{ rotate: '45deg' }] }]}>87%</Text>
                          </View>
                          <View style={{ gap: 1 }}>
                            <Text style={{ fontSize: 7, color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>OBJECTIF</Text>
                            <Text style={{ fontSize: 11, color: '#FFFFFF', fontWeight: '900' }}>2 040 kcal</Text>
                          </View>
                        </View>
                        <View style={{ gap: 3 }}>
                          {[{ e: '🏃', l: 'Séance terminée', p: '+25', c: '#00C8D4' }, { e: '🥗', l: 'Repas loggué', p: '+10', c: '#E2AA27' }].map((it, i) => (
                            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 7, padding: 5 }}>
                              <Text style={{ fontSize: 9 }}>{it.e}</Text>
                              <Text style={{ fontSize: 7, color: 'rgba(255,255,255,0.6)', flex: 1 }}>{it.l}</Text>
                              <Text style={{ fontSize: 8, color: it.c, fontWeight: '800' }}>{it.p}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* PHONE LEFT — Nutrition */}
                  <View style={styles.s1PhoneLeft}>
                    <View style={[styles.s1PhoneScreen, { backgroundColor: '#FAFAFA' }]}>
                      <View style={styles.s1PhoneDI} />
                      <View style={styles.s1PhnBody}>
                        <Text style={styles.s1PhnTitle}>Nutrition</Text>
                        <View style={styles.s1CalRingWrap}>
                          <View style={styles.s1CalRing}>
                            <Text style={styles.s1CalNum}>1 840</Text>
                            <Text style={styles.s1CalUnit}>kcal</Text>
                          </View>
                        </View>
                        <View style={styles.s1MacroBars}>
                          <View style={styles.s1MacroRow}>
                            <Text style={styles.s1MacroLbl}>Prot.</Text>
                            <View style={styles.s1MacroTrack}><View style={[styles.s1MacroFill, { width: '72%', backgroundColor: '#3B82F6' }]} /></View>
                          </View>
                          <View style={styles.s1MacroRow}>
                            <Text style={styles.s1MacroLbl}>Gluc.</Text>
                            <View style={styles.s1MacroTrack}><View style={[styles.s1MacroFill, { width: '58%', backgroundColor: '#F59E0B' }]} /></View>
                          </View>
                          <View style={styles.s1MacroRow}>
                            <Text style={styles.s1MacroLbl}>Lipi.</Text>
                            <View style={styles.s1MacroTrack}><View style={[styles.s1MacroFill, { width: '44%', backgroundColor: '#EF4444' }]} /></View>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* PHONE RIGHT — Training (héro principal) */}
                  <View style={styles.s1PhoneRight}>
                    <View style={[styles.s1PhoneScreen, { backgroundColor: '#0D1117' }]}>
                      <View style={styles.s1PhoneDI} />
                      <View style={[styles.s1PhnBody, { backgroundColor: '#0D1117' }]}>
                        <Text style={[styles.s1PhnTitle, { color: '#FFFFFF' }]}>Training</Text>
                        <Text style={[styles.s1PhnSub, { marginBottom: 2 }]}>Révèle ton potentiel</Text>
                        <View style={styles.s1ExoCard}>
                          <View style={styles.s1ExoHero}>
                            <View style={styles.s1ExoBadgeNew}><Text style={styles.s1ExoBadgeNewTxt}>SÉANCE DU JOUR</Text></View>
                          </View>
                          <View style={styles.s1ExoFooter}>
                            <Text style={styles.s1ExoTitle}>Push — Chest & Delts</Text>
                            <Text style={styles.s1ExoMeta}>6 exercices · 48 min</Text>
                          </View>
                        </View>
                        <View style={styles.s1ExoProgressTrack}>
                          <View style={[styles.s1ExoProgressFill, { width: '65%' }]} />
                        </View>
                        <Text style={styles.s1PhnSub}>65% complété</Text>
                      </View>
                    </View>
                  </View>

                </View>

                {/* HEADLINE */}
                <View style={styles.s1HeadlineBlock}>
                  <Text style={styles.s1HeadlineTop}>L'EXPERTISE</Text>
                  <View style={styles.s1HeadlineRow}>
                    <Text style={[styles.s1HeadlineBig, { color: '#00C8D4' }]}>SPORT</Text>
                    <Text style={styles.s1HeadlineBig}>{' '}&{' '}</Text>
                  </View>
                  <Text style={[styles.s1HeadlineBig, { color: '#E2AA27' }]}>NUTRITION</Text>
                  <Text style={styles.s1HeadlineTop}>CONNECTÉE !</Text>
                </View>

                {/* BENTO CARD — formulaire d'inscription */}
                <View style={styles.s1BentoCard}>
                  {emailSent ? (
                    <View style={styles.emailSentBox}>
                      <Text style={[styles.emailSentTxt, { color: '#0D1117' }]}>📧 Vérifie ta boîte mail !</Text>
                      <Text style={[styles.emailSentSub, { color: '#6B7280' }]}>Lien envoyé à {email.trim()}</Text>
                    </View>
                  ) : (
                    <>
                      <TextInput
                        style={styles.s1Input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Votre adresse e-mail"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        spellCheck={false}
                        inputMode="email"
                      />
                      <TouchableOpacity style={[styles.s1CTA, emailLoading && { opacity: 0.6 }]} onPress={handleEmailLogin} activeOpacity={0.9} disabled={emailLoading}>
                        <Text style={styles.s1CTATxt}>{emailLoading ? 'ENVOI...' : 'DÉMARRER MON SUIVI →'}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.s1Ghost} onPress={() => transitionTo('welcome')} activeOpacity={0.8}>
                        <Text style={styles.s1GhostTxt}>Continuer sans compte</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>

                <View style={styles.s1ScrollHint}>
                  <Text style={styles.s1ScrollTxt}>DÉCOUVRIR L'ÉCOSYSTÈME</Text>
                  <ChevronDown size={13} color="#B0B8C4" strokeWidth={2} />
                </View>
              </View>

              {/* ════════════════════════════════════════════
                  SLIDE 2 — IA Nutritionnelle & Avatar 3D
              ════════════════════════════════════════════ */}
              <View style={styles.slide2}>

                <View style={styles.s2Tag}>
                  <Text style={styles.s2TagTxt}>IA NUTRITIONNELLE & AVATAR 3D</Text>
                </View>
                <Text style={styles.s2Title}>NUTRITION COMPLÈTE{'\n'}& ÉVOLUTION EN 3D</Text>
                <Text style={styles.s2Desc}>
                  Scannez vos repas par IA, gérez vos calories selon vos objectifs et observez la transformation en temps réel de votre avatar morphologique dynamique.
                </Text>

                {/* Macros card */}
                <View style={styles.s2Card}>
                  <Text style={styles.s2CardLabel}>MACROS JOURNALIERS</Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <MacroBlock label="Protéines" value="142g" color="#3B82F6" />
                    <MacroBlock label="Glucides"  value="220g" color="#F59E0B" />
                    <MacroBlock label="Lipides"   value="58g"  color="#EF4444" />
                  </View>
                  <View style={styles.s2CardDivider} />
                  <View style={{ gap: 12 }}>
                    <ProgressBar label="💧 Hydratation — Objectif litres / jour" pct={61} color="#3B82F6" />
                    <ProgressBar label="🌙 Qualité du Sommeil / Récupération"   pct={84} color="#8B5CF6" />
                  </View>
                </View>

                {/* Feature cards */}
                <View style={styles.s2FeaturesRow}>
                  <FeatureCard
                    emoji="📸"
                    title="SCAN OPTIQUE IA"
                    desc="Photo de votre assiette → Calories & macros calculés instantanément."
                    accent="#3B82F6"
                  />
                  <FeatureCard
                    emoji="🛒"
                    title="SMART SHOPPING"
                    desc={"Optimisé selon votre Budget Courses, vos allergies et vos goûts."}
                    accent="#10B981"
                  />
                </View>

                {/* Avatar 3D */}
                <View style={styles.s2AvatarBlock}>
                  <View style={styles.s2AvatarIcon}>
                    <Text style={{ fontSize: 28 }}>🧬</Text>
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.s2AvatarTitle}>AVATAR 3D MORPHOLOGIQUE</Text>
                    <Text style={styles.s2AvatarDesc}>Votre silhouette se transforme visuellement au fil de vos progrès mesurés.</Text>
                  </View>
                </View>

                {/* Objective pills — centered */}
                <View style={styles.s2PillsRow}>
                  {['Prise de masse', 'Perte de poids', 'Maintien sain'].map((tag) => (
                    <View key={tag} style={styles.s2Pill}>
                      <Text style={styles.s2PillTxt}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* ════════════════════════════════════════════
                  SLIDE 3 — Moteur EnzoBoost & Clinique
              ════════════════════════════════════════════ */}
              <View style={styles.slide3}>
                <LinearGradient colors={['#0B132B', '#060E1C', '#0B132B']} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFill} />

                <View style={styles.s3Tag}>
                  <Activity size={11} color={Colors.teal} strokeWidth={2} />
                  <Text style={styles.s3TagTxt}>MOTEUR ENZOBOOST — IA CORE</Text>
                </View>
                <Text style={styles.s3Title}>PRÉCISION CLINIQUE{'\n'}& PASSEPORT SANTÉ</Text>
                <Text style={styles.s3Desc}>
                  Méthode algorithmique EnzoBoost — IA Core répliquant vos protocoles même en votre absence. Synchronisation avec Apple Santé, Google Fit et ceintures cardio (VFC).
                </Text>

                {/* Dashboard MedTech */}
                <View style={styles.s3Dashboard}>

                  {/* ECG */}
                  <View style={styles.s3EcgBox}>
                    <Text style={styles.s3EcgLabel}>FC EN DIRECT</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2, paddingTop: 6 }}>
                      {ECG_HEIGHTS.map((h, i) => {
                        const opacity = h >= 12 ? 1 : h >= 6 ? 0.65 : h >= 3 ? 0.38 : 0.18;
                        return <View key={i} style={{ width: 4, height: h, borderRadius: 2, backgroundColor: Colors.teal, opacity }} />;
                      })}
                    </View>
                    <Text style={styles.s3Bpm}>68 <Text style={styles.s3BpmUnit}>bpm  •  VFC 52 ms</Text></Text>
                  </View>

                  {/* IA Core disciplines */}
                  <View style={styles.s3IACore}>
                    <Text style={styles.s3IACoreLabel}>IA CORE — CLONAGE MÉTHODE ENZOBOOST</Text>
                    <View style={styles.s3IACorePills}>
                      {['💪 Musculation', '🏋️ Haltérophilie', '🏊 Natation', '🏃 Course'].map((d) => (
                        <View key={d} style={styles.s3IACoreItem}>
                          <Text style={styles.s3IACoreItemTxt}>{d}</Text>
                        </View>
                      ))}
                    </View>
                    <View style={styles.s3HandicapNote}>
                      <Text style={styles.s3HandicapTxt}>♿  Fiches spécifiques fauteuil roulant & programmes APA disponibles</Text>
                    </View>
                  </View>
                </View>

                {/* Rapport Caméléon */}
                <View style={styles.s3RapportSection}>
                  <Text style={styles.s3RapportHeader}>MOTEUR CAMÉLÉON — 3 RAPPORTS EN 1 CLIC</Text>
                  <View style={styles.s3RapportList}>
                    <RapportCard emoji="👤" title="Rapport Client"        desc="Évolution visuelle Avatar 3D & courbes de progression" />
                    <RapportCard emoji="🎽" title="Rapport Coach"         desc="Charges, charges nettes, densité d'entraînement & macros" />
                    <RapportCard emoji="🏥" title="Rapport Institutionnel" desc="Tolérance à l'effort, VFC — validé ARS, médecins, kinés & subventions d'État" />
                  </View>
                </View>

                {/* Public badges */}
                <View style={styles.s3BadgesRow}>
                  {[
                    'Athlètes Élite',
                    'Seniors (Anti-Sarcopénie)',
                    'Post-Rééducation & ALD',
                    'PMR (Fauteuil)',
                    'Handicap Mental (UX Simplifiée)',
                  ].map((p) => (
                    <View key={p} style={styles.s3Badge}>
                      <Text style={styles.s3BadgeTxt}>{p}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* ════════════════════════════════════════════
                  SLIDE 4 — Logistique & Transports
              ════════════════════════════════════════════ */}
              <View style={styles.slide4}>

                <View style={styles.s4Tag}>
                  <Text style={styles.s4TagTxt}>MAISON SPORT-SANTÉ</Text>
                </View>
                <Text style={styles.s4Title}>ZÉRO ÉPARPILLEMENT.{'\n'}LOGISTIQUE CENTRALISÉE.</Text>
                <Text style={styles.s4Desc}>
                  Éradication totale des groupes WhatsApp. Module logistique intégré pour les structures disposant d'un service de ramassage — navette adaptée pour seniors, personnes isolées ou PMR.
                </Text>

                {/* Prochain RDV */}
                <View style={styles.s4RdvCard}>
                  <View style={styles.s4RdvLeft}>
                    <Text style={styles.s4RdvEmoji}>📅</Text>
                    <View style={{ gap: 2 }}>
                      <Text style={styles.s4RdvLabel}>MON PROCHAIN RDV</Text>
                      <Text style={styles.s4RdvTime}>Mercredi — 08h30</Text>
                    </View>
                  </View>
                  <View style={styles.s4RdvConfirmed}>
                    <Text style={styles.s4RdvConfirmedTxt}>Navette ✓</Text>
                  </View>
                </View>

                {/* Timeline */}
                <View style={styles.s4Card}>
                  <Text style={styles.s4CardTitle}>VOTRE JOURNÉE AUTOMATISÉE</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                    <LogisticsStep icon="🏠" label="Domicile" time="08h30" />
                    <View style={styles.s4Connector} />
                    <LogisticsStep icon="🚍" label={"Navette\nMETABOOST"} time="08h45" highlight />
                    <View style={styles.s4Connector} />
                    <LogisticsStep icon="🏋️" label={"10 Bornes\nTactiles"} time="09h00" />
                    <View style={styles.s4Connector} />
                    <LogisticsStep icon="📱" label={"Suivi\nClinique"} time="Live" />
                  </View>
                </View>

                {/* iOS-style push notification */}
                <PushNotif
                  title="🔔  Votre chauffeur arrive dans 12 min"
                  sub="Ahmed • Navette METABOOST • 📍 Rue de la Paix, en route"
                />

                <Text style={styles.s4AdminNote}>
                  ⚙️  Feuille de route chauffeur générée automatiquement via le God Mode Admin.
                </Text>

                <View style={styles.s4Badges}>
                  {['10 bornes tactiles en salle', 'Navette adaptée domicile', 'Alertes push temps réel'].map((b) => (
                    <View key={b} style={styles.s4Badge}>
                      <Text style={styles.s4BadgeTxt}>✓  {b}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* ════════════════════════════════════════════
                  SLIDE 5 — Infrastructure B2B & Capture
              ════════════════════════════════════════════ */}
              <View style={styles.slide5}>
                <LinearGradient colors={['#050A12', '#0A0F1E', '#050A12']} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFill} />

                <View style={styles.s5Header}>
                  <Users size={16} color={Colors.accent} strokeWidth={1.8} />
                  <Text style={styles.s5HeaderChip}>PROFESSIONNELS & ÉTABLISSEMENTS</Text>
                </View>
                <Text style={styles.s5Title}>L'INFRASTRUCTURE{'\n'}POUR LES PROS</Text>

                {/* Options B2B */}
                <View style={styles.s5OptionsRow}>
                  <B2BOption
                    emoji="🔑"
                    title="Clé en main"
                    desc={"Méthode EnzoBoost intégrée. Lancez votre structure en 48h."}
                    dark
                  />
                  <B2BOption
                    emoji="🏷️"
                    title="Marque Blanche"
                    desc={"Vos protocoles + notre infrastructure IA, Scanner & Navette."}
                  />
                </View>

                {/* Cibles B2B */}
                <View style={styles.s5TargetsRow}>
                  {['🏋️ Salles de sport', '🎽 Coachs indépendants', '🏠 EHPAD & Maisons de Santé'].map((t) => (
                    <View key={t} style={styles.s5TargetBadge}>
                      <Text style={styles.s5TargetTxt}>{t}</Text>
                    </View>
                  ))}
                </View>

                {/* Copilote IA Chatbot */}
                <View style={styles.s5CopiloteCard}>
                  <View style={styles.s5CopiloteHeader}>
                    <Bot size={18} color={Colors.teal} strokeWidth={1.8} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.s5CopiloteTitle}>COPILOTE IA CHATBOT</Text>
                      <Text style={styles.s5CopiloteDesc}>
                        Répond à vos questions nutrition, entraînement et logistique — disponible 24h/24, 7j/7, sans délai.
                      </Text>
                    </View>
                    <View style={styles.s5CopiloteBadge}>
                      <Text style={styles.s5CopiloteBadgeTxt}>24H/24</Text>
                    </View>
                  </View>
                </View>

                {/* Trust badges */}
                <View style={styles.s5TrustBlock}>
                  <TrustBadge text="Données Chiffrées RGPD" />
                  <TrustBadge text="Synchronisation IoT Native" />
                  <TrustBadge text="Protocoles Certifiés Sport-Santé" />
                </View>

                {/* CTA zone */}
                <View style={styles.s5CTAZone}>
                  {emailSent ? (
                    <View style={styles.emailSentBox}>
                      <Text style={[styles.emailSentTxt, { color: Colors.text }]}>📧 Vérifie ta boîte mail !</Text>
                      <Text style={styles.emailSentSub}>Lien envoyé à {email.trim()}</Text>
                    </View>
                  ) : (
                    <>
                      <TextInput
                        style={styles.s5Input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Ton adresse email"
                        placeholderTextColor="rgba(255,255,255,0.28)"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        spellCheck={false}
                        inputMode="email"
                      />
                      <TouchableOpacity style={[styles.s5CTA, emailLoading && { opacity: 0.6 }]} onPress={handleEmailLogin} activeOpacity={0.9} disabled={emailLoading}>
                        <Text style={styles.s5CTATxt}>{emailLoading ? 'ENVOI...' : 'DÉMARRER MON SUIVI'}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.s5Ghost} onPress={() => transitionTo('welcome')} activeOpacity={0.8}>
                        <Text style={styles.s5GhostTxt}>Commencer sans compte</Text>
                        <ChevronRight size={14} color="rgba(255,255,255,0.4)" strokeWidth={2} />
                      </TouchableOpacity>
                    </>
                  )}
                </View>

                {/* Footer légal */}
                <View style={styles.s5Legal}>
                  <Text style={styles.s5LegalTxt}>
                    En continuant, tu acceptes nos{' '}
                    <Text style={styles.s5LegalLink} onPress={() => router.push('/legal/cgu')}>Conditions d'utilisation</Text>
                    {' '}et notre{' '}
                    <Text style={styles.s5LegalLink} onPress={() => router.push('/legal/privacy')}>Politique de confidentialité</Text>
                    {' '}(RGPD). Traitement des données de santé au sens de l'art. 9 du RGPD, sous contrôle de la CNIL.
                  </Text>
                  <View style={styles.s5LegalRow}>
                    <Text style={styles.s5LegalLink} onPress={() => router.push('/legal/mentions')}>Mentions légales</Text>
                    <Text style={styles.s5LegalSep}>·</Text>
                    <Text style={styles.s5LegalLink} onPress={() => router.push('/legal/cgv')}>CGV</Text>
                    <Text style={styles.s5LegalSep}>·</Text>
                    <Text style={styles.s5LegalLink} onPress={() => router.push('/legal/cookies')}>Cookies</Text>
                  </View>
                </View>
              </View>

            </ScrollView>
          )}

          {/* ══════════════ WELCOME ══════════════ */}
          {step === 'welcome' && (
            <View style={styles.screen}>
              <View style={[styles.screenContent, Platform.OS === 'web' && { paddingBottom: 80 }]}>
                <View style={styles.welcomeBlock}>
                  <View style={styles.emojiRing}><Text style={{ fontSize: 34 }}>👋</Text></View>
                  <Text style={styles.welcomeHi}>Ravi de te rencontrer,</Text>
                  <TextInput
                    style={styles.nameInput}
                    value={userName}
                    onChangeText={setUserName}
                    placeholder="Ton prénom"
                    placeholderTextColor="rgba(226,209,179,0.28)"
                    returnKeyType="done"
                    autoCapitalize="words"
                    autoCorrect={false}
                    onSubmitEditing={() => Keyboard.dismiss()}
                  />
                  <Text style={styles.welcomeSub}>Prêt(e) à transformer ton corps ? 🔥</Text>
                  <View style={styles.genderRow}>
                    {([{ key: 'male' as Gender, sym: '♂', lbl: 'Homme' }, { key: 'female' as Gender, sym: '♀', lbl: 'Femme' }]).map((g) => (
                      <TouchableOpacity key={g.key} style={[styles.genderPill, gender === g.key && styles.genderOn]} onPress={() => { setGender(g.key); Haptics.selectionAsync?.(); }} activeOpacity={0.8}>
                        <Text style={[styles.genderSym, gender === g.key && { color: '#2a2a2a' }]}>{g.sym}</Text>
                        <Text style={[styles.genderLbl, gender === g.key && styles.genderLblOn]}>{g.lbl}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
              <View style={Platform.OS === 'web' ? styles.ctaFixed : null}>
                <TouchableOpacity style={styles.ctaBtn} onPress={goNext} activeOpacity={0.88}>
                  <Text style={styles.ctaTxt}>C'est parti !</Text>
                  <ChevronRight size={20} color="#2a2a2a" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ══════════════ GOAL ══════════════ */}
          {step === 'goal' && (
            <View style={styles.screen}>
              <View style={styles.screenContent}>
                <View style={styles.screenHead}>
                  <Text style={styles.screenTitle}>Ton objectif principal ?</Text>
                  <Text style={styles.screenSub}>Choisis ce qui te correspond — tu pourras changer plus tard.</Text>
                </View>
                <View style={styles.goalList}>
                  {GOALS.map((g) => {
                    const on = goal === g.key;
                    return (
                      <TouchableOpacity key={String(g.key)} style={[styles.goalCard, on && { borderColor: g.color + '55', borderWidth: 1.5 }]} onPress={() => { setGoal(g.key); Haptics.selectionAsync?.(); }} activeOpacity={0.85}>
                        {on && (
                          <LinearGradient colors={[g.color + '16', 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[StyleSheet.absoluteFill, { borderRadius: Radius.xl }]} />
                        )}
                        <View style={[styles.goalIconBox, on && { borderColor: g.color + '45', backgroundColor: g.color + '12' }]}>{g.icon}</View>
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
              </View>
              <View style={Platform.OS === 'web' ? styles.ctaFixed : null}>
                <TouchableOpacity style={[styles.ctaBtn, !goal && styles.ctaOff]} onPress={goal ? goNext : undefined} activeOpacity={0.88}>
                  <Text style={styles.ctaTxt}>Continuer</Text>
                  <ChevronRight size={20} color="#2a2a2a" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ══════════════ MEASURES ══════════════ */}
          {step === 'measures' && (
            <View style={styles.screen}>
              <View style={styles.screenContent}>
                <View style={styles.screenHead}>
                  <Text style={styles.screenTitle}>Tes mesures de départ</Text>
                  <Text style={styles.screenSub}>Ces données calibrent ton profil. Tu pourras les modifier à tout moment.</Text>
                </View>
                <View style={styles.mGrid}>
                  {ROW1.map(({ key: k, label, desc, unit, ph }) => (
                    <View key={k} style={styles.mCard}>
                      <Text style={styles.mLabel}>{label}</Text>
                      <Text style={styles.mDesc}>{desc}</Text>
                      <TextInput style={styles.mInput} value={vals[k]} onChangeText={sets[k]} keyboardType="numeric" inputMode="numeric" placeholder={ph} placeholderTextColor="rgba(226,209,179,0.22)" textAlign="center" autoCorrect={false} />
                      <Text style={styles.mUnit}>{unit}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.optSep}>
                  <View style={styles.optLine} />
                  <Text style={styles.optTxt}>Optionnel</Text>
                  <View style={styles.optLine} />
                </View>
                <View style={[styles.mGrid, { opacity: 0.78 }]}>
                  {ROW2.map(({ key: k, label, desc, unit, ph }) => (
                    <View key={k} style={[styles.mCard, styles.mCardOpt]}>
                      <Text style={styles.mLabel}>{label}</Text>
                      <Text style={styles.mDesc}>{desc}</Text>
                      <TextInput style={styles.mInput} value={vals[k]} onChangeText={sets[k]} keyboardType="numeric" inputMode="numeric" placeholder={ph} placeholderTextColor="rgba(255,255,255,0.14)" textAlign="center" autoCorrect={false} />
                      <Text style={styles.mUnit}>{unit}</Text>
                    </View>
                  ))}
                  <View style={styles.mFiller} />
                </View>
                <TouchableOpacity style={styles.scanBtn} onPress={() => Alert.alert('Bientôt disponible', 'Scanner ton ticket de balance — disponible très prochainement ✨')} activeOpacity={0.8}>
                  <ScanLine size={16} color={Colors.teal} strokeWidth={1.8} />
                  <Text style={styles.scanTxt}>Scanner mon ticket de balance</Text>
                  <View style={styles.beta}><Text style={styles.betaTxt}>BÊTA</Text></View>
                </TouchableOpacity>
              </View>
              <View style={[Platform.OS === 'web' ? styles.ctaFixed : null, { gap: Spacing.sm }]}>
                <TouchableOpacity style={styles.ctaBtn} onPress={finish} activeOpacity={0.88}>
                  <Text style={styles.ctaTxt}>Démarrer MetaBoost 🚀</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={finish} style={styles.skipBtn}>
                  <Text style={styles.skipTxt}>Passer pour l'instant</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

// ── StyleSheet ────────────────────────────────────────────────────────────────

// Phone mockup — proportions iPhone élancées (ratio h/w ≈ 2.16)
const PHN_ASPECT = 2.16;
const ZONE_H = Math.round(H * 0.52);
const PHONE_R_W = Math.round(W * 0.44);
const PHONE_R_H = Math.min(Math.round(PHONE_R_W * PHN_ASPECT), Math.round(ZONE_H * 0.96));
const PHONE_L_W = Math.round(W * 0.36);
const PHONE_L_H = Math.min(Math.round(PHONE_L_W * PHN_ASPECT), Math.round(ZONE_H * 0.82));
const PHONE_TL_W = Math.round(W * 0.30);
const PHONE_TL_H = Math.min(Math.round(PHONE_TL_W * PHN_ASPECT), Math.round(ZONE_H * 0.66));
const MOCKUP_ZONE_H = ZONE_H;

const CARD_SHADOW = Platform.OS === 'web'
  ? { boxShadow: '0 4px 28px rgba(0,0,0,0.08)' } as any
  : { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 28, elevation: 4 };

const styles = StyleSheet.create({

  // ── Root ───────────────────────────────────────────────────────────────────
  root: { flex: 1, backgroundColor: '#050A12' },
  rootWeb: {
    position: 'absolute' as any,
    top: 0, left: 0,
    width: '100%' as any,
    height: '100dvh' as any,
    overflow: 'hidden' as any,
    flex: 1,
    paddingBottom: 0,
  },
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

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 1 — Style TrainSweatEat : gradient, mockups téléphone, typo sombre
  // ══════════════════════════════════════════════════════════════════════════
  rootLight: { backgroundColor: '#FFFFFF' },
  slide1: {
    minHeight: H,
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 28,
    overflow: 'hidden' as any,
  },
  s1TopBar: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  s1LogoBadge: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#0D1117', alignItems: 'center', justifyContent: 'center' },
  s1LogoEmoji: { fontSize: 16 },
  s1Brand: {
    fontSize: 30, fontWeight: '900', color: '#0D1117',
    letterSpacing: 4, textAlign: 'center',
    marginTop: 8, marginBottom: 16,
  },
  // ── Mockup zone — pleine largeur, transparent (gradient du slide en fond) ──
  s1MockupsZone: {
    height: MOCKUP_ZONE_H,
    position: 'relative' as any,
    marginTop: 0,
    marginBottom: 12,
    marginHorizontal: -20,
    overflow: 'hidden',
  },
  // Téléphone haut-gauche — arrière-plan, rogné en haut
  s1PhoneTopLeft: {
    position: 'absolute' as any,
    left: 12,
    top: -20,
    width: PHONE_TL_W,
    height: PHONE_TL_H,
    borderRadius: 24,
    overflow: 'hidden',
    zIndex: 1,
    transform: [{ rotate: '-7deg' }],
    backgroundColor: '#1A1A1A',
    borderWidth: 3,
    borderColor: '#080808',
    padding: 4,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 8px 28px rgba(0,0,0,0.20)' } as any
      : { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.20, shadowRadius: 18, elevation: 6 }),
  },
  // Téléphone bas-gauche — Nutrition, complet
  s1PhoneLeft: {
    position: 'absolute' as any,
    left: 14,
    bottom: 12,
    width: PHONE_L_W,
    height: PHONE_L_H,
    borderRadius: 26,
    overflow: 'hidden',
    zIndex: 2,
    transform: [{ rotate: '-4deg' }],
    backgroundColor: '#1A1A1A',
    borderWidth: 3,
    borderColor: '#080808',
    padding: 4,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 14px 44px rgba(0,0,0,0.28)' } as any
      : { shadowColor: '#000', shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.28, shadowRadius: 26, elevation: 10 }),
  },
  // Téléphone droit — Training (héro, dominant)
  s1PhoneRight: {
    position: 'absolute' as any,
    right: 12,
    top: 12,
    width: PHONE_R_W,
    height: PHONE_R_H,
    borderRadius: 30,
    overflow: 'hidden',
    zIndex: 3,
    transform: [{ rotate: '3deg' }],
    backgroundColor: '#1A1A1A',
    borderWidth: 3,
    borderColor: '#080808',
    padding: 4,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 20px 56px rgba(0,0,0,0.36)' } as any
      : { shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.36, shadowRadius: 36, elevation: 14 }),
  },
  // Écran intérieur (clippé dans le châssis)
  s1PhoneScreen: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  // Dynamic Island — pill noire centrée en haut de l'écran
  s1PhoneDI: {
    alignSelf: 'center',
    width: 44,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#000000',
    marginTop: 6,
    marginBottom: 4,
  },
  s1PhnStatusBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 8, paddingTop: 6, paddingBottom: 3,
  },
  s1PhnStatusTime: { fontSize: 8, fontWeight: '700', color: '#0D1117', opacity: 0.5 },
  s1PhnBody: {
    flex: 1, backgroundColor: '#FFFFFF',
    paddingHorizontal: 8, paddingBottom: 8, gap: 5,
  },
  s1PhnTitle: { fontSize: 10, fontWeight: '800', color: '#0D1117', letterSpacing: 0.3 },
  s1PhnSub: { fontSize: 7, color: 'rgba(255,255,255,0.4)', marginTop: 1 },
  // calorie ring
  s1CalRingWrap: { alignItems: 'center', marginVertical: 3 },
  s1CalRing: {
    width: 44, height: 44, borderRadius: 22,
    borderWidth: 4,
    borderTopColor: '#00C8D4',
    borderRightColor: '#00C8D4',
    borderBottomColor: '#E5E7EB',
    borderLeftColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center',
    transform: [{ rotate: '-45deg' }],
  },
  s1CalNum: {
    fontSize: 8, fontWeight: '900', color: '#0D1117',
    transform: [{ rotate: '45deg' }],
    letterSpacing: -0.3,
  },
  s1CalUnit: {
    fontSize: 5, color: '#9CA3AF', fontWeight: '600',
    transform: [{ rotate: '45deg' }],
  },
  // macro bars
  s1MacroBars: { gap: 3 },
  s1MacroRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  s1MacroLbl: { fontSize: 6, fontWeight: '600', color: '#6B7280', width: 18 },
  s1MacroTrack: { flex: 1, height: 3, backgroundColor: '#F3F4F6', borderRadius: 2, overflow: 'hidden' },
  s1MacroFill: { height: '100%', borderRadius: 2 },
  // exercise card
  s1ExoCard: {
    borderRadius: 8, overflow: 'hidden',
    backgroundColor: '#1A1F26', flex: 1,
  },
  s1ExoHero: {
    flex: 1, backgroundColor: '#1E293B',
    padding: 6, justifyContent: 'flex-start',
  },
  s1ExoBadgeNew: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,200,212,0.15)',
    paddingHorizontal: 4, paddingVertical: 2,
    borderRadius: 3,
  },
  s1ExoBadgeNewTxt: { fontSize: 5, fontWeight: '800', color: '#00C8D4', letterSpacing: 0.6 },
  s1ExoFooter: { padding: 5 },
  s1ExoTitle: { fontSize: 8, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.2 },
  s1ExoMeta: { fontSize: 6, color: 'rgba(255,255,255,0.4)', marginTop: 1 },
  s1ExoProgressTrack: {
    height: 2, backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2, overflow: 'hidden', marginTop: 3,
  },
  s1ExoProgressFill: { height: '100%', backgroundColor: '#00C8D4', borderRadius: 2 },
  // ── Headline ──
  s1HeadlineBlock: { gap: 0, marginTop: 8 },
  s1HeadlineRow: { flexDirection: 'row', alignItems: 'baseline' },
  s1HeadlineTop: {
    fontSize: 14, fontWeight: '700', color: '#6B7280', letterSpacing: -0.3,
  },
  s1HeadlineBig: {
    fontSize: 32, fontWeight: '900', color: '#0D1117',
    letterSpacing: -1.5, lineHeight: 36,
  },
  // kept for compat
  s1Hero: { flex: 1, justifyContent: 'center', gap: 20, paddingVertical: 16 },
  s1PreviewRow: { flexDirection: 'row', gap: 8 },
  s1PreviewCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12, gap: 3, borderWidth: 1, borderColor: '#E5E7EB' },
  s1PreviewDark: { backgroundColor: '#0D1117', borderColor: '#0D1117' },
  s1PreviewEmoji: { fontSize: 18, marginBottom: 2 },
  s1PreviewLabel: { fontSize: 8, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.8 },
  s1PreviewValue: { fontSize: 13, fontWeight: '900', color: '#0D1117', letterSpacing: -0.3 },
  s1Eyebrow: { fontSize: 10, fontWeight: '700', color: '#9CA3AF', letterSpacing: 2.5, textTransform: 'uppercase' },
  s1Title: { fontSize: 54, fontWeight: '900', color: '#0D1117', letterSpacing: -2, textAlign: 'center' },
  s1Tagline: { fontSize: 11, fontWeight: '700', color: '#6B7280', letterSpacing: 2, textAlign: 'center', textTransform: 'uppercase', lineHeight: 18 },
  s1Sub: { fontSize: 12, color: '#8E9AA8', letterSpacing: 0.4, textAlign: 'center' },
  s1HeroBadges: { flexDirection: 'row', gap: 7, flexWrap: 'wrap', justifyContent: 'center', marginTop: 6 },
  s1HeroBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB' },
  s1HeroBadgeTxt: { fontSize: 11, fontWeight: '600', color: '#374151' },
  s1BentoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 24,
    gap: 12,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 4px 32px rgba(0,0,0,0.05)' } as any
      : { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 24, elevation: 2 }),
  },
  s1CardLabel: { fontSize: 13, fontWeight: '600', color: '#374151', textAlign: 'center' },
  s1Auth: { gap: 12 },
  s1Input: {
    height: 54, backgroundColor: '#F3F4F6', borderRadius: Radius.full,
    paddingHorizontal: 20, fontSize: 16, color: '#0D1117',
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  s1CTA: {
    height: 54, backgroundColor: '#1A1F26', borderRadius: Radius.full,
    alignItems: 'center', justifyContent: 'center',
    ...(Platform.OS === 'web' ? { boxShadow: '0 4px 20px rgba(26,31,38,0.22)' } as any : {}),
  },
  s1CTATxt: { fontSize: 14, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1.5 },
  s1Ghost: { alignItems: 'center', justifyContent: 'center', paddingVertical: 10 },
  s1GhostTxt: { fontSize: 13, fontWeight: '500', color: '#9CA3AF' },
  s1ScrollHint: { alignItems: 'center', gap: 4, marginTop: 16 },
  s1ScrollTxt: { fontSize: 9, color: '#B0B8C4', letterSpacing: 2.5, textTransform: 'uppercase' },

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 2 — Fond Blanc
  // ══════════════════════════════════════════════════════════════════════════
  slide2: {
    minHeight: H, marginTop: -1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24, paddingTop: 52, paddingBottom: 52,
    gap: 20,
  },
  s2Tag: {
    alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: Radius.full, backgroundColor: '#F3F4F6',
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  s2TagTxt: { fontSize: 10, fontWeight: '800', color: '#6B7280', letterSpacing: 1.8, textTransform: 'uppercase' },
  s2Title: { fontSize: 26, fontWeight: '900', color: '#050A12', letterSpacing: -0.8, lineHeight: 32 },
  s2Desc: { fontSize: 13, color: '#374151', lineHeight: 20 },
  s2Card: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18, gap: 14,
    borderWidth: 1, borderColor: '#F3F4F6', ...CARD_SHADOW,
  },
  s2CardLabel: { fontSize: 10, fontWeight: '800', color: '#9CA3AF', letterSpacing: 2, textTransform: 'uppercase' },
  s2CardDivider: { height: 1, backgroundColor: '#F3F4F6' },
  s2FeaturesRow: { flexDirection: 'row', gap: 10 },
  s2FeatureCard: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: '#F3F4F6', gap: 4, ...CARD_SHADOW,
  },
  s2FeatureTitle: { fontSize: 11, fontWeight: '800', color: '#050A12', letterSpacing: 0.5, textTransform: 'uppercase' },
  s2FeatureDesc: { fontSize: 11, color: '#4B5563', lineHeight: 16 },
  s2AvatarBlock: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#F9FAFB', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  s2AvatarIcon: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center',
  },
  s2AvatarTitle: { fontSize: 11, fontWeight: '800', color: '#050A12', letterSpacing: 0.8, textTransform: 'uppercase' },
  s2AvatarDesc: { fontSize: 11, color: '#4B5563', lineHeight: 16, marginTop: 2 },
  // centered row with wrap for the 3 pills
  s2PillsRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
    justifyContent: 'center', marginTop: 4,
  },
  s2Pill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.full, backgroundColor: '#050A12' },
  s2PillTxt: { fontSize: 12, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.3 },

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 3 — Fond Sombre #0B132B
  // ══════════════════════════════════════════════════════════════════════════
  slide3: {
    minHeight: H, paddingHorizontal: 24, paddingVertical: 52, gap: 18,
  },
  s3Tag: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: Radius.full,
    backgroundColor: 'rgba(0,200,212,0.1)', borderWidth: 1, borderColor: 'rgba(0,200,212,0.25)',
  },
  s3TagTxt: { fontSize: 10, fontWeight: '800', color: Colors.teal, letterSpacing: 1.5 },
  s3Title: { fontSize: 26, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.8, lineHeight: 32 },
  s3Desc: { fontSize: 13, color: 'rgba(255,255,255,0.48)', lineHeight: 20 },
  s3Dashboard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 18, padding: 14, gap: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  s3EcgBox: { backgroundColor: 'rgba(0,200,212,0.06)', borderRadius: 12, padding: 12 },
  s3EcgLabel: { fontSize: 9, fontWeight: '800', color: Colors.teal, letterSpacing: 2, textTransform: 'uppercase' },
  s3Bpm: { fontSize: 19, fontWeight: '900', color: '#FFFFFF', marginTop: 8, letterSpacing: -0.5 },
  s3BpmUnit: { fontSize: 11, fontWeight: '400', color: 'rgba(255,255,255,0.35)' },
  s3IACore: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 12, gap: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  s3IACoreLabel: { fontSize: 9, fontWeight: '800', color: 'rgba(255,255,255,0.32)', letterSpacing: 1.5, textTransform: 'uppercase' },
  s3IACorePills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  s3IACoreItem: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)',
  },
  s3IACoreItemTxt: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },
  s3HandicapNote: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 6, paddingHorizontal: 8, borderRadius: 8,
    backgroundColor: 'rgba(0,200,212,0.07)', borderWidth: 1, borderColor: 'rgba(0,200,212,0.2)',
  },
  s3HandicapTxt: { fontSize: 11, color: Colors.teal, fontWeight: '600' },
  s3RapportSection: { gap: 8 },
  s3RapportHeader: { fontSize: 9, fontWeight: '800', color: 'rgba(255,255,255,0.28)', letterSpacing: 1.5, textTransform: 'uppercase' },
  s3RapportList: { gap: 6 },
  s3RapportCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 13, padding: 11,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  s3RapportInner: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  s3RapportTitle: { fontSize: 13, fontWeight: '700', color: '#FFFFFF', marginBottom: 1 },
  s3RapportDesc: { fontSize: 10, color: 'rgba(255,255,255,0.38)', lineHeight: 14 },
  s3BadgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  s3Badge: {
    paddingHorizontal: 11, paddingVertical: 6, borderRadius: Radius.full,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  s3BadgeTxt: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.6)' },

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 4 — Fond Blanc
  // ══════════════════════════════════════════════════════════════════════════
  slide4: {
    minHeight: H, marginTop: -1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24, paddingTop: 52, paddingBottom: 52,
    gap: 18,
  },
  s4Tag: {
    alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: Radius.full, backgroundColor: '#F3F4F6',
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  s4TagTxt: { fontSize: 10, fontWeight: '800', color: '#6B7280', letterSpacing: 1.8, textTransform: 'uppercase' },
  s4Title: { fontSize: 26, fontWeight: '900', color: '#050A12', letterSpacing: -0.8, lineHeight: 32 },
  s4Desc: { fontSize: 13, color: '#374151', lineHeight: 20 },
  s4RdvCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#050A12', borderRadius: 16, padding: 16,
  },
  s4RdvLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  s4RdvEmoji: { fontSize: 24 },
  s4RdvLabel: { fontSize: 9, fontWeight: '800', color: 'rgba(255,255,255,0.45)', letterSpacing: 1.5, textTransform: 'uppercase' },
  s4RdvTime: { fontSize: 18, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.3 },
  s4RdvConfirmed: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full,
    backgroundColor: '#DCFCE7', borderWidth: 1, borderColor: '#BBF7D0',
  },
  s4RdvConfirmedTxt: { fontSize: 11, fontWeight: '800', color: '#15803D' },
  s4Card: {
    backgroundColor: '#FFFFFF', borderRadius: 18, padding: 18, gap: 16,
    borderWidth: 1, borderColor: '#F3F4F6', ...CARD_SHADOW,
  },
  s4CardTitle: { fontSize: 10, fontWeight: '800', color: '#9CA3AF', letterSpacing: 2, textTransform: 'uppercase' },
  s4Connector: { flex: 1, height: 1.5, backgroundColor: '#E5E7EB', marginTop: 20, marginHorizontal: -6 },
  // Compact iOS-style notification card
  s4PushBanner: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14, padding: 13,
    borderWidth: 1, borderColor: '#E5E7EB',
    ...(Platform.OS === 'web' ? { boxShadow: '0 2px 10px rgba(0,0,0,0.04)' } as any : {}),
  },
  s4PushDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#F97316' },
  s4PushApp: { fontSize: 11, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.4 },
  s4PushTime: { fontSize: 11, color: '#9CA3AF', fontWeight: '400' },
  s4PushTitle: { fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 2 },
  s4PushSub: { fontSize: 12, color: '#6B7280', lineHeight: 17 },
  s4PushBadge: {
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6,
    backgroundColor: '#FEF3C7',
  },
  s4PushBadgeTxt: { fontSize: 9, fontWeight: '900', color: '#D97706', letterSpacing: 1 },
  s4AdminNote: { fontSize: 11, color: '#9CA3AF', letterSpacing: 0.2, lineHeight: 17, fontStyle: 'italic', paddingHorizontal: 2 },
  s4Badges: { gap: 8 },
  s4Badge: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
    backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB',
  },
  s4BadgeTxt: { fontSize: 13, fontWeight: '600', color: '#374151' },

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 5 — Fond Sombre #050A12
  // ══════════════════════════════════════════════════════════════════════════
  slide5: {
    minHeight: H, paddingHorizontal: 24, paddingTop: 52, paddingBottom: 40, gap: 22,
  },
  s5Header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  s5HeaderChip: { fontSize: 9, fontWeight: '800', color: Colors.accent, letterSpacing: 1.5, textTransform: 'uppercase' },
  s5Title: { fontSize: 28, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.8, lineHeight: 34 },
  s5OptionsRow: { flexDirection: 'row', gap: 10 },
  s5OptionCard: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16,
    padding: 16, gap: 6, ...CARD_SHADOW,
  },
  s5OptionCardDark: { backgroundColor: '#111827', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  s5OptionTitle: { fontSize: 13, fontWeight: '900', color: '#050A12', letterSpacing: 0.2 },
  s5OptionDesc: { fontSize: 11, color: '#6B7280', lineHeight: 16 },
  s5TargetsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  s5TargetBadge: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  s5TargetTxt: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.65)' },
  s5CopiloteCard: {
    backgroundColor: 'rgba(0,200,212,0.07)',
    borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: 'rgba(0,200,212,0.22)',
  },
  s5CopiloteHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  s5CopiloteTitle: { fontSize: 12, fontWeight: '800', color: Colors.teal, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 4 },
  s5CopiloteDesc: { fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 18 },
  s5CopiloteBadge: {
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
    backgroundColor: Colors.teal, alignSelf: 'flex-start',
  },
  s5CopiloteBadgeTxt: { fontSize: 9, fontWeight: '900', color: '#FFFFFF', letterSpacing: 1 },
  s5TrustBlock: { gap: 10, paddingHorizontal: 4 },
  s5CTAZone: { gap: 12 },
  s5Input: {
    height: 54, backgroundColor: '#111827', borderRadius: Radius.full,
    paddingHorizontal: 24, fontSize: 16, color: '#FFFFFF',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  s5CTA: {
    height: 54, backgroundColor: '#FFFFFF', borderRadius: Radius.full,
    alignItems: 'center', justifyContent: 'center',
    ...(Platform.OS === 'web' ? { boxShadow: '0 8px 32px rgba(255,255,255,0.12)' } as any : {}),
  },
  s5CTATxt: { fontSize: 14, fontWeight: '800', color: '#050A12', letterSpacing: 2 },
  s5Ghost: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 14 },
  s5GhostTxt: { fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.4)' },
  s5Legal: { gap: 8, alignItems: 'center' },
  s5LegalTxt: { fontSize: 11, color: 'rgba(255,255,255,0.2)', textAlign: 'center', lineHeight: 17, letterSpacing: 0.2 },
  s5LegalRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'center' },
  s5LegalLink: { fontSize: 11, color: 'rgba(255,255,255,0.32)', textDecorationLine: 'underline' },
  s5LegalSep: { fontSize: 11, color: 'rgba(255,255,255,0.15)' },

  // ══════════════════════════════════════════════════════════════════════════
  // Shared
  // ══════════════════════════════════════════════════════════════════════════
  emailSentBox: { alignItems: 'center', gap: 8, paddingVertical: 20 },
  emailSentTxt: { fontSize: 20, color: Colors.text, fontWeight: '700' },
  emailSentSub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },

  // ══════════════════════════════════════════════════════════════════════════
  // Welcome / Goal / Measures (inchangé)
  // ══════════════════════════════════════════════════════════════════════════
  screen: {
    flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl, justifyContent: 'space-between', gap: Spacing.lg,
  },
  screenContent: { flex: 1, justifyContent: 'center', gap: Spacing.md },
  screenHead:  { gap: 6 },
  screenTitle: { fontSize: 27, fontWeight: '900', color: Colors.text, letterSpacing: -0.4 },
  screenSub:   { fontSize: 14, color: Colors.textSecondary, lineHeight: 21 },
  welcomeBlock: { alignItems: 'center', gap: 14 },
  emojiRing: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)',
    alignItems: 'center', justifyContent: 'center',
  },
  welcomeHi:  { fontSize: 16, color: Colors.textSecondary, fontWeight: '300' },
  nameInput: {
    fontSize: 40, fontWeight: '900', color: Colors.accent,
    textAlign: 'center', letterSpacing: -1,
    borderBottomWidth: 2, borderBottomColor: 'rgba(226,209,179,0.28)',
    paddingBottom: 8, width: '100%',
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}),
  },
  welcomeSub: { fontSize: 16, color: Colors.text, textAlign: 'center' },
  genderRow: { flexDirection: 'row', gap: 10, width: '100%' },
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
  goalList: { gap: 10 },
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
  mGrid: { flexDirection: 'row', gap: 8 },
  mCard: {
    flex: 1, alignItems: 'center', paddingVertical: 16, paddingHorizontal: 4,
    borderRadius: Radius.xl, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)', gap: 2,
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
  mUnit:   { fontSize: 10, color: Colors.textSecondary, fontWeight: '500' },
  optSep:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  optLine: { flex: 1, height: 0.5, backgroundColor: 'rgba(255,255,255,0.08)' },
  optTxt:  { fontSize: 10, color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 1 },
  scanBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 13, paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1, borderColor: Colors.teal + '38',
    backgroundColor: 'rgba(0,200,212,0.05)',
  },
  scanTxt: { flex: 1, fontSize: 13, fontWeight: '600', color: Colors.teal },
  beta:    { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: Colors.teal + '18', borderWidth: 0.5, borderColor: Colors.teal + '40' },
  betaTxt: { fontSize: 8, fontWeight: '900', color: Colors.teal, letterSpacing: 1.5 },
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.accent, borderRadius: Radius.full, paddingVertical: 18,
    ...(Platform.OS === 'web' ? { boxShadow: '0 8px 30px rgba(226,209,179,0.2)' } as any : {}),
  },
  ctaOff:  { opacity: 0.35 },
  ctaTxt:  { fontSize: 17, fontWeight: '800', color: '#2a2a2a', letterSpacing: 0.2 },
  skipBtn: { alignItems: 'center', paddingVertical: Spacing.sm },
  skipTxt: { fontSize: 13, color: Colors.textTertiary },
  ctaFixed: Platform.OS === 'web' ? {
    position: 'fixed' as any,
    bottom: 'calc(20px + var(--kb-offset, 0px) + env(safe-area-inset-bottom))' as any,
    left: '5%' as any,
    width: '90%' as any,
    zIndex: 50,
  } : {},
});
