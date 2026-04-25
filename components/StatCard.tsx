import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius, Spacing } from '@/constants/theme';

const GLASS: any = { backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)' };
const FLOAT: any = { boxShadow: '0 4px 24px rgba(0,0,0,0.6), 0 0 1px rgba(0,242,255,0.06)' };

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  color?: string;
}

export default function StatCard({ label, value, unit, icon, color = Colors.cyan }: StatCardProps) {
  return (
    <View style={[styles.card, GLASS, FLOAT]}>
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
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    padding: Spacing.md,
    alignItems: 'center',
    flex: 1,
    minWidth: 80,
    gap: 4,
  },
  iconWrap: {
    marginBottom: 2,
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
    marginTop: 2,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
