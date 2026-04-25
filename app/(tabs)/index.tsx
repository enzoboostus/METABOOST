import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Scale, Footprints, Dumbbell, Play, ChevronRight } from 'lucide-react-native';
import { useShallow } from 'zustand/react/shallow';
import { useUserStore } from '@/store/userStore';
import { useAvatarParams } from '@/hooks/useAvatarParams';
import { useSteps } from '@/hooks/useSteps';
import { Colors, Spacing, Radius, Shadow } from '@/constants/theme';

/* ─── Mock program catalog ──────────────────────────────────────────────────── */
interface Program {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  duration: string;
  sessionsPerWeek: number;
  level: string;
  equipment: string[];
  image: string;
}

const PROGRAMS: Program[] = [
  {
    id: 'p1',
    name: 'SCULPT',
    subtitle: 'Intensive',
    category: 'Cardio & Renfo',
    duration: '35min',
    sessionsPerWeek: 4,
    level: 'Confirmé',
    equipment: ['Haltères'],
    image: 'https://images.unsplash.com/photo-1550345332-09e3ac987658?auto=format&fit=crop&w=800&h=500&q=90',
  },
  {
    id: 'p2',
    name: 'PILATES',
    subtitle: 'Cercle',
    category: 'Gainage & Posture',
    duration: '25min',
    sessionsPerWeek: 3,
    level: 'Intermédiaire',
    equipment: ['Tapis'],
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&h=500&q=90',
  },
  {
    id: 'p3',
    name: 'FORCE',
    subtitle: 'Maximum',
    category: 'Musculation',
    duration: '40min',
    sessionsPerWeek: 4,
    level: 'Expert',
    equipment: ['Barres', 'Haltères'],
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&h=500&q=90',
  },
];

const FILTERS = ['Personnalisé', 'Tout nouveau ✨', 'Force', 'Cardio', 'Souplesse'];

