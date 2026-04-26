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
      <SafeAreaView edges={['top']} style={styles.headerArea}>
        <LinearGradient
          colors={['rgba(28,37,65,0.95)', 'rgba(10,17,40,0)']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bonjour,</Text>
            <Text style={styles.name}>{profile.name || 'Athlète'}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtn}>
              <Search size={20} color={Colors.text} strokeWidth={1.8} />
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
          colors={['#0C1428', '#060E1C', '#0C1428']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {/* Coral top accent line */}
        <View style={styles.avatarTopAccent} />

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
        <View style={styles.sectionTitleRow}>
          <View style={styles.accentBar} />
          <Text style={styles.sectionTitle}>PROGRAMMES</Text>
        </View>
        <TouchableOpacity>
          <Text style={styles.sectionLink}>Voir tout</Text>
        </TouchableOpacity>
      </View>

      {PROGRAMS.map((p) => (
        <TouchableOpacity key={p.id} style={[styles.programCard, Shadow.lg]} activeOpacity={0.9}>
          <Image source={{ uri: p.image }} style={styles.programImg} resizeMode="cover" />
          <LinearGradient
            colors={['rgba(6,14,28,0)', 'rgba(6,14,28,0.55)', 'rgba(6,14,28,0.92)']}
            style={[StyleSheet.absoluteFill, { borderRadius: Radius.xl }]}
          />
          <View style={styles.programOverlay}>
            <View style={styles.programTop}>
              <View style={styles.levelPill}>
                <Text style={styles.levelTxt}>{p.level}</Text>
              </View>
              <TouchableOpacity style={styles.playBtn}>
                <Play size={14} color="#333" fill="#333" />
              </TouchableOpacity>
            </View>
            <View>
              <Text style={styles.programTag}>{p.tag}</Text>
              <Text style={styles.programTitle}>{p.title}</Text>
              <Text style={styles.programMeta}>{p.meta}</Text>
              <TouchableOpacity style={styles.programCta} activeOpacity={0.85}>
                <Play size={12} color="#333" fill="#333" />
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
            <View style={styles.sectionTitleRow}>
              <View style={styles.accentBar} />
              <Text style={styles.sectionTitle}>RÉCENT</Text>
            </View>
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
  headerArea:   { overflow: 'hidden' },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, paddingBottom: Spacing.md },
  greeting:     { fontSize: 12, color: Colors.textSecondary, fontWeight: '400', letterSpacing: 0.3 },
  name:         { fontSize: 28, fontWeight: '900', color: Colors.text, letterSpacing: -1, marginTop: 1 },
  headerRight:  { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  iconBtn:      { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: Colors.cardBorder },
  avatarCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  avatarInitial:{ fontSize: 16, fontWeight: '800', color: '#333' },

  /* Avatar card */
  avatarSection: {
    marginHorizontal: Spacing.md,
    borderRadius: Radius.xxl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(226,209,179,0.22)',
  },
  avatarTopAccent: {
    height: 3,
    backgroundColor: Colors.accent,
    marginHorizontal: 0,
  },
  genderRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    marginBottom: 4,
  },
  genderPill: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  genderPillActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  genderPillTxt:       { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.40)' },
  genderPillTxtActive: { color: '#333', fontWeight: '800' },

  /* Horizontal: avatar left, stats right */
  avatarBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: Spacing.md,
  },
  statsCol:  { flex: 1, paddingLeft: Spacing.md },
  statItem:  { alignItems: 'center', paddingVertical: 16 },
  statSep:   { height: 0.5, backgroundColor: 'rgba(255,255,255,0.08)', marginHorizontal: Spacing.sm },
  statBigVal:  { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: -1.2 },
  statBigUnit: { fontSize: 11, fontWeight: '400', color: 'rgba(255,255,255,0.45)', marginTop: 2 },
  statBigLbl:  { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 4 },

  /* Step strip */
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
  statVal:   { fontSize: 22, fontWeight: '900', color: Colors.text, letterSpacing: -0.8 },
  statLbl:   { fontSize: 9, color: Colors.textSecondary, marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.8 },
  stepTrack: { height: 4, backgroundColor: Colors.surface, borderRadius: Radius.full, overflow: 'hidden', marginTop: 10 },
  stepFill:  { height: '100%', backgroundColor: Colors.accent, borderRadius: Radius.full },

  /* Filters */
  filtersScroll: { marginTop: Spacing.lg },
  filtersRow:    { paddingHorizontal: Spacing.md, gap: Spacing.sm },
  filterPill:       { paddingHorizontal: 18, paddingVertical: 9, borderRadius: Radius.full, backgroundColor: Colors.card, borderWidth: 0.5, borderColor: Colors.cardBorder },
  filterPillActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  filterTxt:        { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
  filterTxtActive:  { color: '#333', fontWeight: '700' },

  /* Section headers */
  sectionRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, marginTop: Spacing.xl, marginBottom: Spacing.md },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  accentBar:       { width: 3, height: 16, borderRadius: 2, backgroundColor: Colors.accent },
  sectionTitle:    { fontSize: 12, fontWeight: '800', color: Colors.text, letterSpacing: 2.5, textTransform: 'uppercase' },
  sectionLink:     { fontSize: 12, fontWeight: '600', color: Colors.accent },

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
  levelPill:      { paddingHorizontal: 12, paddingVertical: 5, backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: Radius.full, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.28)' },
  levelTxt:       { fontSize: 11, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },
  playBtn:        { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  programTag:     { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: 2.5, marginBottom: 6 },
  programTitle:   { fontSize: 40, fontWeight: '900', color: '#fff', textTransform: 'uppercase', letterSpacing: -1.5, lineHeight: 40 },
  programMeta:    { fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 8 },
  programCta:     { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.accent, borderRadius: Radius.full, paddingHorizontal: 20, paddingVertical: 11, alignSelf: 'flex-start', marginTop: 12 },
  programCtaTxt:  { fontSize: 13, fontWeight: '800', color: '#333', letterSpacing: 0.2 },

  /* Recent sessions */
  sessionRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card,
    borderRadius: Radius.lg, padding: Spacing.md, marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm, gap: Spacing.md, borderWidth: 0.5, borderColor: Colors.cardBorder,
  },
  sessionDot:    { width: 44, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  sessionDate:   { fontSize: 14, fontWeight: '700', color: Colors.text, textTransform: 'capitalize' },
  sessionSub:    { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  effortTag:     { borderRadius: Radius.sm, paddingHorizontal: 8, paddingVertical: 5 },
  effortTagTxt:  { fontSize: 12, fontWeight: '800' },
});
