import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, User, ChevronRight, Play, TrendingDown } from 'lucide-react-native';
import { useShallow } from 'zustand/react/shallow';
import { useUserStore } from '@/store/userStore';
import { useAvatarParams } from '@/hooks/useAvatarParams';
import { useSteps } from '@/hooks/useSteps';
import { Colors, Spacing, Radius, Shadow } from '@/constants/theme';

const { width: W } = Dimensions.get('window');

interface Program {
  id: string;
  tag: string;
  title: string;
  desc: string;
  meta: string;
  level: string;
  image: string;
}

const PROGRAMS: Program[] = [
  {
    id: 'p1',
    tag: 'Cardio & Renforcement',
    title: 'INTENSIVE\nSCULPT',
    desc: 'Sculpte ton corps avec des exercices composés haute intensité.',
    meta: '4 séances / sem · 35 min',
    level: 'Confirmé',
    image: 'https://images.unsplash.com/photo-1550345332-09e3ac987658?auto=format&fit=crop&w=800&h=1000&q=90',
  },
  {
    id: 'p2',
    tag: 'Gainage & Posture',
    title: 'PILATES\nCERCLE',
    desc: 'Renforce ta sangle abdominale et améliore ta posture durablement.',
    meta: '3 séances / sem · 25 min',
    level: 'Intermédiaire',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&h=1000&q=90',
  },
  {
    id: 'p3',
    tag: 'Force & Masse',
    title: 'MAXIMUM\nFORCE',
    desc: 'Programme de force progressive pour développer ta musculature.',
    meta: '4 séances / sem · 40 min',
    level: 'Expert',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&h=1000&q=90',
  },
];

const FILTERS = ['Pour toi', 'Nouveau', 'Force', 'Cardio', 'Souplesse'];

