import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Dimensions, Animated, Platform, Alert, Keyboard, ScrollView, Image, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Flame, TrendingUp, Shield, ChevronRight, ChevronLeft, ScanLine,
  Activity, Users, ChevronDown, Bot, Mail,
} from 'lucide-react-native';
import { useShallow } from 'zustand/react/shallow';
import { useUserStore, Gender, Goal } from '@/store/userStore';
import { supabase } from '@/lib/supabase';
import { Colors, Spacing, Radius } from '@/constants/theme';
import * as Haptics from 'expo-haptics';

const { width: W, height: H } = Dimensions.get('window');
const PROFILE_CARD_W = Math.round(W * 0.76);
const PROFILE_GAP = 12;
const PROFILES = [
  {
    title: 'MUSCULATION & PROGRAMMATION',
    subTag: '(renforcement musculaire)',
    desc: "Que votre objectif soit une prise de masse, une perte de poids, de l'entretien ou du renforcement fonctionnel et adapté (APA / Santé), notre système s'ajuste à chaque profil, du débutant absolu à l'athlète exigeant. Cette carte débloque un écosystème unique : bénéficiez de protocoles évolutifs automatisés, connectés directement à une plateforme de suivi personnalisé. Que ce soit avec mes propres programmes ou via votre coach et salle de sport partenaire, chaque professionnel peut piloter, valider et vous envoyer vos séances sur mesure pour un accompagnement à la fois humain, sécurisé et ultra-précis.",
    accent: '#00C8D4', emoji: '💪', tag: 'UNIVERS DE LA MUSCULATION',
    trioImg: require('../assets/avatars/musculation_trio.jpeg'),
  },
  {
    title: 'SPORT GRAND PUBLIC',
    subTag: '(toutes disciplines)',
    desc: 'Que vous pratiquiez le cyclisme, la course à pied, la natation, ou que vous suiviez un parcours de santé et de renforcement adapté (APA), notre système s\'ajuste à votre réalité. Pour nous, chaque pratiquant, du senior dynamique à l\'athlète confirmé mérite la même exigence. La plateforme assure une continuité parfaite de votre entraînement : via mon accompagnement, celui de votre entraîneur ou l\'automatisation de vos objectifs, l\'écosystème planifie des blocs de cardio et des séances complémentaires adaptés à votre rythme pour préserver votre capital physique et surclasser vos performances.',
    accent: '#00C8D4', emoji: undefined, tag: 'TOUS SPORTS',
    trioImg: require('../assets/avatars/sports_trio.jpeg'),
  },
  {
    title: 'SUIVI MÉDICAL & APA',
    subTag: undefined,
    desc: 'Que vous soyez en post-rééducation, en ALD, ou en situation de handicap, notre plateforme concrétise la passerelle entre la médecine et le mouvement. METABOOST s\'adapte aux besoins spécifiques de chaque pathologie grâce à des protocoles sécurisés, des fiches configurables et une interface simplifiée garantissant une accessibilité universelle. En connectant vos données biométriques, le système assure un suivi clinique et rigoureux de votre tolérance à l\'effort. Plus qu\'un carnet de bord, l\'écosystème génère instantanément des rapports scientifiques chiffrés, offrant aux professionnels de santé, médecins et kinésithérapeutes, la preuve incontestable de votre assiduité et de vos progrès.',
    accent: '#E2AA27', emoji: '🩺', tag: 'MÉDICAL & APA',
    trioImg: require('../assets/avatars/medical_apa_card.jpeg'),
    imgSmall: true,
  },
  {
    title: 'SYSTÈME DE FRANCHISE',
    subTag: '(pour les professionnels)',
    desc: "Propulsez votre structure avec une technologie que vous pouvez totalement vous approprier. METABOOST s'adapte à votre vision : utilisez notre méthode pré-intégrée ou programmez vos propres séances et injectez votre propre méthodologie d'entraînement. L'application devient votre outil central pour planifier l'activité, communiquer en direct et offrir à vos adhérents un suivi d'évolution ultra-poussé (nutrition IA, courbes de progression, bilans). Pilotez vos équipes au quotidien et valorisez votre expertise en partageant des rapports cliniques sécurisés avec les professionnels de santé. Une solution clé en main ou en marque blanche, simple et puissante, pour digitaliser votre activité et fidéliser votre communauté sans aucun coût de développement.",
    accent: '#E2AA27',
    emoji: '🏢',
    tag: 'PRO & STRUCTURES',
    trioImg: require('../assets/avatars/franchise_card.png'),
    imgSmall: true,
  },
];

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

function AvatarBlock() {
  const liveDot = useRef(new Animated.Value(1)).current;
  const float1  = useRef(new Animated.Value(0)).current;
  const float2  = useRef(new Animated.Value(6)).current;
  const float3  = useRef(new Animated.Value(0)).current;
  const [bpm,   setBpm]   = useState(72);
  const [vo2,   setVo2]   = useState(48);
  const [steps, setSteps] = useState(8432);
  const [fat,   setFat]   = useState(22.4);

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(liveDot, { toValue: 0, duration: 600, useNativeDriver: true }),
      Animated.timing(liveDot, { toValue: 1, duration: 600, useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(float1, { toValue: -10, duration: 2000, useNativeDriver: true }),
      Animated.timing(float1, { toValue: 0,   duration: 2000, useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(float2, { toValue: -4, duration: 2200, useNativeDriver: true }),
      Animated.timing(float2, { toValue: 6,  duration: 2200, useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(float3, { toValue: -8, duration: 1900, useNativeDriver: true }),
      Animated.timing(float3, { toValue: 0,  duration: 1900, useNativeDriver: true }),
    ])).start();
    const t = setInterval(() => {
      setBpm(b   => b   >= 148   ? 72   : b + 2);
      setVo2(v   => v   >= 54    ? 48   : v + 1);
      setSteps(s => s   >= 10000 ? 8432 : s + 68);
      setFat(f   => parseFloat((f <= 20.8 ? 22.4 : f - 0.1).toFixed(1)));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#E2AA27', alignItems: 'center', justifyContent: 'flex-start', gap: 8, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16 }}>

      {/* Live badge */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <Animated.View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFFFFF', opacity: liveDot }} />
        <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '800', letterSpacing: 3 }}>LIVE</Text>
      </View>

      {/* Carte 1 — Rythme cardiaque */}
      <Animated.View style={[{
        backgroundColor: '#FFFFFF', borderRadius: 22, padding: 12, width: '90%',
        alignSelf: 'flex-start', marginLeft: 8,
        shadowColor: '#000', shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.18, shadowRadius: 24, elevation: 12,
      }, { transform: [{ translateY: float1 }, { rotate: '-3deg' }] }]}>
        <Text style={{ fontSize: 10, fontWeight: '700', color: '#9CA3AF', letterSpacing: 1.5, textTransform: 'uppercase' as any, marginBottom: 4 }}>Rythme cardiaque</Text>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
          <Text style={{ fontSize: 36, fontWeight: '900', color: '#EF4444', letterSpacing: -1 }}>{bpm}</Text>
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#EF4444' }}>BPM</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, height: 22 }}>
          {[1,2,2,1,2,14,3,10,3,1,2,1,2,12,3,9,2,1,2,1,2,10,3].map((h, i) => (
            <View key={i} style={{ width: 3.5, height: Math.max(2, h * 1.5), backgroundColor: '#EF4444', borderRadius: 2, opacity: i < 11 ? 0.25 + i * 0.06 : 1 }} />
          ))}
        </View>
      </Animated.View>

      {/* Carte 2 — Steps + VO2 */}
      <Animated.View style={[{
        backgroundColor: '#FFFFFF', borderRadius: 22, padding: 12, width: '90%',
        alignSelf: 'flex-end', marginRight: 8,
        shadowColor: '#000', shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.18, shadowRadius: 24, elevation: 12,
      }, { transform: [{ translateY: float2 }, { rotate: '2deg' }] }]}>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: '#9CA3AF', letterSpacing: 1.5, textTransform: 'uppercase' as any, marginBottom: 4 }}>Pas</Text>
            <Text style={{ fontSize: 22, fontWeight: '900', color: '#111827', letterSpacing: -0.5 }}>{steps.toLocaleString('fr-FR')}</Text>
          </View>
          <View style={{ width: 1, backgroundColor: '#F3F4F6', marginVertical: 4 }} />
          <View style={{ flex: 1, paddingLeft: 12 }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: '#9CA3AF', letterSpacing: 1.5, textTransform: 'uppercase' as any, marginBottom: 4 }}>VO₂ Max</Text>
            <Text style={{ fontSize: 22, fontWeight: '900', color: '#E2AA27', letterSpacing: -0.5 }}>{vo2}</Text>
          </View>
        </View>
        <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F3F4F6' }}>
          <Text style={{ fontSize: 10, fontWeight: '700', color: '#9CA3AF', letterSpacing: 1.5, textTransform: 'uppercase' as any, marginBottom: 3 }}>Masse grasse</Text>
          <Text style={{ fontSize: 18, fontWeight: '900', color: '#111827' }}>{fat}<Text style={{ fontSize: 12, color: '#6B7280' }}>%</Text></Text>
        </View>
      </Animated.View>

      {/* Carte 3 — Objectif semaine */}
      <Animated.View style={[{
        backgroundColor: '#FFFFFF', borderRadius: 22, padding: 12, width: '90%',
        alignSelf: 'flex-start', marginLeft: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.18, shadowRadius: 24, elevation: 12,
      }, { transform: [{ translateY: float3 }, { rotate: '-2deg' }] }]}>
        <Text style={{ fontSize: 10, fontWeight: '700', color: '#9CA3AF', letterSpacing: 1.5, textTransform: 'uppercase' as any, marginBottom: 4 }}>Objectif semaine</Text>
        <Text style={{ fontSize: 28, fontWeight: '900', color: '#111827', letterSpacing: -1 }}>-1.0 <Text style={{ fontSize: 15, color: '#6B7280' }}>kg</Text></Text>
        <View style={{ marginTop: 8 }}>
          <View style={{ height: 3, backgroundColor: '#F3F4F6', borderRadius: 2, overflow: 'hidden' as any }}>
            <View style={{ width: '75%', height: '100%', backgroundColor: '#E2AA27', borderRadius: 2 }} />
          </View>
          <Text style={{ fontSize: 10, fontWeight: '600', color: '#9CA3AF', marginTop: 4 }}>75% complété</Text>
        </View>
      </Animated.View>
    </View>
  );
}

