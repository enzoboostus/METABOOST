import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Footprints, Zap, Heart, HeartPulse, Smile, CheckCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useShallow } from 'zustand/react/shallow';
import { useUserStore, Feeling, Session } from '@/store/userStore';
import { Colors, Spacing, Radius } from '@/constants/theme';
import ParticleEffect from '@/components/ParticleEffect';

const FEELINGS: { key: Feeling; label: string; icon: React.ReactNode; color: string }[] = [
  { key: 'top',    label: 'Top',           icon: <Zap  size={22} color={Colors.cyan}    strokeWidth={1.5} />, color: Colors.cyan },
  { key: 'medium', label: 'Moyen',         icon: <Smile size={22} color={Colors.warning} strokeWidth={1.5} />, color: Colors.warning },
  { key: 'tired',  label: 'Fatigue',       icon: <HeartPulse size={22} color={Colors.accent}  strokeWidth={1.5} />, color: Colors.accent },
];

const BG: any    = { backgroundImage: 'radial-gradient(ellipse at 50% 30%, #0A0E12 0%, #020202 70%)' };
const GRAIN: any = {
  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
  opacity: 0.03,
};
const GLASS: any = { backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)' };
const FLOAT: any = { boxShadow: '0 8px 40px rgba(0,0,0,0.7), 0 0 1px rgba(0,242,255,0.06)' };

