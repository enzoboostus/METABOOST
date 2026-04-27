import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, View } from 'react-native';
import { AvatarParams } from '@/hooks/useAvatarParams';

interface Props {
  gender: 'male' | 'female';
  params: AvatarParams;
  size?: number;
  minimal?: boolean;
}

// ── Female images ─────────────────────────────────────────────────────────
const FEMALE_SLIM     = { uri: 'https://i.imgur.com/lcg0eAC.webp' };
const FEMALE_ATHLETIC = { uri: 'https://i.imgur.com/Ca1ZFYu.webp' };
const FEMALE_FULL     = { uri: 'https://i.imgur.com/92fJtwz.webp' };

// ── Male images ───────────────────────────────────────────────────────────
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

// [phase_deg, radius_ratio, dot_size, color]
const ORBIT_PARTICLES: [number, number, number, string][] = [
  [  0, 0.44, 5, 'rgba(185,160,255,0.90)'],
  [ 62, 0.51, 3, 'rgba(255,200,140,0.85)'],
  [130, 0.47, 6, 'rgba(185,160,255,0.80)'],
  [193, 0.50, 3, 'rgba(255,220,160,0.80)'],
  [255, 0.43, 4, 'rgba(185,160,255,0.75)'],
  [318, 0.52, 5, 'rgba(255,200,140,0.90)'],
];

