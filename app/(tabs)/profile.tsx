import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Scale, Ruler, TrendingDown, TrendingUp, Activity } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useShallow } from 'zustand/react/shallow';
import { useUserStore, BodyMeasure } from '@/store/userStore';
import { useAvatarParams } from '@/hooks/useAvatarParams';
import { Colors, Spacing, Radius, Shadow } from '@/constants/theme';

export default function Profile() {
  const { profile, measures, addMeasure, getCurrentMeasure, logout } = useUserStore(useShallow((s) => ({
    profile: s.profile, measures: s.measures, addMeasure: s.addMeasure, getCurrentMeasure: s.getCurrentMeasure, logout: s.logout,
  })));
  const params         = useAvatarParams();
  const currentMeasure = getCurrentMeasure();

  const [weight,   setWeight]   = useState(currentMeasure?.weight?.toString() ?? '');
  const [waist,    setWaist]    = useState(currentMeasure?.waist?.toString()  ?? '');
  const [saved,    setSaved]    = useState(false);
  const [tapCount, setTapCount] = useState(0);

  function handleSave() {
    const w = parseFloat(weight), wa = parseFloat(waist);
    if (isNaN(w) || isNaN(wa) || w <= 0 || wa <= 0) return;
    addMeasure({ date: new Date().toISOString(), weight: w, waist: wa } as BodyMeasure);
    setSaved(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setSaved(false), 2000);
  }

  const bmiColor = params.bmi < 18.5 ? Colors.warning : params.bmi < 25 ? Colors.success : params.bmi < 30 ? Colors.warning : Colors.red;
  const bmiLabel = params.bmi < 18.5 ? 'Maigreur' : params.bmi < 25 ? 'Poids normal' : params.bmi < 30 ? 'Surpoids' : 'Obésité';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.pageLabel}>Mes données</Text>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              const next = tapCount + 1;
              setTapCount(next);
              if (next >= 5) {
                setTapCount(0);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                router.push('/god-mode');
              }
            }}
          >
            <Text style={styles.title}>PROFIL</Text>
          </TouchableOpacity>

          {/* Profile banner */}
          <View style={[styles.profileBanner, Shadow.md]}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileInitial}>{(profile.name || 'A').charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>{profile.name || 'Athlète'}</Text>
              <Text style={styles.profileSub}>{profile.gender === 'male' ? 'Homme' : 'Femme'} · {profile.height} cm</Text>
            </View>
          </View>

          {/* BMI */}
          <View style={[styles.bmiCard, Shadow.sm]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.bmiLabel}>IMC</Text>
              <Text style={[styles.bmiNum, { color: bmiColor }]}>{params.bmi.toFixed(1)}</Text>
              <View style={[styles.bmiPill, { backgroundColor: bmiColor + '18', borderColor: bmiColor + '44' }]}>
                <Text style={[styles.bmiPillTxt, { color: bmiColor }]}>{bmiLabel}</Text>
              </View>
            </View>
            <View style={styles.bmiZones}>
              {[{ r: '<18.5', a: params.bmi < 18.5, c: Colors.warning }, { r: '18–25', a: params.bmi >= 18.5 && params.bmi < 25, c: Colors.success }, { r: '25–30', a: params.bmi >= 25 && params.bmi < 30, c: Colors.warning }, { r: '>30', a: params.bmi >= 30, c: Colors.red }].map((z) => (
                <View key={z.r} style={[styles.bmiZone, z.a && { backgroundColor: z.c + '18', borderColor: z.c + '55' }]}>
                  <Text style={[styles.bmiZoneTxt, z.a && { color: z.c, fontWeight: '700' }]}>{z.r}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            {[
              { lbl: 'Tonus', val: `${Math.round(params.toneLevel * 100)}%`, icon: <Activity size={16} color={Colors.accent} strokeWidth={2} /> },
              { lbl: 'Posture', val: `${Math.round(params.posture * 100)}%`, icon: <TrendingUp size={16} color={Colors.accent} strokeWidth={2} /> },
              { lbl: 'Affinement', val: `${Math.round(params.stepSlim * 200)}%`, icon: <TrendingDown size={16} color={Colors.success} strokeWidth={2} /> },
            ].map((s) => (
              <View key={s.lbl} style={[styles.statBox, Shadow.sm]}>
                {s.icon}
                <Text style={styles.statVal}>{s.val}</Text>
                <Text style={styles.statLbl}>{s.lbl}</Text>
              </View>
            ))}
          </View>

          {/* New measure */}
          <View style={[styles.card, Shadow.sm]}>
            <Text style={styles.cardTitle}>Nouvelle mesure</Text>
            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLbl}>Poids (kg)</Text>
                <View style={styles.inputBox}>
                  <Scale size={15} color={Colors.textSecondary} strokeWidth={1.5} />
                  <TextInput style={styles.input} value={weight} onChangeText={setWeight} keyboardType="decimal-pad" placeholder="75.0" placeholderTextColor={Colors.textTertiary} />
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLbl}>Tour de taille (cm)</Text>
                <View style={styles.inputBox}>
                  <Ruler size={15} color={Colors.textSecondary} strokeWidth={1.5} />
                  <TextInput style={styles.input} value={waist} onChangeText={setWaist} keyboardType="decimal-pad" placeholder="85" placeholderTextColor={Colors.textTertiary} />
                </View>
              </View>
            </View>
            <TouchableOpacity style={[styles.saveBtn, saved && { backgroundColor: Colors.success }]} onPress={handleSave} activeOpacity={0.85}>
              <Text style={styles.saveBtnTxt}>{saved ? 'Enregistré ✓' : 'Enregistrer'}</Text>
            </TouchableOpacity>
          </View>

          {/* History */}
          {measures.length > 0 && (
            <>
              <Text style={styles.historyTitle}>HISTORIQUE</Text>
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
                    <View key={m.date} style={[styles.tableRow, i === 0 && { backgroundColor: Colors.accentLight }]}>
                      <Text style={styles.cell}>{new Date(m.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</Text>
                      <Text style={styles.cell}>
                        {m.weight}{diff !== 0 && <Text style={{ color: diff < 0 ? Colors.success : Colors.red, fontSize: 10 }}> {diff > 0 ? '+' : ''}{diff.toFixed(1)}</Text>}
                      </Text>
                      <Text style={styles.cell}>{m.waist} cm</Text>
                      <Text style={[styles.cell, { color: bmi < 25 ? Colors.success : Colors.red, fontWeight: '700' }]}>{bmi.toFixed(1)}</Text>
                    </View>
                  );
                })}
              </View>
            </>
          )}

          {/* Logout */}
          <View style={styles.logoutBlock}>
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={async () => { await logout(); router.replace('/onboarding'); }}
              activeOpacity={0.8}
            >
              <Text style={styles.logoutTxt}>Se déconnecter</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },

  pageLabel: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 },
  title:     { fontSize: 48, fontWeight: '900', color: Colors.text, letterSpacing: -2, textTransform: 'uppercase', marginBottom: Spacing.lg, lineHeight: 48 },

  profileBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.card, borderRadius: Radius.xl, padding: Spacing.md,
    marginBottom: Spacing.md, borderWidth: 0.5, borderColor: Colors.cardBorder,
  },
  profileAvatar:  { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.cardBorder },
  profileInitial: { fontSize: 22, fontWeight: '900', color: Colors.text },
  profileName:    { fontSize: 20, fontWeight: '800', color: Colors.text },
  profileSub:     { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },

  bmiCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.card, borderRadius: Radius.xl, padding: Spacing.md,
    marginBottom: Spacing.md, borderWidth: 0.5, borderColor: Colors.cardBorder,
    borderLeftWidth: 3, borderLeftColor: Colors.success,
  },
  bmiLabel:   { fontSize: 10, fontWeight: '600', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 2 },
  bmiNum:     { fontSize: 52, fontWeight: '900', letterSpacing: -2 },
  bmiPill:    { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full, borderWidth: 0.5, marginTop: 4 },
  bmiPillTxt: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  bmiZones:   { gap: 4 },
  bmiZone:    { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 5, borderWidth: 0.5, borderColor: Colors.cardBorder, backgroundColor: Colors.surface, alignItems: 'center', minWidth: 56 },
  bmiZoneTxt: { fontSize: 10, fontWeight: '500', color: Colors.textSecondary },

  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  statBox:  { flex: 1, backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center', gap: 4, borderWidth: 0.5, borderColor: Colors.cardBorder },
  statVal:  { fontSize: 22, fontWeight: '900', color: Colors.text },
  statLbl:  { fontSize: 9, color: Colors.textSecondary, textAlign: 'center' },

  card:       { backgroundColor: Colors.card, borderRadius: Radius.xl, padding: Spacing.md, marginBottom: Spacing.lg, borderWidth: 0.5, borderColor: Colors.cardBorder },
  cardTitle:  { fontSize: 18, fontWeight: '800', color: Colors.text, marginBottom: Spacing.md, letterSpacing: -0.4 },
  inputRow:   { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  inputGroup: { flex: 1 },
  inputLbl:   { fontSize: 10, fontWeight: '600', color: Colors.textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 },
  inputBox:   { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.surface, borderRadius: Radius.md, paddingHorizontal: Spacing.sm, borderWidth: 0.5, borderColor: Colors.cardBorder },
  input:      { flex: 1, paddingVertical: 12, color: Colors.text, fontSize: 20, fontWeight: '700' },
  saveBtn:    { backgroundColor: Colors.accent, borderRadius: Radius.full, paddingVertical: 14, alignItems: 'center' },
  saveBtnTxt: { fontSize: 15, fontWeight: '700', color: '#333333', letterSpacing: 0.2 },

  historyTitle: { fontSize: 11, fontWeight: '800', color: Colors.textSecondary, letterSpacing: 3, textTransform: 'uppercase', marginBottom: Spacing.sm },
  table:       { backgroundColor: Colors.card, borderRadius: Radius.lg, overflow: 'hidden', borderWidth: 0.5, borderColor: Colors.cardBorder },
  tableRow:    { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: Colors.surface },
  tableHead:   { backgroundColor: Colors.surface },
  tableHeadTxt:{ flex: 1, fontSize: 9, fontWeight: '700', color: Colors.textSecondary, padding: Spacing.sm, textTransform: 'uppercase', letterSpacing: 1.5 },
  cell:        { flex: 1, fontSize: 13, fontWeight: '400', color: Colors.text, padding: Spacing.sm },

  logoutBlock:   { marginTop: Spacing.xl, marginBottom: Spacing.lg },
  logoutBtn:     { borderRadius: Radius.full, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,59,48,0.3)', backgroundColor: 'rgba(255,59,48,0.06)' },
  logoutTxt:     { fontSize: 15, fontWeight: '700', color: Colors.red, letterSpacing: 0.2 },
});
