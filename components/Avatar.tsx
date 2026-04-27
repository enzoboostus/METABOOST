import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, View } from 'react-native';
import { AvatarParams } from '@/hooks/useAvatarParams';

interface Props {
  gender: 'male' | 'female';
  params: AvatarParams;
  size?: number;
  minimal?: boolean;
}

// ── Female images — mapped by BMI ─────────────────────────────────────────
const FEMALE_SLIM     = { uri: 'https://i.imgur.com/lcg0eAC.webp' };
const FEMALE_ATHLETIC = { uri: 'https://i.imgur.com/Ca1ZFYu.webp' };
const FEMALE_FULL     = { uri: 'https://i.imgur.com/92fJtwz.webp' };

// ── Male images — mapped by BMI ───────────────────────────────────────────
const MALE_SLIM     = { uri: 'https://i.imgur.com/GoQRmSG.webp' };
const MALE_ATHLETIC = { uri: 'https://i.imgur.com/5DtnVxi.webp' };
const MALE_FULL     = { uri: 'https://i.imgur.com/53m4ute.webp' };

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

const ASPECT = 2.6;

export default function Avatar({ gender, params, size = 200, minimal = false }: Props) {
  const src    = gender === 'female' ? femaleSource(params.bmi) : maleSource(params.bmi);
  const srcKey = src.uri;
  const h      = Math.round(size * ASPECT);

  // ── Idle animations ───────────────────────────────────────────────────
  const floatAnim  = useRef(new Animated.Value(0)).current;
  const breathAnim = useRef(new Animated.Value(1)).current;
  const swayAnim   = useRef(new Animated.Value(0)).current;
  const glowAnim   = useRef(new Animated.Value(0)).current;

  // ── Cross-fade on morphology / gender change ──────────────────────────
  const fadeAnim                        = useRef(new Animated.Value(1)).current;
  const [displaySrc, setDisplaySrc]     = useState<{ uri: string }>(src);
  const prevKeyRef                      = useRef(srcKey);

  useEffect(() => {
    if (srcKey === prevKeyRef.current) return;
    prevKeyRef.current = srcKey;
    // Snap opacity to 0, swap image, fade back in
    fadeAnim.setValue(0);
    setDisplaySrc(src);
    Animated.timing(fadeAnim, {
      toValue:  1,
      duration: 420,
      easing:   Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [srcKey]);

  // ── Start all idle loops once ─────────────────────────────────────────
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

  // Ground shadow shrinks and fades as avatar rises
  const shadowScaleX  = floatAnim.interpolate({ inputRange: [-8, 0], outputRange: [0.60, 1.0] });
  const shadowOpacity = floatAnim.interpolate({ inputRange: [-8, 0], outputRange: [0.10, 0.28] });

  return (
    <View style={{ width: size, height: h + Math.round(size * 0.07), alignItems: 'center' }}>

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
            ...({ boxShadow: `0 0 ${Math.round(size * 1.0)}px ${Math.round(size * 0.5)}px rgba(226,209,179,0.22)` } as any),
          }}
        />
      )}

      {/* Figure — float + breathe + sway + cross-fade */}
      <Animated.View
        style={{
          width:   size,
          height:  h,
          opacity: fadeAnim,
          transform: [
            { translateY: floatAnim  },
            { translateX: swayAnim   },
            { scale:      breathAnim },
          ],
        }}
      >
        <Image
          source={displaySrc}
          style={{ width: size, height: h }}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Ground shadow ellipse — reacts to float */}
      {!minimal && (
        <Animated.View
          style={{
            position:        'absolute',
            bottom:          0,
            alignSelf:       'center',
            width:           size * 0.52,
            height:          size * 0.052,
            borderRadius:    9999,
            backgroundColor: '#0a0a18',
            opacity:         shadowOpacity,
            transform:       [{ scaleX: shadowScaleX }],
          }}
        />
      )}
    </View>
  );
}
