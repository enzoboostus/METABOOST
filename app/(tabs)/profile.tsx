import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Scale, Ruler, Activity, TrendingDown, TrendingUp, CheckCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useShallow } from 'zustand/react/shallow';
import { useUserStore, BodyMeasure } from '@/store/userStore';
import { useAvatarParams } from '@/hooks/useAvatarParams';
import { Colors, Spacing, Radius, Shadow } from '@/constants/theme';

export default function Profile() {
  const { profile, measures, addMeasure, getCurrentMeasure } = useUserStore(useShallow((s) => ({
    profile:           s.profile,
    measures:          s.measures,
    addMeasure:        s.addMeasure,
    getCurrentMeasure: s.getCurrentMeasure,
  })));
  const params         = useAvatarParams();
  const currentMeasure = getCurrentMeasure();

  const [weight, setWeight] = useState(currentMeasure?.weight?.toString() ?? '');
  const [waist,  setWaist]  = useState(currentMeasure?.waist?.toString()  ?? '');
  const [saved,  setSaved]  = useState(false);

  function handleSave() {
    const w  = parseFloat(weight);
    const wa = parseFloat(waist);
    if (isNaN(w) || isNaN(wa) || w <= 0 || wa <= 0) return;
    addMeasure({ date: new Date().toISOString(), weight: w, waist: wa } as BodyMeasure);
    setSaved(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setSaved(false), 2000);
  }

  const bmiColor =
    params.bmi < 18.5 ? Colors.warning
    : params.bmi < 25  ? Colors.success
    : params.bmi < 30  ? Colors.warning
    : Colors.error;

  const bmiLabel =
    params.bmi < 18.5 ? 'Maigreur'
    : params.bmi < 25  ? 'Poids normal'
    : params.bmi < 30  ? 'Surpoids'
    : 'Obésité';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Profil & Stats</Text>

          {/* Profile card */}
          <View style={[styles.profileCard, Shadow.md]}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileInitial}>{(profile.name || 'A').charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>{profile.name || 'Athlète'}</Text>
              <Text style={styles.profileSub}>
                {profile.gender === 'male' ? 'Homme' : 'Femme'} · {profile.height} cm
              </Text>
            </View>
            <View style={styles.profileBadge}>
              <Text style={styles.profileBadgeTxt}>Actif</Text>
            </View>
          </View>

          {/* BMI card */}
          <View style={[styles.bmiCard, Shadow.sm, { borderLeftColor: bmiColor }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.bmiCaption}>Indice de Masse Corporelle</Text>
              <Text style={[styles.bmiNum, { color: bmiColor }]}>{params.bmi.toFixed(1)}</Text>
              <View style={[styles.bmiLabelPill, { backgroundColor: bmiColor + '15' }]}>
                <Text style={[styles.bmiLabelTxt, { color: bmiColor }]}>{bmiLabel}</Text>
              </View>
            </View>
            <View style={styles.bmiScale}>
              {[
                { range: '<18.5', active: params.bmi < 18.5,                          color: Colors.warning },
                { range: '18–25', active: params.bmi >= 18.5 && params.bmi < 25,      color: Colors.success },
                { range: '25–30', active: params.bmi >= 25 && params.bmi < 30,        color: Colors.warning },
                { range: '>30',   active: params.bmi >= 30,                           color: Colors.error },
              ].map((z) => (
                <View key={z.range} style={[styles.bmiZone, z.active && { backgroundColor: z.color + '15', borderColor: z.color + '40' }]}>
                  <Text style={[styles.bmiZoneTxt, z.active && { color: z.color, fontWeight: '700' }]}>{z.range}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Stats grid */}
          <View style={styles.statsGrid}>
            {[
              { label: 'Tonus', value: `${Math.round(params.toneLevel * 100)}%`, icon: <Activity size={18} color={Colors.cyan} strokeWidth={2} /> },
              { label: 'Posture', value: `${Math.round(params.posture * 100)}%`, icon: <TrendingUp size={18} color={Colors.cyan} strokeWidth={2} /> },
              { label: 'Affinement', value: `${Math.round(params.stepSlim * 200)}%`, icon: <TrendingDown size={18} color={Colors.success} strokeWidth={2} /> },
            ].map((s) => (
              <View key={s.label} style={[styles.statBox, Shadow.sm]}>
                {s.icon}
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* New measure */}
          <View style={[styles.card, Shadow.sm]}>
            <Text style={styles.cardTitle}>Nouvelle mesure</Text>
            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Poids (kg)</Text>
                <View style={styles.inputWrap}>
                  <Scale size={16} color={Colors.textSecondary} strokeWidth={1.5} />
                  <TextInput
                    style={styles.input}
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="decimal-pad"
                    placeholder="75.0"
                    placeholderTextColor={Colors.textTertiary}
                  />
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tour de taille (cm)</Text>
                <View style={styles.inputWrap}>
                  <Ruler size={16} color={Colors.textSecondary} strokeWidth={1.5} />
                  <TextInput
                    style={styles.input}
                    value={waist}
                    onChangeText={setWaist}
                    keyboardType="decimal-pad"
                    placeholder="85"
                    placeholderTextColor={Colors.textTertiary}
                  />
                </View>
              </View>
            </View>
            <TouchableOpacity style={[styles.saveBtn, saved && styles.saveBtnDone]} onPress={handleSave} activeOpacity={0.85}>
              {saved && <CheckCircle size={16} color="#fff" fill={Colors.success} strokeWidth={0} />}
              <Text style={styles.saveBtnTxt}>{saved ? 'Enregistré !' : 'Enregistrer la mesure'}</Text>
            </TouchableOpacity>
          </View>

          {/* History table */}
          {measures.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Historique des mesures</Text>
              <View style={[styles.table, Shadow.sm]}>
                <View style={[styles.tableRow, styles.tableHead]}>
                  {['Date', 'Poids', 'Taille', 'IMC'].map((h) => (
                    <Text key={h} style={styles.tableHeadTxt}>{h}</Text>
                  ))}
                </View>
                {[...measures].reverse().map((m, i) => {
                  const bmi  = m.weight / ((profile.height / 100) ** 2);
                  const prev = measures[measures.length - 2 - i];
                  const diff = prev ? m.weight - prev.weight : 0;
                  return (
                    <View key={m.date} style={[styles.tableRow, i === 0 && styles.tableRowFirst]}>
                      <Text style={styles.tableCell}>
                        {new Date(m.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </Text>
                      <Text style={styles.tableCell}>
                        {m.weight}
                        {diff !== 0 && (
                          <Text style={{ color: diff < 0 ? Colors.success : Colors.error, fontSize: 10 }}>
                            {' '}{diff > 0 ? '+' : ''}{diff.toFixed(1)}
                          </Text>
                        )}
                      </Text>
                      <Text style={styles.tableCell}>{m.waist} cm</Text>
                      <Text style={[styles.tableCell, { color: bmi < 25 ? Colors.success : Colors.error, fontWeight: '700' }]}>
                        {bmi.toFixed(1)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.background },
  scroll:  { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },

  title: { fontSize: 30, fontWeight: '900', color: Colors.text, marginBottom: Spacing.lg, letterSpacing: -0.8 },

  profileCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  profileAvatar:  { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.text, alignItems: 'center', justifyContent: 'center' },
  profileInitial: { fontSize: 22, fontWeight: '800', color: '#fff' },
  profileName:    { fontSize: 20, fontWeight: '800', color: Colors.text },
  profileSub:     { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  profileBadge:   { paddingHorizontal: 10, paddingVertical: 5, backgroundColor: Colors.success + '15', borderRadius: Radius.full },
  profileBadgeTxt:{ fontSize: 12, fontWeight: '600', color: Colors.success },

  bmiCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
  },
  bmiCaption:   { fontSize: 11, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  bmiNum:       { fontSize: 52, fontWeight: '900', letterSpacing: -2 },
  bmiLabelPill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full, marginTop: 4 },
  bmiLabelTxt:  { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  bmiScale:     { gap: 5 },
  bmiZone: {
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.background,
    alignItems: 'center',
    minWidth: 58,
  },
  bmiZoneTxt: { fontSize: 10, fontWeight: '500', color: Colors.textSecondary },

  statsGrid: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  statBox: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  statValue: { fontSize: 22, fontWeight: '900', color: Colors.text },
  statLabel: { fontSize: 10, color: Colors.textSecondary, textAlign: 'center' },

  card:      { backgroundColor: Colors.card, borderRadius: Radius.xl, padding: Spacing.md, marginBottom: Spacing.lg },
  cardTitle: { fontSize: 18, fontWeight: '800', color: Colors.text, marginBottom: Spacing.md, letterSpacing: -0.4 },
  inputRow:  { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  inputGroup:{ flex: 1 },
  inputLabel:{ fontSize: 11, fontWeight: '600', color: Colors.textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.background, borderRadius: Radius.md, paddingHorizontal: Spacing.sm, borderWidth: 1, borderColor: Colors.cardBorder },
  input:     { flex: 1, paddingVertical: 12, color: Colors.text, fontSize: 20, fontWeight: '700' },
  saveBtn:   { backgroundColor: Colors.text, borderRadius: Radius.full, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: Spacing.sm },
  saveBtnDone:{ backgroundColor: Colors.success },
  saveBtnTxt:{ fontSize: 15, fontWeight: '700', color: '#fff', letterSpacing: 0.2 },

  sectionTitle: { fontSize: 20, fontWeight: '800', color: Colors.text, marginBottom: Spacing.sm, letterSpacing: -0.4 },
  table:        { backgroundColor: Colors.card, borderRadius: Radius.lg, overflow: 'hidden' },
  tableRow:     { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: Colors.background },
  tableRowFirst:{ backgroundColor: Colors.success + '08' },
  tableHead:    { backgroundColor: Colors.background },
  tableHeadTxt: { flex: 1, fontSize: 10, fontWeight: '700', color: Colors.textSecondary, padding: Spacing.sm, textTransform: 'uppercase', letterSpacing: 1 },
  tableCell:    { flex: 1, fontSize: 13, fontWeight: '400', color: Colors.text, padding: Spacing.sm },
});
