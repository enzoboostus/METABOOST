import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius, Spacing, Shadow } from '@/constants/theme';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  color?: string;
}

export default function StatCard({ label, value, unit, icon, color = Colors.text }: StatCardProps) {
  return (
    <View style={[styles.card, Shadow.sm]}>
      {icon && <View style={styles.iconWrap}>{icon}</View>}
      <Text style={[styles.value, { color }]}>
        {value}
        {unit && <Text style={styles.unit}> {unit}</Text>}
      </Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.md,
    alignItems: 'center',
    flex: 1,
    minWidth: 80,
    gap: 4,
  },
  iconWrap: { marginBottom: 2 },
  value: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  unit: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.textSecondary,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});
