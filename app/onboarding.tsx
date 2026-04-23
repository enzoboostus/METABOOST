import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import Avatar from '@/components/Avatar';
import { useUserStore, Gender } from '@/store/userStore';
import { Colors, Spacing, Radius } from '@/constants/theme';

const { width } = Dimensions.get('window');

const STEPS = ['welcome', 'name', 'gender', 'body', 'done'] as const;
type Step = (typeof STEPS)[number];

export default function Onboarding() {
  const [step, setStep] = useState<Step>('welcome');
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [height, setHeight] = useState('175');
  const [weight, setWeight] = useState('75');
  const [waist, setWaist] = useState('85');

  const { setProfile, addMeasure, setInitialMeasure, completeOnboarding } = useUserStore((s) => ({
    setProfile: s.setProfile,
    addMeasure: s.addMeasure,
    setInitialMeasure: s.setInitialMeasure,
    completeOnboarding: s.completeOnboarding,
  }));

  function next() {
    Haptics.selectionAsync();
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) {
      setStep(STEPS[idx + 1]);
    }
  }

  function finish() {
    const h = parseFloat(height) || 175;
    const w = parseFloat(weight) || 75;
    const wa = parseFloat(waist) || 85;

    setProfile({ name: name.trim() || 'Athlète', gender, height: h });
    const measure = { date: new Date().toISOString(), weight: w, waist: wa };
    addMeasure(measure);
    setInitialMeasure(measure);
    completeOnboarding();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace('/(tabs)/');
  }

  const mockParams = {
    bodyWidth: parseFloat(weight) / ((parseFloat(height) / 100) ** 2) * 0.024 + 0.4,
    waistWidth: parseFloat(waist) / 80,
    toneLevel: 0,
    posture: 0,
    stepSlim: 0,
    bmi: parseFloat(weight) / ((parseFloat(height) / 100) ** 2),
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Step indicators */}
        <View style={styles.steps}>
          {STEPS.map((s, i) => (
            <View
              key={s}
              style={[
                styles.stepDot,
                STEPS.indexOf(step) >= i && styles.stepDotActive,
              ]}
            />
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {step === 'welcome' && (
            <View style={styles.centered}>
              <LinearGradient
                colors={[Colors.primary + '33', 'transparent']}
                style={styles.logoBg}
              >
                <Text style={styles.logoText}>⚡</Text>
              </LinearGradient>
              <Text style={styles.welcomeTitle}>MetaBoost</Text>
              <Text style={styles.welcomeSub}>
                Suivez votre évolution physique grâce à un avatar dynamique qui évolue avec vous.
              </Text>
              <View style={styles.featureList}>
                {[
                  { emoji: '🧍', text: 'Avatar qui reflète votre silhouette' },
                  { emoji: '🏋️', text: 'Suivi de vos séances et efforts' },
                  { emoji: '📷', text: 'Analyse rapide de vos repas' },
                  { emoji: '👟', text: 'Comptage automatique des pas' },
                ].map((f) => (
                  <View key={f.text} style={styles.featureItem}>
                    <Text style={styles.featureEmoji}>{f.emoji}</Text>
                    <Text style={styles.featureText}>{f.text}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {step === 'name' && (
            <View style={styles.centered}>
              <Text style={styles.stepTitle}>Comment vous appelez-vous ?</Text>
              <Text style={styles.stepSub}>Votre prénom ou surnom</Text>
              <TextInput
                style={styles.bigInput}
                value={name}
                onChangeText={setName}
                placeholder="Ex: Thomas"
                placeholderTextColor={Colors.textMuted}
                autoFocus
                returnKeyType="next"
                onSubmitEditing={next}
              />
            </View>
          )}

          {step === 'gender' && (
            <View style={styles.centered}>
              <Text style={styles.stepTitle}>Votre profil</Text>
              <Text style={styles.stepSub}>Sélectionnez votre genre pour personnaliser votre avatar</Text>
              <View style={styles.genderRow}>
                <TouchableOpacity
                  style={[styles.genderBtn, gender === 'male' && styles.genderBtnActive]}
                  onPress={() => { setGender('male'); Haptics.selectionAsync(); }}
                >
                  <Avatar
                    gender="male"
                    params={{ bodyWidth: 1, waistWidth: 1, toneLevel: 0.5, posture: 0.5, stepSlim: 0, bmi: 22 }}
                    size={150}
                    minimal
                  />
                  <Text style={[styles.genderLabel, gender === 'male' && { color: Colors.male }]}>Homme</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.genderBtn, gender === 'female' && styles.genderBtnActiveFemale]}
                  onPress={() => { setGender('female'); Haptics.selectionAsync(); }}
                >
                  <Avatar
                    gender="female"
                    params={{ bodyWidth: 0.95, waistWidth: 0.9, toneLevel: 0.5, posture: 0.5, stepSlim: 0, bmi: 21 }}
                    size={150}
                    minimal
                  />
                  <Text style={[styles.genderLabel, gender === 'female' && { color: Colors.female }]}>Femme</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {step === 'body' && (
            <View style={styles.centered}>
              <Text style={styles.stepTitle}>Vos mesures initiales</Text>
              <Text style={styles.stepSub}>
                Ces données serviront à calibrer votre avatar. Vous pouvez les modifier plus tard.
              </Text>

              <Avatar gender={gender} params={mockParams} size={200} />

              <View style={styles.measureRow}>
                <View style={styles.measureGroup}>
                  <Text style={styles.measureLabel}>Taille (cm)</Text>
                  <TextInput
                    style={styles.measureInput}
                    value={height}
                    onChangeText={setHeight}
                    keyboardType="decimal-pad"
                    placeholder="175"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>
                <View style={styles.measureGroup}>
                  <Text style={styles.measureLabel}>Poids (kg)</Text>
                  <TextInput
                    style={styles.measureInput}
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="decimal-pad"
                    placeholder="75"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>
                <View style={styles.measureGroup}>
                  <Text style={styles.measureLabel}>Tour taille (cm)</Text>
                  <TextInput
                    style={styles.measureInput}
                    value={waist}
                    onChangeText={setWaist}
                    keyboardType="decimal-pad"
                    placeholder="85"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>
              </View>

              <Text style={styles.disclaimer}>
                ⚠️ L'avatar est une représentation estimative, pas une reproduction exacte de votre corps.
              </Text>
            </View>
          )}

          {step === 'done' && (
            <View style={styles.centered}>
              <Text style={styles.doneEmoji}>🎉</Text>
              <Text style={styles.stepTitle}>Vous êtes prêt, {name || 'Athlète'} !</Text>
              <Text style={styles.stepSub}>
                Votre profil est configuré. Commencez à tracker vos progrès dès maintenant.
              </Text>
              <Avatar gender={gender} params={mockParams} size={220} />
            </View>
          )}
        </ScrollView>

        {/* CTA Button */}
        <View style={styles.footer}>
          {step === 'done' ? (
            <TouchableOpacity style={styles.ctaBtn} onPress={finish} activeOpacity={0.85}>
              <Text style={styles.ctaText}>🚀 Démarrer MetaBoost</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.ctaBtn} onPress={next} activeOpacity={0.85}>
              <Text style={styles.ctaText}>
                {step === 'welcome' ? 'Commencer →' : 'Suivant →'}
              </Text>
            </TouchableOpacity>
          )}
          {step !== 'welcome' && (
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => {
                const idx = STEPS.indexOf(step);
                if (idx > 0) setStep(STEPS[idx - 1]);
              }}
            >
              <Text style={styles.backText}>← Retour</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  steps: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  stepDot: {
    height: 4,
    flex: 1,
    borderRadius: Radius.full,
    backgroundColor: Colors.cardBorder,
  },
  stepDotActive: { backgroundColor: Colors.primary },

  content: { flexGrow: 1, padding: Spacing.md, paddingBottom: Spacing.sm },
  centered: { flex: 1, alignItems: 'center', paddingTop: Spacing.lg },

  logoBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  logoText: { fontSize: 52 },
  welcomeTitle: { fontSize: 36, fontWeight: '900', color: Colors.text, marginBottom: Spacing.sm },
  welcomeSub: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  featureList: { width: '100%', gap: Spacing.sm },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.md,
  },
  featureEmoji: { fontSize: 24 },
  featureText: { fontSize: 15, color: Colors.text, flex: 1 },

  stepTitle: { fontSize: 26, fontWeight: '800', color: Colors.text, textAlign: 'center', marginBottom: Spacing.sm },
  stepSub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xl, lineHeight: 22, paddingHorizontal: Spacing.md },

  bigInput: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.primary,
    padding: Spacing.md,
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    width: '100%',
    textAlign: 'center',
  },

  genderRow: { flexDirection: 'row', gap: Spacing.md, width: '100%' },
  genderBtn: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
    padding: Spacing.sm,
    overflow: 'hidden',
  },
  genderBtnActive: { borderColor: Colors.male, backgroundColor: Colors.male + '11' },
  genderBtnActiveFemale: { borderColor: Colors.female, backgroundColor: Colors.female + '11' },
  genderLabel: { fontSize: 16, fontWeight: '700', color: Colors.textSecondary, marginTop: Spacing.sm },

  measureRow: { flexDirection: 'row', gap: Spacing.sm, width: '100%', marginVertical: Spacing.md },
  measureGroup: { flex: 1 },
  measureLabel: { fontSize: 11, color: Colors.textSecondary, marginBottom: Spacing.xs, textAlign: 'center' },
  measureInput: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.sm,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  disclaimer: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
    lineHeight: 18,
  },

  doneEmoji: { fontSize: 64, marginBottom: Spacing.md },

  footer: { padding: Spacing.md, gap: Spacing.sm },
  ctaBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingVertical: Spacing.md + 2,
    alignItems: 'center',
  },
  ctaText: { fontSize: 17, fontWeight: '800', color: Colors.text },
  backBtn: { alignItems: 'center', paddingVertical: Spacing.sm },
  backText: { fontSize: 14, color: Colors.textSecondary },
});
