import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/theme';
import { AvatarParams } from '@/hooks/useAvatarParams';

interface Props {
  gender: 'male' | 'female';
  params: AvatarParams;
  size?: number;
  minimal?: boolean;
}

const ATHLETE: Record<string, string> = {
  female: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=480&h=860&q=90',
  male:   'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=480&h=860&q=90',
};

export default function Avatar({ gender, params, size = 280, minimal = false }: Props) {
  const uri = ATHLETE[gender] ?? ATHLETE.female;
  const h = Math.round(size * 1.8);

  // Subtle body width shift: waist 70cm → 0.93, 100cm → 1.07
  const scaleX = Math.max(0.88, Math.min(1.12, 0.72 + params.waistWidth * 0.3));

  // Glow intensity scales with muscle tone
  const glowAlpha = Math.round((0.18 + params.toneLevel * 0.22) * 100) / 100;
  const glowRadius = Math.round(size * 0.85);
  const glowSpread = Math.round(size * 0.45);

  return (
    <View style={{ width: size, height: h, alignItems: 'center' }}>

      {/* Ambient halo — sits behind the photo */}
      {!minimal && (
        <View
          style={[
            styles.halo,
            {
              width: size * 0.55,
              height: h * 0.65,
              top: h * 0.04,
              boxShadow: `0 0 ${glowRadius}px ${glowSpread}px rgba(0,242,255,${glowAlpha})`,
            } as any,
          ]}
        />
      )}

      {/* Athlete photo with body-width morphing */}
      <Image
        source={{ uri }}
        style={[styles.photo, { width: size, height: h, transform: [{ scaleX }] }]}
        resizeMode="cover"
      />

      {/* Inset edge glow for the holographic rim-light effect */}
      {!minimal && (
        <View
          style={[
            styles.edgeGlow,
            {
              width: size,
              height: h,
              boxShadow: `inset 0 0 ${Math.round(size * 0.28)}px rgba(0,242,255,0.09), inset 0 0 3px rgba(0,242,255,0.22)`,
            } as any,
          ]}
        />
      )}

      {/* Gradient fade: merges athlete into dark background */}
      <LinearGradient
        colors={['transparent', Colors.background]}
        style={[styles.fade, { width: size, height: Math.round(h * 0.42) }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  halo: {
    position: 'absolute',
    alignSelf: 'center',
    borderRadius: 9999,
    backgroundColor: Colors.cyan,
  },
  photo: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  edgeGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  fade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
});
