import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
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
 * Photo sources — portrait, full body, athletic, neutral bg.
 * For each gender we pick a different photo based on BMI range
 * so the avatar feels personalized to the user's body.
 */
const PHOTOS: Record<string, Record<string, string>> = {
  female: {
    lean:    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&h=960&q=90',
    normal:  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&h=960&q=90',
    fuller:  'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=600&h=960&q=90',
  },
  male: {
    lean:    'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=600&h=960&q=90',
    normal:  'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=600&h=960&q=90',
    fuller:  'https://images.unsplash.com/photo-1590239926044-4131b5d93f4f?auto=format&fit=crop&w=600&h=960&q=90',
  },
};

function pickPhoto(gender: string, bmi: number): string {
  const set = PHOTOS[gender] ?? PHOTOS.female;
  if (bmi < 21)        return set.lean;
  else if (bmi < 27)   return set.normal;
  else                 return set.fuller;
}

export default function Avatar({ gender, params, size = 300, minimal = false }: Props) {
  const uri = pickPhoto(gender, params.bmi);
  const h   = Math.round(size * 1.75);

  // Subtle horizontal scale based on waist width (max ±10%)
  const scaleX = Math.max(0.90, Math.min(1.10, 0.74 + params.waistWidth * 0.28));

  // Glow intensity grows with fitness level
  const glowAlpha  = Math.round((0.20 + params.toneLevel * 0.25) * 100) / 100;
  const glowRadius = Math.round(size * 0.90);
  const glowSpread = Math.round(size * 0.48);

  return (
    <View style={{ width: size, height: h, alignItems: 'center' }}>

      {/* Ambient halo sits behind the photo */}
      {!minimal && (
        <View
          style={[
            styles.halo,
            {
              width:     size * 0.50,
              height:    h   * 0.62,
              top:       h   * 0.06,
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

      {/* Rim-light: inset cyan edge on photo */}
      {!minimal && (
        <View
          style={[
            styles.rimLight,
            {
              width:     size,
              height:    h,
              boxShadow: `inset 0 0 ${Math.round(size * 0.20)}px rgba(0,242,255,0.08), inset 0 0 2px rgba(0,242,255,0.18)`,
            } as any,
          ]}
        />
      )}

      {/* Gradient fade into background */}
      <LinearGradient
        colors={['transparent', Colors.background]}
        style={[styles.fade, { width: size, height: Math.round(h * 0.38) }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  halo: {
    position:    'absolute',
    alignSelf:   'center',
    borderRadius: 9999,
    backgroundColor: Colors.accent,
  },
  photo: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  rimLight: {
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
