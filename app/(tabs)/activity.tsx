import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useShallow } from 'zustand/react/shallow';
import { useUserStore, Feeling, Session } from '@/store/userStore';
import { Colors, Spacing, Radius } from '@/constants/theme';
import ParticleEffect from '@/components/ParticleEffect';

const FEELINGS: { key: Feeling; label: string; emoji: string; color: string }[] = [
  { key: 'top',    label: 'Top',             emoji: '🔥', color: Colors.cyan },
  { key: 'medium', label: 'Moyen',           emoji: '😐', color: Colors.warning },
  { key: 'tired',  label: 'Fatigue / Douleur', emoji: '😓', color: Colors.accent },
];

const BG: any   = { backgroundImage: 'radial-gradient(ellipse at 50% 0%, #0A1018 0%, #020305 80%)' };
const GLASS: any = { backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' };
const FLOAT: any = { boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 1px rgba(0,242,255,0.06)' };

export default function Activity() {
  const [effort, setEffort] = useState(5);
  const [feeling, setFeeling] = useState<Feeling>('top');
  const [validated, setValidated] = useState(false);
  const [particleTrigger, setParticleTrigger] = useState(0);

  const { sessions, addSession, todaySteps } = useUserStore(useShallow((s) => ({
    sessions:    s.sessions,
    addSession:  s.addSession,
    todaySteps:  s.todaySteps,
  })));

  function handleValidate() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const session: Session = {
      id:      Date.now().toString(),
      date:    new Date().toISOString(),
      effort,
      feeling,
      steps:   todaySteps,
    };
    addSession(session);
    setValidated(true);
    setParticleTrigger((t) => t + 1);
    setTimeout(() => setValidated(false), 2500);
  }

  const effortColor = effort >= 8 ? Colors.accent : Colors.cyan;

  return (
    <SafeAreaView style={[styles.safe, BG]} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <Text style={styles.title}>Activité</Text>

        {/* Steps card */}
        <View style={[styles.stepsCard, GLASS, FLOAT]}>
          <Text style={styles.stepsEmoji}>👟</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.stepsValue}>{todaySteps.toLocaleString('fr-FR')}</Text>
            <Text style={styles.stepsLabel}>pas aujourd'hui</Text>
          </View>
          <View style={styles.stepsGoalPill}>
            <Text style={styles.stepsGoalTxt}>
              {todaySteps >= 10000 ? '— Objectif atteint —' : `${(10000 - todaySteps).toLocaleString('fr-FR')} restants`}
            </Text>
          </View>
        </View>

        {/* Session form */}
        <View style={[styles.card, GLASS, FLOAT]}>
          <Text style={styles.cardTitle}>Nouvelle séance</Text>

          <Text style={styles.label}>Niveau d'effort</Text>
          <View style={styles.effortRow}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <TouchableOpacity
                key={n}
                style={[
                  styles.effortDot,
                  n <= effort && {
                    backgroundColor: n >= 8 ? Colors.accent + '33' : 'rgba(0,242,255,0.18)',
                    borderColor: n <= effort ? effortColor : 'transparent',
                  },
                  n === effort && styles.effortDotActive,
                ]}
                onPress={() => { setEffort(n); Haptics.selectionAsync(); }}
              >
                {n === effort && <Text style={[styles.effortDotLabel, { color: effortColor }]}>{n}</Text>}
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.effortLabels}>
            <Text style={styles.effortLabelTxt}>Facile</Text>
            <Text style={[styles.effortLabelTxt, { color: effortColor, fontWeight: '900', fontSize: 13 }]}>
              {effort}/10
            </Text>
            <Text style={styles.effortLabelTxt}>Intense</Text>
          </View>

          <Text style={[styles.label, { marginTop: Spacing.lg }]}>Ressenti</Text>
          <View style={styles.feelingRow}>
            {FEELINGS.map((f) => (
              <TouchableOpacity
                key={f.key}
                style={[
                  styles.feelingBtn,
                  feeling === f.key && { borderColor: f.color, backgroundColor: f.color + '15' },
                ]}
                onPress={() => { setFeeling(f.key); Haptics.selectionAsync(); }}
              >
                <Text style={styles.feelingEmoji}>{f.emoji}</Text>
                <Text style={[styles.feelingLabel, feeling === f.key && { color: f.color }]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.validateWrap}>
            <TouchableOpacity
              style={[styles.validateBtn, validated && styles.validateBtnDone]}
              onPress={handleValidate}
              activeOpacity={0.85}
            >
              <Text style={[styles.validateTxt, validated && { color: Colors.cyan }]}>
                {validated ? '— Séance enregistrée —' : 'Valider la séance'}
              </Text>
            </TouchableOpacity>
            <ParticleEffect trigger={particleTrigger} />
          </View>
        </View>

        {/* History */}
        {sessions.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Historique</Text>
            {sessions.map((s) => (
              <View key={s.id} style={[styles.historyRow, GLASS]}>
                <Text style={styles.historyEmoji}>
                  {s.feeling === 'top' ? '🔥' : s.feeling === 'medium' ? '😐' : '😓'}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyDate}>
                    {new Date(s.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </Text>
                  <Text style={styles.historySub}>{s.steps.toLocaleString('fr-FR')} pas</Text>
                </View>
                <View style={[styles.effortChip, { backgroundColor: getEffortColor(s.effort) + '18' }]}>
                  <Text style={[styles.effortChipTxt, { color: getEffortColor(s.effort) }]}>{s.effort}/10</Text>
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

  title: { fontSize: 34, fontWeight: '900', color: Colors.text, marginBottom: Spacing.md, letterSpacing: -1 },

  stepsCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,242,255,0.14)',
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  stepsEmoji: { fontSize: 30 },
  stepsValue: { fontSize: 32, fontWeight: '900', color: Colors.cyan, letterSpacing: -1 },
  stepsLabel: { fontSize: 10, fontWeight: '300', color: Colors.textSecondary, letterSpacing: 1.5, textTransform: 'uppercase' },
  stepsGoalPill: {
    backgroundColor: 'rgba(0,242,255,0.08)',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,242,255,0.20)',
  },
  stepsGoalTxt: { fontSize: 11, color: Colors.cyan, fontWeight: '600', letterSpacing: 0.5 },

  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  cardTitle: { fontSize: 20, fontWeight: '900', color: Colors.text, marginBottom: Spacing.md, letterSpacing: -0.3 },
  label: {
    fontSize: 9,
    fontWeight: '300',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 3,
  },

  effortRow: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  effortDot: {
    flex: 1,
    height: 38,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  effortDotActive: { transform: [{ scaleY: 1.25 }] },
  effortDotLabel: { fontSize: 10, fontWeight: '900' },
  effortLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.sm },
  effortLabelTxt: { fontSize: 10, fontWeight: '300', color: Colors.textSecondary, letterSpacing: 0.5 },

  feelingRow: { flexDirection: 'row', gap: Spacing.sm },
  feelingBtn: {
    flex: 1,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: 4,
  },
  feelingEmoji: { fontSize: 22 },
  feelingLabel: { fontSize: 10, fontWeight: '600', color: Colors.textSecondary, textAlign: 'center', letterSpacing: 0.3 },

  validateWrap: { marginTop: Spacing.lg, position: 'relative', alignItems: 'center' },
  validateBtn: {
    width: '100%',
    backgroundColor: 'rgba(0,242,255,0.10)',
    borderRadius: Radius.full,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,242,255,0.35)',
  },
  validateBtnDone: {
    backgroundColor: 'rgba(0,242,255,0.06)',
    borderColor: 'rgba(0,242,255,0.60)',
    boxShadow: '0 0 20px rgba(0,242,255,0.25)' as any,
  },
  validateTxt: { fontSize: 14, fontWeight: '700', color: Colors.text, letterSpacing: 2, textTransform: 'uppercase' },

  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 3,
  },
  historyRow: {
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
  historyEmoji: { fontSize: 22 },
  historyDate: { fontSize: 13, fontWeight: '700', color: Colors.text, textTransform: 'capitalize' },
  historySub: { fontSize: 11, fontWeight: '300', color: Colors.textSecondary, marginTop: 2 },
  effortChip: { borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 4 },
  effortChipTxt: { fontSize: 12, fontWeight: '900' },
});
