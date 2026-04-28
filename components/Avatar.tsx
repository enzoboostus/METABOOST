import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, View } from 'react-native';
import Svg, { Defs, Ellipse, RadialGradient, Stop, LinearGradient as SvgLG } from 'react-native-svg';
import { AvatarParams } from '@/hooks/useAvatarParams';

interface Props {
  gender: 'male' | 'female';
  params: AvatarParams;
  size?: number;
  minimal?: boolean;
}

const FEMALE_SLIM     = { uri: 'https://i.ibb.co/0VpncpQm/IMG-5072.png' };
const FEMALE_ATHLETIC = { uri: 'https://i.ibb.co/gZ1TQDHz/IMG-5073.png' };
const FEMALE_FULL     = { uri: 'https://i.ibb.co/Qjh86N44/IMG-5074.png' };

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

const ASPECT = 2.6;

// Fortnite-style platform with glowing teal ring
function FortnitePlatform({ width, pulseAnim }: { width: number; pulseAnim: Animated.Value }) {
  const svgH = Math.round(width * 0.55);
  const cx   = width / 2;
  const cy   = svgH * 0.38;

  // Main disc dimensions
  const rx  = width * 0.42;
  const ry  = svgH * 0.22;

  // Ring glow intensity pulsing
  const ringOpacity = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.75, 1.0] });
  const glowOpacity = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.40, 0.85] });
  const glowScale   = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1.10] });

  return (
    <View style={{ width, height: svgH }}>
      {/* Animated underlight bloom */}
      <Animated.View style={{
        position: 'absolute',
        alignSelf: 'center',
        top: cy - ry * 0.6,
        width: width * 1.1,
        height: svgH * 0.85,
        borderRadius: 9999,
        opacity: glowOpacity,
        transform: [{ scaleX: glowScale }],
        ...({ boxShadow: `0 0 ${Math.round(width * 0.6)}px ${Math.round(width * 0.3)}px rgba(0,240,200,0.22)` } as any),
      }} />

      <Svg width={width} height={svgH}>
        <Defs>
          {/* Disc surface: dark metallic center, lit edges */}
          <SvgLG id="discFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%"   stopColor="#0AFFDF" stopOpacity="0.18" />
            <Stop offset="40%"  stopColor="#081828" stopOpacity="0.95" />
            <Stop offset="100%" stopColor="#040F1A" stopOpacity="1.00" />
          </SvgLG>

          {/* Outer ring glow fill */}
          <RadialGradient id="outerGlow" cx="50%" cy="45%" rx="50%" ry="50%">
            <Stop offset="0%"   stopColor="#00FFD0" stopOpacity="0.0" />
            <Stop offset="65%"  stopColor="#00FFD0" stopOpacity="0.0" />
            <Stop offset="82%"  stopColor="#00FFD0" stopOpacity="0.28" />
            <Stop offset="92%"  stopColor="#00E8BC" stopOpacity="0.55" />
            <Stop offset="100%" stopColor="#00C8A0" stopOpacity="0.0" />
          </RadialGradient>

          {/* Disc top shine */}
          <SvgLG id="shine" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%"   stopColor="#AFFFFF" stopOpacity="0.55" />
            <Stop offset="100%" stopColor="#00FFD0" stopOpacity="0.0" />
          </SvgLG>
        </Defs>

        {/* Outermost diffuse ring 3 */}
        <Ellipse
          cx={cx} cy={cy}
          rx={rx * 1.60} ry={ry * 1.60}
          fill="none"
          stroke="#00FFD0"
          strokeWidth="0.5"
          strokeOpacity="0.12"
        />

        {/* Outer diffuse ring 2 */}
        <Ellipse
          cx={cx} cy={cy}
          rx={rx * 1.38} ry={ry * 1.38}
          fill="none"
          stroke="#00FFD0"
          strokeWidth="0.8"
          strokeOpacity="0.20"
        />

        {/* Outer diffuse ring 1 */}
        <Ellipse
          cx={cx} cy={cy}
          rx={rx * 1.16} ry={ry * 1.16}
          fill="none"
          stroke="#00FFD0"
          strokeWidth="1.0"
          strokeOpacity="0.35"
        />

        {/* Glow fill behind main disc */}
        <Ellipse
          cx={cx} cy={cy}
          rx={rx * 1.06} ry={ry * 1.06}
          fill="url(#outerGlow)"
        />

        {/* Main disc surface */}
        <Ellipse
          cx={cx} cy={cy}
          rx={rx} ry={ry}
          fill="url(#discFill)"
        />

        {/* THE glowing teal edge ring — Fortnite style */}
        <Ellipse
          cx={cx} cy={cy}
          rx={rx} ry={ry}
          fill="none"
          stroke="#00FFD0"
          strokeWidth="2.8"
          strokeOpacity="0.95"
        />

        {/* Inner glow ring just inside the edge */}
        <Ellipse
          cx={cx} cy={cy}
          rx={rx * 0.88} ry={ry * 0.88}
          fill="none"
          stroke="#00FFD0"
          strokeWidth="0.7"
          strokeOpacity="0.30"
        />

        {/* Top surface shine streak */}
        <Ellipse
          cx={cx} cy={cy - ry * 0.30}
          rx={rx * 0.52} ry={ry * 0.30}
          fill="url(#shine)"
        />

        {/* Center glow dot */}
        <Ellipse
          cx={cx} cy={cy}
          rx={rx * 0.14} ry={ry * 0.22}
          fill="#00FFD0"
          fillOpacity="0.22"
        />
      </Svg>

      {/* Animated ring glow overlay using boxShadow */}
      <Animated.View style={{
        position: 'absolute',
        alignSelf: 'center',
        top: cy - ry,
        width: rx * 2,
        height: ry * 2,
        borderRadius: 9999,
        borderWidth: 2,
        borderColor: '#00FFD0',
        opacity: ringOpacity,
        ...({ boxShadow: `0 0 18px 6px rgba(0,255,200,0.55), inset 0 0 12px 2px rgba(0,255,200,0.20)` } as any),
      }} />
    </View>
  );
}