export default function Avatar({ gender, params, size = 200, minimal = false }: Props) {
  const src    = gender === 'female' ? femaleSource(params.bmi) : maleSource(params.bmi);
  const srcKey = src.uri;
  const h      = Math.round(size * ASPECT);

  // ── Core idle animations ───────────────────────────────────────────────
  const floatAnim  = useRef(new Animated.Value(0)).current;
  const breathAnim = useRef(new Animated.Value(1)).current;
  const swayAnim   = useRef(new Animated.Value(0)).current;
  const glowAnim   = useRef(new Animated.Value(0)).current;

  // ── Particle orbit ─────────────────────────────────────────────────────
  const orbitAnim = useRef(new Animated.Value(0)).current;

  // ── Holographic scan line ──────────────────────────────────────────────
  const scanAnim = useRef(new Animated.Value(0)).current;

  // ── Cross-fade on morphology / gender change ───────────────────────────
  const fadeAnim                    = useRef(new Animated.Value(1)).current;
  const [displaySrc, setDisplaySrc] = useState<{ uri: string }>(src);
  const prevKeyRef                  = useRef(srcKey);

  useEffect(() => {
    if (srcKey === prevKeyRef.current) return;
    prevKeyRef.current = srcKey;
    fadeAnim.setValue(0);
    setDisplaySrc(src);
    Animated.timing(fadeAnim, {
      toValue: 1, duration: 420, easing: Easing.out(Easing.quad), useNativeDriver: true,
    }).start();
  }, [srcKey]);

  useEffect(() => {
    // Float — slightly more dramatic than before
    Animated.loop(Animated.sequence([
      Animated.timing(floatAnim, { toValue: -14, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(floatAnim, { toValue:   0, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ])).start();

    // Breathe — more visible chest expansion
    Animated.loop(Animated.sequence([
      Animated.timing(breathAnim, { toValue: 1.030, duration: 1700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(breathAnim, { toValue: 1,     duration: 1700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ])).start();

    // Idle sway
    Animated.loop(Animated.sequence([
      Animated.timing(swayAnim, { toValue:  3, duration: 1900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(swayAnim, { toValue:  0, duration: 1900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(swayAnim, { toValue: -3, duration: 1900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(swayAnim, { toValue:  0, duration: 1900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ])).start();

    // Glow pulse
    Animated.loop(Animated.sequence([
      Animated.timing(glowAnim, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(glowAnim, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ])).start();

    // Particle orbit — full rotation every 9 s
    Animated.loop(
      Animated.timing(orbitAnim, { toValue: 1, duration: 9000, easing: Easing.linear, useNativeDriver: true })
    ).start();

    // Holographic scan: sweep top→bottom, pause, reset
    Animated.loop(Animated.sequence([
      Animated.timing(scanAnim, { toValue: 1, duration: 2600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.delay(2400),
      Animated.timing(scanAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ])).start();
  }, []);

  const glowBase      = 0.12 + params.toneLevel * 0.14;
  const shadowScaleX  = floatAnim.interpolate({ inputRange: [-14, 0], outputRange: [0.50, 1.0] });
  const shadowOpacity = floatAnim.interpolate({ inputRange: [-14, 0], outputRange: [0.07, 0.28] });

  // Orbit center: horizontally centred, vertically at the torso
  const orbitCX = size / 2;
  const orbitCY = h * 0.37;

  return (
    <View style={{ width: size, height: h + Math.round(size * 0.07), alignItems: 'center' }}>

      {/* ── 1. Background glow halo ────────────────────────────────── */}
      {!minimal && (
        <Animated.View
          style={{
            position: 'absolute', alignSelf: 'center',
            top: h * 0.04, width: size * 0.72, height: h * 0.92,
            borderRadius: 9999, backgroundColor: '#E2D1B3',
            opacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [glowBase, glowBase + 0.14] }),
            transform: [{ translateY: floatAnim }],
            ...({ boxShadow: `0 0 ${Math.round(size * 1.3)}px ${Math.round(size * 0.65)}px rgba(226,209,179,0.30)` } as any),
          }}
        />
      )}

      {/* ── 2. Avatar figure ──────────────────────────────────────── */}
      <Animated.View
        style={{
          width: size, height: h, opacity: fadeAnim,
          transform: [{ translateY: floatAnim }, { translateX: swayAnim }, { scale: breathAnim }],
        }}
      >
        <Image source={displaySrc} style={{ width: size, height: h }} resizeMode="contain" />
      </Animated.View>

      {/* ── 3. Orbiting energy particles (drawn on top of figure) ─── */}
      {!minimal && ORBIT_PARTICLES.map(([phase, radiusRatio, dotSize, color], i) => {
        const r = size * radiusRatio * 0.5;
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              width: dotSize, height: dotSize,
              // Center of this view sits exactly at the orbit center
              left: orbitCX - dotSize / 2,
              top:  orbitCY - dotSize / 2,
              transform: [
                {
                  rotate: orbitAnim.interpolate({
                    inputRange:  [0, 1],
                    outputRange: [`${phase}deg`, `${phase + 360}deg`],
                  }),
                },
                { translateX: r },
              ],
            }}
          >
            <View
              style={{
                width: dotSize, height: dotSize, borderRadius: dotSize / 2,
                backgroundColor: color,
                ...({ boxShadow: `0 0 ${dotSize * 2.5}px ${dotSize * 1.2}px ${color}` } as any),
              }}
            />
          </Animated.View>
        );
      })}

      {/* ── 4. Holographic scan line ──────────────────────────────── */}
      {!minimal && (
        <Animated.View
          style={{
            position: 'absolute', left: 0, right: 0, height: 1.5,
            backgroundColor: 'rgba(190, 210, 255, 0.32)',
            transform: [{ translateY: scanAnim.interpolate({ inputRange: [0, 1], outputRange: [0, h] }) }],
            ...({ boxShadow: '0 0 10px 5px rgba(190,210,255,0.18)' } as any),
          }}
        />
      )}

      {/* ── 5. Ground shadow ellipse ──────────────────────────────── */}
      {!minimal && (
        <Animated.View
          style={{
            position: 'absolute', bottom: 0, alignSelf: 'center',
            width: size * 0.52, height: size * 0.052, borderRadius: 9999,
            backgroundColor: '#0a0a18',
            opacity: shadowOpacity, transform: [{ scaleX: shadowScaleX }],
          }}
        />
      )}
    </View>
  );
}
