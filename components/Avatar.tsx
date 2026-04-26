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
 * AI-generated athlete photos, one per BMI tier per gender.
 * Female: 3 tiers  |  Male: 4 tiers
 */
const PHOTOS = {
  female: {
    lean:    'https://i.imgur.com/lcg0eAC.png', // IMC < 21
    normal:  'https://i.imgur.com/Ca1ZFYu.png', // IMC 21–27
    fuller:  'https://i.imgur.com/92fJtwz.png', // IMC > 27
  },
  male: {
    lean:    'https://i.imgur.com/GoQRmSG.png', // IMC < 21
    normal:  'https://i.imgur.com/5DtnVxi.png', // IMC 21–24
    muscled: 'https://i.imgur.com/f7SAHOu.png', // IMC 24–27
    fuller:  'https://i.imgur.com/53m4ute.png', // IMC > 27
  },
};

function pickPhoto(gender: 'male' | 'female', bmi: number): string {
  if (gender === 'female') {
    if (bmi < 21)  return PHOTOS.female.lean;
    if (bmi < 27)  return PHOTOS.female.normal;
    return PHOTOS.female.fuller;
  } else {
    if (bmi < 21)  return PHOTOS.male.lean;
    if (bmi < 24)  return PHOTOS.male.normal;
    if (bmi < 27)  return PHOTOS.male.muscled;
    return PHOTOS.male.fuller;
  }
}

export default function Avatar({ gender, params, size = 300, minimal = false }: Props) {
  const uri = pickPhoto(gender, params.bmi);
  const h   = Math.round(size * 1.6);

  const glowAlpha  = Math.round((0.18 + params.toneLevel * 0.20) * 100) / 100;
  const glowRadius = Math.round(size * 0.90);
  const glowSpread = Math.round(size * 0.45);

  return (
    <View style={{ width: size, height: h, alignItems: 'center' }}>

      {/* Ambient cyan halo behind the photo */}
      {!minimal && (
        <View
          style={[
            styles.halo,
            {
              width:     size * 0.48,
              height:    h   * 0.58,
              top:       h   * 0.07,
              boxShadow: `0 0 ${glowRadius}px ${glowSpread}px rgba(0,242,255,${glowAlpha})`,
            } as any,
          ]}
        />
      )}

      {/* Full-body athlete photo */}
      <Image
        source={{ uri }}
        style={[styles.photo, { width: size, height: h }]}
        resizeMode="cover"
      />

      {/* Subtle cyan rim-light on photo edges */}
      {!minimal && (
        <View
          style={[
            styles.rimLight,
            {
              width:     size,
              height:    h,
              boxShadow: `inset 0 0 ${Math.round(size * 0.18)}px rgba(0,242,255,0.05), inset 0 0 2px rgba(0,242,255,0.14)`,
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
