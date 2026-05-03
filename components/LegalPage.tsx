import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Colors, Spacing, Radius } from '@/constants/theme';

interface Section { title: string; content: string }

interface Props {
  title: string;
  subtitle?: string;
  lastUpdated: string;
  sections: Section[];
}

export default function LegalPage({ title, subtitle, lastUpdated, sections }: Props) {
  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
            <ChevronLeft size={22} color={Colors.text} strokeWidth={2} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>{title}</Text>
            {subtitle && <Text style={styles.headerSub}>{subtitle}</Text>}
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.updated}>Dernière mise à jour : {lastUpdated}</Text>

          {sections.map((s, i) => (
            <View key={i} style={styles.section}>
              <Text style={styles.sectionTitle}>{s.title}</Text>
              <Text style={styles.sectionBody}>{s.content}</Text>
            </View>
          ))}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerTxt}>MetaBoost — Tous droits réservés</Text>
            <Text style={styles.footerTxt}>Application conforme RGPD · Supervisée par la CNIL</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: '#060E1C' },
  header:  {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: Spacing.md, paddingVertical: 14,
    borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: Colors.text },
  headerSub:   { fontSize: 11, color: Colors.textSecondary, marginTop: 1 },

  content: { padding: Spacing.lg, paddingBottom: 60 },
  updated: { fontSize: 11, color: Colors.textTertiary, marginBottom: Spacing.xl, fontStyle: 'italic' },

  section:      { marginBottom: Spacing.xl },
  sectionTitle: {
    fontSize: 13, fontWeight: '800', color: Colors.accent,
    textTransform: 'uppercase', letterSpacing: 1.5,
    marginBottom: Spacing.sm,
    paddingBottom: 8,
    borderBottomWidth: 0.5, borderBottomColor: 'rgba(226,209,179,0.15)',
  },
  sectionBody: {
    fontSize: 13.5, color: 'rgba(255,255,255,0.75)',
    lineHeight: 22, fontWeight: '300',
  },

  footer:    { marginTop: Spacing.xl, alignItems: 'center', gap: 4 },
  footerTxt: { fontSize: 10, color: Colors.textTertiary, textAlign: 'center' },
});
