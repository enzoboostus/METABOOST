import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, ImageIcon, Leaf, CheckCircle, Zap, Apple } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useShallow } from 'zustand/react/shallow';
import { useUserStore, MealLog } from '@/store/userStore';
import { Colors, Spacing, Radius, Shadow } from '@/constants/theme';

type MealCategory = MealLog['category'];
interface MealFeedback { label: string; icon: React.ReactNode; color: string; tips: string[] }

const MEAL_FEEDBACKS: Record<MealCategory, MealFeedback> = {
  balanced: { label: 'Repas équilibré',           icon: <CheckCircle size={26} color={Colors.success} strokeWidth={2} />, color: Colors.success, tips: ['Assiette bien équilibrée', 'Continuez ainsi 💪'] },
  rich:     { label: 'Repas riche',               icon: <Zap         size={26} color={Colors.warning} strokeWidth={2} />, color: Colors.warning, tips: ['Calorique', "Bougez aujourd'hui"] },
  protein:  { label: 'Bonne source de protéines', icon: <Apple       size={26} color={Colors.accent}  strokeWidth={2} />, color: Colors.accent,  tips: ['Idéal récupération', 'Parfait post-séance'] },
  light:    { label: 'Repas léger',               icon: <Leaf        size={26} color={Colors.success} strokeWidth={2} />, color: Colors.success, tips: ['Peu calorique', 'Complétez si besoin'] },
  unknown:  { label: 'Analyse incomplète',         icon: <ImageIcon   size={26} color={Colors.textSecondary} strokeWidth={2} />, color: Colors.textSecondary, tips: ['Photo peu nette ?', 'Réessayez'] },
};

