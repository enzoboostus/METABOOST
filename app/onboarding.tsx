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
  Activity, Users, ChevronDown,
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
    <View style={{ flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F3F4F6', gap: 3 }}>
      <Text style={{ fontSize: 22, fontWeight: '900', color }}>{value}</Text>
      <Text style={{ fontSize: 8, fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1.2 }}>{label}</Text>
    </View>
  );
}

function MorphoBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <View style={{ gap: 5 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 11, fontWeight: '700', color: '#6B7280', letterSpacing: 0.4 }}>{label}</Text>
        <Text style={{ fontSize: 12, fontWeight: '900', color }}>{pct}%</Text>
      </View>
      <View style={{ height: 7, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden' }}>
        <View style={{ width: `${pct}%` as any, height: '100%', backgroundColor: color, borderRadius: 4 }} />
      </View>
    </View>
  );
}

function MetricCard({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)', gap: 2 }}>
      <Text style={{ fontSize: 20, fontWeight: '900', color: Colors.teal, letterSpacing: -0.5 }}>{value}</Text>
      <Text style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>{unit}</Text>
      <Text style={{ fontSize: 9, color: 'rgba(255,255,255,0.22)', textAlign: 'center' }}>{label}</Text>
    </View>
  );
}

function LogisticsStep({ icon, label, time, highlight }: { icon: string; label: string; time: string; highlight?: boolean }) {
  return (
    <View style={{ alignItems: 'center', gap: 5, flex: 1 }}>
      <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: highlight ? '#050A12' : '#F3F4F6', alignItems: 'center', justifyContent: 'center', borderWidth: highlight ? 0 : 1, borderColor: '#E5E7EB' }}>
        <Text style={{ fontSize: 20 }}>{icon}</Text>
      </View>
      <Text style={{ fontSize: 10, fontWeight: '700', color: highlight ? '#050A12' : '#9CA3AF', textAlign: 'center' }}>{label}</Text>
      <Text style={{ fontSize: 10, fontWeight: '600', color: highlight ? '#374151' : '#D1D5DB' }}>{time}</Text>
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
    <View style={[styles.root, Platform.OS === 'web' && styles.rootWeb]}>
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
            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
              bounces={false}
              overScrollMode="never"
            >

              {/* ── SLIDE 1 : Entrée Immersive Premium ── */}
              <View style={styles.slide1}>
                <LinearGradient
                  colors={['#050A12', '#0B1628', '#050A12']}
                  locations={[0, 0.55, 1]}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.s1Glow} />

                <View style={styles.s1Header}>
                  <View style={styles.s1LogoBadge}>
                    <Text style={styles.s1LogoEmoji}>⚡</Text>
                  </View>
                  <Text style={styles.s1Brand}>METABOOST</Text>
                </View>

                <View style={styles.s1Hero}>
                  <Text style={styles.s1Title}>METABOOST</Text>
                  <Text style={styles.s1Tagline}>SPORT, HAUTE NUTRITION{'\n'}& SANTÉ CONNECTÉE</Text>
                  <Text style={styles.s1Sub}>Écosystème expert  •  Suivi métabolique & APA</Text>
                </View>

                <View style={styles.s1Auth}>
                  {emailSent ? (
                    <View style={styles.emailSentBox}>
                      <Text style={styles.emailSentTxt}>📧 Vérifie ta boîte mail !</Text>
                      <Text style={styles.emailSentSub}>Un lien de connexion a été envoyé à {email.trim()}</Text>
                    </View>
                  ) : (
                    <>
                      <TextInput
                        style={styles.s1Input}
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
                      <TouchableOpacity
                        style={[styles.s1CTA, emailLoading && { opacity: 0.6 }]}
                        onPress={handleEmailLogin}
                        activeOpacity={0.9}
                        disabled={emailLoading}
                      >
                        <Text style={styles.s1CTATxt}>
                          {emailLoading ? 'ENVOI...' : 'DÉMARRER MON SUIVI'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.s1Ghost}
                        onPress={() => transitionTo('welcome')}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.s1GhostTxt}>Commencer sans compte</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>

                <View style={styles.s1ScrollHint}>
                  <Text style={styles.s1ScrollTxt}>DÉCOUVRIR</Text>
                  <ChevronDown size={13} color="rgba(255,255,255,0.22)" strokeWidth={2} />
                </View>
              </View>

              {/* ── SLIDE 2 : Avatar 3D & Nutrition — Fond Blanc ── */}
              <View style={styles.slide2}>
                <View style={styles.s2Tag}>
                  <Text style={styles.s2TagTxt}>IA NUTRITIONNELLE</Text>
                </View>
                <Text style={styles.s2Title}>VOTRE ÉVOLUTION EN 3D{'\n'}& NUTRITION COMPLÈTE</Text>
                <Text style={styles.s2Desc}>
                  Scannez vos repas par IA, gérez vos calories en fonction de vos objectifs et observez la transformation en temps réel de votre avatar morphologique dynamique. L'IA supprime toute votre charge mentale.
                </Text>

                <View style={styles.s2Card}>
                  <Text style={styles.s2CardTitle}>MACROS JOURNALIERS</Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <MacroBlock label="Protéines" value="142g" color="#3B82F6" />
                    <MacroBlock label="Glucides" value="220g" color="#F59E0B" />
                    <MacroBlock label="Lipides" value="58g" color="#EF4444" />
                  </View>
                  <View style={{ gap: 10, marginTop: 4 }}>
                    <MorphoBar label="Masse musculaire" pct={73} color="#050A12" />
                    <MorphoBar label="Hydratation" pct={61} color="#3B82F6" />
                    <MorphoBar label="Objectif calories" pct={84} color="#2DC674" />
                  </View>
                </View>

                <View style={styles.s2B2BRow}>
                  {['Prise de masse', 'Perte de poids', 'Maintien sain'].map((tag) => (
                    <View key={tag} style={styles.s2Pill}>
                      <Text style={styles.s2PillTxt}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* ── SLIDE 3 : Précision Clinique — Fond Sombre ── */}
              <View style={styles.slide3}>
                <LinearGradient
                  colors={['#0B132B', '#060E1C', '#0B132B']}
                  locations={[0, 0.5, 1]}
                  style={StyleSheet.absoluteFill}
                />

                <View style={styles.s3Tag}>
                  <Activity size={11} color={Colors.teal} strokeWidth={2} />
                  <Text style={styles.s3TagTxt}>BIOMÉTRIE CLINIQUE</Text>
                </View>
                <Text style={styles.s3Title}>SUIVI BIOMÉTRIQUE{'\n'}& PASSEPORT SANTÉ</Text>
                <Text style={styles.s3Desc}>
                  Des programmes sur-mesure adaptés à tous : athlètes de haut niveau, seniors, ou public en situation de handicap. Génération en un clic de rapports d'effort cliniques pour votre médecin ou vos demandes de subventions.
                </Text>

                <View style={styles.s3Dashboard}>
                  <View style={styles.s3EcgBox}>
                    <Text style={styles.s3EcgLabel}>FC EN DIRECT</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2, paddingTop: 4 }}>
                      {ECG_HEIGHTS.map((h, i) => {
                        const opacity = h >= 12 ? 1 : h >= 6 ? 0.65 : h >= 3 ? 0.38 : 0.18;
                        return (
                          <View key={i} style={{ width: 4, height: h, borderRadius: 2, backgroundColor: Colors.teal, opacity }} />
                        );
                      })}
                    </View>
                    <Text style={styles.s3Bpm}>68 <Text style={styles.s3BpmUnit}>bpm</Text></Text>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <MetricCard label="Variabilité" value="52" unit="ms VFC" />
                    <MetricCard label="VO₂ max" value="48" unit="ml/kg/min" />
                    <MetricCard label="Charge" value="85" unit="% effort" />
                  </View>
                </View>

                <View style={styles.s3ProgramsRow}>
                  {['Musculation', 'Haltérophilie', 'Course', 'Natation'].map((p) => (
                    <View key={p} style={styles.s3ProgramBadge}>
                      <Text style={styles.s3ProgramTxt}>{p}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* ── SLIDE 4 : Logistique Centralisée — Fond Blanc ── */}
              <View style={styles.slide4}>
                <View style={styles.s4Tag}>
                  <Text style={styles.s4TagTxt}>MAISON SPORT-SANTÉ</Text>
                </View>
                <Text style={styles.s4Title}>ZÉRO ÉPARPILLEMENT.{'\n'}LOGISTIQUE CENTRALISÉE.</Text>
                <Text style={styles.s4Desc}>
                  Oubliez les groupes WhatsApp. Tout votre planning est centralisé. Suivez vos séances sur nos 10 bornes tactiles et recevez vos alertes de prise en charge en temps réel.
                </Text>

                <View style={styles.s4Card}>
                  <Text style={styles.s4CardTitle}>VOTRE JOURNÉE AUTOMATISÉE</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                    <LogisticsStep icon="🏠" label="Domicile" time="08h30" />
                    <View style={styles.s4Connector} />
                    <LogisticsStep icon="🚐" label="Navette" time="08h45" highlight />
                    <View style={styles.s4Connector} />
                    <LogisticsStep icon="🏋️" label="Séance" time="09h00" />
                    <View style={styles.s4Connector} />
                    <LogisticsStep icon="📱" label="Suivi" time="Live" />
                  </View>
                </View>

                <View style={styles.s4Badges}>
                  {['10 bornes tactiles en salle', 'Navette adaptée domicile', 'Alertes temps réel'].map((b) => (
                    <View key={b} style={styles.s4Badge}>
                      <Text style={styles.s4BadgeTxt}>✓  {b}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* ── SLIDE 5 : B2B & Réassurance Élite — Fond Sombre ── */}
              <View style={styles.slide5}>
                <LinearGradient
                  colors={['#050A12', '#0A0F1E', '#050A12']}
                  locations={[0, 0.5, 1]}
                  style={StyleSheet.absoluteFill}
                />

                <View style={styles.s5B2BCard}>
                  <View style={styles.s5B2BIconRow}>
                    <Users size={18} color={Colors.accent} strokeWidth={1.8} />
                    <Text style={styles.s5B2BChip}>MARQUE BLANCHE</Text>
                  </View>
                  <Text style={styles.s5B2BTitle}>
                    Coach indépendant, gérant de salle, EHPAD ou structure de santé ?
                  </Text>
                  <Text style={styles.s5B2BDesc}>
                    Utilisez l'infrastructure METABOOST (IA, Scanner, Navette) en marque blanche pour piloter et automatiser votre propre établissement.
                  </Text>
                </View>

                <View style={styles.s5TrustBlock}>
                  <TrustBadge text="Données Chiffrées RGPD" />
                  <TrustBadge text="Synchronisation Apple Health / Google Fit" />
                  <TrustBadge text="Protocoles Certifiés Sport-Santé" />
                </View>

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
                      <TouchableOpacity
                        style={[styles.s5CTA, emailLoading && { opacity: 0.6 }]}
                        onPress={handleEmailLogin}
                        activeOpacity={0.9}
                        disabled={emailLoading}
                      >
                        <Text style={styles.s5CTATxt}>
                          {emailLoading ? 'ENVOI...' : 'DÉMARRER MON SUIVI'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.s5Ghost}
                        onPress={() => transitionTo('welcome')}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.s5GhostTxt}>Commencer sans compte</Text>
                        <ChevronRight size={14} color="rgba(255,255,255,0.4)" strokeWidth={2} />
                      </TouchableOpacity>
                    </>
                  )}
                </View>

                <View style={styles.s5Legal}>
                  <Text style={styles.s5LegalTxt}>
                    En continuant, tu acceptes nos{' '}
                    <Text style={styles.s5LegalLink} onPress={() => router.push('/legal/cgu')}>Conditions d'utilisation</Text>
                    {' '}et notre{' '}
                    <Text style={styles.s5LegalLink} onPress={() => router.push('/legal/privacy')}>Politique de confidentialité</Text>
                    {' '}(RGPD). Tu consens au traitement de tes données de santé au sens de l'art. 9 du RGPD, sous le contrôle de la CNIL.
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
                    returnKeyType="done"
                    autoCapitalize="words"
                    autoCorrect={false}
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
                      <TextInput
                        style={styles.mInput}
                        value={vals[k]}
                        onChangeText={sets[k]}
                        keyboardType="numeric"
                        inputMode="numeric"
                        placeholder={ph}
                        placeholderTextColor="rgba(226,209,179,0.22)"
                        textAlign="center"
                        autoCorrect={false}
                      />
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
                      <TextInput
                        style={styles.mInput}
                        value={vals[k]}
                        onChangeText={sets[k]}
                        keyboardType="numeric"
                        inputMode="numeric"
                        placeholder={ph}
                        placeholderTextColor="rgba(255,255,255,0.14)"
                        textAlign="center"
                        autoCorrect={false}
                      />
                      <Text style={styles.mUnit}>{unit}</Text>
                    </View>
                  ))}
                  <View style={styles.mFiller} />
                </View>
                <TouchableOpacity
                  style={styles.scanBtn}
                  onPress={() => Alert.alert('Bientôt disponible', 'Scanner ton ticket de balance — disponible très prochainement ✨')}
                  activeOpacity={0.8}
                >
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

  // ── Background glows (non-login steps) ────────────────────────────────────
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

  // ── Progress bar ──────────────────────────────────────────────────────────
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
  // SLIDE 1 — Entrée Immersive Premium
  // ══════════════════════════════════════════════════════════════════════════
  slide1: {
    minHeight: H,
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 36,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  s1Glow: {
    position: 'absolute', top: -120, alignSelf: 'center',
    width: W * 0.9, height: 340, borderRadius: 999,
    backgroundColor: 'rgba(80,120,255,0.07)',
    ...(Platform.OS === 'web' ? { filter: 'blur(90px)' } as any : {}),
  },
  s1Header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  s1LogoBadge: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  s1LogoEmoji: { fontSize: 16 },
  s1Brand: { fontSize: 13, fontWeight: '800', color: 'rgba(255,255,255,0.55)', letterSpacing: 6 },

  s1Hero: { alignItems: 'center', gap: 14 },
  s1Title: {
    fontSize: 56, fontWeight: '900', color: '#FFFFFF',
    letterSpacing: -1.5, textAlign: 'center',
    ...(Platform.OS === 'web' ? { textShadow: '0 0 80px rgba(255,255,255,0.12)' } as any : {}),
  },
  s1Tagline: {
    fontSize: 13, fontWeight: '700',
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 2.5, textAlign: 'center', textTransform: 'uppercase', lineHeight: 22,
  },
  s1Sub: { fontSize: 12, color: '#8E9AA8', letterSpacing: 0.4, textAlign: 'center' },

  s1Auth: { gap: 12 },
  s1Input: {
    height: 54,
    backgroundColor: '#111827',
    borderRadius: Radius.full,
    paddingHorizontal: 24,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  s1CTA: {
    height: 54,
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? { boxShadow: '0 8px 32px rgba(255,255,255,0.15)' } as any : {}),
  },
  s1CTATxt: { fontSize: 14, fontWeight: '800', color: '#050A12', letterSpacing: 2 },
  s1Ghost: {
    height: 54,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  s1GhostTxt: { fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.55)' },

  s1ScrollHint: { alignItems: 'center', gap: 4 },
  s1ScrollTxt: { fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: 3, textTransform: 'uppercase' },

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 2 — 3D Avatar & Nutrition — Fond Blanc
  // ══════════════════════════════════════════════════════════════════════════
  slide2: {
    minHeight: H,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 56,
    gap: 24,
    justifyContent: 'center',
  },
  s2Tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: Radius.full,
    backgroundColor: '#F3F4F6',
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  s2TagTxt: { fontSize: 10, fontWeight: '800', color: '#6B7280', letterSpacing: 1.8, textTransform: 'uppercase' },
  s2Title: { fontSize: 28, fontWeight: '900', color: '#050A12', letterSpacing: -0.8, lineHeight: 34 },
  s2Desc: { fontSize: 14, color: '#4B5563', lineHeight: 22 },
  s2Card: {
    backgroundColor: '#F9FAFB',
    borderRadius: 20, padding: 20, gap: 14,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  s2CardTitle: { fontSize: 10, fontWeight: '800', color: '#9CA3AF', letterSpacing: 2, textTransform: 'uppercase' },
  s2B2BRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  s2Pill: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: '#050A12',
  },
  s2PillTxt: { fontSize: 12, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.3 },

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 3 — Précision Clinique — Fond Sombre
  // ══════════════════════════════════════════════════════════════════════════
  slide3: {
    minHeight: H,
    paddingHorizontal: 24,
    paddingVertical: 56,
    gap: 24,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  s3Tag: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(0,200,212,0.1)',
    borderWidth: 1, borderColor: 'rgba(0,200,212,0.25)',
  },
  s3TagTxt: { fontSize: 10, fontWeight: '800', color: Colors.teal, letterSpacing: 1.8 },
  s3Title: { fontSize: 28, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.8, lineHeight: 34 },
  s3Desc: { fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 22 },
  s3Dashboard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20, padding: 18, gap: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  s3EcgBox: {
    backgroundColor: 'rgba(0,200,212,0.06)',
    borderRadius: 12, padding: 14, gap: 0,
  },
  s3EcgLabel: { fontSize: 9, fontWeight: '800', color: Colors.teal, letterSpacing: 2, textTransform: 'uppercase' },
  s3Bpm: { fontSize: 22, fontWeight: '900', color: '#FFFFFF', marginTop: 6, letterSpacing: -0.5 },
  s3BpmUnit: { fontSize: 12, fontWeight: '400', color: 'rgba(255,255,255,0.4)' },
  s3ProgramsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  s3ProgramBadge: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: Radius.full,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  s3ProgramTxt: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.6)' },

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 4 — Logistique Centralisée — Fond Blanc
  // ══════════════════════════════════════════════════════════════════════════
  slide4: {
    minHeight: H,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 56,
    gap: 24,
    justifyContent: 'center',
  },
  s4Tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: Radius.full,
    backgroundColor: '#F3F4F6',
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  s4TagTxt: { fontSize: 10, fontWeight: '800', color: '#6B7280', letterSpacing: 1.8, textTransform: 'uppercase' },
  s4Title: { fontSize: 28, fontWeight: '900', color: '#050A12', letterSpacing: -0.8, lineHeight: 34 },
  s4Desc: { fontSize: 14, color: '#4B5563', lineHeight: 22 },
  s4Card: {
    backgroundColor: '#F9FAFB',
    borderRadius: 20, padding: 20, gap: 18,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  s4CardTitle: { fontSize: 10, fontWeight: '800', color: '#9CA3AF', letterSpacing: 2, textTransform: 'uppercase' },
  s4Connector: { flex: 1, height: 1.5, backgroundColor: '#E5E7EB', marginTop: 22, marginHorizontal: -6 },
  s4Badges: { gap: 10 },
  s4Badge: {
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  s4BadgeTxt: { fontSize: 13, fontWeight: '600', color: '#374151' },

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 5 — B2B & Finisher — Fond Sombre
  // ══════════════════════════════════════════════════════════════════════════
  slide5: {
    minHeight: H,
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 40,
    gap: 28,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  s5B2BCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20, padding: 20, gap: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  s5B2BIconRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  s5B2BChip: { fontSize: 10, fontWeight: '800', color: Colors.accent, letterSpacing: 2, textTransform: 'uppercase' },
  s5B2BTitle: { fontSize: 17, fontWeight: '800', color: '#FFFFFF', lineHeight: 26 },
  s5B2BDesc: { fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 20 },

  s5TrustBlock: { gap: 10, paddingHorizontal: 4 },

  s5CTAZone: { gap: 12 },
  s5Input: {
    height: 54,
    backgroundColor: '#111827',
    borderRadius: Radius.full,
    paddingHorizontal: 24,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  s5CTA: {
    height: 54,
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? { boxShadow: '0 8px 32px rgba(255,255,255,0.12)' } as any : {}),
  },
  s5CTATxt: { fontSize: 14, fontWeight: '800', color: '#050A12', letterSpacing: 2 },
  s5Ghost: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    paddingVertical: 14,
  },
  s5GhostTxt: { fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.4)' },

  s5Legal: { gap: 8, alignItems: 'center' },
  s5LegalTxt: { fontSize: 11, color: 'rgba(255,255,255,0.2)', textAlign: 'center', lineHeight: 17, letterSpacing: 0.2 },
  s5LegalRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'center' },
  s5LegalLink: { fontSize: 11, color: 'rgba(255,255,255,0.32)', textDecorationLine: 'underline' },
  s5LegalSep: { fontSize: 11, color: 'rgba(255,255,255,0.15)' },

  // ══════════════════════════════════════════════════════════════════════════
  // Email sent (shared)
  // ══════════════════════════════════════════════════════════════════════════
  emailSentBox: { alignItems: 'center', gap: 8, paddingVertical: 20 },
  emailSentTxt: { fontSize: 20, color: Colors.text, fontWeight: '700' },
  emailSentSub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },

  // ══════════════════════════════════════════════════════════════════════════
  // Welcome / Goal / Measures (unchanged)
  // ══════════════════════════════════════════════════════════════════════════
  screen: {
    flex: 1, paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl, paddingBottom: Spacing.xl,
    justifyContent: 'space-between', gap: Spacing.lg,
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

  mGrid:    { flexDirection: 'row', gap: 8 },
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
  ctaOff: { opacity: 0.35 },
  ctaTxt: { fontSize: 17, fontWeight: '800', color: '#2a2a2a', letterSpacing: 0.2 },
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