function NutritionBlock() {
  const dotAnim   = useRef(new Animated.Value(1)).current;
  const laserAnim = useRef(new Animated.Value(0)).current;
  const floatA    = useRef(new Animated.Value(0)).current;
  const floatB    = useRef(new Animated.Value(4)).current;
  const [protein, setProtein] = useState(28);
  const [carbs,   setCarbs]   = useState(42);
  const [lipids,  setLipids]  = useState(12);
  const [kcal,    setKcal]    = useState(384);

  const phoneW = Math.round(W * 0.48);
  const phoneH = Math.round(phoneW * 2.02);
  const foodH  = phoneH - 28 - 54;
  const cW     = W - 24;

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(dotAnim,   { toValue: 0, duration: 700, useNativeDriver: true }),
      Animated.timing(dotAnim,   { toValue: 1, duration: 700, useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(laserAnim, { toValue: foodH - 4, duration: 2000, useNativeDriver: true }),
      Animated.timing(laserAnim, { toValue: 0,          duration: 80,   useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(floatA, { toValue: -9, duration: 2200, useNativeDriver: true }),
      Animated.timing(floatA, { toValue: 0,  duration: 2200, useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(floatB, { toValue: -5, duration: 2000, useNativeDriver: true }),
      Animated.timing(floatB, { toValue: 4,  duration: 2000, useNativeDriver: true }),
    ])).start();
    const t = setInterval(() => {
      setProtein(p => p >= 34 ? 28 : p + 1);
      setCarbs(c   => c >= 50 ? 42 : c + 1);
      setLipids(l  => l >= 16 ? 12 : l + 1);
      setKcal(k    => k >= 422 ? 384 : k + 6);
    }, 1200);
    return () => clearInterval(t);
  }, []);

  const cardW = Math.round(cW * 0.38);

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}>

      {/* Badge SCAN EN COURS */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 }}>
        <Animated.View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#10B981', opacity: dotAnim }} />
        <Text style={{ color: '#10B981', fontSize: 10, fontWeight: '800', letterSpacing: 2.5 }}>ANALYSE EN COURS...</Text>
      </View>

      {/* Phone + floating cards container */}
      <View style={{ width: cW, height: phoneH, alignItems: 'center' }}>

        {/* Phone frame */}
        <View style={{
          width: phoneW, height: phoneH, borderRadius: 32,
          backgroundColor: '#ECFDF5',
          borderWidth: 2, borderColor: '#A7F3D0',
          overflow: 'hidden',
          shadowColor: '#10B981', shadowOffset: { width: 0, height: 16 },
          shadowOpacity: 0.16, shadowRadius: 36, elevation: 18,
        }}>
          {/* Status bar */}
          <View style={{ height: 28, backgroundColor: '#D1FAE5', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 8, fontWeight: '800', color: '#059669', letterSpacing: 1.5 }}>METABOOST EAT</Text>
          </View>

          {/* Food area */}
          <View style={{ height: foodH, backgroundColor: '#F0FDF4', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <View style={{ width: phoneW * 0.82, height: phoneW * 0.82, borderRadius: phoneW * 0.41, backgroundColor: '#D1FAE5', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#A7F3D0' }}>
              <Text style={{ fontSize: phoneW * 0.30 }}>🥗</Text>
            </View>
            {/* Laser line */}
            <Animated.View style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 2, backgroundColor: '#10B981', opacity: 0.9, shadowColor: '#10B981', shadowOpacity: 1, shadowRadius: 6, shadowOffset: { width: 0, height: 0 }, transform: [{ translateY: laserAnim }] }} />
            {/* Laser glow */}
            <Animated.View style={{ position: 'absolute', left: 0, right: 0, top: -4, height: 10, backgroundColor: '#10B981', opacity: 0.15, transform: [{ translateY: laserAnim }] }} />
          </View>

          {/* Bottom kcal */}
          <View style={{ flex: 1, backgroundColor: '#FFFFFF', paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#D1FAE5', justifyContent: 'center' }}>
            <Text style={{ fontSize: 8, fontWeight: '700', color: '#9CA3AF', letterSpacing: 1.5, marginBottom: 2 }}>CALORIES</Text>
            <Text style={{ fontSize: 20, fontWeight: '900', color: '#111827' }}>{kcal}<Text style={{ fontSize: 10, color: '#9CA3AF', fontWeight: '500' }}> kcal</Text></Text>
          </View>
        </View>

        {/* Floating card: MACROS */}
        <Animated.View style={[{
          position: 'absolute', left: 0, top: Math.round(phoneH * 0.13),
          backgroundColor: '#FFFFFF', borderRadius: 16, padding: 11, width: cardW,
          shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.10, shadowRadius: 18, elevation: 10,
          borderWidth: 1, borderColor: '#F3F4F6',
        }, { transform: [{ translateY: floatA }, { rotate: '-3deg' }] }]}>
          <Text style={{ fontSize: 7, fontWeight: '800', color: '#9CA3AF', letterSpacing: 1.5, marginBottom: 7 }}>MACROS DÉTECTÉES</Text>
          {[
            { label: 'Protéines', val: `${protein}g`, color: '#F59E0B' },
            { label: 'Glucides',  val: `${carbs}g`,   color: '#10B981' },
            { label: 'Lipides',   val: `${lipids}g`,  color: '#94A3B8' },
          ].map(({ label, val, color }) => (
            <View key={label} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: color }} />
                <Text style={{ fontSize: 9, color: '#6B7280', fontWeight: '600' }}>{label}</Text>
              </View>
              <Text style={{ fontSize: 10, fontWeight: '900', color: '#111827' }}>{val}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Floating card: PANIER */}
        <Animated.View style={[{
          position: 'absolute', right: 0, top: Math.round(phoneH * 0.53),
          backgroundColor: '#FFFFFF', borderRadius: 16, padding: 11, width: cardW,
          shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.10, shadowRadius: 18, elevation: 10,
          borderWidth: 1, borderColor: '#F3F4F6',
        }, { transform: [{ translateY: floatB }, { rotate: '3deg' }] }]}>
          <Text style={{ fontSize: 7, fontWeight: '800', color: '#9CA3AF', letterSpacing: 1.5, marginBottom: 6 }}>PANIER OPTIMISÉ</Text>
          <Text style={{ fontSize: 15, fontWeight: '900', color: '#111827' }}>3,80 €<Text style={{ fontSize: 9, color: '#9CA3AF', fontWeight: '500' }}> / portion</Text></Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 }}>
            <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: '#10B981' }} />
            <Text style={{ fontSize: 9, fontWeight: '700', color: '#10B981' }}>Budget optimisé ✓</Text>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const LOGISTIQUE_HERO = require('../assets/images/logistique_hero.jpeg');
const REPORTING_HERO = require('../assets/images/reporting_hero.jpeg');

const LOG_STEPS = [
  { emoji: '📋',  label: 'Feuille de route',    sub: 'Validée par la structure' },
  { emoji: '🗺️', label: 'Itinéraire optimisé', sub: 'Multi-arrêts calculés'    },
  { emoji: '📲',  label: 'Prise en contact',    sub: 'SMS / Alerte automatique' },
  { emoji: '🏋️', label: 'Arrivée validée',     sub: 'Musculation démarrée'    },
];

