import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius, Spacing } from '@/constants/theme';

const GLASS: any = { backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' };

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: string;
  color?: string;
}

export default function StatCard({ label, value, unit, icon, color = Colors.primary }: StatCardProps) {
  return (
    <View style={[styles.card, GLASS]}>
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
    fontSize: 22,
    marginBottom: Spacing.xs,
  },
  value: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  unit: {
    fontSize: 13,
    fontWeight: '300',
    color: Colors.textSecondary,
  },
  label: {
    fontSize: 10,
    fontWeight: '300',
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
