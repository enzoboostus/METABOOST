import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, View } from 'react-native';
import { AvatarParams } from '@/hooks/useAvatarParams';

interface Props {
  gender: 'male' | 'female';
  params: AvatarParams;
  size?: number;
  minimal?: boolean;
}

// ── Body type selection based on BMI ─────────────────────────────────────

function bodyType(bmi: number): 'slim' | 'athletic' | 'curvy' | 'full' {
  if (bmi < 21) return 'slim';
  if (bmi < 25) return 'athletic';
  if (bmi < 29) return 'curvy';
  return 'full';
}

// ── Image assets ─────────────────────────────────────────────────────────
// Replace placeholder PNGs in assets/avatars/ with real photos:
//   female_slim.png     → BMI < 21   (silhouette fine/mince)
//   female_athletic.png → BMI 21-25  (silhouette athlétique)
//   female_curvy.png    → BMI 25-29  (silhouette ronde-athlétique)
//   female_full.png     → BMI ≥ 29   (silhouette généreuse)
//   male_slim.png / male_athletic.png / male_curvy.png / male_full.png

const FEMALE = {
  slim:     require('@/assets/avatars/female_slim.png'),
  athletic: require('@/assets/avatars/female_athletic.png'),
  curvy:    require('@/assets/avatars/female_curvy.png'),
  full:     require('@/assets/avatars/female_full.png'),
};

const MALE = {
  slim:     require('@/assets/avatars/male_slim.png'),
  athletic: require('@/assets/avatars/male_athletic.png'),
  curvy:    require('@/assets/avatars/male_curvy.png'),
  full:     require('@/assets/avatars/male_full.png'),
};

// Height-to-width ratio of the reference photos (portrait)
const ASPECT = 2.6;

// ── Main component ────────────────────────────────────────────────────────

export default function Avatar({ gender, params, size = 200, minimal = false }: Props) {
  const bt  = bodyType(params.bmi);
  const src = gender === 'female' ? FEMALE[bt] : MALE[bt];
  const h   = Math.round(size * ASPECT);

  const floatAnim  = useRef(new Animated.Value(0)).current;
  const breathAnim = useRef(new Animated.Value(1)).current;
  const swayAnim   = useRef(new Animated.Value(0)).current;
  const glowAnim   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -8, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue:  0, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(breathAnim, { toValue: 1.018, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(breathAnim, { toValue: 1,     duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(swayAnim, { toValue:  2, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(swayAnim, { toValue:  0, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(swayAnim, { toValue: -2, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(swayAnim, { toValue:  0, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const glowBase = 0.12 + params.toneLevel * 0.16;

  return (
    <View style={{ width: size, height: h, alignItems: 'center' }}>

      {/* Champagne glow halo behind the figure */}
      {!minimal && (
        <Animated.View
          style={{
            position:        'absolute',
            alignSelf:       'center',
            top:             h * 0.06,
            width:           size * 0.65,
            height:          h * 0.88,
            borderRadius:    9999,
            backgroundColor: '#E2D1B3',
            opacity:         glowAnim.interpolate({ inputRange: [0, 1], outputRange: [glowBase, glowBase + 0.10] }),
            transform:       [{ translateY: floatAnim }],
            ...({ boxShadow: `0 0 ${Math.round(size * 0.9)}px ${Math.round(size * 0.5)}px rgba(226,209,179,0.20)` } as any),
          }}
        />
      )}

      {/* Figure — float + breathe + sway */}
      <Animated.View
        style={{
          width: size,
          height: h,
          transform: [
            { translateY: floatAnim },
            { translateX: swayAnim  },
            { scale:      breathAnim },
          ],
        }}
      >
        <Image
          source={src}
          style={{ width: size, height: h }}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}
