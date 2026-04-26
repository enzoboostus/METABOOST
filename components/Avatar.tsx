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

/*
 * Full-body athlete photos from Unsplash — portrait 2:3 ratio, high quality.
 * Three body types per gender (lean / normal / fuller) selected by BMI.
 */
const PHOTOS: Record<string, Record<string, string>> = {
  female: {
    lean:   'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&h=900&q=95',
    normal: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=600&h=900&q=95',
    fuller: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&h=900&q=95',
  },
  male: {
    lean:   'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=600&h=900&q=95',
    normal: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=600&h=900&q=95',
    fuller: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=600&h=900&q=95',
  },
};

function pickPhoto(gender: string, bmi: number): string {
  const set = PHOTOS[gender] ?? PHOTOS.female;
  if (bmi < 21)      return set.lean;
  else if (bmi < 27) return set.normal;
  else               return set.fuller;
}

export default function Avatar({ gender, params, size = 300, minimal = false }: Props) {
  const uri  = pickPhoto(gender, params.bmi);
  const h    = Math.round(size * 1.5);

  // Subtle body-width hint (max ±8%)
  const scaleX = Math.max(0.92, Math.min(1.08, 0.76 + params.waistWidth * 0.26));

  // Glow intensity scales with fitness level
  const glowAlpha  = Math.round((0.22 + params.toneLevel * 0.28) * 100) / 100;
  const glowRadius = Math.round(size * 0.85);
  const glowSpread = Math.round(size * 0.42);

  return (
    <View style={{ width: size, height: h, alignItems: 'center' }}>

      {/* Cyan ambient halo behind photo */}
      {!minimal && (
        <View
          style={[
            styles.halo,
            {
              width:     size * 0.45,
              height:    h   * 0.60,
              top:       h   * 0.08,
              boxShadow: `0 0 ${glowRadius}px ${glowSpread}px rgba(0,242,255,${glowAlpha})`,
            } as any,
          ]}
        />
      )}

      {/* Athlete photo */}
      <Image
        source={{ uri }}
        style={[
          styles.photo,
          { width: size, height: h, transform: [{ scaleX }] },
        ]}
        resizeMode="cover"
      />

      {/* Subtle cyan rim-light overlay */}
      {!minimal && (
        <View
          style={[
            styles.rimLight,
            {
              width:  size,
              height: h,
              boxShadow: `inset 0 0 ${Math.round(size * 0.18)}px rgba(0,242,255,0.06), inset 0 0 2px rgba(0,242,255,0.15)`,
            } as any,
          ]}
        />
      )}

      {/* Gradient fade into background at bottom */}
      <LinearGradient
        colors={['transparent', Colors.background]}
        style={[styles.fade, { width: size, height: Math.round(h * 0.42) }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  halo: {
    position:        'absolute',
    alignSelf:       'center',
    borderRadius:    9999,
    backgroundColor: Colors.accent,
  },
  photo: {
    position: 'absolute',
    top:      0,
    left:     0,
  },
  rimLight: {
    position: 'absolute',
    top:      0,
    left:     0,
  },
  fade: {
    position: 'absolute',
    bottom:   0,
    left:     0,
  },
});
