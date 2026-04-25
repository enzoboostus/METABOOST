import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, ImageIcon, Leaf, CheckCircle, Zap, Apple } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useShallow } from 'zustand/react/shallow';
import { useUserStore, MealLog } from '@/store/userStore';
import { Colors, Spacing, Radius, Shadow } from '@/constants/theme';

type MealCategory = MealLog['category'];

interface MealFeedback {
  label: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  tips: string[];
}

const MEAL_FEEDBACKS: Record<MealCategory, MealFeedback> = {
  balanced: {
    label: 'Repas équilibré',
    icon:  <CheckCircle size={26} color="#34C759" strokeWidth={2} />,
    color: Colors.success,
    bg:    '#F0FDF4',
    tips:  ['Assiette bien équilibrée', 'Continuez ainsi 💪'],
  },
  rich: {
    label: 'Repas riche',
    icon:  <Zap size={26} color={Colors.warning} strokeWidth={2} />,
    color: Colors.warning,
    bg:    '#FFFBEB',
    tips:  ['Calorique', "Bougez aujourd'hui"],
  },
  protein: {
    label: 'Bonne source de protéines',
    icon:  <Apple size={26} color={Colors.cyan} strokeWidth={2} />,
    color: Colors.cyan,
    bg:    '#EFF6FF',
    tips:  ['Idéal pour la récupération', 'Parfait après séance'],
  },
  light: {
    label: 'Repas léger',
    icon:  <Leaf size={26} color={Colors.success} strokeWidth={2} />,
    color: Colors.success,
    bg:    '#F0FDF4',
    tips:  ['Peu calorique', 'Complétez si besoin'],
  },
  unknown: {
    label: 'Analyse incomplète',
    icon:  <ImageIcon size={26} color={Colors.textSecondary} strokeWidth={2} />,
    color: Colors.textSecondary,
    bg:    Colors.background,
    tips:  ['Photo peu nette ?', 'Réessayez'],
  },
};

function mockAnalysis(uri: string): MealCategory {
  const hash = uri.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const cats: MealCategory[] = ['balanced', 'rich', 'protein', 'light', 'balanced', 'protein'];
  return cats[hash % cats.length];
}

