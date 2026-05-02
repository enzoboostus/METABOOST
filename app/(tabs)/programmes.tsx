import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Play } from 'lucide-react-native';
import { Colors, Spacing, Radius, Shadow } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

const { width: W } = Dimensions.get('window');

const CATEGORIES = ['Tous', 'Force', 'Cardio', 'Souplesse', 'Gainage'];

const FALLBACK_PROGRAMS = [
  {
    id: 'p1',
    tag: 'Cardio & Renforcement',
    title: 'INTENSIVE SCULPT',
    meta: '4 séances / sem · 35 min',
    level: 'Confirmé',
    image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
    category: 'Cardio',
    active: true,
  },
  {
    id: 'p2',
    tag: 'Force & Masse',
    title: 'POWER STRENGTH',
    meta: '3 séances / sem · 50 min',
    level: 'Avancé',
    image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800',
    category: 'Force',
    active: true,
  },
  {
    id: 'p3',
    tag: 'Souplesse & Récup',
    title: 'FLEX & MOBILITY',
    meta: '5 séances / sem · 20 min',
    level: 'Débutant',
    image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
    category: 'Souplesse',
    active: true,
  },
  {
    id: 'p4',
    tag: 'Gainage & Stabilité',
    title: 'CORE GAINAGE',
    meta: '4 séances / sem · 25 min',
    level: 'Interméd.',
    image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
    category: 'Gainage',
    active: true,
  },
];

interface Program {
  id: string;
  tag: string;
  title: string;
  meta: string;
  level: string;
  image_url: string;
  category: string;
  active: boolean;
}

export default function Programmes() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [programs, setPrograms] = useState<Program[]>(FALLBACK_PROGRAMS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrograms();
  }, []);

  async function loadPrograms() {
    setLoading(true);
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .eq('active', true)
      .order('sort_order');
    if (!error && data && data.length > 0) {
      setPrograms(data as Program[]);
    }
    setLoading(false);
  }

  const filtered = activeCategory === 0
    ? programs
    : programs.filter(p => p.category === CATEGORIES[activeCategory]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageLabel}>Bibliothèque</Text>
        <Text style={styles.title}>PROGRAMMES</Text>

        {/* Category filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
          style={styles.filtersScroll}
        >
          {CATEGORIES.map((cat, i) => (
            <TouchableOpacity
              key={cat}
              style={[styles.filterPill, i === activeCategory && styles.filterPillActive]}
              onPress={() => setActiveCategory(i)}
            >
              <Text style={[styles.filterTxt, i === activeCategory && styles.filterTxtActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={Colors.accent} size="large" />
          </View>
        ) : (
          filtered.map((p) => (
            <TouchableOpacity key={p.id} style={[styles.card, Shadow.lg]} activeOpacity={0.9}>
              <Image source={{ uri: p.image_url }} style={styles.cardImg} resizeMode="cover" />
              <LinearGradient
                colors={['rgba(6,14,28,0)', 'rgba(6,14,28,0.55)', 'rgba(6,14,28,0.92)']}
                style={[StyleSheet.absoluteFill, { borderRadius: Radius.xl }]}
              />
              <View style={styles.overlay}>
                <View style={styles.overlayTop}>
                  <View style={styles.levelPill}>
                    <Text style={styles.levelTxt}>{p.level}</Text>
                  </View>
                  <TouchableOpacity style={styles.playBtn}>
                    <Play size={14} color="#333" fill="#333" />
                  </TouchableOpacity>
                </View>
                <View>
                  <Text style={styles.tag}>{p.tag}</Text>
                  <Text style={styles.programTitle}>{p.title}</Text>
                  <Text style={styles.meta}>{p.meta}</Text>
                  <TouchableOpacity style={styles.cta} activeOpacity={0.85}>
                    <Play size={12} color="#333" fill="#333" />
                    <Text style={styles.ctaTxt}>Démarrer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 20 }} />
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

  filtersScroll: { marginBottom: Spacing.lg },
  filtersRow:    { gap: Spacing.sm },
  filterPill:       { paddingHorizontal: 18, paddingVertical: 9, borderRadius: Radius.full, backgroundColor: Colors.card, borderWidth: 0.5, borderColor: Colors.cardBorder },
  filterPillActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  filterTxt:        { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
  filterTxtActive:  { color: '#333', fontWeight: '700' },

  loadingWrap: { paddingVertical: 60, alignItems: 'center' },

  card: {
    marginBottom: Spacing.md,
    borderRadius: Radius.xl,
    height: 320,
    overflow: 'hidden',
  },
  cardImg:     { ...StyleSheet.absoluteFillObject },
  overlay:     { ...StyleSheet.absoluteFillObject, padding: Spacing.md, justifyContent: 'space-between' },
  overlayTop:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  levelPill:   { paddingHorizontal: 12, paddingVertical: 5, backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: Radius.full, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.28)' },
  levelTxt:    { fontSize: 11, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },
  playBtn:     { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  tag:         { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: 2.5, marginBottom: 6 },
  programTitle:{ fontSize: 36, fontWeight: '900', color: '#fff', textTransform: 'uppercase', letterSpacing: -1.5, lineHeight: 36 },
  meta:        { fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 6 },
  cta:         { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.accent, borderRadius: Radius.full, paddingHorizontal: 20, paddingVertical: 11, alignSelf: 'flex-start', marginTop: 12 },
  ctaTxt:      { fontSize: 13, fontWeight: '800', color: '#333', letterSpacing: 0.2 },
});
