import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
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

const { width } = Dimensions.get('window');

const BG: any = {
  backgroundImage: 'radial-gradient(ellipse at 50% 0%, #0D1520 0%, #020202 75%)',
};
const GLASS: any = { backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' };

type View2 = 'current' | 'start';

export default function Dashboard() {
  const [viewMode, setViewMode] = useState<View2>('current');
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

  const bmiLabel =
    params.bmi < 18.5
      ? 'Maigreur'
      : params.bmi < 25
      ? 'Normal'
      : params.bmi < 30
      ? 'Surpoids'
      : 'Obésité';

  const bmiColor =
    params.bmi < 18.5
      ? Colors.accentOrange
      : params.bmi < 25
      ? Colors.accentGreen
      : params.bmi < 30
      ? Colors.accentOrange
      : Colors.accent;

  const progressPercent =
    initialMeasure && currentMeasure
      ? Math.round(
          ((initialMeasure.weight - currentMeasure.weight) / initialMeasure.weight) * 100 * 10
        ) / 10
      : 0;

  const stepPct = Math.min(100, Math.round((todaySteps / 10000) * 100));

  return (
    <SafeAreaView style={[styles.safe, BG]} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bonjour,</Text>
            <Text style={styles.name}>{profile.name || 'Athlète'} 👋</Text>
          </View>
          <View style={[styles.bmiPill, { backgroundColor: bmiColor + '22', borderColor: bmiColor }]}>
            <Text style={[styles.bmiText, { color: bmiColor }]}>IMC {params.bmi.toFixed(1)}</Text>
            <Text style={[styles.bmiLabel, { color: bmiColor }]}>{bmiLabel}</Text>
          </View>
        </View>

        {/* Avatar Section */}
        <View style={[styles.avatarSection, { boxShadow: '0 0 60px rgba(0,229,255,0.10)' } as any]}>
          <LinearGradient
            colors={['rgba(13,21,32,0.95)', 'rgba(2,2,2,0.85)']}
            style={[styles.avatarBg, GLASS]}
          >
            <View style={styles.toggle}>
              <TouchableOpacity
                style={[styles.toggleBtn, viewMode === 'start' && styles.toggleActive]}
                onPress={() => setViewMode('start')}
              >
                <Text style={[styles.toggleText, viewMode === 'start' && styles.toggleTextActive]}>
                  Départ
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, viewMode === 'current' && styles.toggleActive]}
                onPress={() => setViewMode('current')}
              >
                <Text style={[styles.toggleText, viewMode === 'current' && styles.toggleTextActive]}>
                  Actuel
                </Text>
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

        {/* Quick Stats */}
        <Text style={styles.sectionTitle}>Statistiques rapides</Text>
        <View style={styles.statsRow}>
          <StatCard label="Poids" value={currentMeasure?.weight ?? '—'} unit="kg" icon="⚖️" color={Colors.primary} />
          <StatCard label="Tour de taille" value={currentMeasure?.waist ?? '—'} unit="cm" icon="📏" color={Colors.primaryLight} />
        </View>
        <View style={[styles.statsRow, { marginTop: Spacing.sm }]}>
          <StatCard label="Séances" value={sessions.length} icon="🏋️" color={Colors.accentGreen} />
          <StatCard label="Pas aujourd'hui" value={todaySteps.toLocaleString('fr-FR')} icon="👟" color={Colors.accentOrange} />
        </View>

        {/* Step progress */}
        <View style={[styles.stepBar, GLASS]}>
          <View style={styles.stepBarHeader}>
            <Text style={styles.stepBarLabel}>Objectif 10 000 pas</Text>
            <Text style={styles.stepBarValue}>{stepPct}%</Text>
          </View>
          <View style={styles.stepBarTrack}>
            <View style={[styles.stepBarFill, { width: `${stepPct}%` }]} />
          </View>
          {stepPct >= 100 && (
            <Text style={styles.stepBarDone}>✅ Objectif atteint !</Text>
          )}
        </View>

        {/* Recent sessions */}
        {sessions.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Dernières séances</Text>
            {sessions.slice(0, 3).map((session) => (
              <View key={session.id} style={[styles.sessionItem, GLASS]}>
                <View style={styles.sessionLeft}>
                  <Text style={styles.sessionEmoji}>
                    {session.feeling === 'top' ? '🔥' : session.feeling === 'medium' ? '😐' : '😓'}
                  </Text>
                  <View>
                    <Text style={styles.sessionDate}>
                      {new Date(session.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </Text>
                    <Text style={styles.sessionSub}>
                      Effort {session.effort}/10 · {session.steps.toLocaleString('fr-FR')} pas
                    </Text>
                  </View>
                </View>
                <View style={[styles.effortBadge, { backgroundColor: getEffortColor(session.effort) + '22' }]}>
                  <Text style={[styles.effortText, { color: getEffortColor(session.effort) }]}>
                    {session.effort}/10
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

function getEffortColor(effort: number) {
  if (effort >= 8) return Colors.accent;
  if (effort >= 5) return Colors.accentOrange;
  return Colors.accentGreen;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  greeting: { fontSize: 13, fontWeight: '300', color: Colors.textSecondary, letterSpacing: 1 },
  name: { fontSize: 26, fontWeight: '900', color: Colors.text, marginTop: 2 },
  bmiPill: {
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    alignItems: 'center',
  },
  bmiText: { fontSize: 14, fontWeight: '900' },
  bmiLabel: { fontSize: 9, fontWeight: '300', textTransform: 'uppercase', letterSpacing: 1.5 },

  avatarSection: { marginBottom: Spacing.lg, borderRadius: Radius.xl },
  avatarBg: {
    borderRadius: Radius.xl,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.15)',
  },
  avatarWrapper: { alignItems: 'center' },
  toggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: Radius.full,
    padding: 3,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  toggleBtn: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.xs, borderRadius: Radius.full },
  toggleActive: { backgroundColor: Colors.primary },
  toggleText: { fontSize: 13, fontWeight: '600', color: Colors.textMuted },
  toggleTextActive: { color: Colors.text, fontWeight: '700' },
  progressBadge: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.accentGreen + '22',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.accentGreen + '44',
  },
  progressText: { color: Colors.accentGreen, fontSize: 13, fontWeight: '700' },

  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 2,
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
  stepBarLabel: { fontSize: 12, fontWeight: '300', color: Colors.textSecondary, letterSpacing: 0.5 },
  stepBarValue: { fontSize: 14, fontWeight: '900', color: Colors.accentOrange },
  stepBarDone: { fontSize: 12, color: Colors.accentGreen, fontWeight: '700', marginTop: Spacing.xs, textAlign: 'center' },
  stepBarTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  stepBarFill: {
    height: '100%',
    backgroundColor: Colors.accentOrange,
    borderRadius: Radius.full,
  },

  sessionItem: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sessionLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  sessionEmoji: { fontSize: 24 },
  sessionDate: { fontSize: 14, fontWeight: '700', color: Colors.text },
  sessionSub: { fontSize: 12, fontWeight: '300', color: Colors.textSecondary, marginTop: 2 },
  effortBadge: { borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 4 },
  effortText: { fontSize: 13, fontWeight: '900' },
});
