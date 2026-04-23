import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useUserStore, Feeling, Session } from '@/store/userStore';
import { Colors, Spacing, Radius } from '@/constants/theme';

const FEELINGS: { key: Feeling; label: string; emoji: string; color: string }[] = [
  { key: 'top', label: 'Top', emoji: '🔥', color: Colors.accentGreen },
  { key: 'medium', label: 'Moyen', emoji: '😐', color: Colors.accentOrange },
  { key: 'tired', label: 'Fatigue / Douleur', emoji: '😓', color: Colors.accent },
];

export default function Activity() {
  const [effort, setEffort] = useState(5);
  const [feeling, setFeeling] = useState<Feeling>('top');
  const [validated, setValidated] = useState(false);
  const { sessions, addSession, todaySteps } = useUserStore((s) => ({
    sessions: s.sessions,
    addSession: s.addSession,
    todaySteps: s.todaySteps,
  }));

  function handleValidate() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const session: Session = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      effort,
      feeling,
      steps: todaySteps,
    };
    addSession(session);
    setValidated(true);
    setTimeout(() => setValidated(false), 2500);
  }

  const effortColor =
    effort >= 8 ? Colors.accent : effort >= 5 ? Colors.accentOrange : Colors.accentGreen;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Activité</Text>

        {/* Steps today */}
        <View style={styles.stepsCard}>
          <Text style={styles.stepsEmoji}>👟</Text>
          <View>
            <Text style={styles.stepsValue}>{todaySteps.toLocaleString('fr-FR')}</Text>
            <Text style={styles.stepsLabel}>pas aujourd'hui</Text>
          </View>
          <View style={styles.stepsGoal}>
            <Text style={styles.stepsGoalText}>
              {todaySteps >= 10000 ? '✅ Objectif atteint !' : `${10000 - todaySteps} restants`}
            </Text>
          </View>
        </View>

        {/* New session */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Nouvelle séance</Text>

          {/* Effort slider */}
          <Text style={styles.label}>Niveau d'effort</Text>
          <View style={styles.effortRow}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <TouchableOpacity
                key={n}
                style={[
                  styles.effortDot,
                  n <= effort && { backgroundColor: effortColor },
                  n === effort && styles.effortDotActive,
                ]}
                onPress={() => {
                  setEffort(n);
                  Haptics.selectionAsync();
                }}
              >
                {n === effort && (
                  <Text style={styles.effortDotLabel}>{n}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.effortLabels}>
            <Text style={styles.effortLabelText}>Facile</Text>
            <Text style={[styles.effortLabelText, { color: effortColor, fontWeight: '700' }]}>
              {effort}/10
            </Text>
            <Text style={styles.effortLabelText}>Intense</Text>
          </View>

          {/* Feeling */}
          <Text style={[styles.label, { marginTop: Spacing.lg }]}>Ressenti</Text>
          <View style={styles.feelingRow}>
            {FEELINGS.map((f) => (
              <TouchableOpacity
                key={f.key}
                style={[
                  styles.feelingBtn,
                  feeling === f.key && {
                    borderColor: f.color,
                    backgroundColor: f.color + '22',
                  },
                ]}
                onPress={() => {
                  setFeeling(f.key);
                  Haptics.selectionAsync();
                }}
              >
                <Text style={styles.feelingEmoji}>{f.emoji}</Text>
                <Text
                  style={[
                    styles.feelingLabel,
                    feeling === f.key && { color: f.color },
                  ]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Validate button */}
          <TouchableOpacity
            style={[styles.validateBtn, validated && styles.validateBtnDone]}
            onPress={handleValidate}
            activeOpacity={0.85}
          >
            <Text style={styles.validateText}>
              {validated ? '✅ Séance enregistrée !' : '⚡ Valider la séance'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* History */}
        {sessions.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Historique des séances</Text>
            {sessions.map((session) => (
              <View key={session.id} style={styles.historyItem}>
                <View style={styles.historyLeft}>
                  <Text style={styles.historyEmoji}>
                    {session.feeling === 'top' ? '🔥' : session.feeling === 'medium' ? '😐' : '😓'}
                  </Text>
                  <View>
                    <Text style={styles.historyDate}>
                      {new Date(session.date).toLocaleDateString('fr-FR', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                      })}
                    </Text>
                    <Text style={styles.historySub}>
                      {session.steps.toLocaleString('fr-FR')} pas
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.effortChip,
                    {
                      backgroundColor:
                        getEffortColor(session.effort) + '22',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.effortChipText,
                      { color: getEffortColor(session.effort) },
                    ]}
                  >
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

  title: { fontSize: 28, fontWeight: '800', color: Colors.text, marginBottom: Spacing.md },

  stepsCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  stepsEmoji: { fontSize: 32 },
  stepsValue: { fontSize: 28, fontWeight: '800', color: Colors.accentOrange },
  stepsLabel: { fontSize: 12, color: Colors.textSecondary },
  stepsGoal: {
    marginLeft: 'auto' as any,
    backgroundColor: Colors.accentOrange + '18',
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  stepsGoalText: { fontSize: 12, color: Colors.accentOrange, fontWeight: '600' },

  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  label: { fontSize: 13, color: Colors.textSecondary, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },

  effortRow: { flexDirection: 'row', gap: Spacing.xs, alignItems: 'center' },
  effortDot: {
    flex: 1,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  effortDotActive: { transform: [{ scaleY: 1.3 }] },
  effortDotLabel: { fontSize: 10, fontWeight: '800', color: Colors.text },
  effortLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  effortLabelText: { fontSize: 11, color: Colors.textMuted },

  feelingRow: { flexDirection: 'row', gap: Spacing.sm },
  feelingBtn: {
    flex: 1,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: 4,
  },
  feelingEmoji: { fontSize: 24 },
  feelingLabel: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary, textAlign: 'center' },

  validateBtn: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  validateBtnDone: { backgroundColor: Colors.accentGreen },
  validateText: { fontSize: 16, fontWeight: '700', color: Colors.text },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  historyItem: {
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
  historyLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  historyEmoji: { fontSize: 24 },
  historyDate: { fontSize: 14, fontWeight: '600', color: Colors.text, textTransform: 'capitalize' },
  historySub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  effortChip: { borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 4 },
  effortChipText: { fontSize: 13, fontWeight: '700' },
});