export default function Nutrition() {
  const [analyzing,  setAnalyzing]  = useState(false);
  const [lastResult, setLastResult] = useState<MealFeedback | null>(null);
  const [lastPhoto,  setLastPhoto]  = useState<string | null>(null);
  const { meals, addMeal } = useUserStore(useShallow((s) => ({ meals: s.meals, addMeal: s.addMeal })));

  async function handlePhoto(source: 'camera' | 'gallery') {
    let result;
    if (source === 'camera') {
      const { granted } = await ImagePicker.requestCameraPermissionsAsync();
      if (!granted) return;
      result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    } else {
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) return;
      result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    }
    if (result.canceled || !result.assets[0]) return;

    const uri = result.assets[0].uri;
    setLastPhoto(uri);
    setAnalyzing(true);
    setLastResult(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await new Promise((r) => setTimeout(r, 1800));
    const category = mockAnalysis(uri);
    const feedback = MEAL_FEEDBACKS[category];
    setLastResult(feedback);
    setAnalyzing(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addMeal({ id: Date.now().toString(), date: new Date().toISOString(), photo: uri, analysis: feedback.label, category });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Nutrition</Text>
        <Text style={styles.subtitle}>Analysez votre repas en photo</Text>

        {/* Action buttons */}
        <View style={styles.photoRow}>
          <TouchableOpacity style={[styles.photoBtn, Shadow.md]} onPress={() => handlePhoto('camera')} activeOpacity={0.85}>
            <View style={styles.photoBtnIcon}>
              <Camera size={26} color={Colors.accent} strokeWidth={2} />
            </View>
            <Text style={styles.photoBtnTxt}>Prendre une photo</Text>
            <Text style={styles.photoBtnSub}>Analyser en temps réel</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.photoBtnSecondary, Shadow.sm]} onPress={() => handlePhoto('gallery')} activeOpacity={0.85}>
            <View style={[styles.photoBtnIcon, { backgroundColor: Colors.background }]}>
              <ImageIcon size={26} color={Colors.textSecondary} strokeWidth={2} />
            </View>
            <Text style={[styles.photoBtnTxt, { color: Colors.text }]}>Galerie</Text>
            <Text style={styles.photoBtnSub}>Choisir une image</Text>
          </TouchableOpacity>
        </View>

        {/* Result card */}
        {(lastPhoto || analyzing) && (
          <View style={[styles.resultCard, Shadow.md]}>
            {lastPhoto && (
              <Image source={{ uri: lastPhoto }} style={styles.mealImage} resizeMode="cover" />
            )}
            {analyzing ? (
              <View style={styles.analyzingRow}>
                <ActivityIndicator color={Colors.accent} size="small" />
                <Text style={styles.analyzingTxt}>Analyse en cours...</Text>
              </View>
            ) : lastResult ? (
              <View style={[styles.feedbackRow, { backgroundColor: lastResult.bg }]}>
                <View style={[styles.feedbackIconWrap, { borderColor: lastResult.color + '33' }]}>
                  {lastResult.icon}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.feedbackLabel, { color: lastResult.color }]}>{lastResult.label}</Text>
                  {lastResult.tips.map((tip, i) => (
                    <Text key={i} style={styles.feedbackTip}>· {tip}</Text>
                  ))}
                </View>
              </View>
            ) : null}
          </View>
        )}

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerTxt}>
            ⚠️ Analyse estimative — non médicale. Ne remplace pas un suivi nutritionnel professionnel.
          </Text>
        </View>

        {/* Meal history */}
        {meals.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Historique des repas</Text>
            {meals.slice(0, 10).map((meal) => {
              const fb = MEAL_FEEDBACKS[meal.category];
              return (
                <View key={meal.id} style={[styles.historyRow, Shadow.sm]}>
                  {meal.photo
                    ? <Image source={{ uri: meal.photo }} style={styles.thumb} />
                    : (
                      <View style={[styles.thumb, styles.thumbFallback, { backgroundColor: fb.bg }]}>
                        {fb.icon}
                      </View>
                    )
                  }
                  <View style={{ flex: 1 }}>
                    <Text style={styles.historyLabel}>{meal.analysis}</Text>
                    <Text style={styles.historyDate}>
                      {new Date(meal.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  <View style={[styles.mealBadge, { backgroundColor: fb.bg }]}>
                    {fb.icon}
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

  title:    { fontSize: 30, fontWeight: '900', color: Colors.text, marginBottom: 4, letterSpacing: -0.8 },
  subtitle: { fontSize: 13, color: Colors.textSecondary, marginBottom: Spacing.lg },

  photoRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  photoBtn: {
    flex: 1.4,
    backgroundColor: Colors.accent,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  photoBtnSecondary: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  photoBtnIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoBtnTxt: { fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  photoBtnSub: { fontSize: 11, color: 'rgba(255,255,255,0.75)' },

  resultCard:   { backgroundColor: Colors.card, borderRadius: Radius.xl, overflow: 'hidden', marginBottom: Spacing.md },
  mealImage:    { width: '100%', height: 220 },
  analyzingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md },
  analyzingTxt: { fontSize: 14, color: Colors.textSecondary },
  feedbackRow:  { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md },
  feedbackIconWrap: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: '#fff',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackLabel: { fontSize: 15, fontWeight: '800', marginBottom: 4, letterSpacing: -0.3 },
  feedbackTip:   { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },

  disclaimer: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
  },
  disclaimerTxt: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },

  sectionTitle: { fontSize: 20, fontWeight: '800', color: Colors.text, marginBottom: Spacing.sm, letterSpacing: -0.4 },
  historyRow: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  thumb:         { width: 56, height: 56, borderRadius: Radius.md },
  thumbFallback: { alignItems: 'center', justifyContent: 'center' },
  historyLabel:  { fontSize: 14, fontWeight: '700', color: Colors.text },
  historyDate:   { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  mealBadge: {
    width: 40, height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
