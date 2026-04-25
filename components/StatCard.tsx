import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius, Spacing } from '@/constants/theme';

const GLASS: any = { backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' };
const FLOAT: any = { boxShadow: '0 4px 24px rgba(0,0,0,0.5), 0 0 1px rgba(0,242,255,0.06)' };

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: string;
  color?: string;
}

export default function StatCard({ label, value, unit, icon, color = Colors.cyan }: StatCardProps) {
  return (
    <View style={[styles.card, GLASS, FLOAT]}>
      {icon && <Text style={styles.icon}>{icon}</Text>}
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
    opacity: 0.7,
  },
  value: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  unit: {
    fontSize: 12,
    fontWeight: '300',
    color: Colors.textSecondary,
  },
  label: {
    fontSize: 9,
    fontWeight: '300',
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
});
