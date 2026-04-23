import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius, Spacing } from '@/constants/theme';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: string;
  color?: string;
}

export default function StatCard({ label, value, unit, icon, color = Colors.primary }: StatCardProps) {
  return (
    <View style={styles.card}>
      {icon && <Text style={[styles.icon, { color }]}>{icon}</Text>}
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
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.md,
    alignItems: 'center',
    flex: 1,
    minWidth: 80,
  },
  icon: {
    fontSize: 20,
    marginBottom: Spacing.xs,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  unit: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.textSecondary,
  },
  label: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
