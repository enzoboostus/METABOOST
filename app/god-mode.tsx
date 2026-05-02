import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, Save, Settings, Lock } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/store/userStore';
import { Colors, Spacing, Radius, Shadow } from '@/constants/theme';

const GOD_PIN = '8888';

const CONFIG_LABELS: Record<string, string> = {
  daily_step_goal:        'Objectif pas quotidien',
  daily_calorie_goal:     'Objectif calorique (kcal)',
  kcal_per_step:          'Calories brûlées / pas',
  session_base_kcal:      'Kcal de base / séance',
  session_effort_kcal:    'Kcal supplém. / effort',
  meal_kcal_balanced:     'Kcal repas équilibré',
  meal_kcal_rich:         'Kcal repas riche',
  meal_kcal_protein:      'Kcal repas protéiné',
  meal_kcal_light:        'Kcal repas léger',
  meal_kcal_unknown:      'Kcal repas inconnu',
  waist_baseline_male:    'Tour taille ref. homme (cm)',
  waist_baseline_female:  'Tour taille ref. femme (cm)',
  bmi_reference:          'IMC de référence',
  tone_sessions_max:      'Séances max pour tonus',
  posture_effort_max:     'Effort max pour posture (1-10)',
  avatar_male_slim:       'Photo avatar homme slim',
  avatar_male_athletic:   'Photo avatar homme athletic',
  avatar_male_full:       'Photo avatar homme full',
  avatar_female_slim:     'Photo avatar femme slim',
  avatar_female_athletic: 'Photo avatar femme athletic',
  avatar_female_full:     'Photo avatar femme full',
};

const URL_KEYS = [
  'avatar_male_slim', 'avatar_male_athletic', 'avatar_male_full',
  'avatar_female_slim', 'avatar_female_athletic', 'avatar_female_full',
];

const PROGRAM_LEVELS = ['Débutant', 'Interméd.', 'Intermédiaire', 'Confirmé', 'Avancé', 'Expert'];
const PROGRAM_CATEGORIES = ['Cardio', 'Force', 'Souplesse', 'Gainage', 'Tous'];

