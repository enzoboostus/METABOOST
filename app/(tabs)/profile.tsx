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

export default function Profile() {
  const { profile, measures, addMeasure, getCurrentMeasure } = useUserStore(useShallow((s) => ({
    profile: s.profile,
    measures: s.measures,
    addMeasure: s.addMeasure,
    getCurrentMeasure: s.getCurrentMeasure,
  })));
  const params = useAvatarParams();

  const currentMeasure = getCurrentMeasure();
  const [weight, setWeight] = useState(currentMeasure?.weight?.toString() ?? '');
  const [waist, setWaist] = useState(currentMeasure?.waist?.toString() ?? '');
  const [saved, setSaved] = useState(false);

  function handleSave() {
    const w = parseFloat(weight);
    const wa = parseFloat(waist);
    if (isNaN(w) || isNaN(wa) || w <= 0 || wa <= 0) return;

    const measure: BodyMeasure = {
      date: new Date().toISOString(),
      weight: w,
      waist: wa,
    };
    addMeasure(measure);
    setSaved(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setSaved(false), 2000);
  }

  const bmiColor =
    params.bmi < 18.5
      ? Colors.accentOrange
      : params.bmi < 25
      ? Colors.accentGreen
      : params.bmi < 30
      ? Colors.accentOrange
      : Colors.accent;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Profil & Stats</Text>

          {/* Profile card */}
          <View style={styles.profileCard}>
            <Text style={styles.avatarEmoji}>{profile.gender === 'male' ? '👨' : '👩'}</Text>
            <View>
              <Text style={styles.profileName}>{profile.name || 'Athlète'}</Text>
              <Text style={styles.profileSub}>
                {profile.gender === 'male' ? 'Homme' : 'Femme'} · {profile.height} cm
              </Text>
            </View>
          </View>

          {/* BMI summary */}
          <View style={[styles.bmiCard, { borderColor: bmiColor + '55' }]}>
            <View>
              <Text style={styles.bmiTitle}>Indice de Masse Corporelle</Text>
              <Text style={[styles.bmiValue, { color: bmiColor }]}>
                {params.bmi.toFixed(1)}
              </Text>
              <Text style={[styles.bmiCategory, { color: bmiColor }]}>
                {params.bmi < 18.5
                  ? 'Maigreur'
                  : params.bmi < 25
                  ? '✅ Poids normal'
                  : params.bmi < 30
                  ? '⚠️ Surpoids'
                  : '🔴 Obésité'}
              </Text>
            </View>
            <View style={styles.bmiScale}>
              {[
                { label: '<18.5', color: Colors.accentOrange },
                { label: '18.5–25', color: Colors.accentGreen },
                { label: '25–30', color: Colors.accentOrange },
                { label: '>30', color: Colors.accent },
              ].map((zone) => (
                <View key={zone.label} style={[styles.bmiZone, { backgroundColor: zone.color + '44' }]}>
                  <Text style={[styles.bmiZoneText, { color: zone.color }]}>{zone.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Tone & activity stats */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{Math.round(params.toneLevel * 100)}%</Text>
              <Text style={styles.statLabel}>Tonus</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{Math.round(params.posture * 100)}%</Text>
              <Text style={styles.statLabel}>Posture</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{Math.round(params.stepSlim * 200)}%</Text>
              <Text style={styles.statLabel}>Affinement pas</Text>
            </View>
          </View>

          {/* Add measurement */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📏 Nouvelle mesure</Text>
            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Poids (kg)</Text>
                <TextInput
                  style={styles.input}
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="decimal-pad"
                  placeholder="Ex: 75.5"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tour de taille (cm)</Text>
                <TextInput
                  style={styles.input}
                  value={waist}
                  onChangeText={setWaist}
                  keyboardType="decimal-pad"
                  placeholder="Ex: 85"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            </View>
            <TouchableOpacity
              style={[styles.saveBtn, saved && styles.saveBtnDone]}
              onPress={handleSave}
              activeOpacity={0.85}
            >
              <Text style={styles.saveBtnText}>
                {saved ? '✅ Enregistré !' : 'Enregistrer la mesure'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Measures history */}
          {measures.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Historique des mesures</Text>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={styles.tableHeaderText}>Date</Text>
                  <Text style={styles.tableHeaderText}>Poids</Text>
                  <Text style={styles.tableHeaderText}>Tour taille</Text>
                  <Text style={styles.tableHeaderText}>IMC</Text>
                </View>
                {[...measures].reverse().map((m, i) => {
                  const bmi = m.weight / ((profile.height / 100) ** 2);
                  const isFirst = i === 0;
                  const prev = measures[measures.length - 1 - (i + 1)];
                  const diff = prev ? m.weight - prev.weight : 0;
                  return (
                    <View key={m.date} style={[styles.tableRow, isFirst && styles.tableRowHighlight]}>
                      <Text style={styles.tableCell}>
                        {new Date(m.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </Text>
                      <Text style={styles.tableCell}>
                        {m.weight} kg{' '}
                        {diff !== 0 && (
                          <Text style={{ color: diff < 0 ? Colors.accentGreen : Colors.accent, fontSize: 11 }}>
                            {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                          </Text>
                        )}
                      </Text>
                      <Text style={styles.tableCell}>{m.waist} cm</Text>
                      <Text style={[styles.tableCell, {
                        color: bmi < 18.5 ? Colors.accentOrange : bmi < 25 ? Colors.accentGreen : Colors.accent
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

  title: { fontSize: 28, fontWeight: '800', color: Colors.text, marginBottom: Spacing.md },

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
  avatarEmoji: { fontSize: 48 },
  profileName: { fontSize: 20, fontWeight: '700', color: Colors.text },
  profileSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },

  bmiCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  bmiTitle: { fontSize: 13, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  bmiValue: { fontSize: 36, fontWeight: '800', marginTop: 4 },
  bmiCategory: { fontSize: 14, fontWeight: '600', marginTop: 4 },
  bmiScale: { flexDirection: 'row', gap: 4 },
  bmiZone: { flex: 1, borderRadius: Radius.sm, padding: 4, alignItems: 'center' },
  bmiZoneText: { fontSize: 10, fontWeight: '600' },

  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.md,
    alignItems: 'center',
  },
  statValue: { fontSize: 22, fontWeight: '700', color: Colors.primary },
  statLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 4, textAlign: 'center' },

  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: Spacing.md },
  inputRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  inputGroup: { flex: 1 },
  inputLabel: { fontSize: 12, color: Colors.textSecondary, marginBottom: Spacing.xs },
  input: {
    backgroundColor: Colors.background,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.sm,
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  saveBtnDone: { backgroundColor: Colors.accentGreen },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: Colors.text },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm },

  table: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  tableRowHighlight: { backgroundColor: Colors.primary + '11' },
  tableHeader: { backgroundColor: Colors.cardBorder },
  tableHeaderText: { flex: 1, fontSize: 11, fontWeight: '700', color: Colors.textSecondary, padding: Spacing.sm, textTransform: 'uppercase' },
  tableCell: { flex: 1, fontSize: 13, color: Colors.text, padding: Spacing.sm },
});
