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

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
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
        <View style={styles.avatarSection}>
          <LinearGradient
            colors={[Colors.card, Colors.background]}
            style={styles.avatarBg}
          >
            {/* Toggle */}
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

            {/* Comparison label */}
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
          <StatCard
            label="Poids"
            value={currentMeasure?.weight ?? '—'}
            unit="kg"
            icon="⚖️"
            color={Colors.primary}
          />
          <StatCard
            label="Tour de taille"
            value={currentMeasure?.waist ?? '—'}
            unit="cm"
            icon="📏"
            color={Colors.primaryLight}
          />
        </View>
        <View style={[styles.statsRow, { marginTop: Spacing.sm }]}>
          <StatCard
            label="Séances"
            value={sessions.length}
            icon="🏋️"
            color={Colors.accentGreen}
          />
          <StatCard
            label="Pas aujourd'hui"
            value={todaySteps.toLocaleString('fr-FR')}
            icon="👟"
            color={Colors.accentOrange}
          />
        </View>

        {/* Step progress */}
        <View style={styles.stepBar}>
          <View style={styles.stepBarHeader}>
            <Text style={styles.stepBarLabel}>Objectif 10 000 pas</Text>
            <Text style={styles.stepBarValue}>
              {Math.min(100, Math.round((todaySteps / 10000) * 100))}%
            </Text>
          </View>
          <View style={styles.stepBarTrack}>
            <View
              style={[
                styles.stepBarFill,
                { width: `${Math.min(100, (todaySteps / 10000) * 100)}%` },
              ]}
            />
          </View>
        </View>

        {/* Recent sessions */}
        {sessions.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Dernières séances</Text>
            {sessions.slice(0, 3).map((session) => (
              <View key={session.id} style={styles.sessionItem}>
                <View style={styles.sessionLeft}>
                  <Text style={styles.sessionEmoji}>
                    {session.feeling === 'top' ? '🔥' : session.feeling === 'medium' ? '😐' : '😓'}
                  </Text>
                  <View>
                    <Text style={styles.sessionDate}>
                      {new Date(session.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                      })}
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
  greeting: { fontSize: 14, color: Colors.textSecondary },
  name: { fontSize: 24, fontWeight: '700', color: Colors.text, marginTop: 2 },
  bmiPill: {
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    alignItems: 'center',
  },
  bmiText: { fontSize: 14, fontWeight: '700' },
  bmiLabel: { fontSize: 10, fontWeight: '500', textTransform: 'uppercase' },

  avatarSection: { marginBottom: Spacing.lg },
  avatarBg: {
    borderRadius: Radius.xl,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    overflow: 'hidden',
  },
  avatarWrapper: { alignItems: 'center' },
  toggle: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: Radius.full,
    padding: 3,
    marginBottom: Spacing.md,
  },
  toggleBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  toggleActive: { backgroundColor: Colors.primary },
  toggleText: { fontSize: 13, fontWeight: '600', color: Colors.textMuted },
  toggleTextActive: { color: Colors.text },
  progressBadge: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.accentGreen + '22',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  progressText: { color: Colors.accentGreen, fontSize: 13, fontWeight: '600' },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
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
  stepBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  stepBarLabel: { fontSize: 13, color: Colors.textSecondary },
  stepBarValue: { fontSize: 13, fontWeight: '700', color: Colors.accentOrange },
  stepBarTrack: {
    height: 8,
    backgroundColor: Colors.cardBorder,
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
  sessionDate: { fontSize: 14, fontWeight: '600', color: Colors.text },
  sessionSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  effortBadge: { borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 4 },
  effortText: { fontSize: 13, fontWeight: '700' },
});
