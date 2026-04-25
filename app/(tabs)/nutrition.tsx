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
import { Camera, ImageIcon, Leaf, CheckCircle } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useShallow } from 'zustand/react/shallow';
import { useUserStore, MealLog } from '@/store/userStore';
import { Colors, Spacing, Radius } from '@/constants/theme';

type MealCategory = MealLog['category'];

interface MealFeedback { label: string; icon: React.ReactNode; color: string; tips: string[] }

const MEAL_FEEDBACKS: Record<MealCategory, MealFeedback> = {
  balanced: {
    label: 'Repas équilibré',
    icon:  <CheckCircle size={28} color={Colors.cyan}          strokeWidth={1.5} />,
    color: Colors.cyan,
    tips:  ['Assiette bien équilibrée', 'Continuez ainsi 💪'],
  },
  rich: {
    label: 'Repas riche',
    icon:  <Leaf size={28} color={Colors.warning} strokeWidth={1.5} />,
    color: Colors.warning,
    tips:  ['Calorique', "Bougez aujourd'hui"],
  },
  protein: {
    label: 'Bonne source de protéines',
    icon:  <CheckCircle size={28} color={Colors.cyan}          strokeWidth={1.5} />,
    color: Colors.cyan,
    tips:  ['Idéal pour la récupération', 'Parfait après séance'],
  },
  light: {
    label: 'Repas léger',
    icon:  <Leaf size={28} color={Colors.cyan}                 strokeWidth={1.5} />,
    color: Colors.cyan,
    tips:  ['Peu calorique', 'Complétez si besoin'],
  },
  unknown: {
    label: 'Analyse incomplète',
    icon:  <ImageIcon size={28} color={Colors.textSecondary}  strokeWidth={1.5} />,
    color: Colors.textSecondary,
    tips:  ['Photo peu nette ?', 'Réessayez'],
  },
};

function mockAnalysis(uri: string): MealCategory {
  const hash = uri.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const cats: MealCategory[] = ['balanced', 'rich', 'protein', 'light', 'balanced', 'protein'];
  return cats[hash % cats.length];
}

const BG: any    = { backgroundImage: 'radial-gradient(ellipse at 50% 30%, #0A0E12 0%, #020202 70%)' };
const GRAIN: any = {
  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
  opacity: 0.03,
};
const GLASS: any = { backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)' };
const FLOAT: any = { boxShadow: '0 8px 40px rgba(0,0,0,0.7), 0 0 1px rgba(0,242,255,0.06)' };

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
    <SafeAreaView style={[styles.safe, BG]} edges={['top']}>
      <View style={GRAIN} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Nutrition</Text>
        <Text style={styles.subtitle}>Analysez votre repas en photo</Text>

        <View style={styles.photoRow}>
          <TouchableOpacity style={[styles.photoBtn, FLOAT]} onPress={() => handlePhoto('camera')} activeOpacity={0.85}>
            <Camera size={28} color={Colors.cyan} strokeWidth={1.5} />
            <Text style={styles.photoBtnTxt}>Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.photoBtnSecondary, GLASS, FLOAT]} onPress={() => handlePhoto('gallery')} activeOpacity={0.85}>
            <ImageIcon size={28} color={Colors.textSecondary} strokeWidth={1.5} />
            <Text style={[styles.photoBtnTxt, { color: Colors.textSecondary }]}>Galerie</Text>
          </TouchableOpacity>
        </View>

        {(lastPhoto || analyzing) && (
          <View style={[styles.resultCard, GLASS, FLOAT]}>
            {lastPhoto && <Image source={{ uri: lastPhoto }} style={styles.mealImage} resizeMode="cover" />}
            {analyzing ? (
              <View style={styles.analyzingRow}>
                <ActivityIndicator color={Colors.cyan} size="small" />
                <Text style={styles.analyzingTxt}>Analyse en cours...</Text>
              </View>
            ) : lastResult ? (
              <View style={styles.feedbackRow}>
                {lastResult.icon}
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

        <View style={[styles.disclaimer, GLASS]}>
          <Text style={styles.disclaimerTxt}>
            Analyse estimative — non médicale. Ne remplace pas un suivi nutritionnel professionnel.
          </Text>
        </View>

        {meals.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Historique des repas</Text>
            {meals.slice(0, 10).map((meal) => {
              const fb = MEAL_FEEDBACKS[meal.category];
              return (
                <View key={meal.id} style={[styles.historyRow, GLASS]}>
                  {meal.photo
                    ? <Image source={{ uri: meal.photo }} style={styles.thumb} />
                    : <View style={[styles.thumb, styles.thumbFallback]}><Leaf size={20} color={Colors.textSecondary} strokeWidth={1.5} /></View>
                  }
                  <View style={{ flex: 1 }}>
                    <Text style={styles.historyLabel}>{meal.analysis}</Text>
                    <Text style={styles.historyDate}>
                      {new Date(meal.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  <View style={[styles.iconWrap, { borderColor: fb.color + '33', backgroundColor: fb.color + '0D' }]}>
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

  title:    { fontSize: 34, fontWeight: '900', color: Colors.text, marginBottom: 4, letterSpacing: -1 },
  subtitle: { fontSize: 11, fontWeight: '300', color: Colors.textSecondary, marginBottom: Spacing.lg, letterSpacing: 1 },

  photoRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  photoBtn: {
    flex: 1,
    backgroundColor: 'rgba(0,242,255,0.08)',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 0.5,
    borderColor: 'rgba(0,242,255,0.28)',
  },
  photoBtnSecondary: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
  },
  photoBtnTxt: { fontSize: 12, fontWeight: '700', color: Colors.cyan, textTransform: 'uppercase', letterSpacing: 1.5 },

  resultCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  mealImage:    { width: '100%', height: 200 },
  analyzingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md },
  analyzingTxt: { fontSize: 13, fontWeight: '300', color: Colors.textSecondary, letterSpacing: 0.5 },
  feedbackRow:  { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, padding: Spacing.md },
  feedbackLabel:{ fontSize: 16, fontWeight: '900', marginBottom: 4 },
  feedbackTip:  { fontSize: 12, fontWeight: '300', color: Colors.textSecondary, marginTop: 2 },

  disclaimer: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  disclaimerTxt: { fontSize: 11, fontWeight: '300', color: Colors.textSecondary, lineHeight: 18, letterSpacing: 0.3 },

  sectionTitle: {
    fontSize: 9, fontWeight: '300', color: Colors.textSecondary,
    marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 3,
  },
  historyRow: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  thumb:        { width: 52, height: 52, borderRadius: Radius.sm },
  thumbFallback:{ backgroundColor: 'rgba(255,255,255,0.03)', alignItems: 'center', justifyContent: 'center' },
  historyLabel: { fontSize: 14, fontWeight: '700', color: Colors.text },
  historyDate:  { fontSize: 11, fontWeight: '300', color: Colors.textSecondary, marginTop: 2, letterSpacing: 0.3 },
  iconWrap: {
    width: 40, height: 40,
    borderRadius: Radius.sm,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