export default function Avatar({ gender, params, size = 200, minimal = false }: Props) {
  const src    = gender === 'female' ? femaleSource(params.bmi) : maleSource(params.bmi);
  const srcKey = src.uri;
  const h      = Math.round(size * ASPECT);

  const pulseAnim       = useRef(new Animated.Value(0)).current;
  const orbitAnim       = useRef(new Animated.Value(0)).current;
  const scanAnim        = useRef(new Animated.Value(0)).current;
  const particleOpacity = useRef(new Animated.Value(0)).current;
  const fadeAnim        = useRef(new Animated.Value(1)).current;

  const [displaySrc, setDisplaySrc] = useState<{ uri: string }>(src);
  const prevKeyRef = useRef(srcKey);

  const platH  = Math.round(size * 0.55);
  // overlap: character feet sit on the disc — shift platform up into character bottom
  const overlap = Math.round(platH * 0.68);
  const totalH  = h + platH - overlap;

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
      Animated.timing(pulseAnim, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.sine), useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.sine), useNativeDriver: true }),
    ])).start();

    Animated.loop(
      Animated.timing(orbitAnim, { toValue: 1, duration: 9000, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, []);

  return (
    <View style={{ width: size, height: totalH, alignItems: 'center' }}>
      {/* Character photo — female images have more padding so scale them up to match male */}
      <Animated.View style={{ width: size, height: h, opacity: fadeAnim, zIndex: 2 }}>
        <Image
          source={displaySrc}
          style={{ width: size, height: h, transform: [{ scale: gender === 'female' ? 1.22 : 1.0 }] }}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Platform — positioned so character stands on it */}
      {!minimal && (
        <View style={{ position: 'absolute', bottom: 0, width: size, zIndex: 1 }}>
          <FortnitePlatform width={size} pulseAnim={pulseAnim} />
        </View>
      )}

      {/* Scan line on avatar change */}
      {!minimal && (
        <Animated.View style={{
          position: 'absolute', left: 0, right: 0, height: 1.5, zIndex: 3,
          backgroundColor: 'rgba(0,255,200,0.40)',
          transform: [{ translateY: scanAnim.interpolate({ inputRange: [0, 1], outputRange: [0, h] }) }],
          ...({ boxShadow: '0 0 10px 4px rgba(0,255,200,0.25)' } as any),
        }} />
      )}
    </View>
  );
}