function LogistiqueBlock() {
  const imgSize = Math.round(Math.min(W * 0.88, H * 0.40));
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActiveStep(s => (s + 1) % 4), 2500);
    return () => clearInterval(t);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center' }}>

      {/* ── Zone image hero — taille carrée naturelle, aucun recadrage ── */}
      <View style={{
        width: imgSize, height: imgSize,
        borderRadius: 24, overflow: 'hidden' as any,
        backgroundColor: '#E2AA27',
        shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.10, shadowRadius: 20, elevation: 6,
        marginBottom: 8,
      }}>
        {LOGISTIQUE_HERO ? (
          <Image
            source={LOGISTIQUE_HERO}
            style={{ width: imgSize, height: imgSize }}
            resizeMode="contain"
          />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Text style={{ fontSize: 48 }}>🚌</Text>
          </View>
        )}
      </View>

      {/* ── Timeline 4 étapes ── */}
      <View style={{ paddingHorizontal: 20, paddingTop: 36, paddingBottom: 16 }}>

        {/* Ligne de connexion horizontale */}
        <View style={{ position: 'absolute' as any, top: 36 + 20, left: 20 + 20, right: 20 + 20, height: 1, backgroundColor: '#E5E7EB' }} />

        <View style={{ flexDirection: 'row' as any, justifyContent: 'space-between' as any }}>
          {LOG_STEPS.map(({ emoji, label, sub }, i) => {
            const active = i === activeStep;
            return (
              <View key={i} style={{ alignItems: 'center' as any, width: Math.round((W - 40) / 4) }}>
                <View style={{
                  width: 44, height: 44, borderRadius: 14,
                  backgroundColor: active ? '#FFFBEB' : '#FAFAFA',
                  borderWidth: 1.5,
                  borderColor: active ? '#E2AA27' : '#E5E7EB',
                  alignItems: 'center' as any, justifyContent: 'center' as any,
                  shadowColor: active ? '#E2AA27' : '#000',
                  shadowOffset: { width: 0, height: active ? 4 : 2 },
                  shadowOpacity: active ? 0.18 : 0.04,
                  shadowRadius: active ? 12 : 6,
                  elevation: active ? 4 : 1,
                  marginBottom: 8,
                  ...(Platform.OS === 'web' ? { transition: 'all 0.45s ease' } as any : {}),
                }}>
                  <Text style={{ fontSize: 20 }}>{emoji}</Text>
                </View>
                <Text style={{
                  fontSize: 9,
                  fontWeight: active ? '800' : '500' as any,
                  color: active ? '#0D1117' : '#9CA3AF',
                  textAlign: 'center' as any, lineHeight: 13,
                  ...(Platform.OS === 'web' ? { transition: 'all 0.45s ease' } as any : {}),
                }}>{label}</Text>
                <Text style={{ fontSize: 8, color: '#B0B8C4', textAlign: 'center' as any, marginTop: 2, lineHeight: 12 }}>{sub}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

const REPORT_TABS = [
  {
    key: 'adherent',
    label: 'Adhérent',
    color: '#E2AA27',
    icon: '🏅',
    title: 'Bilan Mensuel — Mai 2025',
    lines: [
      { label: 'Séances réalisées', value: '18 / 20', accent: true },
      { label: 'Score progression', value: '+14 pts', accent: true },
      { label: 'IMC estimé', value: '23.1', accent: false },
      { label: 'Objectif atteint', value: '✓ En bonne voie', accent: false },
    ],
    badge: 'FORMAT MOTIVANT',
  },
  {
    key: 'coach',
    label: 'Coach',
    color: '#3B82F6',
    icon: '📈',
    title: 'Rapport de Performance',
    lines: [
      { label: 'Charge hebdo moy.', value: '2 340 kg', accent: true },
      { label: 'Volume progressif', value: '+8.2 %', accent: true },
      { label: 'FC de repos', value: '58 bpm', accent: false },
      { label: 'Assiduité', value: '90 %', accent: false },
    ],
    badge: 'SUIVI PERFORMANCE',
  },
  {
    key: 'institutionnel',
    label: 'Institutionnel',
    color: '#10B981',
    icon: '🏛️',
    title: 'Bilan Clinique — Partenaire',
    lines: [
      { label: 'Pathologie suivie', value: 'Diabète T2', accent: false },
      { label: 'Tolérance à l\'effort', value: 'Grade B', accent: true },
      { label: 'Protocole APA certifié', value: '✓ Validé', accent: true },
      { label: 'Rapport transmis à', value: 'Médecin + Kiné', accent: false },
    ],
    badge: 'FORMAT CLINIQUE',
  },
];

const STAT_TILES = [
  { color: '#E2AA27', label: 'ADHÉRENT',      icon: '🏅', stat: '18/20',  desc: 'séances\nréalisées' },
  { color: '#3B82F6', label: 'COACH',          icon: '📈', stat: '+8.2%', desc: 'progression\ndu volume'  },
  { color: '#10B981', label: 'INSTITUTIONNEL', icon: '🏛️', stat: 'APA ✓', desc: 'protocole\nvalidé'     },
];

function ReportingBlock() {
  const [activeTab, setActiveTab] = useState(0);
  const underlineX = useRef(new Animated.Value(0)).current;
  const tabW = Math.round((W - 48) / 3);
  const heroH = W - 48; // full square — image is 1024x1024

  useEffect(() => {
    const t = setInterval(() => setActiveTab(s => (s + 1) % 3), 2800);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    Animated.spring(underlineX, {
      toValue: activeTab * tabW,
      useNativeDriver: true,
      tension: 140, friction: 12,
    }).start();
  }, [activeTab]);

  const tab = REPORT_TABS[activeTab];

  return (
    <View style={{ backgroundColor: '#FFFFFF', paddingTop: 8 }}>

      {/* Hero image */}
      <View style={{
        width: W - 48, height: heroH, borderRadius: 20,
        overflow: 'hidden' as any, alignSelf: 'center' as any,
        shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.10, shadowRadius: 16, elevation: 5,
        marginBottom: 10,
      }}>
        <Image
          source={REPORTING_HERO}
          style={{ width: W - 48, height: W - 48, position: 'absolute' as any, top: 0 }}
          resizeMode="cover"
        />
      </View>

      {/* Underline selector */}
      <View style={{ paddingHorizontal: 24, marginBottom: 10 }}>
        <View style={{ flexDirection: 'row' as any }}>
          {REPORT_TABS.map((t, i) => {
            const active = i === activeTab;
            return (
              <TouchableOpacity key={t.key} onPress={() => setActiveTab(i)} activeOpacity={0.7}
                style={{ flex: 1, alignItems: 'center' as any, paddingVertical: 7 }}>
                <View style={{ flexDirection: 'row' as any, alignItems: 'center' as any, gap: 6 }}>
                  <View style={{
                    width: 7, height: 7, borderRadius: 4,
                    backgroundColor: active ? t.color : '#D1D5DB',
                    ...(Platform.OS === 'web' ? { transition: 'background-color 0.35s ease' } as any : {}),
                  }} />
                  <Text style={{
                    fontSize: 13, fontWeight: active ? '800' : '500' as any,
                    color: active ? '#0D1117' : '#9CA3AF',
                    ...(Platform.OS === 'web' ? { transition: 'all 0.35s ease' } as any : {}),
                  }}>{t.label}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={{ height: 1, backgroundColor: '#F0F0F0' }}>
          <Animated.View style={{
            width: tabW, height: 2, borderRadius: 1,
            backgroundColor: tab.color, marginTop: -0.5,
            transform: [{ translateX: underlineX }],
            ...(Platform.OS === 'web' ? { transition: 'background-color 0.35s ease' } as any : {}),
          }} />
        </View>
      </View>

      {/* Document card */}
      <View style={{
        marginHorizontal: 24, borderRadius: 18,
        backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EBEBEB',
        overflow: 'hidden' as any,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06, shadowRadius: 16, elevation: 3,
      }}>
        <View style={{
          backgroundColor: '#0D1117', paddingHorizontal: 16, paddingVertical: 10,
          flexDirection: 'row' as any, alignItems: 'center' as any, gap: 12,
        }}>
          <View style={{ width: 3, alignSelf: 'stretch' as any, borderRadius: 2, backgroundColor: tab.color }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 9, fontWeight: '700' as any, color: tab.color, letterSpacing: 1.4, textTransform: 'uppercase' as any, marginBottom: 3 }}>{tab.badge}</Text>
            <Text style={{ fontSize: 13, fontWeight: '800' as any, color: '#FFFFFF', lineHeight: 17 }}>{tab.title}</Text>
          </View>
          <Text style={{ fontSize: 22 }}>{tab.icon}</Text>
        </View>
        <View style={{ padding: 8, gap: 6 }}>
          <View style={{ flexDirection: 'row' as any, gap: 6 }}>
            {tab.lines.slice(0, 2).map((line, i) => (
              <View key={i} style={{ flex: 1, backgroundColor: '#FAFAFA', borderRadius: 10, padding: 8, borderWidth: 1, borderColor: '#F3F4F6' }}>
                <Text style={{ fontSize: 9, color: '#9CA3AF', fontWeight: '600' as any, marginBottom: 3, letterSpacing: 0.3 }}>{line.label}</Text>
                <Text style={{ fontSize: 14, fontWeight: '900' as any, color: line.accent ? tab.color : '#0D1117' }}>{line.value}</Text>
              </View>
            ))}
          </View>
          <View style={{ flexDirection: 'row' as any, gap: 6 }}>
            {tab.lines.slice(2, 4).map((line, i) => (
              <View key={i} style={{ flex: 1, backgroundColor: '#FAFAFA', borderRadius: 10, padding: 8, borderWidth: 1, borderColor: '#F3F4F6' }}>
                <Text style={{ fontSize: 9, color: '#9CA3AF', fontWeight: '600' as any, marginBottom: 3, letterSpacing: 0.3 }}>{line.label}</Text>
                <Text style={{ fontSize: 14, fontWeight: '900' as any, color: line.accent ? tab.color : '#0D1117' }}>{line.value}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={{ flexDirection: 'row' as any, alignItems: 'center' as any, justifyContent: 'space-between' as any, paddingHorizontal: 16, paddingVertical: 7, borderTopWidth: 1, borderTopColor: '#F3F4F6' }}>
          <View style={{ flexDirection: 'row' as any, alignItems: 'center' as any, gap: 6 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' }} />
            <Text style={{ fontSize: 10, color: '#9CA3AF' }}>PDF · RGPD · Signé</Text>
          </View>
          <Text style={{ fontSize: 11, fontWeight: '800' as any, color: tab.color }}>Exporter →</Text>
        </View>
      </View>
    </View>
  );
}

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

const LEGAL_CONTENT = {
  mentions: {
    title: 'Mentions Légales',
    sections: [
      { heading: 'Éditeur du site', body: "Association MetaBoost (Loi 1901)\nSiège social : Guyane\nRNA : En cours de déclaration\nDirecteur de la publication : Le Président de l'Association MetaBoost\nContact : metaboost@gmail.com" },
      { heading: 'Hébergement', body: "Le site est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA.\nTéléphone : +1 (551) 800-5645\nEmail : privacy@vercel.com" },
      { heading: 'Propriété intellectuelle', body: "L'ensemble des contenus présents sur ce site (textes, images, logos, vidéos, bases de données) sont la propriété exclusive de l'Association MetaBoost ou de ses partenaires. Toute reproduction, distribution ou utilisation sans autorisation préalable est strictement interdite." },
      { heading: 'Limitation de responsabilité', body: "L'Association MetaBoost s'efforce d'assurer l'exactitude des informations diffusées sur ce site. Toutefois, nous ne pouvons garantir l'exhaustivité ou l'absence d'erreurs. L'utilisation des informations se fait sous la seule responsabilité de l'utilisateur." },
    ],
  },
  privacy: {
    title: 'Politique de Confidentialité',
    sections: [
      { heading: 'Responsable du traitement', body: "Association MetaBoost — metaboost@gmail.com" },
      { heading: 'Conditions d\'accès et Avertissement Médical', body: "L'Association MetaBoost n'est pas un établissement médical et ne dispense aucun conseil ni diagnostic médical. L'utilisateur reconnaît que l'ensemble des données (rythme cardiaque, IMC, conseils de rééquilibrage) et les évolutions de l'avatar virtuel sont fournis à titre purement indicatif et motivationnel. L'utilisateur certifie être en possession d'un certificat médical de non-contre-indication à la pratique sportive. L'accès à l'application est strictement réservé aux personnes âgées de 15 ans ou plus, ou bénéficiant d'une autorisation parentale expresse pour les mineurs de moins de 15 ans." },
      { heading: 'Données collectées', body: "• Données de compte, profil et adhésion : Prénom, genre, statut (Adhérent, Coach, Transporteur/Ambulancier, Établissement de santé), objectifs bien-être, historique des adhésions/cotisations associatives, adresse e-mail.\n\n• Données morphologiques et composition corporelle : Poids, taille, âge, masse grasse, muscle, IMC, issues des saisies manuelles ou de l'analyse automatisée des photos de bilans corporels et de balances connectées (nécessitant l'accès à l'appareil photo ou à la galerie).\n\n• Modélisation graphique : Données d'évolution corporelle destinées à l'affichage et à l'animation de l'avatar virtuel personnalisé.\n\n• Données d'activité et capteurs (via Apple Santé / Google Fit / Objets connectés) : Nombre de pas quotidiens, rythme cardiaque, calories brûlées, données de séances de musculation, course à pied et fiches de suivi technique.\n\n• Données de localisation : Géolocalisation GPS précise en temps réel et en arrière-plan pour le tracé des parcours sportifs et le suivi des trajets de transport.\n\n• Données de transport et logistique sanitaire : Adresses de prise en charge et de destination, horaires de trajets, type de véhicule requis, niveau de mobilité et besoins d'assistance.\n\n• Données techniques : ID unique de l'appareil (Token Push), adresse IP, données de connexions et logs techniques." },
      { heading: 'Finalités du traitement', body: "• Personnalisation des programmes d'entraînement, suivi de la performance et édition des bilans techniques.\n• Gestion des adhésions, des accès à l'application et sécurisation des comptes.\n• Génération et évolution dynamique de l'avatar virtuel (profilage graphique à visée motivationnelle).\n• Planification, optimisation logistique et suivi en temps réel des trajets de transport vers les lieux de pratique. L'association intervient comme simple intermédiaire technique et décline toute responsabilité quant à l'exécution ou aux incidents liés au transport lui-même.\n• Tracé cartographique GPS des parcours de course à pied et de transport.\n• Analyse et extraction automatisée des données physiques via l'import de photographies.\n• Suivi des habitudes nutritionnelles, scan de repas et génération de conseils de bien-être (excluant tout diagnostic médical).\n• Envoi de notifications push, alertes de sécurité d'effort et SMS logistiques." },
      { heading: 'Base légale et Consentement Santé', body: "• Données de compte, localisation et logistiques : Exécution du contrat/statuts associatifs (Art. 6.1.b RGPD).\n• Données de santé et biométriques (rythme cardiaque, IMC, besoins d'assistance transport) : Consentement explicite, spécifique et transparent de l'utilisateur (Art. 9.2.a RGPD), recueilli de manière distincte lors de l'activation des fonctionnalités concernées." },
      { heading: 'Durée de conservation', body: "Les données et la modélisation de l'avatar sont conservées pendant toute la durée de la relation contractuelle, puis archivées pendant 3 ans après l'inactivité ou la suppression du compte." },
      { heading: 'Sécurité, Hébergement et Prestataires', body: "Les données sont strictement confidentielles et stockées de manière sécurisée sur des serveurs situés au sein de l'Union Européenne via les infrastructures chiffrées de Supabase (chiffrement SSL/TLS). L'application étant en phase de lancement et d'expérimentation associative, l'infrastructure évoluera vers un hébergement agréé pour les données de santé (HDS) lors du déploiement à grande échelle. Les données sont partagées uniquement entre l'adhérent, son coach et les services de transport partenaires pour la logistique des trajets. L'Association MetaBoost s'engage formellement à ne jamais vendre, louer ou commercialiser vos données à des tiers. Pour des besoins purement techniques (cartographie GPS, routage des SMS/notifications), des sous-traitants certifiés conformes au RGPD peuvent intervenir de manière sécurisée." },
      { heading: 'Vos droits et Retrait du consentement', body: "Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement (oubli), de portabilité, d'opposition et du droit de ne pas faire l'objet d'un profilage automatisé exclusif.\n\nL'utilisateur peut retirer son consentement au traitement de ses données de santé à tout moment depuis l'application, et demander la suppression instantanée de son compte et de l'ensemble de ses données depuis les paramètres ou en contactant : metaboost@gmail.com\n\nRecours CNIL : cnil.fr" },
      { heading: 'Cookies et Identifiants', body: "Des cookies techniques et de session sont strictement nécessaires pour l'authentification (Supabase) et le bon fonctionnement de l'application. Aucun cookie publicitaire tiers n'est déposé sans votre consentement." },
    ],
  },
  cgu: {
    title: "Conditions Générales d'Utilisation",
    sections: [
      { heading: "1. Objet", body: "Les présentes Conditions Générales d'Utilisation ont pour objet de définir les modalités d'accès et d'utilisation de l'application MetaBoost, éditée par l'Association MetaBoost (Association Loi 1901). L'application propose des outils de suivi de performance sportive, de suivi nutritionnel, de modélisation visuelle via un avatar, ainsi qu'un service technique de planification logistique de transport." },
      { heading: "2. Accès au service et Majorité numérique", body: "L'accès à MetaBoost est strictement réservé aux personnes âgées de 15 ans ou plus, ou bénéficiant d'une autorisation parentale expresse et écrite pour les mineurs de moins de 15 ans. L'Association MetaBoost se réserve le droit de demander tout justificatif permettant d'établir l'âge de l'utilisateur à tout moment." },
      { heading: "3. Avertissement Médical et Non-Responsabilité", body: "L'Association MetaBoost n'est pas un établissement médical et ne dispense aucun conseil, diagnostic ou traitement médical. L'ensemble des fonctionnalités, données affichées (IMC, masse grasse, rythme cardiaque) et conseils nutritionnels sont fournis à titre purement indicatif et motivationnel. L'utilisateur reconnaît utiliser l'application sous sa propre responsabilité et certifie être en possession d'un certificat médical de non-contre-indication à la pratique sportive en cours de validité." },
      { heading: "4. Consentement aux Données de Santé et Capteurs", body: "L'utilisation de certaines fonctionnalités de l'application (suivi des performances, évolution de l'avatar, synchronisation des objets connectés) nécessite le traitement de données relatives à votre condition physique et à votre santé (rythme cardiaque, masse grasse, etc.). L'accès à ces services est strictement subordonné à votre consentement exprès lors de l'inscription. L'utilisateur peut retirer ce consentement à tout moment depuis les paramètres de son compte. Toutefois, le retrait du consentement ou le refus d'autoriser l'accès aux capteurs tiers (Apple Santé, Google Fit, balances connectées) entraînera l'impossibilité technique d'utiliser les fonctionnalités de suivi personnalisé et de modélisation de l'avatar, sans que la responsabilité de l'Association MetaBoost ne puisse être engagée." },
      { heading: "5. Génération, Partage et Portée des Bilans", body: "L'application permet de générer en un clic des rapports d'évolution adaptés (résumé visuel pour l'adhérent, suivi technique pour le coach, bilan clinique pour les partenaires médicaux et institutionnels). L'utilisateur est seul responsable du partage de ces rapports avec les tiers de son choix. L'Association MetaBoost rappelle que ces documents automatisés constituent de simples outils de synthèse technique et d'aide à la décision. Ils ne possèdent aucune valeur de diagnostic médical et ne sauraient en aucun cas remplacer l'évaluation, l'examen clinique et la responsabilité exclusive d'un professionnel de santé qualifié. Les professionnels de santé tiers demeurent pleinement et exclusivement responsables des diagnostics, décisions thérapeutiques ou prescriptions qu'ils établissent." },
      { heading: "6. Obligation de Moyens et Non-Garantie de Résultats", body: "L'Association MetaBoost fournit des outils d'accompagnement, de suivi et de modélisation. Elle est soumise à une stricte obligation de moyens. L'association ne garantit aucun résultat physique, athlétique ou de santé spécifique, l'évolution et les performances dépendant exclusivement de l'état de santé initial, de la rigueur et de l'implication personnelle de l'utilisateur." },
      { heading: "7. Sécurité Routière et Utilisation Responsable", body: "Il est strictement interdit d'utiliser, de consulter ou de saisir des données sur l'application MetaBoost lors de la conduite d'un véhicule motorisé ou de tout autre moyen de transport. L'utilisateur s'engage à respecter scrupuleusement le Code de la route et assume l'entière responsabilité de sa sécurité et de celle d'autrui lors de ses déplacements." },
      { heading: "8. Limitation de responsabilité technique, Capteurs et Cartographie", body: "L'Association MetaBoost s'efforce d'assurer une disponibilité maximale de la plateforme. Toutefois, sa responsabilité ne saurait être engagée en cas d'interruptions techniques temporaires, de bugs, de maintenance, ou de défaillances de synchronisation avec les capteurs tiers. Les données de géolocalisation, d'itinéraires et de cartographie sont fournies à titre purement indicatif : l'association ne garantit pas leur exactitude ni leur exhaustivité en temps réel. Aucun dédommagement ne pourra être exigé en cas d'indisponibilité ou d'erreur du service." },
      { heading: "9. Logistique, Transport et Force Majeure", body: "Pour faciliter l'accès aux lieux de pratique, l'application intègre un outil de planification logistique des trajets. L'Association MetaBoost intervient en qualité de simple intermédiaire technique de mise en relation et décline toute responsabilité quant à l'exécution matérielle des trajets, aux retards, annulations ou incidents survenant lors du transport. La responsabilité de l'association ne pourra être engagée en cas de force majeure ou d'événements climatiques exceptionnels perturbant la logistique." },
      { heading: "10. Propriété Intellectuelle, Contenus, Photos et Avatar Virtuel", body: "L'ensemble des contenus, codes, algorithmes, designs et logos de la plateforme sont protégés par le droit d'auteur. La modélisation graphique, le concept visuel et l'animation de l'avatar virtuel personnalisé évolutif sont la propriété exclusive de MetaBoost. L'utilisateur bénéficie d'une licence d'utilisation personnelle, privée, non exclusive, non transférable et non commerciale. Il est strictement interdit de copier, modifier, ou tenter de rétro-concevoir (reverse-engineer) les algorithmes ou le code de l'application.\n\nConcernant les photographies téléchargées par l'utilisateur, celui-ci garantit détenir l'intégralité des droits sur ces fichiers et concède à l'Association MetaBoost une licence gratuite et mondiale, limitée aux stricts besoins techniques du fonctionnement de l'application. L'importation de photos à caractère pornographique, violent, illicite ou portant atteinte à la dignité humaine est strictement interdite et entraînera la clôture immédiate du compte." },
      { heading: "11. Comportement, Respect de la communauté et Modération", body: "L'application MetaBoost repose sur le respect mutuel entre adhérents, coachs, professionnels de santé et transporteurs partenaires. Tout comportement inapproprié, propos injurieux, harcèlement, utilisation frauduleuse du système de transport ou partage de contenu illicite entraînera la suspension immédiate et définitive du compte de l'utilisateur, sans préavis ni remboursement de sa cotisation associative." },
      { heading: "12. Résiliation", body: "L'utilisateur peut cesser d'utiliser le service et demander la suppression de son compte à tout moment depuis les paramètres de l'application. L'Association MetaBoost se réserve le droit de suspendre ou de fermer un compte en cas de violation des présentes CGU ou d'inactivité prolongée supérieure à 3 ans." },
      { heading: "13. Modifications des CGU", body: "L'Association MetaBoost se réserve le droit de modifier les présentes CGU à tout moment pour les adapter aux évolutions techniques ou réglementaires. L'utilisation continue de l'application après modification vaut acceptation des nouvelles CGU." },
      { heading: "14. Divisibilité des clauses", body: "Si une ou plusieurs stipulations des présentes CGU sont tenues pour non valides ou déclarées comme telles en application d'une loi, d'un règlement ou à la suite d'une décision définitive d'une juridiction compétente, les autres stipulations garderont toute leur force et leur portée." },
      { heading: "15. Loi applicable et Juridiction compétente", body: "Les présentes CGU sont régies par la loi française. En cas de litige relatif à l'interprétation ou à l'exécution des présentes, et à défaut d'accord amiable, compétence expresse est attribuée aux tribunaux compétents du ressort du siège social de l'Association MetaBoost." },
    ],
  },
};

type LegalKey = 'mentions' | 'privacy' | 'cgu' | null;

export default function Onboarding() {
  const [step, setStep]         = useState<Step>('login');
  const [userName, setUserName]   = useState('');
  const [gender, setGender]       = useState<Gender>('male');
  const [birthDay, setBirthDay]   = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [goal, setGoal]         = useState<Goal>(null);
  const [height, setHeight]     = useState('175');
  const [weight, setWeight]     = useState('');
  const [waist,  setWaist]      = useState('');
  const [thigh,  setThigh]      = useState('');
  const [arm,    setArm]        = useState('');

  const vals: Record<string, string>              = { weight, height, waist, thigh, arm };
  const sets: Record<string, (v: string) => void> = { weight: setWeight, height: setHeight, waist: setWaist, thigh: setThigh, arm: setArm };

  const [profileIdx, setProfileIdx] = useState(0);
  const profileScrollRef = useRef<ScrollView>(null);
  const [legalModal, setLegalModal] = useState<LegalKey>(null);

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

  function computeAge(d: string, m: string, y: string): number | null {
    const day = parseInt(d), month = parseInt(m), year = parseInt(y);
    if (!day || !month || !year || year < 1900 || year > 2100) return null;
    const birth = new Date(year, month - 1, day);
    if (isNaN(birth.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const md = today.getMonth() - birth.getMonth();
    if (md < 0 || (md === 0 && today.getDate() < birth.getDate())) age--;
    return age > 0 && age < 130 ? age : null;
  }

  function finish() {
    const h  = parseFloat(height) || 175;
    const w  = parseFloat(weight) || 75;
    const wa = parseFloat(waist)  || 80;
    const th = parseFloat(thigh)  || undefined;
    const ar = parseFloat(arm)    || undefined;
    const age = computeAge(birthDay, birthMonth, birthYear);
    const birthDate = (birthYear && birthMonth && birthDay)
      ? `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`
      : '';
    setProfile({ name: userName.trim() || 'Athlète', gender, height: h, goal, age, birthDate });
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
    <View style={[styles.root, (step === 'login' || step === 'welcome' || step === 'goal') && styles.rootLight, Platform.OS === 'web' && styles.rootWeb]}>
      {step !== 'login' && step !== 'welcome' && step !== 'goal' && (
        <LinearGradient colors={['#0B1628', '#060E1C', '#03080F']} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFill} />
      )}
      {step !== 'login' && step !== 'welcome' && step !== 'goal' && <View style={styles.glowA} />}
      {step !== 'login' && step !== 'welcome' && step !== 'goal' && <View style={styles.glowB} />}

      <SafeAreaView style={{ flex: 1 }} edges={Platform.OS === 'web' ? ['top'] : ['top', 'bottom']}>
        {step !== 'login' && step !== 'welcome' && step !== 'goal' && (
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
                  <Text style={styles.s1HeadlineTop}>L'ÉCOSYSTÈME</Text>
                  <View style={styles.s1HeadlineRow}>
                    <Text style={[styles.s1HeadlineBig, { color: '#00C8D4' }]}>SPORT</Text>
                    <Text style={styles.s1HeadlineBig}>{' '}&{' '}</Text>
                  </View>
                  <Text style={[styles.s1HeadlineBig, { color: '#E2AA27' }]}>MÉDICAL</Text>
                  <Text style={styles.s1HeadlineTop}>NOUVELLE GÉNÉRATION.</Text>
                </View>

                {/* BENTO CARD — boutons auth */}
                <View style={styles.s1BentoCard}>
                  <TouchableOpacity style={styles.s1CTA} onPress={() => transitionTo('welcome')} activeOpacity={0.9}>
                    <Text style={styles.s1CTATxt}>S'INSCRIRE →</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.s1CTAOutline} onPress={() => transitionTo('welcome')} activeOpacity={0.8}>
                    <Text style={styles.s1CTAOutlineTxt}>SE CONNECTER</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.s1ScrollHint}>
                  <Text style={styles.s1ScrollTxt}>DÉCOUVRIR L'ÉCOSYSTÈME</Text>
                  <ChevronDown size={13} color="#B0B8C4" strokeWidth={2} />
                </View>
              </View>

              {/* ════════════════════════════════════════════
                  SLIDE 2 — Carrousel Profils
              ════════════════════════════════════════════ */}
              <View style={styles.slide2}>
                <LinearGradient
                  colors={['#FFFFFF', '#F4F6F9', '#F4F6F9', '#FFFFFF']}
                  locations={[0, 0.15, 0.85, 1]}
                  style={StyleSheet.absoluteFill}
                />

                {/* Titre section */}
                <Text style={styles.s2SectionEye}>UNE SOLUTION ADAPTÉE À</Text>
                <Text style={styles.s2SectionTitle}>CHAQUE{' '}
                  <Text style={{ color: '#00C8D4' }}>PROFIL</Text>
                </Text>

                {/* Carrousel */}
                <ScrollView
                  ref={profileScrollRef}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  snapToInterval={PROFILE_CARD_W + PROFILE_GAP}
                  decelerationRate="fast"
                  scrollEventThrottle={16}
                  onScroll={(e) => {
                    const idx = Math.round(e.nativeEvent.contentOffset.x / (PROFILE_CARD_W + PROFILE_GAP));
                    setProfileIdx(Math.max(0, Math.min(PROFILES.length - 1, idx)));
                  }}
                  style={{ marginHorizontal: -24 }}
                  contentContainerStyle={{ paddingHorizontal: 24, gap: PROFILE_GAP }}
                >
                  {PROFILES.map((p, i) => (
                    <View key={i} style={[styles.s2ProfileCard, { width: PROFILE_CARD_W }]}>
                      {(p as any).imgSmall ? (
                        <View style={{
                          height: 220,
                          borderTopWidth: 4,
                          borderTopColor: p.accent,
                          backgroundColor: p.trioImg ? '#D4A017' : '#F3F4F6',
                          overflow: 'hidden' as any,
                          position: 'relative' as any,
                        }}>
                          {p.trioImg ? (
                            <Image
                              source={p.trioImg}
                              style={{
                                width: '100%' as any,
                                height: '100%' as any,
                                objectFit: 'contain' as any,
                              }}
                            />
                          ) : (
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                              <Text style={{ fontSize: 52 }}>{p.emoji}</Text>
                            </View>
                          )}
                          <View style={{ position: 'absolute' as any, bottom: 12, left: 12, gap: 5 }}>
                            <View style={[styles.s2ProfileTag, { backgroundColor: p.accent }]}>
                              <Text style={styles.s2ProfileTagTxt}>{p.tag}</Text>
                            </View>
                            {p.subTag && (
                              <Text style={styles.s2ProfileSubTag}>{p.subTag}</Text>
                            )}
                          </View>
                        </View>
                      ) : (
                        <View style={[styles.s2ProfileImg, { borderTopColor: p.accent }]}>
                          {p.trioImg ? (
                            <Image source={p.trioImg} style={{ flex: 1, height: '100%' as any, width: '100%' as any }} resizeMode="cover" />
                          ) : p.emoji ? (
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F4F6F9' }}>
                              <Text style={{ fontSize: 52 }}>{p.emoji}</Text>
                            </View>
                          ) : (
                            <View style={{ flex: 1, flexDirection: 'row' as any, backgroundColor: '#F0F4F8' }}>
                              {[p.accent, '#E5E7EB', '#D1D5DB'].map((bg, j) => (
                                <View key={j} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', borderRightWidth: j < 2 ? 1 : 0, borderColor: '#E2E8F0' }}>
                                  <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: bg + '22', borderWidth: 2, borderColor: bg + '44', alignItems: 'center', justifyContent: 'center' }}>
                                    <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: bg + '66' }} />
                                  </View>
                                </View>
                              ))}
                            </View>
                          )}
                          <View style={{ position: 'absolute' as any, bottom: 12, left: 12, gap: 5 }}>
                            <View style={[styles.s2ProfileTag, { backgroundColor: p.accent }]}>
                              <Text style={styles.s2ProfileTagTxt}>{p.tag}</Text>
                            </View>
                            {p.subTag && (
                              <Text style={styles.s2ProfileSubTag}>{p.subTag}</Text>
                            )}
                          </View>
                        </View>
                      )}
                      <View style={styles.s2ProfileBody}>
                        <Text style={styles.s2ProfileTitle}>{p.title}</Text>
                        <Text style={styles.s2ProfileDesc}>{p.desc}</Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>

                {/* Navigation */}
                <View style={styles.s2NavRow}>
                  <TouchableOpacity
                    style={[styles.s2NavBtn, profileIdx === 0 && { opacity: 0.3 }]}
                    onPress={() => {
                      const next = Math.max(0, profileIdx - 1);
                      setProfileIdx(next);
                      profileScrollRef.current?.scrollTo({ x: next * (PROFILE_CARD_W + PROFILE_GAP), animated: true });
                    }}
                    activeOpacity={0.7}
                  >
                    <ChevronLeft size={18} color="#1A1F26" strokeWidth={2.5} />
                  </TouchableOpacity>

                  <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                    {PROFILES.map((_, i) => (
                      <View key={i} style={[styles.s2Dot, profileIdx === i && styles.s2DotActive]} />
                    ))}
                  </View>

                  <TouchableOpacity
                    style={[styles.s2NavBtn, profileIdx === PROFILES.length - 1 && { opacity: 0.3 }]}
                    onPress={() => {
                      const next = Math.min(PROFILES.length - 1, profileIdx + 1);
                      setProfileIdx(next);
                      profileScrollRef.current?.scrollTo({ x: next * (PROFILE_CARD_W + PROFILE_GAP), animated: true });
                    }}
                    activeOpacity={0.7}
                  >
                    <ChevronRight size={18} color="#1A1F26" strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* ════════════════════════════════════════════
                  SLIDE 3 — Avatar 3D & Transformation
              ════════════════════════════════════════════ */}
              <View style={[styles.slide3, { height: H }]}>
                <Text style={styles.s3AvatarTitle}>
                  Votre transformation{'\n'}en temps réel
                </Text>
                <Text style={styles.s3AvatarSub}>
                  Votre Avatar 3D Métabolique évolue séance après séance (masse musculaire, composition corporelle et VO2 Max mis à jour en direct).
                </Text>
                <View style={[styles.s3VideoBlock, { flex: 1 }]}>
                  <AvatarBlock />
                </View>
              </View>

              {/* ════════════════════════════════════════════
                  SLIDE 4 — Hub EAT & Nutrition Augmentée
              ════════════════════════════════════════════ */}
              <View style={[styles.slide4, { height: H }]}>
                <Text style={styles.s4EatTitle}>
                  Votre nutrition,{'\n'}enfin simplifiée.
                </Text>
                <Text style={styles.s4EatSub}>
                  Découvrez une programmation nutritionnelle sur-mesure, calibrée selon votre objectif (perte de gras, prise de muscle ou forme active). Notre système planifie vos repas en un clic, génère votre liste de courses optimisée au meilleur prix et s'adapte à votre rythme, sans aucune frustration.
                </Text>
                <View style={{ flex: 1 }}>
                  <NutritionBlock />
                </View>
              </View>

              {/* ════════════════════════════════════════════
                  SLIDE 5 — Hub Logistique Terrain
              ════════════════════════════════════════════ */}
              <View style={[styles.slideLog, { height: H }]}>
                <Text style={styles.logTitle}>La logistique terrain,{'\n'}sans l'effort.</Text>
                <Text style={styles.logSub}>
                  Centralisez la validation et la planification des trajets de chaque adhérent en un seul endroit. Notre plateforme connecte directement la structure sportive, l'adhérent et le chauffeur pour valider chaque prise en charge et automatiser les tournées, sans aucun canal de messagerie externe.
                </Text>
                <View style={{ flex: 1 }}>
                  <LogistiqueBlock />
                </View>
              </View>

              {/* ════════════════════════════════════════════
                  SLIDE 6 — Reporting Intelligent
              ════════════════════════════════════════════ */}
              <View style={{ width: W, backgroundColor: '#FFFFFF', paddingTop: 16, paddingBottom: 40 }}>
                  <Text style={{
                    fontSize: 28, fontWeight: '900' as any, color: '#0D1117',
                    letterSpacing: -1, lineHeight: 35,
                    textAlign: 'center' as any, paddingHorizontal: 24,
                    marginBottom: 8,
                  }}>
                    Le bilan en un clic,{'\n'}pour tous.
                  </Text>
                  <Text style={{
                    fontSize: 12, color: '#4B5563', lineHeight: 18,
                    textAlign: 'center' as any, paddingHorizontal: 28,
                    marginBottom: 4,
                  }}>
                    Résumez et écrivez le parcours de chaque utilisateur pour chaque étape de sa progression. D'un simple clic, notre plateforme retranscrit l'évolution exacte de chacun dans un rapport qui adapte instantanément son langage : un résumé visuel et motivant pour l'adhérent, un suivi de performance technique pour le coach, et un bilan clinique rigoureux pour vos partenaires médicaux et institutionnels.
                  </Text>
                  <ReportingBlock />
                  {/* Legal footer */}
                  <View style={{ paddingHorizontal: 24, paddingTop: 14, paddingBottom: 4 }}>
                    <View style={{ height: 1, backgroundColor: '#E5E7EB', marginBottom: 8 }} />
                    <View style={{ flexDirection: 'row' as any, flexWrap: 'wrap' as any, alignItems: 'center' as any, justifyContent: 'center' as any }}>
                      <Text style={{ fontSize: 10, color: '#9CA3AF' }}>© 2026 MetaBoost. Tous droits réservés.{'  '}</Text>
                      <TouchableOpacity onPress={() => setLegalModal('mentions')} activeOpacity={0.7}>
                        <Text style={{ fontSize: 10, color: '#6B7280', textDecorationLine: 'underline' as any }}>Mentions Légales</Text>
                      </TouchableOpacity>
                      <Text style={{ fontSize: 10, color: '#9CA3AF' }}>{'  '}|{'  '}</Text>
                      <TouchableOpacity onPress={() => setLegalModal('privacy')} activeOpacity={0.7}>
                        <Text style={{ fontSize: 10, color: '#6B7280', textDecorationLine: 'underline' as any }}>Politique de Confidentialité</Text>
                      </TouchableOpacity>
                      <Text style={{ fontSize: 10, color: '#9CA3AF' }}>{'  '}|{'  '}</Text>
                      <TouchableOpacity onPress={() => setLegalModal('cgu')} activeOpacity={0.7}>
                        <Text style={{ fontSize: 10, color: '#6B7280', textDecorationLine: 'underline' as any }}>CGU</Text>
                      </TouchableOpacity>
                      <Text style={{ fontSize: 10, color: '#9CA3AF' }}>{'  '}|{'  '}Accessibilité : non conforme</Text>
                    </View>
                  </View>
              </View>


            </ScrollView>
          )}

          {/* ══════════════ WELCOME ══════════════ */}
          {step === 'welcome' && (
            <View style={{
              flex: 1, backgroundColor: '#FFFFFF',
              paddingHorizontal: 28, paddingTop: 48, paddingBottom: 32,
              justifyContent: 'space-between',
            }}>

              {/* Top content — left-aligned, editorial */}
              <View style={{ ...(Platform.OS === 'web' ? { paddingBottom: 80 } : {}) }}>

                {/* Brand micro-label */}
                <Text style={{
                  fontSize: 10, fontWeight: '800', color: '#C4C4C4',
                  letterSpacing: 3.5, textTransform: 'uppercase' as any,
                  marginBottom: 44,
                }}>
                  METABOOST
                </Text>

                {/* Display title */}
                <Text style={{
                  fontSize: 36, fontWeight: '900', color: '#0D1117',
                  letterSpacing: -1, lineHeight: 43,
                  marginBottom: 32,
                }}>
                  Bienvenue sur{'\n'}MetaBoost.
                </Text>

                {/* Name input */}
                <TextInput
                  style={{
                    fontSize: 17, fontWeight: '500', color: '#0D1117',
                    borderWidth: 1.5, borderColor: '#D1D5DB', borderRadius: 12,
                    paddingHorizontal: 18, paddingVertical: 16,
                    width: '100%', marginBottom: 12,
                    ...(Platform.OS === 'web' ? { outlineStyle: 'none', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif' } as any : {}),
                  }}
                  value={userName}
                  onChangeText={setUserName}
                  placeholder="Ton prénom"
                  placeholderTextColor="#C4C4C4"
                  returnKeyType="next"
                  autoCapitalize="words"
                  autoCorrect={false}
                  onSubmitEditing={() => Keyboard.dismiss()}
                />

                {/* Date de naissance */}
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#9CA3AF', letterSpacing: 1, textTransform: 'uppercase' as any, marginBottom: 8 }}>
                  Date de naissance
                </Text>
                <View style={{ flexDirection: 'row' as any, gap: 8, marginBottom: 20 }}>

                  {/* Jour */}
                  <View style={{ width: 72, borderWidth: 1.5, borderColor: '#D1D5DB', borderRadius: 12, overflow: 'hidden' as any }}>
                    {Platform.OS === 'web'
                      ? (React.createElement as any)('select', {
                          value: birthDay,
                          onChange: (e: any) => setBirthDay(e.target.value),
                          style: {
                            border: 'none', outline: 'none', background: '#FFFFFF',
                            fontSize: '15px', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
                            color: birthDay ? '#0D1117' : '#9CA3AF',
                            width: '100%', cursor: 'pointer',
                            padding: '14px 10px',
                          },
                        }, [
                          (React.createElement as any)('option', { key: '__', value: '', disabled: true, hidden: true }, 'Jour'),
                          ...Array.from({ length: 31 }, (_, i) => {
                            const v = String(i + 1).padStart(2, '0');
                            return (React.createElement as any)('option', { key: v, value: v }, v);
                          }),
                        ])
                      : <TextInput style={{ fontSize: 15, color: '#0D1117', paddingHorizontal: 10, paddingVertical: 14, textAlign: 'center' as any }} value={birthDay} onChangeText={(v) => setBirthDay(v.replace(/\D/g, '').slice(0, 2))} placeholder="JJ" placeholderTextColor="#9CA3AF" keyboardType="numeric" maxLength={2} />
                    }
                  </View>

                  {/* Mois */}
                  <View style={{ flex: 1, borderWidth: 1.5, borderColor: '#D1D5DB', borderRadius: 12, overflow: 'hidden' as any }}>
                    {Platform.OS === 'web'
                      ? (React.createElement as any)('select', {
                          value: birthMonth,
                          onChange: (e: any) => setBirthMonth(e.target.value),
                          style: {
                            border: 'none', outline: 'none', background: '#FFFFFF',
                            fontSize: '15px', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
                            color: birthMonth ? '#0D1117' : '#9CA3AF',
                            width: '100%', cursor: 'pointer',
                            padding: '14px 10px',
                          },
                        }, [
                          (React.createElement as any)('option', { key: '__', value: '', disabled: true, hidden: true }, 'Mois'),
                          ...MONTHS_FR.map((m, i) => {
                            const v = String(i + 1).padStart(2, '0');
                            return (React.createElement as any)('option', { key: v, value: v }, m);
                          }),
                        ])
                      : <TextInput style={{ fontSize: 15, color: '#0D1117', paddingHorizontal: 10, paddingVertical: 14 }} value={birthMonth} onChangeText={(v) => setBirthMonth(v.replace(/\D/g, '').slice(0, 2))} placeholder="Mois" placeholderTextColor="#9CA3AF" keyboardType="numeric" maxLength={2} />
                    }
                  </View>

                  {/* Année */}
                  <View style={{ width: 96, borderWidth: 1.5, borderColor: '#D1D5DB', borderRadius: 12, overflow: 'hidden' as any }}>
                    {Platform.OS === 'web'
                      ? (React.createElement as any)('select', {
                          value: birthYear,
                          onChange: (e: any) => setBirthYear(e.target.value),
                          style: {
                            border: 'none', outline: 'none', background: '#FFFFFF',
                            fontSize: '15px', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
                            color: birthYear ? '#0D1117' : '#9CA3AF',
                            width: '100%', cursor: 'pointer',
                            padding: '14px 10px',
                          },
                        }, [
                          (React.createElement as any)('option', { key: '__', value: '', disabled: true, hidden: true }, 'Année'),
                          ...Array.from({ length: 100 }, (_, i) => {
                            const y = new Date().getFullYear() - i;
                            return (React.createElement as any)('option', { key: y, value: String(y) }, String(y));
                          }),
                        ])
                      : <TextInput style={{ fontSize: 15, color: '#0D1117', paddingHorizontal: 10, paddingVertical: 14, textAlign: 'center' as any }} value={birthYear} onChangeText={(v) => setBirthYear(v.replace(/\D/g, '').slice(0, 4))} placeholder="Année" placeholderTextColor="#9CA3AF" keyboardType="numeric" maxLength={4} />
                    }
                  </View>

                </View>

                {/* Sub line */}
                <Text style={{
                  fontSize: 14, color: '#9CA3AF', lineHeight: 20, marginBottom: 24,
                }}>
                  Pour un accompagnement qui te ressemble.
                </Text>

                {/* Gender pills */}
                <View style={{ flexDirection: 'row' as any, gap: 10 }}>
                  {([{ key: 'male' as Gender, sym: '♂', lbl: 'Homme' }, { key: 'female' as Gender, sym: '♀', lbl: 'Femme' }]).map((g) => {
                    const on = gender === g.key;
                    return (
                      <TouchableOpacity
                        key={g.key}
                        onPress={() => { setGender(g.key); Haptics.selectionAsync?.(); }}
                        activeOpacity={0.8}
                        style={{
                          flex: 1, flexDirection: 'row' as any, alignItems: 'center', justifyContent: 'center', gap: 8,
                          paddingVertical: 14, borderRadius: 12,
                          borderWidth: 1.5,
                          borderColor: on ? '#0D1117' : '#E5E7EB',
                          backgroundColor: on ? '#0D1117' : '#FAFAFA',
                          ...(Platform.OS === 'web' ? { transition: 'all 0.18s ease' } as any : {}),
                        }}
                      >
                        <Text style={{ fontSize: 14, color: on ? '#FFFFFF' : '#BFBFBF' }}>{g.sym}</Text>
                        <Text style={{ fontSize: 15, fontWeight: on ? '800' : '500' as any, color: on ? '#FFFFFF' : '#374151' }}>
                          {g.lbl}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* CTA */}
              <View style={Platform.OS === 'web' ? styles.ctaFixed : undefined}>
                <TouchableOpacity
                  style={{
                    flexDirection: 'row' as any, alignItems: 'center', justifyContent: 'center', gap: 8,
                    backgroundColor: '#0D1117', borderRadius: 100, paddingVertical: 18,
                    ...(Platform.OS === 'web' ? { boxShadow: '0 4px 20px rgba(0,0,0,0.14)' } as any : {}),
                  }}
                  onPress={goNext}
                  activeOpacity={0.88}
                >
                  <Text style={{ fontSize: 17, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.2 }}>
                    Continuer
                  </Text>
                  <ChevronRight size={20} color="#FFFFFF" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ══════════════ GOAL → Création de compte ══════════════ */}
          {step === 'goal' && (
            <View style={{
              flex: 1, backgroundColor: '#FFFFFF',
              paddingHorizontal: 28, paddingTop: 48, paddingBottom: 32,
              justifyContent: 'space-between',
            }}>

              {/* Top content */}
              <View style={{ ...(Platform.OS === 'web' ? { paddingBottom: 80 } : {}) }}>

                {/* Retour */}
                <TouchableOpacity
                  onPress={() => transitionTo('welcome')}
                  activeOpacity={0.7}
                  style={{ alignSelf: 'flex-start', marginBottom: 32, padding: 8, borderRadius: 10, backgroundColor: '#F3F4F6' }}
                >
                  <ChevronLeft size={20} color="#0D1117" strokeWidth={2.5} />
                </TouchableOpacity>

                {/* Titre */}
                <Text style={{
                  fontSize: 36, fontWeight: '900', color: '#0D1117',
                  letterSpacing: -1, lineHeight: 43, marginBottom: 12,
                }}>
                  Crée ton{'\n'}compte.
                </Text>

                {/* Sous-titre */}
                <Text style={{ fontSize: 14, color: '#6B7280', lineHeight: 21, marginBottom: 36 }}>
                  Pour sauvegarder ton parcours et retrouver tes données partout.
                </Text>

                {/* Continuer avec Apple */}
                <TouchableOpacity
                  style={{
                    flexDirection: 'row' as any, alignItems: 'center', justifyContent: 'center', gap: 10,
                    backgroundColor: '#0D1117', borderRadius: 12, paddingVertical: 16, marginBottom: 12,
                  }}
                  onPress={() => Alert.alert('Apple Sign In', 'Disponible très prochainement.')}
                  activeOpacity={0.88}
                >
                  <Text style={{ fontSize: 19, color: '#FFFFFF', lineHeight: 22 }}></Text>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF' }}>Continuer avec Apple</Text>
                </TouchableOpacity>

                {/* Continuer avec Google */}
                <TouchableOpacity
                  style={{
                    flexDirection: 'row' as any, alignItems: 'center', justifyContent: 'center', gap: 10,
                    backgroundColor: '#FFFFFF', borderRadius: 12, paddingVertical: 16, marginBottom: 28,
                    borderWidth: 1.5, borderColor: '#E5E7EB',
                  }}
                  onPress={() => Alert.alert('Google Sign In', 'Disponible très prochainement.')}
                  activeOpacity={0.88}
                >
                  <View style={{
                    width: 20, height: 20, borderRadius: 10,
                    borderWidth: 2, borderColor: '#4285F4',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text style={{ fontSize: 11, fontWeight: '900', color: '#4285F4', lineHeight: 14 }}>G</Text>
                  </View>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#0D1117' }}>Continuer avec Google</Text>
                </TouchableOpacity>

                {/* Séparateur */}
                <View style={{ flexDirection: 'row' as any, alignItems: 'center', gap: 14, marginBottom: 28 }}>
                  <View style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
                  <Text style={{ fontSize: 13, color: '#9CA3AF', fontWeight: '500' }}>ou</Text>
                  <View style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
                </View>

                {/* Continuer avec e-mail / téléphone */}
                <TouchableOpacity
                  style={{
                    flexDirection: 'row' as any, alignItems: 'center', justifyContent: 'center', gap: 10,
                    backgroundColor: '#FAFAFA', borderRadius: 12, paddingVertical: 16,
                    borderWidth: 1.5, borderColor: '#E5E7EB',
                  }}
                  onPress={() => Alert.alert('E-mail / Téléphone', 'Disponible très prochainement.')}
                  activeOpacity={0.88}
                >
                  <Mail size={17} color="#6B7280" strokeWidth={2} />
                  <Text style={{ fontSize: 15, fontWeight: '500', color: '#374151' }}>
                    Continuer avec un e-mail ou un téléphone
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Bouton bas */}
              <View style={Platform.OS === 'web' ? styles.ctaFixed : undefined}>
                <TouchableOpacity
                  style={{
                    flexDirection: 'row' as any, alignItems: 'center', justifyContent: 'center', gap: 8,
                    backgroundColor: '#0D1117', borderRadius: 100, paddingVertical: 18,
                    ...(Platform.OS === 'web' ? { boxShadow: '0 4px 20px rgba(0,0,0,0.14)' } as any : {}),
                  }}
                  onPress={goNext}
                  activeOpacity={0.88}
                >
                  <Text style={{ fontSize: 17, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.2 }}>
                    Continuer
                  </Text>
                  <ChevronRight size={20} color="#FFFFFF" strokeWidth={2.5} />
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

        {/* ══════════════ LEGAL MODALS ══════════════ */}
        <Modal
          visible={legalModal !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setLegalModal(null)}
        >
          <View style={{
            flex: 1, backgroundColor: 'rgba(0,0,0,0.55)',
            justifyContent: 'center' as any, alignItems: 'center' as any,
            padding: 20,
          }}>
            <View style={{
              backgroundColor: '#FFFFFF', borderRadius: 20,
              width: '100%' as any, maxWidth: 480, maxHeight: '85%' as any,
              overflow: 'hidden' as any,
              shadowColor: '#000', shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.25, shadowRadius: 32, elevation: 20,
            }}>
              {/* Modal header */}
              <View style={{
                flexDirection: 'row' as any, alignItems: 'center' as any,
                justifyContent: 'space-between' as any,
                paddingHorizontal: 20, paddingTop: 20, paddingBottom: 14,
                borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
              }}>
                <Text style={{ fontSize: 17, fontWeight: '800' as any, color: '#0D1117', flex: 1 }}>
                  {legalModal ? LEGAL_CONTENT[legalModal].title : ''}
                </Text>
                <TouchableOpacity onPress={() => setLegalModal(null)} activeOpacity={0.7}
                  style={{
                    width: 32, height: 32, borderRadius: 16,
                    backgroundColor: '#F3F4F6',
                    alignItems: 'center' as any, justifyContent: 'center' as any,
                    marginLeft: 12,
                  }}>
                  <Text style={{ fontSize: 16, color: '#6B7280', fontWeight: '600' as any, lineHeight: 18 }}>✕</Text>
                </TouchableOpacity>
              </View>
              {/* Modal body */}
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 20, gap: 18, paddingBottom: 80 }}
                showsVerticalScrollIndicator={false}
              >
                {legalModal && LEGAL_CONTENT[legalModal].sections.map((s, i) => (
                  <View key={i} style={{ gap: 6 }}>
                    <Text style={{ fontSize: 13, fontWeight: '800' as any, color: '#0D1117' }}>{s.heading}</Text>
                    <Text style={{ fontSize: 13, color: '#4B5563', lineHeight: 20 }}>{s.body}</Text>
                  </View>
                ))}
              </ScrollView>
              {/* Modal footer */}
              <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6' }}>
                <TouchableOpacity
                  onPress={() => setLegalModal(null)}
                  activeOpacity={0.85}
                  style={{
                    backgroundColor: '#0D1117', borderRadius: 12,
                    paddingVertical: 13, alignItems: 'center' as any,
                  }}>
                  <Text style={{ fontSize: 14, fontWeight: '700' as any, color: '#FFFFFF' }}>Fermer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

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
    minHeight: H - 160,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    overflow: 'hidden' as any,
  },
  s1TopBar: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  s1LogoBadge: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#0D1117', alignItems: 'center', justifyContent: 'center' },
  s1LogoEmoji: { fontSize: 16 },
  s1Brand: {
    fontSize: 28, fontWeight: '900', color: '#0D1117',
    letterSpacing: 1, textAlign: 'center',
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
    borderRadius: 24,
    padding: 14,
    gap: 8,
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
    height: 46, backgroundColor: '#1A1F26', borderRadius: Radius.full,
    alignItems: 'center', justifyContent: 'center',
    ...(Platform.OS === 'web' ? { boxShadow: '0 2px 12px rgba(26,31,38,0.18)' } as any : {}),
  },
  s1CTATxt: { fontSize: 13, fontWeight: '700', color: '#FFFFFF', letterSpacing: 1 },
  s1CTAOutline: {
    height: 46, backgroundColor: 'transparent', borderRadius: Radius.full,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#CBD5E1',
  },
  s1CTAOutlineTxt: { fontSize: 13, fontWeight: '600', color: '#374151', letterSpacing: 1 },
  s1Ghost: { alignItems: 'center', justifyContent: 'center', paddingVertical: 10 },
  s1GhostTxt: { fontSize: 13, fontWeight: '500', color: '#9CA3AF' },
  s1ScrollHint: { alignItems: 'center', gap: 4, marginTop: 16 },
  s1ScrollTxt: { fontSize: 9, color: '#B0B8C4', letterSpacing: 2.5, textTransform: 'uppercase' },

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 2 — Fond Blanc
  // ══════════════════════════════════════════════════════════════════════════
  slide2: {
    minHeight: H, marginTop: -1,
    paddingHorizontal: 24, paddingTop: 14, paddingBottom: 20,
    gap: 10, overflow: 'hidden' as any,
  },
  s2SectionEye: {
    fontSize: 13, fontWeight: '700', color: '#6B7280', letterSpacing: 1,
  },
  s2SectionTitle: {
    fontSize: 28, fontWeight: '900', color: '#0D1117', letterSpacing: -0.5, marginBottom: 4,
  },
  s2ProfileCard: {
    backgroundColor: '#FFFFFF', borderRadius: 20, overflow: 'hidden' as any,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 4px 24px rgba(0,0,0,0.07)' } as any
      : { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 16, elevation: 3 }),
  },
  s2ProfileImg: {
    height: 220, borderTopWidth: 4,
    flexDirection: 'row' as any,
    overflow: 'hidden' as any,
  },
  s2ProfileTag: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start' as any,
  },
  s2ProfileTagTxt: { fontSize: 10, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.8 },
  s2ProfileSubTag: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.90)', fontStyle: 'italic' as any },
  s2ProfileBody: { padding: 16, gap: 6 },
  s2ProfileTitle: { fontSize: 16, fontWeight: '900', color: '#0D1117', letterSpacing: -0.3 },
  s2ProfileDesc: { fontSize: 13, fontWeight: '500', color: '#6B7280', lineHeight: 19 },
  s2NavRow: {
    flexDirection: 'row' as any, alignItems: 'center', justifyContent: 'center', gap: 16,
  },
  s2NavBtn: {
    width: 42, height: 42, borderRadius: 21,
    borderWidth: 1.5, borderColor: '#1A1F26',
    alignItems: 'center', justifyContent: 'center',
  },
  s2Dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D1D5DB' },
  s2DotActive: { width: 22, height: 6, borderRadius: 3, backgroundColor: '#1A1F26' },
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
  // SLIDE 3 — Avatar 3D & Transformation (fond blanc)
  // ══════════════════════════════════════════════════════════════════════════
  slide3: {
    backgroundColor: '#FFFFFF',
    paddingTop: 48, paddingBottom: 0,
    gap: 16,
    flexDirection: 'column' as any,
  },
  s3AvatarTitle: {
    fontSize: 30, fontWeight: '900', color: '#0D1117',
    letterSpacing: -1, lineHeight: 38,
    textAlign: 'center', paddingHorizontal: 24,
  },
  s3AvatarSub: {
    fontSize: 14, color: '#4B5563', lineHeight: 22,
    textAlign: 'center', paddingHorizontal: 28,
  },
  s3VideoBlock: {
    width: '100%' as any,
    backgroundColor: '#E2AA27',
    overflow: 'hidden' as any,
    marginTop: 8,
  },

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 4 — Hub EAT & Nutrition Augmentée
  // ══════════════════════════════════════════════════════════════════════════
  slide4: {
    backgroundColor: '#FFFFFF',
    paddingTop: 48, paddingBottom: 0,
    gap: 16,
    flexDirection: 'column' as any,
  },
  s4EatTitle: {
    fontSize: 30, fontWeight: '900' as any, color: '#0D1117',
    letterSpacing: -1, lineHeight: 38,
    textAlign: 'center' as any, paddingHorizontal: 24,
  },
  s4EatSub: {
    fontSize: 14, color: '#4B5563', lineHeight: 22,
    textAlign: 'center' as any, paddingHorizontal: 28,
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

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 5 — Hub Logistique Terrain
  // ══════════════════════════════════════════════════════════════════════════
  slideLog: {
    backgroundColor: '#FFFFFF',
    paddingTop: 48, paddingBottom: 0,
    gap: 12,
    flexDirection: 'column' as any,
  },
  logTitle: {
    fontSize: 30, fontWeight: '900' as any, color: '#0D1117',
    letterSpacing: -1, lineHeight: 38,
    textAlign: 'center' as any, paddingHorizontal: 24,
  },
  logSub: {
    fontSize: 13, color: '#4B5563', lineHeight: 21,
    textAlign: 'center' as any, paddingHorizontal: 28,
  },
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