export default function Dashboard() {
  const [activeFilter, setActiveFilter] = useState(0);
  const [featuredIdx, setFeaturedIdx]   = useState(0);

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
  const featured       = PROGRAMS[featuredIdx % PROGRAMS.length];

  const bmi      = params.bmi;
  const stepPct  = Math.min(100, Math.round((todaySteps / 10000) * 100));
  const initials = (profile.name || 'A').charAt(0).toUpperCase();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
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
              <Text style={styles.avatarInitial}>{initials}</Text>
            </View>
          </View>
        </View>

        {/* ── Filter tabs ── */}
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

        {/* ── Featured program card ── */}
        <View style={[styles.programCard, Shadow.lg]}>
          {/* Photo */}
          <View style={styles.programImageWrap}>
            <Image source={{ uri: featured.image }} style={styles.programImage} resizeMode="cover" />
            <LinearGradient
              colors={['rgba(0,0,0,0.55)', 'rgba(0,0,0,0)']}
              start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
              style={[StyleSheet.absoluteFill, { borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl }]}
            />

            {/* Title overlay */}
            <View style={styles.titleOverlay}>
              <Text style={styles.programSubtitle}>{featured.subtitle}</Text>
              <Text style={styles.programName}>{featured.name}</Text>
            </View>

            {/* Progress pill */}
            <View style={styles.progressPill}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: '12%' }]} />
              </View>
              <Text style={styles.progressPct}>12%</Text>
            </View>

            {/* Nav dots */}
            <View style={styles.dotsRow}>
              {PROGRAMS.map((_, i) => (
                <TouchableOpacity key={i} onPress={() => setFeaturedIdx(i)}>
                  <View style={[styles.dot, i === featuredIdx % PROGRAMS.length && styles.dotActive]} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Details section */}
          <View style={styles.programDetails}>
            <Text style={styles.detailHint}>Temps moyen par séance : {featured.duration}</Text>
            <Text style={styles.detailSessions}>{featured.sessionsPerWeek} séances <Text style={styles.detailUnit}>/sem</Text></Text>
            <Text style={styles.detailMeta}>Niveau : <Text style={styles.detailMetaBold}>{featured.level}</Text></Text>
            <Text style={styles.detailMeta}>Objectif : <Text style={styles.detailMetaBold}>{featured.category}</Text></Text>

            <View style={styles.detailFooter}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexShrink: 1 }}>
                {featured.equipment.map((tag) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagTxt}>{tag}</Text>
                  </View>
                ))}
              </ScrollView>
              <TouchableOpacity style={styles.ctaBtn} activeOpacity={0.8}>
                <Play size={12} color="#fff" fill="#fff" />
                <Text style={styles.ctaTxt}>Voir le programme</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── Quick stats strip ── */}
        <View style={styles.statsStrip}>
          <View style={[styles.statChip, Shadow.sm]}>
            <Scale size={16} color={Colors.text} strokeWidth={1.5} />
            <Text style={styles.statChipVal}>{currentMeasure?.weight ?? '—'}</Text>
            <Text style={styles.statChipUnit}>kg</Text>
          </View>
          <View style={[styles.statChip, Shadow.sm]}>
            <Footprints size={16} color={Colors.text} strokeWidth={1.5} />
            <Text style={styles.statChipVal}>{todaySteps.toLocaleString('fr-FR')}</Text>
            <Text style={styles.statChipUnit}>pas</Text>
          </View>
          <View style={[styles.statChip, Shadow.sm]}>
            <Dumbbell size={16} color={Colors.text} strokeWidth={1.5} />
            <Text style={styles.statChipVal}>{sessions.length}</Text>
            <Text style={styles.statChipUnit}>séances</Text>
          </View>
          <View style={[styles.statChip, { borderColor: bmi < 25 ? Colors.success + '44' : Colors.warning + '44', backgroundColor: bmi < 25 ? Colors.success + '0A' : Colors.warning + '0A' }, Shadow.sm]}>
            <Text style={[styles.statChipVal, { color: bmi < 25 ? Colors.success : Colors.warning, fontSize: 18 }]}>{bmi.toFixed(1)}</Text>
            <Text style={[styles.statChipUnit, { color: bmi < 25 ? Colors.success : Colors.warning }]}>IMC</Text>
          </View>
        </View>

        {/* ── Step goal bar ── */}
        <View style={[styles.stepCard, Shadow.sm]}>
          <View style={styles.stepCardHeader}>
            <Text style={styles.stepCardLabel}>Objectif quotidien</Text>
            <Text style={styles.stepCardPct}>{stepPct}%</Text>
          </View>
          <View style={styles.stepTrack}>
            <View style={[styles.stepFill, { width: `${stepPct}%` } as any]} />
          </View>
          <Text style={styles.stepCardSub}>
            {todaySteps >= 10000
              ? '🎯 Objectif atteint !'
              : `${(10000 - todaySteps).toLocaleString('fr-FR')} pas restants`}
          </Text>
        </View>

        {/* ── Programmes en cours ── */}
        {sessions.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Programmes en cours</Text>
              <TouchableOpacity style={styles.seeAllBtn}>
                <Text style={styles.seeAllTxt}>Voir tout</Text>
                <ChevronRight size={14} color={Colors.textSecondary} strokeWidth={2} />
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              data={sessions.slice(0, 5)}
              keyExtractor={(s) => s.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: Spacing.md }}
              renderItem={({ item: s }) => {
                const prog = PROGRAMS[parseInt(s.id) % PROGRAMS.length];
                return (
                  <View style={[styles.miniCard, Shadow.md]}>
                    <Image source={{ uri: prog.image }} style={styles.miniCardImg} resizeMode="cover" />
                    <LinearGradient
                      colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)']}
                      style={[StyleSheet.absoluteFill, { borderRadius: Radius.lg }]}
                    />
                    <View style={styles.miniProgressPill}>
                      <View style={styles.miniProgressTrack}>
                        <View style={[styles.miniProgressFill, { width: `${s.effort * 10}%` }]} />
                      </View>
                      <Text style={styles.miniProgressPct}>{s.effort * 10}%</Text>
                    </View>
                    <View style={styles.miniCardBottom}>
                      <Text style={styles.miniCardSub}>{prog.subtitle}</Text>
                      <Text style={styles.miniCardName}>{prog.name}</Text>
                    </View>
                  </View>
                );
              }}
            />
          </>
        )}

        {/* ── Autres programmes ── */}
        <View style={[styles.sectionHeader, { marginTop: sessions.length > 0 ? Spacing.md : 0 }]}>
          <Text style={styles.sectionTitle}>Tous les programmes</Text>
          <TouchableOpacity style={styles.seeAllBtn}>
            <Text style={styles.seeAllTxt}>Voir tout</Text>
            <ChevronRight size={14} color={Colors.textSecondary} strokeWidth={2} />
          </TouchableOpacity>
        </View>
        {PROGRAMS.map((p, i) => (
          <TouchableOpacity key={p.id} style={[styles.listCard, Shadow.sm]} activeOpacity={0.9}>
            <Image source={{ uri: p.image }} style={styles.listCardImg} resizeMode="cover" />
            <View style={styles.listCardContent}>
              <Text style={styles.listCardSub}>{p.subtitle}</Text>
              <Text style={styles.listCardName}>{p.name}</Text>
              <Text style={styles.listCardMeta}>{p.sessionsPerWeek} séances/sem · {p.duration}</Text>
              <View style={styles.listCardTags}>
                <View style={styles.levelTag}>
                  <Text style={styles.levelTagTxt}>{p.level}</Text>
                </View>
              </View>
            </View>
            <ChevronRight size={18} color={Colors.textTertiary} strokeWidth={1.5} />
          </TouchableOpacity>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.background },
  scroll:  { flex: 1 },
  content: { paddingBottom: Spacing.xxl },

  /* Header */
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, marginBottom: Spacing.md },
  greeting:    { fontSize: 12, fontWeight: '400', color: Colors.textSecondary, letterSpacing: 0.3 },
  name:        { fontSize: 24, fontWeight: '800', color: Colors.text, marginTop: 2, letterSpacing: -0.5 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  iconBtn:     { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  avatarCircle:{ width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.text, alignItems: 'center', justifyContent: 'center' },
  avatarInitial:{ fontSize: 16, fontWeight: '700', color: '#fff' },

  /* Filters */
  filtersScroll: { marginBottom: Spacing.md },
  filtersRow:    { paddingHorizontal: Spacing.md, gap: Spacing.sm },
  filterPill:    { paddingHorizontal: Spacing.md, paddingVertical: 9, borderRadius: Radius.full, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder },
  filterPillActive: { backgroundColor: Colors.text, borderColor: Colors.text },
  filterTxt:     { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
  filterTxtActive:{ color: '#fff', fontWeight: '600' },

  /* Featured program card */
  programCard: {
    marginHorizontal: Spacing.md,
    borderRadius: Radius.xl,
    backgroundColor: Colors.card,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  programImageWrap: { position: 'relative', height: 260 },
  programImage:     { width: '100%', height: '100%' },
  titleOverlay: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
  },
  programSubtitle: { fontSize: 13, fontWeight: '400', color: 'rgba(255,255,255,0.85)', letterSpacing: 0.5, fontStyle: 'italic' },
  programName:     { fontSize: 42, fontWeight: '900', color: '#fff', letterSpacing: -1, lineHeight: 44, marginTop: 2 },
  progressPill: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.40)',
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  progressTrack: { width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: Radius.full, overflow: 'hidden' },
  progressFill:  { height: '100%', backgroundColor: Colors.accent, borderRadius: Radius.full },
  progressPct:   { fontSize: 11, fontWeight: '700', color: '#fff' },
  dotsRow: { position: 'absolute', bottom: Spacing.sm, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 5 },
  dot:       { width: 5, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { width: 16, backgroundColor: '#fff' },

  programDetails: { padding: Spacing.md, gap: 3 },
  detailHint:     { fontSize: 11, fontWeight: '400', color: Colors.textSecondary, marginBottom: 2 },
  detailSessions: { fontSize: 22, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
  detailUnit:     { fontSize: 15, fontWeight: '400', color: Colors.textSecondary },
  detailMeta:     { fontSize: 13, fontWeight: '400', color: Colors.textSecondary },
  detailMetaBold: { fontWeight: '700', color: Colors.text },
  detailFooter:   { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm, gap: Spacing.sm },
  tag:    { paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.sm, backgroundColor: Colors.background, marginRight: 4 },
  tagTxt: { fontSize: 12, fontWeight: '500', color: Colors.textSecondary },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.text, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 9 },
  ctaTxt: { fontSize: 13, fontWeight: '700', color: '#fff' },

  /* Stats strip */
  statsStrip: { flexDirection: 'row', paddingHorizontal: Spacing.md, gap: Spacing.sm, marginBottom: Spacing.md },
  statChip: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.sm,
    alignItems: 'center',
    gap: 2,
  },
  statChipVal:  { fontSize: 20, fontWeight: '900', color: Colors.text, letterSpacing: -0.5 },
  statChipUnit: { fontSize: 9, fontWeight: '400', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8 },

  /* Step bar */
  stepCard: {
    marginHorizontal: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  stepCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  stepCardLabel:  { fontSize: 13, fontWeight: '500', color: Colors.text },
  stepCardPct:    { fontSize: 15, fontWeight: '800', color: Colors.accent },
  stepTrack:      { height: 6, backgroundColor: Colors.background, borderRadius: Radius.full, overflow: 'hidden', marginBottom: Spacing.sm },
  stepFill:       { height: '100%', backgroundColor: Colors.accent, borderRadius: Radius.full },
  stepCardSub:    { fontSize: 12, fontWeight: '400', color: Colors.textSecondary },

  /* Section header */
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, marginBottom: Spacing.sm },
  sectionTitle:  { fontSize: 18, fontWeight: '800', color: Colors.text, letterSpacing: -0.3 },
  seeAllBtn:     { flexDirection: 'row', alignItems: 'center', gap: 2 },
  seeAllTxt:     { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },

  /* Mini cards (horizontal scroll) */
  miniCard: {
    width: 160,
    height: 200,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginLeft: Spacing.md,
    position: 'relative',
  },
  miniCardImg:        { width: '100%', height: '100%' },
  miniProgressPill: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: Radius.full,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  miniProgressTrack: { width: 28, height: 3, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2, overflow: 'hidden' },
  miniProgressFill:  { height: '100%', backgroundColor: Colors.accent },
  miniProgressPct:   { fontSize: 9, fontWeight: '700', color: '#fff' },
  miniCardBottom: { position: 'absolute', bottom: Spacing.sm, left: Spacing.sm, right: Spacing.sm },
  miniCardSub:  { fontSize: 10, color: 'rgba(255,255,255,0.8)', fontStyle: 'italic' },
  miniCardName: { fontSize: 18, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },

  /* List cards */
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  listCardImg:     { width: 90, height: 90 },
  listCardContent: { flex: 1, padding: Spacing.md, gap: 2 },
  listCardSub:     { fontSize: 11, color: Colors.textSecondary, fontStyle: 'italic' },
  listCardName:    { fontSize: 18, fontWeight: '900', color: Colors.text, letterSpacing: -0.5 },
  listCardMeta:    { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  listCardTags:    { flexDirection: 'row', marginTop: 4 },
  levelTag:        { paddingHorizontal: 8, paddingVertical: 3, backgroundColor: Colors.background, borderRadius: Radius.sm },
  levelTagTxt:     { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },
});
