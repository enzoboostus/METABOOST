import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AvatarParams } from '@/hooks/useAvatarParams';

interface Props {
  gender: 'male' | 'female';
  params: AvatarParams;
  size?: number;
  minimal?: boolean;
}

const FEMALE_SLIM     = { uri: 'https://i.ibb.co/qYHh2v0Y/IMG-5048.png' };
const FEMALE_ATHLETIC = { uri: 'https://i.ibb.co/6RJy4jfR/IMG-5047.png' };
const FEMALE_FULL     = { uri: 'https://i.ibb.co/d0pMhx8W/IMG-5046.png' };

const MALE_SLIM     = { uri: 'https://i.ibb.co/SD438mhX/IMG-5045.png' };
const MALE_ATHLETIC = { uri: 'https://i.ibb.co/SDvdfGB6/IMG-5044.png' };
const MALE_FULL     = { uri: 'https://i.ibb.co/VYkF2X0n/IMG-5043.png' };

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

const ASPECT   = 2.6;
const CARD_BG  = '#0A1128';

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

  const platAreaH = Math.round(size * 0.26);
  const platDiscW = Math.round(size * 0.88);
  const platDiscH = Math.round(size * 0.094);
  const platRingW = Math.round(size * 0.98);
  const platRingH = Math.round(size * 0.108);
  const totalH    = h + platAreaH;

  const glowAnim        = useRef(new Animated.Value(0)).current;
  const orbitAnim       = useRef(new Animated.Value(0)).current;
  const scanAnim        = useRef(new Animated.Value(0)).current;
  const particleOpacity = useRef(new Animated.Value(0)).current;
  const fadeAnim        = useRef(new Animated.Value(1)).current;

  const [displaySrc, setDisplaySrc] = useState<{ uri: string }>(src);
  const prevKeyRef = useRef(srcKey);

  useEffect(() => {
    if (srcKey === prevKeyRef.current) return;
    prevKeyRef.current = srcKey;

    fadeAnim.setValue(0);
    setDisplaySrc(src);
    Animated.timing(fadeAnim, {
      toValue: 1, duration: 420, easing: Easing.out(Easing.quad), useNativeDriver: true,
    }).start();

    scanAnim.setValue(0);
    Animated.timing(scanAnim, {
      toValue: 1, duration: 2400, easing: Easing.inOut(Easing.quad), useNativeDriver: true,
    }).start();

    Animated.sequence([
      Animated.timing(particleOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(1800),
      Animated.timing(particleOpacity, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, [srcKey]);

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(glowAnim, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(glowAnim, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ])).start();

    Animated.loop(
      Animated.timing(orbitAnim, { toValue: 1, duration: 9000, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, []);

  const glowBase   = 0.12 + params.toneLevel * 0.14;
  const platGlowOp = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.18, 0.52] });
  const orbitCX    = size / 2;
  const orbitCY    = h * 0.37;

  const sideW = Math.round(size * 0.38);
  const topH  = Math.round(h * 0.22);
  const botH  = Math.round(h * 0.12);

  const rx = platDiscW / 2;
  const ry = platDiscH / 2;
  const platDots = ([0, 90, 180, 270] as const).map((deg) => {
    const rad = (deg * Math.PI) / 180;
    return { deg, dx: rx * Math.cos(rad), dy: ry * Math.sin(rad) };
  });

  return (
    <View style={{ width: size, height: totalH, alignItems: 'center' }}>

      {!minimal && (
        <Animated.View style={{
          position: 'absolute', alignSelf: 'center',
          top: h * 0.04, width: size * 0.72, height: h * 0.92,
          borderRadius: 9999, backgroundColor: '#E2D1B3',
          opacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [glowBase, glowBase + 0.14] }),
          ...({ boxShadow: `0 0 ${Math.round(size * 1.3)}px ${Math.round(size * 0.65)}px rgba(226,209,179,0.30)` } as any),
        }} />
      )}

      <Animated.View style={{ width: size, height: h, opacity: fadeAnim }}>
        <Image source={displaySrc} style={{ width: size, height: h }} resizeMode="contain" />
        <LinearGradient
          colors={[CARD_BG, 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: sideW }}
          pointerEvents="none"
        />
        <LinearGradient
          colors={['transparent', CARD_BG]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: sideW }}
          pointerEvents="none"
        />
        <LinearGradient
          colors={[CARD_BG, 'transparent']}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: topH }}
          pointerEvents="none"
        />
        <LinearGradient
          colors={['transparent', CARD_BG]}
          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: botH }}
          pointerEvents="none"
        />
      </Animated.View>

      {!minimal && (
        <Animated.View style={{ opacity: particleOpacity, position: 'absolute', width: size, height: h }}>
          {ORBIT_PARTICLES.map(([phase, radiusRatio, dotSize, color], i) => {
            const r = size * radiusRatio * 0.5;
            return (
              <Animated.View key={i} style={{
                position: 'absolute',
                width: dotSize, height: dotSize,
                left: orbitCX - dotSize / 2,
                top:  orbitCY - dotSize / 2,
                transform: [
                  { rotate: orbitAnim.interpolate({ inputRange: [0, 1], outputRange: [`${phase}deg`, `${phase + 360}deg`] }) },
                  { translateX: r },
                ],
              }}>
                <View style={{
                  width: dotSize, height: dotSize, borderRadius: dotSize / 2,
                  backgroundColor: color,
                  ...({ boxShadow: `0 0 ${dotSize * 2.5}px ${dotSize * 1.2}px ${color}` } as any),
                }} />
              </Animated.View>
            );
          })}
        </Animated.View>
      )}

      {!minimal && (
        <Animated.View style={{
          position: 'absolute', left: 0, right: 0, height: 1.5,
          backgroundColor: 'rgba(190,210,255,0.32)',
          transform: [{ translateY: scanAnim.interpolate({ inputRange: [0, 1], outputRange: [0, h] }) }],
          ...({ boxShadow: '0 0 10px 5px rgba(190,210,255,0.18)' } as any),
        }} />
      )}

      {!minimal && (
        <View style={{
          position: 'absolute', bottom: 0, width: size, height: platAreaH,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Animated.View style={{
            position: 'absolute', width: size, height: platAreaH,
            borderRadius: platAreaH / 2, backgroundColor: 'rgba(40,80,255,0.22)',
            opacity: platGlowOp,
          }} />
          <View style={{
            position: 'absolute', width: platRingW, height: platRingH,
            borderRadius: platRingH / 2, borderWidth: 1,
            borderColor: 'rgba(100,130,210,0.28)',
          }} />
          <View style={{
            width: platDiscW, height: platDiscH, borderRadius: platDiscH / 2,
            backgroundColor: 'rgba(10,20,55,0.96)', borderWidth: 1.8,
            borderColor: 'rgba(110,145,235,0.60)',
          }} />
          <View style={{
            position: 'absolute',
            width: Math.round(platDiscW * 0.52), height: Math.round(platDiscH * 0.30),
            borderRadius: platDiscH / 2, backgroundColor: 'rgba(160,185,255,0.10)',
            top: platAreaH / 2 - platDiscH * 0.68,
          }} />
          {platDots.map(({ deg, dx, dy }) => (
            <View key={deg} style={{
              position: 'absolute', width: 5, height: 4, borderRadius: 2.5,
              backgroundColor: deg === 0 || deg === 180 ? 'rgba(226,209,179,0.90)' : 'rgba(160,180,255,0.85)',
              left: size / 2 + dx - 2.5,
              top:  platAreaH / 2 + dy - 2,
            }} />
          ))}
        </View>
      )}
    </View>
  );
}