export default function GodMode() {
  const [pin, setPin] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [tab, setTab] = useState<'config' | 'programs'>('config');
  const [configValues, setConfigValues] = useState<Record<string, string>>({});
  const [programs, setPrograms] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [savingPrograms, setSavingPrograms] = useState(false);
  const { loadConfig } = useUserStore();

  useEffect(() => {
    if (unlocked) loadData();
  }, [unlocked]);

  async function loadData() {
    setLoadingData(true);
    const [cfgRes, progRes] = await Promise.all([
      supabase.from('app_config').select('key, value'),
      supabase.from('programs').select('*').order('sort_order'),
    ]);
    if (cfgRes.data) {
      const vals: Record<string, string> = {};
      cfgRes.data.forEach((row: any) => { vals[row.key] = row.value; });
      setConfigValues(vals);
    }
    if (progRes.data) setPrograms(progRes.data);
    setLoadingData(false);
  }

  function checkPin() {
    if (pin === GOD_PIN) {
      setUnlocked(true);
    } else {
      Alert.alert('Code incorrect', 'PIN invalide');
      setPin('');
    }
  }

  async function saveConfig() {
    setSavingConfig(true);
    const errors: string[] = [];
    await Promise.all(
      Object.entries(configValues).map(async ([key, value]) => {
        const { error } = await supabase.from('app_config').update({ value }).eq('key', key);
        if (error) errors.push(error.message);
      })
    );
    if (errors.length > 0) {
      Alert.alert('Erreur', errors[0]);
    } else {
      await loadConfig();
      Alert.alert('✓ Sauvegardé', 'Configuration mise à jour dans l\'app');
    }
    setSavingConfig(false);
  }

  async function savePrograms() {
    setSavingPrograms(true);
    const { error } = await supabase.from('programs').upsert(
      programs.map(p => ({
        id: p.id,
        title: p.title,
        tag: p.tag,
        meta: p.meta,
        level: p.level,
        image_url: p.image_url,
        category: p.category,
        active: p.active,
        sort_order: p.sort_order,
      }))
    );
    if (error) Alert.alert('Erreur', error.message);
    else Alert.alert('✓ Sauvegardé', 'Programmes mis à jour');
    setSavingPrograms(false);
  }

  function updateProgram(id: string, field: string, value: any) {
    setPrograms(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  }

  // ── PIN screen ────────────────────────────────────────────────────────────────
  if (!unlocked) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.pinScreen}>
          <TouchableOpacity style={styles.backBtnAbs} onPress={() => router.back()}>
            <ChevronLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <Lock size={52} color={Colors.accent} strokeWidth={1.5} />
          <Text style={styles.pinTitle}>GOD MODE</Text>
          <Text style={styles.pinSub}>Code PIN administrateur</Text>
          <TextInput
            style={styles.pinInput}
            value={pin}
            onChangeText={setPin}
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
            placeholder="••••"
            placeholderTextColor={Colors.textTertiary}
            autoFocus
            onSubmitEditing={checkPin}
          />
          <TouchableOpacity style={styles.unlockBtn} onPress={checkPin}>
            <Text style={styles.unlockBtnTxt}>DÉBLOQUER</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Main screen ───────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ChevronLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Settings size={16} color={Colors.accent} />
            <Text style={styles.headerTitle}>GOD MODE</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Tabs */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabBtn, tab === 'config' && styles.tabBtnActive]}
            onPress={() => setTab('config')}
          >
            <Text style={[styles.tabTxt, tab === 'config' && styles.tabTxtActive]}>CONFIG</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, tab === 'programs' && styles.tabBtnActive]}
            onPress={() => setTab('programs')}
          >
            <Text style={[styles.tabTxt, tab === 'programs' && styles.tabTxtActive]}>PROGRAMMES</Text>
          </TouchableOpacity>
        </View>

        {loadingData ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={Colors.accent} size="large" />
            <Text style={styles.loadingTxt}>Chargement depuis Supabase...</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* ── CONFIG TAB ── */}
            {tab === 'config' && (
              <>
                <Text style={styles.sectionHint}>
                  Modifiez les valeurs et appuyez sur Sauvegarder. Les changements s'appliquent immédiatement dans l'app.
                </Text>

                <View style={[styles.configCard, Shadow.sm]}>
                  <Text style={styles.groupTitle}>ACTIVITÉ & CALORIES</Text>
                  {['daily_step_goal', 'daily_calorie_goal', 'kcal_per_step',
                    'session_base_kcal', 'session_effort_kcal'].map(key => (
                    <View key={key} style={styles.configRow}>
                      <Text style={styles.configLabel}>{CONFIG_LABELS[key]}</Text>
                      <TextInput
                        style={styles.configInput}
                        value={configValues[key] ?? ''}
                        onChangeText={val => setConfigValues(prev => ({ ...prev, [key]: val }))}
                        keyboardType="decimal-pad"
                      />
                    </View>
                  ))}
                </View>

                <View style={[styles.configCard, Shadow.sm]}>
                  <Text style={styles.groupTitle}>REPAS (KCAL)</Text>
                  {['meal_kcal_balanced', 'meal_kcal_rich', 'meal_kcal_protein',
                    'meal_kcal_light', 'meal_kcal_unknown'].map(key => (
                    <View key={key} style={styles.configRow}>
                      <Text style={styles.configLabel}>{CONFIG_LABELS[key]}</Text>
                      <TextInput
                        style={styles.configInput}
                        value={configValues[key] ?? ''}
                        onChangeText={val => setConfigValues(prev => ({ ...prev, [key]: val }))}
                        keyboardType="decimal-pad"
                      />
                    </View>
                  ))}
                </View>

                <View style={[styles.configCard, Shadow.sm]}>
                  <Text style={styles.groupTitle}>MORPHOLOGIE</Text>
                  {['waist_baseline_male', 'waist_baseline_female', 'bmi_reference',
                    'tone_sessions_max', 'posture_effort_max'].map(key => (
                    <View key={key} style={styles.configRow}>
                      <Text style={styles.configLabel}>{CONFIG_LABELS[key]}</Text>
                      <TextInput
                        style={styles.configInput}
                        value={configValues[key] ?? ''}
                        onChangeText={val => setConfigValues(prev => ({ ...prev, [key]: val }))}
                        keyboardType="decimal-pad"
                      />
                    </View>
                  ))}
                </View>

                <View style={[styles.configCard, Shadow.sm]}>
                  <Text style={styles.groupTitle}>AVATARS (URL PHOTOS)</Text>
                  {URL_KEYS.map(key => (
                    <View key={key} style={styles.configRowUrl}>
                      <Text style={styles.configLabel}>{CONFIG_LABELS[key]}</Text>
                      <TextInput
                        style={styles.configInputUrl}
                        value={configValues[key] ?? ''}
                        onChangeText={val => setConfigValues(prev => ({ ...prev, [key]: val }))}
                        keyboardType="url"
                        autoCapitalize="none"
                        autoCorrect={false}
                        multiline
                      />
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  style={[styles.saveBtn, savingConfig && { opacity: 0.6 }]}
                  onPress={saveConfig}
                  disabled={savingConfig}
                >
                  {savingConfig ? (
                    <ActivityIndicator color="#333" size="small" />
                  ) : (
                    <>
                      <Save size={16} color="#333" />
                      <Text style={styles.saveBtnTxt}>SAUVEGARDER CONFIG</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}

            {/* ── PROGRAMS TAB ── */}
            {tab === 'programs' && (
              <>
                <Text style={styles.sectionHint}>
                  Éditez les programmes. Désactivez un programme pour le masquer dans l'app.
                </Text>

                {programs.map((prog, idx) => (
                  <View key={prog.id} style={[styles.progCard, Shadow.sm]}>
                    <View style={styles.progCardHeader}>
                      <View style={styles.progNum}>
                        <Text style={styles.progNumTxt}>{idx + 1}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.progCardTitle}>{prog.title}</Text>
                        <Text style={styles.progCardSub}>{prog.category} · {prog.level}</Text>
                      </View>
                      <View style={styles.activeRow}>
                        <Text style={styles.activeLbl}>{prog.active ? 'Actif' : 'Inactif'}</Text>
                        <Switch
                          value={prog.active}
                          onValueChange={val => updateProgram(prog.id, 'active', val)}
                          trackColor={{ false: Colors.surface, true: Colors.accent + '80' }}
                          thumbColor={prog.active ? Colors.accent : Colors.textSecondary}
                        />
                      </View>
                    </View>

                    {([
                      { field: 'title',     label: 'Titre' },
                      { field: 'tag',       label: 'Tag' },
                      { field: 'meta',      label: 'Méta (séances/durée)' },
                      { field: 'level',     label: 'Niveau' },
                      { field: 'category',  label: 'Catégorie' },
                      { field: 'image_url', label: 'URL Image' },
                    ] as { field: string; label: string }[]).map(({ field, label }) => (
                      <View key={field} style={styles.progField}>
                        <Text style={styles.progFieldLbl}>{label}</Text>
                        <TextInput
                          style={[styles.progFieldInput, field === 'image_url' && styles.configInputUrl]}
                          value={String(prog[field] ?? '')}
                          onChangeText={val => updateProgram(prog.id, field, val)}
                          autoCapitalize={field === 'image_url' ? 'none' : 'sentences'}
                          autoCorrect={false}
                          multiline={field === 'image_url'}
                        />
                      </View>
                    ))}
                  </View>
                ))}

                <TouchableOpacity
                  style={[styles.saveBtn, savingPrograms && { opacity: 0.6 }]}
                  onPress={savePrograms}
                  disabled={savingPrograms}
                >
                  {savingPrograms ? (
                    <ActivityIndicator color="#333" size="small" />
                  ) : (
                    <>
                      <Save size={16} color="#333" />
                      <Text style={styles.saveBtnTxt}>SAUVEGARDER PROGRAMMES</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}

            <View style={{ height: 60 }} />
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  /* PIN screen */
  pinScreen:   { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl, gap: Spacing.md },
  backBtnAbs:  { position: 'absolute', top: Spacing.md, left: Spacing.md, width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center' },
  pinTitle:    { fontSize: 36, fontWeight: '900', color: Colors.text, letterSpacing: -1.5 },
  pinSub:      { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
  pinInput:    { width: '60%', textAlign: 'center', fontSize: 28, fontWeight: '900', color: Colors.text, backgroundColor: Colors.card, borderRadius: Radius.xl, paddingVertical: 18, borderWidth: 1, borderColor: Colors.cardBorder, letterSpacing: 12 },
  unlockBtn:   { backgroundColor: Colors.accent, borderRadius: Radius.full, paddingHorizontal: 48, paddingVertical: 16, marginTop: Spacing.sm },
  unlockBtnTxt:{ fontSize: 15, fontWeight: '800', color: '#333', letterSpacing: 1 },

  /* Header */
  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 0.5, borderBottomColor: Colors.cardBorder },
  backBtn:      { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  headerTitle:  { fontSize: 16, fontWeight: '900', color: Colors.text, letterSpacing: 2 },

  /* Tabs */
  tabBar:       { flexDirection: 'row', marginHorizontal: Spacing.md, marginTop: Spacing.sm, backgroundColor: Colors.card, borderRadius: Radius.lg, padding: 3, borderWidth: 0.5, borderColor: Colors.cardBorder },
  tabBtn:       { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: Radius.md },
  tabBtnActive: { backgroundColor: Colors.accent },
  tabTxt:       { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 1.5 },
  tabTxtActive: { color: '#333' },

  /* Loading */
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  loadingTxt:  { fontSize: 13, color: Colors.textSecondary },

  scroll:  { flex: 1 },
  content: { padding: Spacing.md },

  sectionHint: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18, marginBottom: Spacing.md, textAlign: 'center' },

  /* Config card */
  configCard:   { backgroundColor: Colors.card, borderRadius: Radius.xl, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 0.5, borderColor: Colors.cardBorder },
  groupTitle:   { fontSize: 10, fontWeight: '800', color: Colors.textSecondary, letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: Spacing.sm },
  configRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: Colors.cardBorder },
  configRowUrl: { paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: Colors.cardBorder },
  configLabel:  { flex: 1, fontSize: 13, color: Colors.text, marginRight: Spacing.sm },
  configInput:  { width: 90, textAlign: 'right', fontSize: 15, fontWeight: '700', color: Colors.accent, backgroundColor: Colors.surface, borderRadius: Radius.sm, paddingHorizontal: 10, paddingVertical: 7, borderWidth: 0.5, borderColor: Colors.cardBorder },
  configInputUrl: { width: '100%', fontSize: 11, color: Colors.teal, backgroundColor: Colors.surface, borderRadius: Radius.sm, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 0.5, borderColor: Colors.cardBorder, marginTop: 4 },

  /* Program card */
  progCard:       { backgroundColor: Colors.card, borderRadius: Radius.xl, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 0.5, borderColor: Colors.cardBorder },
  progCardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md, paddingBottom: Spacing.sm, borderBottomWidth: 0.5, borderBottomColor: Colors.cardBorder },
  progNum:        { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  progNumTxt:     { fontSize: 14, fontWeight: '900', color: Colors.accent },
  progCardTitle:  { fontSize: 16, fontWeight: '800', color: Colors.text },
  progCardSub:    { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  activeRow:      { alignItems: 'center', gap: 2 },
  activeLbl:      { fontSize: 9, fontWeight: '600', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  progField:      { marginBottom: Spacing.sm },
  progFieldLbl:   { fontSize: 10, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 },
  progFieldInput: { fontSize: 14, color: Colors.text, backgroundColor: Colors.surface, borderRadius: Radius.sm, paddingHorizontal: 12, paddingVertical: 9, borderWidth: 0.5, borderColor: Colors.cardBorder },

  /* Save button */
  saveBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.accent, borderRadius: Radius.full, paddingVertical: 16, marginTop: Spacing.sm, marginBottom: Spacing.md },
  saveBtnTxt: { fontSize: 14, fontWeight: '800', color: '#333', letterSpacing: 1 },
});