export default function Dashboard() {
  const [activeFilter, setActiveFilter] = useState(0);

  const { profile, getCurrentMeasure, sessions, todaySteps } = useUserStore(
    useShallow((s) => ({
      profile:           s.profile,
      getCurrentMeasure: s.getCurrentMeasure,
      sessions:          s.sessions,
      todaySteps:        s.todaySteps,
    }))
  );

  useSteps();
  const currentMeasure = getCurrentMeasure();
  const params         = useAvatarParams();
  const featured       = PROGRAMS[0];
  const stepPct        = Math.min(100, Math.round((todaySteps / 10000) * 100));

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Hero plein écran ── */}
      <View style={styles.hero}>
        <Image source={{ uri: featured.image }} style={styles.heroImage} resizeMode="cover" />

        {/* Header flottant sur l'image */}
        <SafeAreaView style={styles.heroHeader} edges={['top']}>
          <Text style={styles.brandName}>METABOOST</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.headerIconBtn}>
              <Search size={20} color="#fff" strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIconBtn}>
              <User size={20} color="#fff" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Gradient overlay bas */}
        <LinearGradient
          colors={['transparent', 'rgba(10,10,10,0.5)', Colors.background]}
          locations={[0.3, 0.7, 1]}
          style={styles.heroGradient}
        />

        {/* Texte hero */}
        <View style={styles.heroContent}>
          <Text style={styles.heroTag}>{featured.tag}</Text>
          <Text style={styles.heroTitle}>{featured.title}</Text>
          <Text style={styles.heroDesc}>{featured.desc}</Text>
          <View style={styles.heroFooter}>
            <TouchableOpacity style={styles.pillBtn} activeOpacity={0.85}>
              <Text style={styles.pillBtnTxt}>Commencer</Text>
            </TouchableOpacity>
            <Text style={styles.heroMeta}>{featured.meta}</Text>
          </View>
        </View>
      </View>

      {/* ── Stats strip ── */}
      <View style={styles.statsStrip}>
        <View style={[styles.statBlock, { borderRightWidth: 0.5, borderRightColor: Colors.cardBorder }]}>
          <Text style={styles.statVal}>{currentMeasure?.weight ?? '—'}<Text style={styles.statUnit}> kg</Text></Text>
          <Text style={styles.statLbl}>Poids</Text>
        </View>
        <View style={[styles.statBlock, { borderRightWidth: 0.5, borderRightColor: Colors.cardBorder }]}>
          <Text style={styles.statVal}>{todaySteps.toLocaleString('fr-FR')}</Text>
          <Text style={styles.statLbl}>Pas aujourd'hui</Text>
        </View>
        <View style={styles.statBlock}>
          <Text style={styles.statVal}>{sessions.length}</Text>
          <Text style={styles.statLbl}>Séances</Text>
        </View>
      </View>

      {/* ── Step bar ── */}
      {stepPct > 0 && (
        <View style={styles.stepWrap}>
          <View style={styles.stepRow}>
            <Text style={styles.stepLabel}>Objectif quotidien</Text>
            <Text style={styles.stepPct}>{stepPct}%</Text>
          </View>
          <View style={styles.stepTrack}>
            <View style={[styles.stepFill, { width: `${stepPct}%` } as any]} />
          </View>
        </View>
      )}

      {/* ── Filters ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersRow}
        style={styles.filtersScroll}
      >
        {FILTERS.map((f, i) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterPill, i === activeFilter && styles.filterPillActive]}
            onPress={() => setActiveFilter(i)}
          >
            <Text style={[styles.filterTxt, i === activeFilter && styles.filterTxtActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Programme du jour ── */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>PROGRAMMES</Text>
        <TouchableOpacity>
          <Text style={styles.sectionLink}>Voir tout</Text>
        </TouchableOpacity>
      </View>

      {PROGRAMS.map((p) => (
        <TouchableOpacity key={p.id} style={[styles.programCard, Shadow.lg]} activeOpacity={0.9}>
          {/* Photo */}
          <Image source={{ uri: p.image }} style={styles.programImg} resizeMode="cover" />

          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.82)']}
            style={[StyleSheet.absoluteFill, { borderRadius: Radius.xl }]}
          />

          {/* Content overlay */}
          <View style={styles.programOverlay}>
            <View style={styles.programTop}>
              <View style={styles.levelPill}>
                <Text style={styles.levelTxt}>{p.level}</Text>
              </View>
              <TouchableOpacity style={styles.playBtn}>
                <Play size={14} color={Colors.background} fill={Colors.background} />
              </TouchableOpacity>
            </View>

            <View style={styles.programBottom}>
              <Text style={styles.programTag}>{p.tag}</Text>
              <Text style={styles.programTitle}>{p.title}</Text>
              <Text style={styles.programMeta}>{p.meta}</Text>
              <TouchableOpacity style={styles.programCta} activeOpacity={0.85}>
                <Text style={styles.programCtaTxt}>Démarrer</Text>
                <ChevronRight size={14} color={Colors.background} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      ))}

      {/* ── Progression récente ── */}
      {sessions.length > 0 && (
        <>
          <View style={[styles.sectionRow, { marginTop: Spacing.xl }]}>
            <Text style={styles.sectionTitle}>RÉCENT</Text>
          </View>
          {sessions.slice(0, 3).map((s) => (
            <View key={s.id} style={[styles.sessionRow, Shadow.sm]}>
              <View style={[styles.sessionDot, { backgroundColor: s.effort >= 8 ? Colors.red + '20' : Colors.accentLight }]}>
                <Text style={{ fontSize: 18 }}>
                  {s.feeling === 'top' ? '🔥' : s.feeling === 'medium' ? '😐' : '😓'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sessionDate}>
                  {new Date(s.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })}
                </Text>
                <Text style={styles.sessionSub}>
                  Effort {s.effort}/10 · {s.steps.toLocaleString('fr-FR')} pas
                </Text>
              </View>
              <View style={[styles.effortTag, { backgroundColor: (s.effort >= 8 ? Colors.red : Colors.accent) + '18' }]}>
                <Text style={[styles.effortTagTxt, { color: s.effort >= 8 ? Colors.red : Colors.accent }]}>
                  {s.effort}/10
                </Text>
              </View>
            </View>
          ))}
        </>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll:  { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: Spacing.xxl },

  /* Hero */
  hero:        { width: W, height: W * 1.3, position: 'relative' },
  heroImage:   { ...StyleSheet.absoluteFillObject },
  heroHeader:  { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingTop: Spacing.sm },
  brandName:   { fontSize: 18, fontWeight: '900', color: '#fff', letterSpacing: 3, textTransform: 'uppercase' },
  headerIcons: { flexDirection: 'row', gap: Spacing.sm },
  headerIconBtn:{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  heroGradient:{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '70%' },
  heroContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing.md, paddingBottom: Spacing.xl },
  heroTag:     { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 },
  heroTitle:   { fontSize: 52, fontWeight: '900', color: '#fff', textTransform: 'uppercase', letterSpacing: -1.5, lineHeight: 52, marginBottom: 12 },
  heroDesc:    { fontSize: 15, fontWeight: '300', color: 'rgba(255,255,255,0.80)', lineHeight: 22, marginBottom: 20 },
  heroFooter:  { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  heroMeta:    { fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: '400' },

  pillBtn:    { backgroundColor: '#fff', borderRadius: Radius.full, paddingHorizontal: 28, paddingVertical: 13 },
  pillBtnTxt: { fontSize: 15, fontWeight: '700', color: Colors.background, letterSpacing: 0.2 },

  /* Stats */
  statsStrip: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
  },
  statBlock:  { flex: 1, paddingVertical: Spacing.md, paddingHorizontal: Spacing.sm, alignItems: 'center' },
  statVal:    { fontSize: 22, fontWeight: '900', color: Colors.text, letterSpacing: -0.5 },
  statUnit:   { fontSize: 13, fontWeight: '300', color: Colors.textSecondary },
  statLbl:    { fontSize: 10, fontWeight: '400', color: Colors.textSecondary, marginTop: 3, textAlign: 'center' },

  /* Step bar */
  stepWrap: { marginHorizontal: Spacing.md, marginTop: Spacing.md },
  stepRow:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  stepLabel:{ fontSize: 12, color: Colors.textSecondary, fontWeight: '400' },
  stepPct:  { fontSize: 13, fontWeight: '800', color: Colors.accent },
  stepTrack:{ height: 3, backgroundColor: Colors.surface, borderRadius: Radius.full, overflow: 'hidden' },
  stepFill: { height: '100%', backgroundColor: Colors.accent, borderRadius: Radius.full },

  /* Filters */
  filtersScroll: { marginTop: Spacing.lg },
  filtersRow:    { paddingHorizontal: Spacing.md, gap: Spacing.sm },
  filterPill:    { paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: Radius.full, backgroundColor: Colors.surface, borderWidth: 0.5, borderColor: Colors.cardBorder },
  filterPillActive: { backgroundColor: '#fff', borderColor: '#fff' },
  filterTxt:    { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
  filterTxtActive:{ color: Colors.background, fontWeight: '700' },

  /* Section header */
  sectionRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, marginTop: Spacing.xl, marginBottom: Spacing.md },
  sectionTitle:{ fontSize: 11, fontWeight: '800', color: Colors.text, letterSpacing: 3, textTransform: 'uppercase' },
  sectionLink: { fontSize: 12, fontWeight: '500', color: Colors.textSecondary },

  /* Program cards */
  programCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: Radius.xl,
    height: 360,
    overflow: 'hidden',
    position: 'relative',
  },
  programImg:     { ...StyleSheet.absoluteFillObject },
  programOverlay: { ...StyleSheet.absoluteFillObject, padding: Spacing.md, justifyContent: 'space-between' },
  programTop:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  levelPill:      { paddingHorizontal: 10, paddingVertical: 5, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: Radius.full, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.3)' },
  levelTxt:       { fontSize: 11, fontWeight: '600', color: '#fff' },
  playBtn:        { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  programBottom:  { gap: 4 },
  programTag:     { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 2 },
  programTitle:   { fontSize: 40, fontWeight: '900', color: '#fff', textTransform: 'uppercase', letterSpacing: -1.5, lineHeight: 40 },
  programMeta:    { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  programCta:     { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fff', borderRadius: Radius.full, paddingHorizontal: 18, paddingVertical: 10, alignSelf: 'flex-start', marginTop: 8 },
  programCtaTxt:  { fontSize: 13, fontWeight: '700', color: Colors.background },

  /* Recent sessions */
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
  },
  sessionDot:  { width: 44, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  sessionDate: { fontSize: 14, fontWeight: '600', color: Colors.text, textTransform: 'capitalize' },
  sessionSub:  { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  effortTag:   { borderRadius: Radius.sm, paddingHorizontal: 8, paddingVertical: 5 },
  effortTagTxt:{ fontSize: 12, fontWeight: '800' },
});