export default function Activity() {
  const [effort,         setEffort]         = useState(5);
  const [feeling,        setFeeling]        = useState<Feeling>('top');
  const [validated,      setValidated]      = useState(false);
  const [particleTrigger, setParticleTrigger] = useState(0);

  const { sessions, addSession, todaySteps } = useUserStore(useShallow((s) => ({
    sessions:   s.sessions,
    addSession: s.addSession,
    todaySteps: s.todaySteps,
  })));

  function handleValidate() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const session: Session = {
      id:     Date.now().toString(),
      date:   new Date().toISOString(),
      effort,
      feeling,
      steps:  todaySteps,
    };
    addSession(session);
    setValidated(true);
    setParticleTrigger((t) => t + 1);
    setTimeout(() => setValidated(false), 2500);
  }

  const effortColor = effort >= 8 ? Colors.accent : Colors.cyan;

  return (
    <SafeAreaView style={[styles.safe, BG]} edges={['top']}>
      <View style={GRAIN} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <Text style={styles.title}>Activité</Text>

        {/* Steps card */}
        <View style={[styles.stepsCard, GLASS, FLOAT]}>
          <Footprints size={28} color={Colors.cyan} strokeWidth={1.5} />
          <View style={{ flex: 1 }}>
            <Text style={styles.stepsValue}>{todaySteps.toLocaleString('fr-FR')}</Text>
            <Text style={styles.stepsLabel}>pas aujourd'hui</Text>
          </View>
          <View style={styles.stepsGoalPill}>
            <Text style={styles.stepsGoalTxt}>
              {todaySteps >= 10000 ? '— Objectif —' : `${(10000 - todaySteps).toLocaleString('fr-FR')} restants`}
            </Text>
          </View>
        </View>

        {/* Session form */}
        <View style={[styles.card, GLASS, FLOAT]}>
          <Text style={styles.cardTitle}>Nouvelle séance</Text>

          <Text style={styles.fieldLabel}>Niveau d'effort</Text>
          <View style={styles.effortRow}>
            {[1,2,3,4,5,6,7,8,9,10].map((n) => (
              <TouchableOpacity
                key={n}
                style={[
                  styles.effortDot,
                  n <= effort && {
                    backgroundColor: n >= 8 ? Colors.accent + '22' : 'rgba(0,242,255,0.12)',
                    borderColor:     n <= effort ? effortColor : 'transparent',
                  },
                  n === effort && styles.effortDotActive,
                ]}
                onPress={() => { setEffort(n); Haptics.selectionAsync(); }}
              >
                {n === effort && <Text style={[styles.effortDotLabel, { color: effortColor }]}>{n}</Text>}
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.effortFooter}>
            <Text style={styles.effortScaleTxt}>Facile</Text>
            <Text style={[styles.effortScoreVal, { color: effortColor }]}>{effort}/10</Text>
            <Text style={styles.effortScaleTxt}>Intense</Text>
          </View>

          <Text style={[styles.fieldLabel, { marginTop: Spacing.lg }]}>Ressenti</Text>
          <View style={styles.feelingRow}>
            {FEELINGS.map((f) => (
              <TouchableOpacity
                key={f.key}
                style={[
                  styles.feelingBtn,
                  feeling === f.key && { borderColor: f.color + '55', backgroundColor: f.color + '10' },
                ]}
                onPress={() => { setFeeling(f.key); Haptics.selectionAsync(); }}
              >
                {f.icon}
                <Text style={[styles.feelingLabel, feeling === f.key && { color: f.color }]}>{f.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.validateWrap}>
            <TouchableOpacity
              style={[styles.validateBtn, validated && styles.validateBtnDone]}
              onPress={handleValidate}
              activeOpacity={0.85}
            >
              {validated
                ? <CheckCircle size={16} color={Colors.cyan} strokeWidth={2} />
                : null
              }
              <Text style={[styles.validateTxt, validated && { color: Colors.cyan }]}>
                {validated ? 'Séance enregistrée' : 'Valider la séance'}
              </Text>
            </TouchableOpacity>
            <ParticleEffect trigger={particleTrigger} />
          </View>
        </View>

        {/* History */}
        {sessions.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Historique</Text>
            {sessions.map((s) => {
              const fi = FEELINGS.find((f) => f.key === s.feeling);
              return (
                <View key={s.id} style={[styles.historyRow, GLASS]}>
                  <View style={[styles.feelingDot, { borderColor: (fi?.color ?? Colors.textSecondary) + '44', backgroundColor: (fi?.color ?? Colors.textSecondary) + '12' }]}>
                    {fi?.icon}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.historyDate}>
                      {new Date(s.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </Text>
                    <Text style={styles.historySub}>{s.steps.toLocaleString('fr-FR')} pas</Text>
                  </View>
                  <View style={[styles.effortChip, { backgroundColor: getEffortColor(s.effort) + '15' }]}>
                    <Text style={[styles.effortChipTxt, { color: getEffortColor(s.effort) }]}>{s.effort}/10</Text>
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

function getEffortColor(n: number) {
  return n >= 8 ? Colors.accent : Colors.cyan;
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.background },
  scroll:  { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },

  title: { fontSize: 34, fontWeight: '900', color: Colors.text, marginBottom: Spacing.md, letterSpacing: -1 },

  stepsCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    borderColor: 'rgba(0,242,255,0.18)',
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  stepsValue:   { fontSize: 32, fontWeight: '900', color: Colors.cyan, letterSpacing: -1 },
  stepsLabel:   { fontSize: 10, fontWeight: '300', color: Colors.textSecondary, letterSpacing: 1.5, textTransform: 'uppercase' },
  stepsGoalPill: {
    backgroundColor: 'rgba(0,242,255,0.06)',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderWidth: 0.5,
    borderColor: 'rgba(0,242,255,0.18)',
  },
  stepsGoalTxt: { fontSize: 10, color: Colors.cyan, fontWeight: '600', letterSpacing: 0.5 },

  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  cardTitle: { fontSize: 20, fontWeight: '900', color: Colors.text, marginBottom: Spacing.md, letterSpacing: -0.3 },
  fieldLabel: {
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
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: 'transparent',
  },
  effortDotActive: { transform: [{ scaleY: 1.25 }] },
  effortDotLabel:  { fontSize: 10, fontWeight: '900' },
  effortFooter:    { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.sm, alignItems: 'center' },
  effortScaleTxt:  { fontSize: 9, fontWeight: '300', color: Colors.textSecondary, letterSpacing: 0.5 },
  effortScoreVal:  { fontSize: 16, fontWeight: '900', letterSpacing: -0.3 },

  feelingRow: { flexDirection: 'row', gap: Spacing.sm },
  feelingBtn: {
    flex: 1,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: 6,
  },
  feelingLabel: { fontSize: 10, fontWeight: '300', color: Colors.textSecondary, textAlign: 'center', letterSpacing: 0.5 },

  validateWrap: { marginTop: Spacing.lg, position: 'relative', alignItems: 'center' },
  validateBtn: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(0,242,255,0.08)',
    borderRadius: Radius.full,
    paddingVertical: Spacing.md,
    borderWidth: 0.5,
    borderColor: 'rgba(0,242,255,0.30)',
  },
  validateBtnDone: {
    backgroundColor: 'rgba(0,242,255,0.05)',
    borderColor: 'rgba(0,242,255,0.55)',
    boxShadow: '0 0 20px rgba(0,242,255,0.22)' as any,
  },
  validateTxt: { fontSize: 13, fontWeight: '700', color: Colors.text, letterSpacing: 2, textTransform: 'uppercase' },

  sectionTitle: {
    fontSize: 9,
    fontWeight: '300',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 3,
  },
  historyRow: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  feelingDot: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyDate: { fontSize: 13, fontWeight: '700', color: Colors.text, textTransform: 'capitalize' },
  historySub:  { fontSize: 11, fontWeight: '300', color: Colors.textSecondary, marginTop: 2 },
  effortChip:    { borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 4 },
  effortChipTxt: { fontSize: 12, fontWeight: '900' },
});