function mockAnalysis(uri: string): MealCategory {
  const hash = uri.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return (['balanced','rich','protein','light','balanced','protein'] as MealCategory[])[hash % 6];
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
    setLastPhoto(uri); setAnalyzing(true); setLastResult(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await new Promise((r) => setTimeout(r, 1800));
    const fb = MEAL_FEEDBACKS[mockAnalysis(uri)];
    setLastResult(fb); setAnalyzing(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addMeal({ id: Date.now().toString(), date: new Date().toISOString(), photo: uri, analysis: fb.label, category: mockAnalysis(uri) });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageLabel}>Analyse repas</Text>
        <Text style={styles.title}>NUTRITION</Text>

        {/* Action buttons */}
        <View style={styles.photoRow}>
          <TouchableOpacity style={[styles.photoBtnMain, Shadow.lg]} onPress={() => handlePhoto('camera')} activeOpacity={0.85}>
            <View style={styles.photoBtnIconWrap}>
              <Camera size={28} color="#333333" strokeWidth={2} />
            </View>
            <Text style={styles.photoBtnTitle}>Prendre une photo</Text>
            <Text style={styles.photoBtnSub}>Analyse instantanée</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.photoBtnSec, Shadow.sm]} onPress={() => handlePhoto('gallery')} activeOpacity={0.85}>
            <ImageIcon size={28} color={Colors.textSecondary} strokeWidth={1.5} />
            <Text style={styles.photoBtnSecTxt}>Galerie</Text>
          </TouchableOpacity>
        </View>

        {/* Result */}
        {(lastPhoto || analyzing) && (
          <View style={[styles.resultCard, Shadow.md]}>
            {lastPhoto && <Image source={{ uri: lastPhoto }} style={styles.mealImg} resizeMode="cover" />}
            {analyzing ? (
              <View style={styles.analyzingRow}>
                <ActivityIndicator color={Colors.accent} size="small" />
                <Text style={styles.analyzingTxt}>Analyse en cours...</Text>
              </View>
            ) : lastResult ? (
              <View style={styles.feedbackRow}>
                <View style={[styles.feedbackIcon, { borderColor: lastResult.color + '33' }]}>{lastResult.icon}</View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.feedbackLabel, { color: lastResult.color }]}>{lastResult.label}</Text>
                  {lastResult.tips.map((t, i) => <Text key={i} style={styles.feedbackTip}>· {t}</Text>)}
                </View>
              </View>
            ) : null}
          </View>
        )}

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerTxt}>Analyse estimative — non médicale. Ne remplace pas un suivi nutritionnel professionnel.</Text>
        </View>

        {/* History */}
        {meals.length > 0 && (
          <>
            <Text style={styles.historyTitle}>HISTORIQUE</Text>
            {meals.slice(0, 10).map((meal) => {
              const fb = MEAL_FEEDBACKS[meal.category];
              return (
                <View key={meal.id} style={[styles.historyRow, Shadow.sm]}>
                  {meal.photo
                    ? <Image source={{ uri: meal.photo }} style={styles.thumb} />
                    : <View style={[styles.thumb, { backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' }]}>{fb.icon}</View>
                  }
                  <View style={{ flex: 1 }}>
                    <Text style={styles.historyLabel}>{meal.analysis}</Text>
                    <Text style={styles.historyDate}>{new Date(meal.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</Text>
                  </View>
                  <View style={[styles.mealTag, { backgroundColor: fb.color + '18', borderColor: fb.color + '33' }]}>
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

  pageLabel: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 },
  title:     { fontSize: 48, fontWeight: '900', color: Colors.text, letterSpacing: -2, textTransform: 'uppercase', marginBottom: Spacing.lg, lineHeight: 48 },

  photoRow:     { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  photoBtnMain: { flex: 1.5, backgroundColor: Colors.accent, borderRadius: Radius.xl, padding: Spacing.md, gap: Spacing.sm },
  photoBtnIconWrap: { width: 52, height: 52, borderRadius: Radius.md, backgroundColor: 'rgba(51,51,51,0.12)', alignItems: 'center', justifyContent: 'center' },
  photoBtnTitle: { fontSize: 16, fontWeight: '800', color: '#333333', letterSpacing: -0.3 },
  photoBtnSub:   { fontSize: 11, color: 'rgba(51,51,51,0.55)' },
  photoBtnSec:   { flex: 1, backgroundColor: Colors.card, borderRadius: Radius.xl, alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 0.5, borderColor: Colors.cardBorder },
  photoBtnSecTxt:{ fontSize: 13, fontWeight: '600', color: Colors.textSecondary },

  resultCard:   { backgroundColor: Colors.card, borderRadius: Radius.xl, overflow: 'hidden', marginBottom: Spacing.md, borderWidth: 0.5, borderColor: Colors.cardBorder },
  mealImg:      { width: '100%', height: 220 },
  analyzingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md },
  analyzingTxt: { fontSize: 14, color: Colors.textSecondary },
  feedbackRow:  { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md },
  feedbackIcon: { width: 52, height: 52, borderRadius: Radius.md, backgroundColor: Colors.surface, borderWidth: 0.5, alignItems: 'center', justifyContent: 'center' },
  feedbackLabel:{ fontSize: 15, fontWeight: '800', marginBottom: 4, letterSpacing: -0.3 },
  feedbackTip:  { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },

  disclaimer:    { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.lg, borderLeftWidth: 2, borderLeftColor: Colors.textTertiary },
  disclaimerTxt: { fontSize: 11, color: Colors.textSecondary, lineHeight: 18 },

  historyTitle: { fontSize: 11, fontWeight: '800', color: Colors.textSecondary, letterSpacing: 3, textTransform: 'uppercase', marginBottom: Spacing.sm },
  historyRow:   { backgroundColor: Colors.card, borderRadius: Radius.lg, flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.sm, marginBottom: Spacing.sm, borderWidth: 0.5, borderColor: Colors.cardBorder },
  thumb:        { width: 56, height: 56, borderRadius: Radius.md },
  historyLabel: { fontSize: 14, fontWeight: '700', color: Colors.text },
  historyDate:  { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  mealTag:      { width: 40, height: 40, borderRadius: Radius.md, borderWidth: 0.5, alignItems: 'center', justifyContent: 'center' },
});
