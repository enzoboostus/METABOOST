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
import { Search, ChevronRight, Play, TrendingDown, User } from 'lucide-react-native';
import Avatar from '@/components/Avatar';
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
  const [activeFilter,   setActiveFilter]   = useState(0);
  const [avatarGender,   setAvatarGender]   = useState<'male' | 'female'>('female');

  const { profile, getCurrentMeasure, sessions, todaySteps } = useUserStore(
    useShallow((s) => ({
      profile:           s.profile,
      getCurrentMeasure: s.getCurrentMeasure,
      sessions:          s.sessions,
      todaySteps:        s.todaySteps,
    }))
  );

  useSteps();

  // Sync gender toggle with profile on first render
  React.useEffect(() => {
    if (profile.gender) setAvatarGender(profile.gender);
  }, [profile.gender]);

  const currentMeasure = getCurrentMeasure();
  const params         = useAvatarParams();
  const stepPct        = Math.min(100, Math.round((todaySteps / 10000) * 100));

  const bmiColor =
    params.bmi < 18.5 ? Colors.warning
    : params.bmi < 25  ? Colors.success
    : params.bmi < 30  ? Colors.warning
    : Colors.red;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ── */}
      <SafeAreaView edges={['top']}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bonjour,</Text>
            <Text style={styles.name}>Pour {profile.name || 'vous'}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtn}>
              <Search size={20} color={Colors.text} strokeWidth={2} />
            </TouchableOpacity>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>
                {(profile.name || 'A').charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>

      {/* ── Avatar Hero ── */}
      <View style={[styles.avatarSection, Shadow.md]}>
        <LinearGradient
          colors={['#0D1117', '#080B12', '#0D1117']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Gender toggle */}
        <View style={styles.genderRow}>
          {(['female', 'male'] as const).map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.genderPill, avatarGender === g && styles.genderPillActive]}
              onPress={() => setAvatarGender(g)}
              activeOpacity={0.8}
            >
              <Text style={[styles.genderPillTxt, avatarGender === g && styles.genderPillTxtActive]}>
                {g === 'female' ? '♀  Femme' : '♂  Homme'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Avatar LEFT · Stats RIGHT */}
        <View style={styles.avatarBodyRow}>
          <Avatar gender={avatarGender} params={params} size={W * 0.36} />

          <View style={styles.statsCol}>
            <View style={styles.statItem}>
              <Text style={styles.statBigVal}>{currentMeasure?.weight ?? '—'}</Text>
              <Text style={styles.statBigUnit}>kg</Text>
              <Text style={styles.statBigLbl}>POIDS</Text>
            </View>
            <View style={styles.statSep} />
            <View style={styles.statItem}>
              <Text style={[styles.statBigVal, { color: bmiColor, fontSize: 28 }]}>
                {params.bmi.toFixed(1)}
              </Text>
              <Text style={[styles.statBigUnit, { color: bmiColor }]}>IMC</Text>
              <Text style={[styles.statBigLbl, { color: bmiColor }]}>
                {params.bmi < 18.5 ? 'MAIGREUR' : params.bmi < 25 ? 'NORMAL' : params.bmi < 30 ? 'SURPOIDS' : 'OBÉSITÉ'}
              </Text>
            </View>
            <View style={styles.statSep} />
            <View style={styles.statItem}>
              <Text style={styles.statBigVal}>{currentMeasure?.waist ?? '—'}</Text>
              <Text style={styles.statBigUnit}>cm</Text>
              <Text style={styles.statBigLbl}>TAILLE</Text>
            </View>
          </View>
        </View>
      </View>

      {/* ── Step bar ── */}
      <View style={styles.stepWrap}>
        <View style={styles.statsStrip}>
          <View style={[styles.statBlock, { borderRightWidth: 0.5, borderRightColor: Colors.cardBorder }]}>
            <Text style={styles.statVal}>{todaySteps.toLocaleString('fr-FR')}</Text>
            <Text style={styles.statLbl}>Pas aujourd'hui</Text>
          </View>
          <View style={[styles.statBlock, { borderRightWidth: 0.5, borderRightColor: Colors.cardBorder }]}>
            <Text style={styles.statVal}>{sessions.length}</Text>
            <Text style={styles.statLbl}>Séances</Text>
          </View>
          <View style={styles.statBlock}>
            <Text style={[styles.statVal, { color: stepPct >= 100 ? Colors.success : Colors.text }]}>
              {stepPct}%
            </Text>
            <Text style={styles.statLbl}>Objectif</Text>
          </View>
        </View>
        <View style={styles.stepTrack}>
          <View style={[styles.stepFill, { width: `${stepPct}%` } as any]} />
        </View>
      </View>

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

      {/* ── Programmes ── */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>PROGRAMMES</Text>
        <TouchableOpacity>
          <Text style={styles.sectionLink}>Voir tout</Text>
        </TouchableOpacity>
      </View>

      {PROGRAMS.map((p) => (
        <TouchableOpacity key={p.id} style={[styles.programCard, Shadow.lg]} activeOpacity={0.9}>
          <Image source={{ uri: p.image }} style={styles.programImg} resizeMode="cover" />
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.82)']}
            style={[StyleSheet.absoluteFill, { borderRadius: Radius.xl }]}
          />
          <View style={styles.programOverlay}>
            <View style={styles.programTop}>
              <View style={styles.levelPill}>
                <Text style={styles.levelTxt}>{p.level}</Text>
              </View>
              <TouchableOpacity style={styles.playBtn}>
                <Play size={14} color={Colors.background} fill={Colors.background} />
              </TouchableOpacity>
            </View>
            <View>
              <Text style={styles.programTag}>{p.tag}</Text>
              <Text style={styles.programTitle}>{p.title}</Text>
              <Text style={styles.programMeta}>{p.meta}</Text>
              <TouchableOpacity style={styles.programCta} activeOpacity={0.85}>
                <Play size={12} color={Colors.background} fill={Colors.background} />
                <Text style={styles.programCtaTxt}>Démarrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      ))}

      {/* ── Sessions récentes ── */}
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

  /* Header */
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  greeting:     { fontSize: 12, color: Colors.textSecondary, fontWeight: '400' },
  name:         { fontSize: 24, fontWeight: '800', color: Colors.text, letterSpacing: -0.5, marginTop: 2 },
  headerRight:  { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  iconBtn:      { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  avatarCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.cardBorder },
  avatarInitial:{ fontSize: 16, fontWeight: '700', color: Colors.text },

  /* Avatar section */
  avatarSection: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    borderRadius: Radius.xxl,
    overflow: 'hidden',
  },
  genderRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    marginBottom: 4,
  },
  genderPill: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  genderPillActive: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  genderPillTxt:       { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.5)' },
  genderPillTxtActive: { color: '#0D1117', fontWeight: '800' },

  /* Horizontal row: avatar + stats */
  avatarBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: Spacing.md,
  },
  statsCol: {
    flex: 1,
    paddingLeft: Spacing.md,
    gap: 0,
  },
  statItem: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  statSep: {
    height: 0.5,
    backgroundColor: 'rgba(255,255,255,0.10)',
    marginHorizontal: Spacing.sm,
  },
  statBigVal:  { fontSize: 30, fontWeight: '900', color: '#FFFFFF', letterSpacing: -1 },
  statBigUnit: { fontSize: 11, fontWeight: '400', color: 'rgba(255,255,255,0.5)', marginTop: 1 },
  statBigLbl:  { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 1.2, marginTop: 3 },

  /* Step / stats strip */
  stepWrap: { marginHorizontal: Spacing.md, marginTop: Spacing.md },
  statsStrip: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
  },
  statBlock: { flex: 1, paddingVertical: Spacing.md, alignItems: 'center' },
  statVal:   { fontSize: 20, fontWeight: '900', color: Colors.text, letterSpacing: -0.5 },
  statLbl:   { fontSize: 10, color: Colors.textSecondary, marginTop: 2 },
  stepTrack: { height: 3, backgroundColor: Colors.surface, borderRadius: Radius.full, overflow: 'hidden', marginTop: 8 },
  stepFill:  { height: '100%', backgroundColor: Colors.accent, borderRadius: Radius.full },

  /* Filters */
  filtersScroll: { marginTop: Spacing.lg },
  filtersRow:    { paddingHorizontal: Spacing.md, gap: Spacing.sm },
  filterPill:    { paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: Radius.full, backgroundColor: Colors.surface, borderWidth: 0.5, borderColor: Colors.cardBorder },
  filterPillActive:  { backgroundColor: '#fff', borderColor: '#fff' },
  filterTxt:         { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
  filterTxtActive:   { color: Colors.background, fontWeight: '700' },

  /* Section header */
  sectionRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, marginTop: Spacing.xl, marginBottom: Spacing.md },
  sectionTitle: { fontSize: 11, fontWeight: '800', color: Colors.text, letterSpacing: 3, textTransform: 'uppercase' },
  sectionLink:  { fontSize: 12, fontWeight: '500', color: Colors.textSecondary },

  /* Program cards */
  programCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: Radius.xl,
    height: 340,
    overflow: 'hidden',
    position: 'relative',
  },
  programImg:     { ...StyleSheet.absoluteFillObject },
  programOverlay: { ...StyleSheet.absoluteFillObject, padding: Spacing.md, justifyContent: 'space-between' },
  programTop:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  levelPill:      { paddingHorizontal: 10, paddingVertical: 5, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: Radius.full, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.3)' },
  levelTxt:       { fontSize: 11, fontWeight: '600', color: '#fff' },
  playBtn:        { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  programTag:     { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 },
  programTitle:   { fontSize: 38, fontWeight: '900', color: '#fff', textTransform: 'uppercase', letterSpacing: -1.5, lineHeight: 38 },
  programMeta:    { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 6 },
  programCta:     { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff', borderRadius: Radius.full, paddingHorizontal: 18, paddingVertical: 10, alignSelf: 'flex-start', marginTop: 10 },
  programCtaTxt:  { fontSize: 13, fontWeight: '700', color: Colors.background },

  /* Recent sessions */
  sessionRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card,
    borderRadius: Radius.lg, padding: Spacing.md, marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm, gap: Spacing.md, borderWidth: 0.5, borderColor: Colors.cardBorder,
  },
  sessionDot:    { width: 44, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  sessionDate:   { fontSize: 14, fontWeight: '600', color: Colors.text, textTransform: 'capitalize' },
  sessionSub:    { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  effortTag:     { borderRadius: Radius.sm, paddingHorizontal: 8, paddingVertical: 5 },
  effortTagTxt:  { fontSize: 12, fontWeight: '800' },
});
