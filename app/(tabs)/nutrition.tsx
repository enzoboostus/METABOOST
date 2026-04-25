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
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useShallow } from 'zustand/react/shallow';
import { useUserStore, MealLog } from '@/store/userStore';
import { Colors, Spacing, Radius } from '@/constants/theme';

type MealCategory = MealLog['category'];

interface MealFeedback {
  label: string;
  emoji: string;
  color: string;
  tips: string[];
}

const MEAL_FEEDBACKS: Record<MealCategory, MealFeedback> = {
  balanced: {
    label: 'Repas équilibré',
    emoji: '✅',
    color: Colors.accentGreen,
    tips: ['Belle assiette équilibrée !', 'Continuez comme ça 💪'],
  },
  rich: {
    label: 'Repas riche',
    emoji: '⚡',
    color: Colors.accentOrange,
    tips: ['Riche en calories', "Pensez à bouger aujourd'hui"],
  },
  protein: {
    label: 'Bonne source de protéines',
    emoji: '💪',
    color: Colors.primary,
    tips: ['Excellent pour la récupération', 'Idéal après une séance'],
  },
  light: {
    label: 'Repas léger',
    emoji: '🥗',
    color: Colors.accentGreen,
    tips: ['Repas peu calorique', 'Pensez à compléter si besoin'],
  },
  unknown: {
    label: 'Analyse incomplète',
    emoji: '🤔',
    color: Colors.textSecondary,
    tips: ['Photo peu nette ?', 'Essayez une meilleure prise de vue'],
  },
};

function mockAnalysis(uri: string): MealCategory {
  const hash = uri.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const categories: MealCategory[] = ['balanced', 'rich', 'protein', 'light', 'balanced', 'protein'];
  return categories[hash % categories.length];
}

const BG: any = {
  backgroundImage: 'radial-gradient(ellipse at 50% 0%, #0D1520 0%, #020202 75%)',
};
const GLASS: any = { backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' };

export default function Nutrition() {
  const [analyzing, setAnalyzing] = useState(false);
  const [lastResult, setLastResult] = useState<MealFeedback | null>(null);
  const [lastPhoto, setLastPhoto] = useState<string | null>(null);
  const { meals, addMeal } = useUserStore(useShallow((s) => ({
    meals: s.meals,
    addMeal: s.addMeal,
  })));

  async function handlePhoto(source: 'camera' | 'gallery') {
    let result;
    if (source === 'camera') {
      const { granted } = await ImagePicker.requestCameraPermissionsAsync();
      if (!granted) return;
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        base64: false,
      });
    } else {
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) return;
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });
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

    const meal: MealLog = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      photo: uri,
      analysis: feedback.label,
      category,
    };
    addMeal(meal);
  }

  return (
    <SafeAreaView style={[styles.safe, BG]} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Nutrition</Text>
        <Text style={styles.subtitle}>Photographiez votre repas pour une analyse rapide</Text>

        {/* Photo buttons */}
        <View style={styles.photoRow}>
          <TouchableOpacity style={styles.photoBtn} onPress={() => handlePhoto('camera')} activeOpacity={0.85}>
            <Text style={styles.photoBtnEmoji}>📷</Text>
            <Text style={styles.photoBtnText}>Prendre une photo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.photoBtn, styles.photoBtnSecondary, GLASS]}
            onPress={() => handlePhoto('gallery')}
            activeOpacity={0.85}
          >
            <Text style={styles.photoBtnEmoji}>🖼️</Text>
            <Text style={[styles.photoBtnText, { color: Colors.textSecondary }]}>Galerie</Text>
          </TouchableOpacity>
        </View>

        {/* Analysis result */}
        {(lastPhoto || analyzing) && (
          <View style={[styles.resultCard, GLASS]}>
            {lastPhoto && (
              <Image source={{ uri: lastPhoto }} style={styles.mealImage} resizeMode="cover" />
            )}
            {analyzing ? (
              <View style={styles.analyzingRow}>
                <ActivityIndicator color={Colors.cyan} size="small" />
                <Text style={styles.analyzingText}>Analyse en cours...</Text>
              </View>
            ) : lastResult ? (
              <View style={styles.feedbackRow}>
                <Text style={styles.feedbackEmoji}>{lastResult.emoji}</Text>
                <View style={styles.feedbackContent}>
                  <Text style={[styles.feedbackLabel, { color: lastResult.color }]}>
                    {lastResult.label}
                  </Text>
                  {lastResult.tips.map((tip, i) => (
                    <Text key={i} style={styles.feedbackTip}>· {tip}</Text>
                  ))}
                </View>
              </View>
            ) : null}
          </View>
        )}

        {/* Disclaimer */}
        <View style={[styles.disclaimer, GLASS]}>
          <Text style={styles.disclaimerText}>
            ⚠️ L'analyse est estimative et non médicale. Elle ne remplace pas un suivi nutritionnel professionnel.
          </Text>
        </View>

        {/* Meal history */}
        {meals.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Historique des repas</Text>
            {meals.slice(0, 10).map((meal) => {
              const fb = MEAL_FEEDBACKS[meal.category];
              return (
                <View key={meal.id} style={[styles.historyItem, GLASS]}>
                  {meal.photo ? (
                    <Image source={{ uri: meal.photo }} style={styles.historyThumb} />
                  ) : (
                    <View style={[styles.historyThumb, styles.historyThumbFallback]}>
                      <Text>🍽️</Text>
                    </View>
                  )}
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyLabel}>{meal.analysis}</Text>
                    <Text style={styles.historyDate}>
                      {new Date(meal.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                  <Text style={styles.historyEmoji}>{fb.emoji}</Text>
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
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },

  title: { fontSize: 32, fontWeight: '900', color: Colors.text, marginBottom: 4 },
  subtitle: { fontSize: 13, fontWeight: '300', color: Colors.textSecondary, marginBottom: Spacing.lg, letterSpacing: 0.3 },

  photoRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  photoBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primaryLight + '44',
  },
  photoBtnSecondary: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  photoBtnEmoji: { fontSize: 32 },
  photoBtnText: { fontSize: 14, fontWeight: '700', color: Colors.text },

  resultCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  mealImage: { width: '100%', height: 180 },
  analyzingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md },
  analyzingText: { fontSize: 14, fontWeight: '300', color: Colors.textSecondary },
  feedbackRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, padding: Spacing.md },
  feedbackEmoji: { fontSize: 32 },
  feedbackContent: { flex: 1 },
  feedbackLabel: { fontSize: 16, fontWeight: '900', marginBottom: 4 },
  feedbackTip: { fontSize: 13, fontWeight: '300', color: Colors.textSecondary, marginTop: 2 },

  disclaimer: {
    backgroundColor: Colors.accentOrange + '12',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.accentOrange + '33',
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  disclaimerText: { fontSize: 12, fontWeight: '300', color: Colors.accentOrange, lineHeight: 18 },

  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },

  historyItem: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  historyThumb: { width: 52, height: 52, borderRadius: Radius.sm },
  historyThumbFallback: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyInfo: { flex: 1 },
  historyLabel: { fontSize: 14, fontWeight: '700', color: Colors.text },
  historyDate: { fontSize: 12, fontWeight: '300', color: Colors.textSecondary, marginTop: 2 },
  historyEmoji: { fontSize: 24 },
});
