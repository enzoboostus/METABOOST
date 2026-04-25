import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Avatar from '@/components/Avatar';
import StatCard from '@/components/StatCard';
import { useShallow } from 'zustand/react/shallow';
import { useUserStore } from '@/store/userStore';
import { useAvatarParams } from '@/hooks/useAvatarParams';
import { useSteps } from '@/hooks/useSteps';
import { Colors, Spacing, Radius } from '@/constants/theme';

const BG: any = {
  backgroundImage: 'radial-gradient(ellipse at 50% 0%, #0A1018 0%, #020305 80%)',
};
const GLASS: any = { backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' };
const FLOAT: any = { boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 1px rgba(0,242,255,0.08)' };

type ViewMode = 'current' | 'start';

export default function Dashboard() {
  const [viewMode, setViewMode] = useState<ViewMode>('current');
  const { profile, getCurrentMeasure, initialMeasure, sessions, todaySteps } = useUserStore(
    useShallow((s) => ({
      profile: s.profile,
      getCurrentMeasure: s.getCurrentMeasure,
      initialMeasure: s.initialMeasure,
      sessions: s.sessions,
      todaySteps: s.todaySteps,
    }))
  );

  useSteps();

  const currentMeasure = getCurrentMeasure();
  const params = useAvatarParams();

  const bmiColor =
    params.bmi < 18.5 ? Colors.warning
    : params.bmi < 25  ? Colors.cyan
    : params.bmi < 30  ? Colors.warning
    : Colors.accent;

  const bmiLabel =
    params.bmi < 18.5 ? 'Maigreur'
    : params.bmi < 25  ? 'Normal'
    : params.bmi < 30  ? 'Surpoids'
    : 'Obésité';

  const progressPercent =
    initialMeasure && currentMeasure
      ? Math.round(((initialMeasure.weight - currentMeasure.weight) / initialMeasure.weight) * 100 * 10) / 10
      : 0;

  const stepPct = Math.min(100, Math.round((todaySteps / 10000) * 100));

  return (
    <SafeAreaView style={[styles.safe, BG]} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bonjour,</Text>
            <Text style={styles.name}>{profile.name || 'Athlète'} 👋</Text>
          </View>
          <View style={[styles.bmiPill, { borderColor: bmiColor + '55', backgroundColor: bmiColor + '12' }]}>
            <Text style={[styles.bmiValue, { color: bmiColor }]}>IMC {params.bmi.toFixed(1)}</Text>
            <Text style={[styles.bmiLabel, { color: bmiColor }]}>{bmiLabel}</Text>
          </View>
        </View>

        {/* Avatar pod */}
        <View style={[styles.avatarSection, FLOAT]}>
          <LinearGradient
            colors={['rgba(8,14,22,0.98)', 'rgba(2,3,5,0.95)']}
            style={[styles.avatarBg, GLASS]}
          >
            <View style={styles.toggle}>
              <TouchableOpacity
                style={[styles.toggleBtn, viewMode === 'start' && styles.toggleActive]}
                onPress={() => setViewMode('start')}
              >
                <Text style={[styles.toggleText, viewMode === 'start' && styles.toggleTextActive]}>Départ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, viewMode === 'current' && styles.toggleActive]}
                onPress={() => setViewMode('current')}
              >
                <Text style={[styles.toggleText, viewMode === 'current' && styles.toggleTextActive]}>Actuel</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.avatarWrapper}>
              {viewMode === 'current' ? (
                <Avatar gender={profile.gender} params={params} size={240} />
              ) : initialMeasure ? (
                <Avatar
                  gender={profile.gender}
                  params={{
                    ...params,
                    bodyWidth: (initialMeasure.weight / (profile.height / 100) ** 2) * 0.024 + 0.4,
                    waistWidth: initialMeasure.waist / 80,
                    toneLevel: 0,
                    posture: 0,
                    stepSlim: 0,
                  }}
                  size={240}
                />
              ) : (
                <Avatar gender={profile.gender} params={params} size={240} />
              )}
            </View>

            {progressPercent !== 0 && (
              <View style={styles.progressBadge}>
                <Text style={styles.progressText}>
                  {progressPercent > 0 ? '▼' : '▲'} {Math.abs(progressPercent)}% poids
                </Text>
              </View>
            )}
          </LinearGradient>
        </View>

        {/* Stats */}
        <Text style={styles.sectionTitle}>Statistiques rapides</Text>
        <View style={styles.statsRow}>
          <StatCard label="Poids" value={currentMeasure?.weight ?? '—'} unit="kg" icon="⚖️" color={Colors.cyan} />
          <StatCard label="Tour de taille" value={currentMeasure?.waist ?? '—'} unit="cm" icon="📏" color={Colors.cyan} />
        </View>
        <View style={[styles.statsRow, { marginTop: Spacing.sm }]}>
          <StatCard label="Séances" value={sessions.length} icon="🏋️" color={Colors.cyan} />
          <StatCard label="Pas aujourd'hui" value={todaySteps.toLocaleString('fr-FR')} icon="👟" color={Colors.cyan} />
        </View>

        {/* Step bar with inner glow */}
        <View style={[styles.stepBar, GLASS, FLOAT]}>
          <View style={styles.stepBarHeader}>
            <Text style={styles.stepBarLabel}>Objectif 10 000 pas</Text>
            <Text style={styles.stepBarPct}>{stepPct}%</Text>
          </View>
          <View style={styles.stepTrack}>
            <View style={[styles.stepFill, { width: `${stepPct}%` } as any]} />
          </View>
          {stepPct >= 100 && <Text style={styles.stepDone}>— Objectif atteint —</Text>}
        </View>

        {/* Recent sessions */}
        {sessions.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Dernières séances</Text>
            {sessions.slice(0, 3).map((s) => (
              <View key={s.id} style={[styles.sessionRow, GLASS]}>
                <Text style={styles.sessionEmoji}>
                  {s.feeling === 'top' ? '🔥' : s.feeling === 'medium' ? '😐' : '😓'}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sessionDate}>
                    {new Date(s.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </Text>
                  <Text style={styles.sessionSub}>
                    Effort {s.effort}/10 · {s.steps.toLocaleString('fr-FR')} pas
                  </Text>
                </View>
                <View style={[styles.effortChip, { backgroundColor: getEffortColor(s.effort) + '18' }]}>
                  <Text style={[styles.effortChipTxt, { color: getEffortColor(s.effort) }]}>
                    {s.effort}/10
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function getEffortColor(n: number) {
  return n >= 8 ? Colors.accent : Colors.cyan;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.md },
  greeting: { fontSize: 12, fontWeight: '300', color: Colors.textSecondary, letterSpacing: 2, textTransform: 'uppercase' },
  name: { fontSize: 28, fontWeight: '900', color: Colors.text, marginTop: 2, letterSpacing: -0.5 },

  bmiPill: { borderRadius: Radius.full, borderWidth: 1, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, alignItems: 'center' },
  bmiValue: { fontSize: 13, fontWeight: '900' },
  bmiLabel: { fontSize: 9, fontWeight: '300', textTransform: 'uppercase', letterSpacing: 2 },

  avatarSection: { marginBottom: Spacing.lg, borderRadius: Radius.xl },
  avatarBg: {
    borderRadius: Radius.xl,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,242,255,0.12)',
  },
  avatarWrapper: { alignItems: 'center' },
  toggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: Radius.full,
    padding: 3,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  toggleBtn: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.xs, borderRadius: Radius.full },
  toggleActive: { backgroundColor: 'rgba(0,242,255,0.15)', borderWidth: 1, borderColor: 'rgba(0,242,255,0.4)' },
  toggleText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, letterSpacing: 0.5 },
  toggleTextActive: { color: Colors.cyan, fontWeight: '700' },
  progressBadge: {
    marginTop: Spacing.sm,
    backgroundColor: 'rgba(0,242,255,0.10)',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(0,242,255,0.25)',
  },
  progressText: { color: Colors.cyan, fontSize: 12, fontWeight: '700', letterSpacing: 1 },

  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 3,
  },
  statsRow: { flexDirection: 'row', gap: Spacing.sm },

  stepBar: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  stepBarHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  stepBarLabel: { fontSize: 11, fontWeight: '300', color: Colors.textSecondary, letterSpacing: 1 },
  stepBarPct: { fontSize: 15, fontWeight: '900', color: Colors.cyan },
  stepTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  stepFill: {
    height: '100%',
    backgroundColor: Colors.cyan,
    borderRadius: Radius.full,
    shadowColor: Colors.cyan,
    shadowOpacity: 0.8,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    boxShadow: '0 0 12px rgba(0,242,255,0.7), inset 0 0 6px rgba(0,242,255,0.4)' as any,
  },
  stepDone: { fontSize: 11, color: Colors.cyan, fontWeight: '600', marginTop: Spacing.sm, textAlign: 'center', letterSpacing: 2 },

  sessionRow: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sessionEmoji: { fontSize: 22 },
  sessionDate: { fontSize: 14, fontWeight: '700', color: Colors.text },
  sessionSub: { fontSize: 11, fontWeight: '300', color: Colors.textSecondary, marginTop: 2, letterSpacing: 0.3 },
  effortChip: { borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 4 },
  effortChipTxt: { fontSize: 12, fontWeight: '900' },
});
