import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, View } from 'react-native';
import { AvatarParams } from '@/hooks/useAvatarParams';

interface Props {
  gender: 'male' | 'female';
  params: AvatarParams;
  size?: number;
  minimal?: boolean;
}

// ── Female images — mapped by IMC ─────────────────────────────────────────
// IMC < 18.5  → F1 Mince
// IMC 18.5–30 → F2 Athlétique
// IMC ≥ 30    → F3 Surpoids
const FEMALE_SLIM     = require('@/assets/avatars/female_slim.webp');
const FEMALE_ATHLETIC = require('@/assets/avatars/female_athletic.webp');
const FEMALE_FULL     = require('@/assets/avatars/female_full.webp');

// ── Male images — mapped by IMC ───────────────────────────────────────────
// IMC < 18.5  → H1 Mince (très sec)
// IMC 18.5–30 → H2 Athlétique (Thomas 24.5)
// IMC ≥ 30    → H3 Surpoids
const MALE_SLIM     = require('@/assets/avatars/male_slim.webp');
const MALE_ATHLETIC = require('@/assets/avatars/male_athletic.webp');
const MALE_FULL     = require('@/assets/avatars/male_full.webp');

function femaleSource(bmi: number) {
  if (bmi < 18.5) return FEMALE_SLIM;
  if (bmi < 30)   return FEMALE_ATHLETIC;
  return FEMALE_FULL;
}

function maleSource(bmi: number) {
  if (bmi < 18.5) return MALE_SLIM;
  if (bmi < 30)   return MALE_ATHLETIC;
  return MALE_FULL;
}

const ASPECT = 2.6; // portrait ratio height/width

// ── Main component ────────────────────────────────────────────────────────

export default function Avatar({ gender, params, size = 200, minimal = false }: Props) {
  const src = gender === 'female' ? femaleSource(params.bmi) : maleSource(params.bmi);
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

  const glowBase = 0.10 + params.toneLevel * 0.14;

  return (
    <View style={{ width: size, height: h, alignItems: 'center' }}>

      {/* Champagne glow halo */}
      {!minimal && (
        <Animated.View
          style={{
            position:        'absolute',
            alignSelf:       'center',
            top:             h * 0.05,
            width:           size * 0.68,
            height:          h * 0.90,
            borderRadius:    9999,
            backgroundColor: '#E2D1B3',
            opacity:         glowAnim.interpolate({ inputRange: [0, 1], outputRange: [glowBase, glowBase + 0.09] }),
            transform:       [{ translateY: floatAnim }],
            ...({ boxShadow: `0 0 ${Math.round(size * 1.0)}px ${Math.round(size * 0.5)}px rgba(226,209,179,0.18)` } as any),
          }}
        />
      )}

      {/* Figure — float + breathe + sway */}
      <Animated.View
        style={{
          width:  size,
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
