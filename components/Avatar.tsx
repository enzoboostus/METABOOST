import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, View } from 'react-native';
import Svg, { Defs, Ellipse, RadialGradient, Stop, LinearGradient as SvgLinearGradient, Line } from 'react-native-svg';
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

const ORBIT_PARTICLES: [number, number, number, string][] = [
  [  0, 0.44, 5, 'rgba(185,160,255,0.90)'],
  [ 62, 0.51, 3, 'rgba(255,200,140,0.85)'],
  [130, 0.47, 6, 'rgba(185,160,255,0.80)'],
  [193, 0.50, 3, 'rgba(255,220,160,0.80)'],
  [255, 0.43, 4, 'rgba(185,160,255,0.75)'],
  [318, 0.52, 5, 'rgba(255,200,140,0.90)'],
];

function PremiumPlatform({ width, glowAnim }: { width: number; glowAnim: Animated.Value }) {
  const svgH   = Math.round(width * 0.38);
  const cx     = width / 2;
  const cy     = svgH * 0.52;
  const rx     = width * 0.46;
  const ry     = svgH * 0.28;

  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1.0] });
  const glowScale   = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.08] });

  return (
    <View style={{ width, height: svgH, alignItems: 'center', justifyContent: 'center' }}>
      {/* Animated halo glow underneath platform */}
      <Animated.View style={{
        position: 'absolute',
        width: width * 0.9,
        height: svgH * 0.7,
        borderRadius: 9999,
        backgroundColor: 'transparent',
        opacity: glowOpacity,
        transform: [{ scaleX: glowScale }],
        ...({ boxShadow: `0 0 ${Math.round(width * 0.4)}px ${Math.round(width * 0.18)}px rgba(100,140,255,0.28)` } as any),
      }} />

      <Svg width={width} height={svgH} style={{ position: 'absolute' }}>
        <Defs>
          {/* Outer ring gradient */}
          <RadialGradient id="outerRing" cx="50%" cy="45%" rx="50%" ry="50%">
            <Stop offset="0%"   stopColor="#8AABFF" stopOpacity="0.0" />
            <Stop offset="72%"  stopColor="#5578CC" stopOpacity="0.0" />
            <Stop offset="88%"  stopColor="#6690EE" stopOpacity="0.55" />
            <Stop offset="100%" stopColor="#3355AA" stopOpacity="0.0" />
          </RadialGradient>

          {/* Mid ring */}
          <RadialGradient id="midRing" cx="50%" cy="44%" rx="50%" ry="50%">
            <Stop offset="0%"   stopColor="#AABFFF" stopOpacity="0.0" />
            <Stop offset="68%"  stopColor="#6688DD" stopOpacity="0.0" />
            <Stop offset="82%"  stopColor="#88AAFF" stopOpacity="0.70" />
            <Stop offset="100%" stopColor="#4466CC" stopOpacity="0.0" />
          </RadialGradient>

          {/* Platform disc surface gradient — top lighter, bottom darker for 3D depth */}
          <SvgLinearGradient id="discSurface" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%"   stopColor="#C8D8FF" stopOpacity="0.95" />
            <Stop offset="28%"  stopColor="#8AABEE" stopOpacity="0.88" />
            <Stop offset="62%"  stopColor="#3A5AAA" stopOpacity="0.82" />
            <Stop offset="100%" stopColor="#0D1E55" stopOpacity="0.90" />
          </SvgLinearGradient>

          {/* Inner shine streak */}
          <SvgLinearGradient id="shine" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.70" />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
          </SvgLinearGradient>

          {/* Subtle glow fill under disc */}
          <RadialGradient id="discGlow" cx="50%" cy="30%" rx="50%" ry="50%">
            <Stop offset="0%"   stopColor="#90B0FF" stopOpacity="0.30" />
            <Stop offset="100%" stopColor="#1030AA" stopOpacity="0.0" />
          </RadialGradient>
        </Defs>

        {/* Outermost diffuse ring */}
        <Ellipse
          cx={cx} cy={cy}
          rx={rx * 1.30} ry={ry * 1.30}
          fill="url(#outerRing)"
        />

        {/* Second ring */}
        <Ellipse
          cx={cx} cy={cy}
          rx={rx * 1.12} ry={ry * 1.12}
          fill="url(#midRing)"
        />

        {/* Thin outer border ring */}
        <Ellipse
          cx={cx} cy={cy}
          rx={rx * 1.04} ry={ry * 1.04}
          fill="none"
          stroke="rgba(130,165,255,0.35)"
          strokeWidth="0.8"
        />

        {/* Main platform disc — glow fill */}
        <Ellipse
          cx={cx} cy={cy}
          rx={rx} ry={ry}
          fill="url(#discGlow)"
        />

        {/* Main platform disc — surface */}
        <Ellipse
          cx={cx} cy={cy}
          rx={rx} ry={ry}
          fill="url(#discSurface)"
          stroke="rgba(160,200,255,0.75)"
          strokeWidth="1.2"
        />

        {/* Inner shine highlight — top arc of disc */}
        <Ellipse
          cx={cx} cy={cy - ry * 0.18}
          rx={rx * 0.56} ry={ry * 0.38}
          fill="url(#shine)"
        />

        {/* Thin inner edge line for depth */}
        <Ellipse
          cx={cx} cy={cy}
          rx={rx * 0.84} ry={ry * 0.72}
          fill="none"
          stroke="rgba(200,220,255,0.22)"
          strokeWidth="0.6"
        />

        {/* Compass energy lines — 4 directions */}
        <Line x1={cx} y1={cy - ry - 2}  x2={cx} y2={cy - ry - 10} stroke="rgba(180,210,255,0.60)" strokeWidth="1.5" strokeLinecap="round" />
        <Line x1={cx} y1={cy + ry + 2}  x2={cx} y2={cy + ry + 8}  stroke="rgba(180,210,255,0.40)" strokeWidth="1.0" strokeLinecap="round" />
        <Line x1={cx - rx - 2} y1={cy}  x2={cx - rx - 8} y2={cy}  stroke="rgba(180,210,255,0.40)" strokeWidth="1.0" strokeLinecap="round" />
        <Line x1={cx + rx + 2} y1={cy}  x2={cx + rx + 8} y2={cy}  stroke="rgba(180,210,255,0.40)" strokeWidth="1.0" strokeLinecap="round" />

        {/* Corner accent dots */}
        <Ellipse cx={cx}       cy={cy - ry} rx={3}   ry={2.2} fill="rgba(226,209,179,0.95)" />
        <Ellipse cx={cx}       cy={cy + ry} rx={2.5} ry={1.8} fill="rgba(180,200,255,0.80)" />
        <Ellipse cx={cx - rx}  cy={cy}      rx={2.5} ry={2.0} fill="rgba(180,200,255,0.80)" />
        <Ellipse cx={cx + rx}  cy={cy}      rx={2.5} ry={2.0} fill="rgba(180,200,255,0.80)" />
      </Svg>
    </View>
  );
}

export default function Avatar({ gender, params, size = 200, minimal = false }: Props) {
  const src    = gender === 'female' ? femaleSource(params.bmi) : maleSource(params.bmi);
  const srcKey = src.uri;
  const h      = Math.round(size * ASPECT);

  const glowAnim        = useRef(new Animated.Value(0)).current;
  const orbitAnim       = useRef(new Animated.Value(0)).current;
  const scanAnim        = useRef(new Animated.Value(0)).current;
  const particleOpacity = useRef(new Animated.Value(0)).current;
  const fadeAnim        = useRef(new Animated.Value(1)).current;

  const [displaySrc, setDisplaySrc] = useState<{ uri: string }>(src);
  const prevKeyRef = useRef(srcKey);

  const platH  = Math.round(size * 0.38);
  const totalH = h + platH * 0.4;

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

  const glowBase = 0.12 + params.toneLevel * 0.14;
  const orbitCX  = size / 2;
  const orbitCY  = h * 0.37;

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
        <View style={{ position: 'absolute', bottom: 0, width: size }}>
          <PremiumPlatform width={size} glowAnim={glowAnim} />
        </View>
      )}
    </View>
  );
}
