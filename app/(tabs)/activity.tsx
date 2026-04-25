import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Footprints, Zap, Smile, HeartPulse, CheckCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useShallow } from 'zustand/react/shallow';
import { useUserStore, Feeling, Session } from '@/store/userStore';
import { Colors, Spacing, Radius, Shadow } from '@/constants/theme';
import ParticleEffect from '@/components/ParticleEffect';

const FEELINGS: { key: Feeling; label: string; icon: React.ReactNode; color: string }[] = [
  { key: 'top',    label: 'Top',    icon: <Zap       size={22} color={Colors.warning}  strokeWidth={2} />, color: Colors.warning },
  { key: 'medium', label: 'Moyen',  icon: <Smile     size={22} color={Colors.accent}   strokeWidth={2} />, color: Colors.accent },
  { key: 'tired',  label: 'Fatigue',icon: <HeartPulse size={22} color={Colors.red}     strokeWidth={2} />, color: Colors.red },
];

export default function Activity() {
  const [effort,          setEffort]          = useState(5);
  const [feeling,         setFeeling]         = useState<Feeling>('top');
  const [validated,       setValidated]       = useState(false);
  const [particleTrigger, setParticleTrigger] = useState(0);

  const { sessions, addSession, todaySteps } = useUserStore(useShallow((s) => ({
    sessions:   s.sessions,
    addSession: s.addSession,
    todaySteps: s.todaySteps,
  })));

  function handleValidate() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addSession({ id: Date.now().toString(), date: new Date().toISOString(), effort, feeling, steps: todaySteps } as Session);
    setValidated(true);
    setParticleTrigger((t) => t + 1);
    setTimeout(() => setValidated(false), 2500);
  }

  const effortColor = effort >= 8 ? Colors.red : Colors.accent;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <Text style={styles.pageLabel}>Aujourd'hui</Text>
        <Text style={styles.title}>ACTIVITÉ</Text>

        {/* Steps hero */}
        <View style={[styles.stepsCard, Shadow.md]}>
          <View style={styles.stepsIconWrap}>
            <Footprints size={24} color={Colors.accent} strokeWidth={2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.stepsVal}>{todaySteps.toLocaleString('fr-FR')}</Text>
            <Text style={styles.stepsLbl}>pas aujourd'hui</Text>
          </View>
          <View style={[styles.stepsGoalPill, todaySteps >= 10000 && styles.stepsGoalPillDone]}>
            <Text style={[styles.stepsGoalTxt, todaySteps >= 10000 && { color: Colors.success }]}>
              {todaySteps >= 10000 ? 'Objectif ✓' : `${(10000 - todaySteps).toLocaleString('fr-FR')} restants`}
            </Text>
          </View>
        </View>

        {/* Session form */}
        <View style={[styles.card, Shadow.sm]}>
          <Text style={styles.cardTitle}>Nouvelle séance</Text>

          <Text style={styles.fieldLabel}>Niveau d'effort</Text>
          <View style={styles.effortRow}>
            {[1,2,3,4,5,6,7,8,9,10].map((n) => (
              <TouchableOpacity
                key={n}
                style={[
                  styles.effortDot,
                  n <= effort && { backgroundColor: n >= 8 ? Colors.red + '22' : Colors.accentLight, borderColor: effortColor },
                  n === effort && styles.effortDotActive,
                ]}
                onPress={() => { setEffort(n); Haptics.selectionAsync(); }}
              >
                {n === effort && <Text style={[styles.effortDotLbl, { color: effortColor }]}>{n}</Text>}
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.effortMeta}>
            <Text style={styles.effortScale}>Facile</Text>
            <Text style={[styles.effortScore, { color: effortColor }]}>{effort}/10</Text>
            <Text style={styles.effortScale}>Intense</Text>
          </View>

          <Text style={[styles.fieldLabel, { marginTop: Spacing.lg }]}>Ressenti</Text>
          <View style={styles.feelingRow}>
            {FEELINGS.map((f) => (
              <TouchableOpacity
                key={f.key}
                style={[styles.feelingBtn, feeling === f.key && { borderColor: f.color, backgroundColor: f.color + '12' }]}
                onPress={() => { setFeeling(f.key); Haptics.selectionAsync(); }}
              >
                {f.icon}
                <Text style={[styles.feelingLbl, feeling === f.key && { color: f.color }]}>{f.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.validateWrap}>
            <TouchableOpacity
              style={[styles.validateBtn, validated && styles.validateBtnDone]}
              onPress={handleValidate}
              activeOpacity={0.85}
            >
              {validated && <CheckCircle size={16} color={Colors.background} fill={Colors.success} strokeWidth={0} />}
              <Text style={styles.validateTxt}>
                {validated ? 'Séance enregistrée' : 'Valider la séance'}
              </Text>
            </TouchableOpacity>
            <ParticleEffect trigger={particleTrigger} />
          </View>
        </View>

        {/* History */}
        {sessions.length > 0 && (
          <>
            <Text style={styles.historyTitle}>HISTORIQUE</Text>
            {sessions.map((s) => {
              const fi = FEELINGS.find((f) => f.key === s.feeling);
              return (
                <View key={s.id} style={[styles.historyRow, Shadow.sm]}>
                  <View style={[styles.historyIcon, { backgroundColor: (fi?.color ?? Colors.textSecondary) + '18' }]}>
                    {fi?.icon}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.historyDate}>
                      {new Date(s.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })}
                    </Text>
                    <Text style={styles.historySub}>{s.steps.toLocaleString('fr-FR')} pas</Text>
                  </View>
                  <View style={[styles.effortBadge, { backgroundColor: (s.effort >= 8 ? Colors.red : Colors.accent) + '18' }]}>
                    <Text style={[styles.effortBadgeTxt, { color: s.effort >= 8 ? Colors.red : Colors.accent }]}>{s.effort}/10</Text>
                  </View>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.background },
  scroll:  { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },

  pageLabel: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 },
  title:     { fontSize: 48, fontWeight: '900', color: Colors.text, letterSpacing: -2, textTransform: 'uppercase', marginBottom: Spacing.lg, lineHeight: 48 },

  stepsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.md,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
  },
  stepsIconWrap: { width: 48, height: 48, borderRadius: Radius.md, backgroundColor: Colors.accentLight, alignItems: 'center', justifyContent: 'center' },
  stepsVal:      { fontSize: 28, fontWeight: '900', color: Colors.text, letterSpacing: -1 },
  stepsLbl:      { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  stepsGoalPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: Colors.surface, borderWidth: 0.5, borderColor: Colors.cardBorder },
  stepsGoalPillDone: { backgroundColor: Colors.success + '18', borderColor: Colors.success + '44' },
  stepsGoalTxt:  { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },

  card:      { backgroundColor: Colors.card, borderRadius: Radius.xl, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 0.5, borderColor: Colors.cardBorder },
  cardTitle: { fontSize: 20, fontWeight: '800', color: Colors.text, marginBottom: Spacing.md, letterSpacing: -0.5 },
  fieldLabel:{ fontSize: 10, fontWeight: '600', color: Colors.textSecondary, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 2 },

  effortRow:     { flexDirection: 'row', gap: 4 },
  effortDot:     { flex: 1, height: 40, borderRadius: 8, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'transparent' },
  effortDotActive:{ transform: [{ scaleY: 1.2 }] },
  effortDotLbl:  { fontSize: 11, fontWeight: '900' },
  effortMeta:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.sm },
  effortScale:   { fontSize: 10, color: Colors.textSecondary },
  effortScore:   { fontSize: 18, fontWeight: '900' },

  feelingRow: { flexDirection: 'row', gap: Spacing.sm },
  feelingBtn: {
    flex: 1, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.cardBorder,
    backgroundColor: Colors.surface, alignItems: 'center', paddingVertical: Spacing.md, gap: 6,
  },
  feelingLbl: { fontSize: 11, fontWeight: '500', color: Colors.textSecondary },

  validateWrap: { marginTop: Spacing.md, position: 'relative', alignItems: 'center' },
  validateBtn: {
    width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: Spacing.sm, backgroundColor: '#fff', borderRadius: Radius.full, paddingVertical: 15,
  },
  validateBtnDone: { backgroundColor: Colors.success },
  validateTxt:     { fontSize: 15, fontWeight: '700', color: Colors.background, letterSpacing: 0.2 },

  historyTitle: { fontSize: 11, fontWeight: '800', color: Colors.textSecondary, letterSpacing: 3, textTransform: 'uppercase', marginBottom: Spacing.sm, marginTop: Spacing.sm },
  historyRow: {
    backgroundColor: Colors.card, borderRadius: Radius.lg, flexDirection: 'row',
    alignItems: 'center', gap: Spacing.md, padding: Spacing.md, marginBottom: Spacing.sm,
    borderWidth: 0.5, borderColor: Colors.cardBorder,
  },
  historyIcon:    { width: 44, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  historyDate:    { fontSize: 14, fontWeight: '600', color: Colors.text, textTransform: 'capitalize' },
  historySub:     { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  effortBadge:    { borderRadius: Radius.sm, paddingHorizontal: 8, paddingVertical: 5 },
  effortBadgeTxt: { fontSize: 12, fontWeight: '800' },
});
