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
import * as Haptics from 'expo-haptics';
import { useShallow } from 'zustand/react/shallow';
import { useUserStore, BodyMeasure } from '@/store/userStore';
import { useAvatarParams } from '@/hooks/useAvatarParams';
import { Colors, Spacing, Radius } from '@/constants/theme';

const BG: any    = { backgroundImage: 'radial-gradient(ellipse at 50% 0%, #0A1018 0%, #020305 80%)' };
const GLASS: any = { backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' };
const FLOAT: any = { boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 1px rgba(0,242,255,0.06)' };

export default function Profile() {
  const { profile, measures, addMeasure, getCurrentMeasure } = useUserStore(useShallow((s) => ({
    profile:           s.profile,
    measures:          s.measures,
    addMeasure:        s.addMeasure,
    getCurrentMeasure: s.getCurrentMeasure,
  })));
  const params = useAvatarParams();
  const currentMeasure = getCurrentMeasure();

  const [weight, setWeight] = useState(currentMeasure?.weight?.toString() ?? '');
  const [waist,  setWaist]  = useState(currentMeasure?.waist?.toString()  ?? '');
  const [saved,  setSaved]  = useState(false);

  function handleSave() {
    const w = parseFloat(weight);
    const wa = parseFloat(waist);
    if (isNaN(w) || isNaN(wa) || w <= 0 || wa <= 0) return;
    const measure: BodyMeasure = { date: new Date().toISOString(), weight: w, waist: wa };
    addMeasure(measure);
    setSaved(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setSaved(false), 2000);
  }

  const bmiColor =
    params.bmi < 18.5 ? Colors.warning
    : params.bmi < 25  ? Colors.cyan
    : params.bmi < 30  ? Colors.warning
    : Colors.accent;

  const bmiLabel =
    params.bmi < 18.5 ? 'Maigreur'
    : params.bmi < 25  ? 'Poids normal'
    : params.bmi < 30  ? 'Surpoids'
    : 'Obésité';

  return (
    <SafeAreaView style={[styles.safe, BG]} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Profil & Stats</Text>

          {/* Profile card */}
          <View style={[styles.profileCard, GLASS, FLOAT]}>
            <Text style={styles.avatarEmoji}>{profile.gender === 'male' ? '👤' : '👤'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>{profile.name || 'Athlète'}</Text>
              <Text style={styles.profileSub}>
                {profile.gender === 'male' ? 'Homme' : 'Femme'} · {profile.height} cm
              </Text>
            </View>
          </View>

          {/* BMI */}
          <View style={[styles.bmiCard, { borderColor: bmiColor + '33' }, GLASS, FLOAT]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.bmiCaption}>Indice de Masse Corporelle</Text>
              <Text style={[styles.bmiNum, { color: bmiColor }]}>{params.bmi.toFixed(1)}</Text>
              <Text style={[styles.bmiLabelTxt, { color: bmiColor }]}>{bmiLabel}</Text>
            </View>
            <View style={styles.bmiScale}>
              {[
                { range: '<18.5', active: params.bmi < 18.5 },
                { range: '18–25', active: params.bmi >= 18.5 && params.bmi < 25 },
                { range: '25–30', active: params.bmi >= 25 && params.bmi < 30 },
                { range: '>30',   active: params.bmi >= 30 },
              ].map((z) => (
                <View key={z.range} style={[styles.bmiZone, z.active && { borderColor: bmiColor + '55', backgroundColor: bmiColor + '15' }]}>
                  <Text style={[styles.bmiZoneTxt, z.active && { color: bmiColor }]}>{z.range}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Stats grid */}
          <View style={styles.statsGrid}>
            {[
              { label: 'Tonus musculaire', value: `${Math.round(params.toneLevel * 100)}%` },
              { label: 'Posture',          value: `${Math.round(params.posture * 100)}%` },
              { label: 'Affinement',       value: `${Math.round(params.stepSlim * 200)}%` },
            ].map((s) => (
              <View key={s.label} style={[styles.statBox, GLASS]}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* New measure */}
          <View style={[styles.card, GLASS, FLOAT]}>
            <Text style={styles.cardTitle}>Nouvelle mesure</Text>
            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Poids (kg)</Text>
                <TextInput
                  style={styles.input}
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="decimal-pad"
                  placeholder="75.0"
                  placeholderTextColor={Colors.textSecondary}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tour de taille (cm)</Text>
                <TextInput
                  style={styles.input}
                  value={waist}
                  onChangeText={setWaist}
                  keyboardType="decimal-pad"
                  placeholder="85"
                  placeholderTextColor={Colors.textSecondary}
                />
              </View>
            </View>
            <TouchableOpacity style={[styles.saveBtn, saved && styles.saveBtnDone]} onPress={handleSave} activeOpacity={0.85}>
              <Text style={[styles.saveBtnTxt, saved && { color: Colors.cyan }]}>
                {saved ? '— Enregistré —' : 'Enregistrer la mesure'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* History table */}
          {measures.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Historique des mesures</Text>
              <View style={[styles.table, GLASS]}>
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
                        {m.weight}{diff !== 0 && (
                          <Text style={{ color: diff < 0 ? Colors.cyan : Colors.accent, fontSize: 10 }}>
                            {' '}{diff > 0 ? '+' : ''}{diff.toFixed(1)}
                          </Text>
                        )}
                      </Text>
                      <Text style={styles.tableCell}>{m.waist} cm</Text>
                      <Text style={[styles.tableCell, {
                        color: bmi < 25 ? Colors.cyan : Colors.accent,
                        fontWeight: '700',
                      }]}>
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
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },

  title: { fontSize: 34, fontWeight: '900', color: Colors.text, marginBottom: Spacing.md, letterSpacing: -1 },

  profileCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  avatarEmoji: { fontSize: 44, opacity: 0.7 },
  profileName: { fontSize: 22, fontWeight: '900', color: Colors.text },
  profileSub: { fontSize: 11, fontWeight: '300', color: Colors.textSecondary, marginTop: 3, letterSpacing: 0.8 },

  bmiCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  bmiCaption: { fontSize: 9, fontWeight: '300', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 2 },
  bmiNum: { fontSize: 46, fontWeight: '900', letterSpacing: -2, marginTop: 2 },
  bmiLabelTxt: { fontSize: 13, fontWeight: '700', marginTop: 2, textTransform: 'uppercase', letterSpacing: 1 },
  bmiScale: { gap: 4 },
  bmiZone: {
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    minWidth: 60,
  },
  bmiZoneTxt: { fontSize: 10, fontWeight: '600', color: Colors.textSecondary },

  statsGrid: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  statBox: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.md,
    alignItems: 'center',
  },
  statValue: { fontSize: 22, fontWeight: '900', color: Colors.cyan },
  statLabel: { fontSize: 9, fontWeight: '300', color: Colors.textSecondary, marginTop: 4, textAlign: 'center', letterSpacing: 0.8 },

  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  cardTitle: { fontSize: 18, fontWeight: '900', color: Colors.text, marginBottom: Spacing.md, letterSpacing: -0.3 },
  inputRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  inputGroup: { flex: 1 },
  inputLabel: { fontSize: 9, fontWeight: '300', color: Colors.textSecondary, marginBottom: Spacing.xs, textTransform: 'uppercase', letterSpacing: 1.5 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,242,255,0.18)',
    padding: Spacing.sm,
    color: Colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  saveBtn: {
    backgroundColor: 'rgba(0,242,255,0.08)',
    borderRadius: Radius.full,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,242,255,0.30)',
  },
  saveBtnDone: { borderColor: 'rgba(0,242,255,0.60)', boxShadow: '0 0 16px rgba(0,242,255,0.20)' as any },
  saveBtnTxt: { fontSize: 13, fontWeight: '700', color: Colors.text, textTransform: 'uppercase', letterSpacing: 2 },

  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 3,
  },
  table: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  tableRowFirst: { backgroundColor: 'rgba(0,242,255,0.05)' },
  tableHead: { backgroundColor: 'rgba(255,255,255,0.03)' },
  tableHeadTxt: { flex: 1, fontSize: 9, fontWeight: '700', color: Colors.textSecondary, padding: Spacing.sm, textTransform: 'uppercase', letterSpacing: 1.5 },
  tableCell: { flex: 1, fontSize: 13, fontWeight: '300', color: Colors.text, padding: Spacing.sm },
});
