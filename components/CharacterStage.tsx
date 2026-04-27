import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';
import Svg, { Defs, Ellipse, Line, RadialGradient, Stop } from 'react-native-svg';
import Avatar from './Avatar';
import { AvatarParams } from '@/hooks/useAvatarParams';
import { Spacing } from '@/constants/theme';

const { width: W } = Dimensions.get('window');
const CARD_W = W - Spacing.md * 2;

export default function CharacterStage({
  gender,
  params,
}: {
  gender: 'male' | 'female';
  params: AvatarParams;
}) {
  const avatarSize       = Math.round(CARD_W * 0.54);
  const avatarImgH       = Math.round(avatarSize * 2.6);
  const avatarContainerH = avatarImgH + Math.round(avatarSize * 0.07);
  const platformH        = Math.round(CARD_W * 0.22);
  const stageH           = avatarContainerH + Math.round(platformH * 0.55);

  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.55] });

  // Grid
  const lineSpacing = 36;
  const numLines    = Math.ceil(CARD_W / lineSpacing) + 4;

  // Platform
  const platCX = CARD_W / 2;
  const platCY = platformH * 0.50;
  const platRX = CARD_W * 0.36;
  const platRY = CARD_W * 0.068;

  return (
    <View style={{ width: CARD_W, height: stageH }}>

      {/* ── 1. Geometric grid background ──────────────────────────── */}
      <Svg width={CARD_W} height={stageH} style={StyleSheet.absoluteFill}>
        {Array.from({ length: numLines }, (_, i) => {
          const x = (i - 2) * lineSpacing;
          return (
            <React.Fragment key={i}>
              <Line
                x1={x} y1={0}
                x2={x + stageH * 0.55} y2={stageH}
                stroke="rgba(100,140,220,0.09)" strokeWidth={1}
              />
              <Line
                x1={x} y1={0}
                x2={x - stageH * 0.55} y2={stageH}
                stroke="rgba(100,140,220,0.09)" strokeWidth={1}
              />
            </React.Fragment>
          );
        })}
      </Svg>

      {/* ── 2. Avatar — centred, anchored to top ──────────────────── */}
      <View style={{
        position: 'absolute',
        left: (CARD_W - avatarSize) / 2,
        top:  0,
      }}>
        <Avatar gender={gender} params={params} size={avatarSize} minimal />
      </View>

      {/* ── 3. Platform ───────────────────────────────────────────── */}
      <View style={{ position: 'absolute', bottom: 0, width: CARD_W, height: platformH }}>

        {/* Pulsing ambient glow */}
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: glowOpacity }]}>
          <Svg width={CARD_W} height={platformH}>
            <Defs>
              <RadialGradient id="pg" cx="50%" cy="55%" r="50%">
                <Stop offset="0%"   stopColor="#4070FF" stopOpacity="0.60" />
                <Stop offset="100%" stopColor="#4070FF" stopOpacity="0"    />
              </RadialGradient>
            </Defs>
            <Ellipse cx={platCX} cy={platCY} rx={platRX * 1.25} ry={platRY * 3} fill="url(#pg)" />
          </Svg>
        </Animated.View>

        {/* Disc + rings */}
        <Svg width={CARD_W} height={platformH} style={StyleSheet.absoluteFill}>
          {/* Main disc */}
          <Ellipse
            cx={platCX} cy={platCY}
            rx={platRX} ry={platRY}
            fill="rgba(12,22,58,0.95)"
            stroke="rgba(110,140,230,0.55)"
            strokeWidth={1.8}
          />
          {/* Outer ring */}
          <Ellipse
            cx={platCX} cy={platCY}
            rx={platRX * 1.12} ry={platRY * 1.12}
            fill="none"
            stroke="rgba(100,130,210,0.25)"
            strokeWidth={1}
          />
          {/* Inner shine highlight */}
          <Ellipse
            cx={platCX} cy={platCY - platRY * 0.35}
            rx={platRX * 0.55} ry={platRY * 0.28}
            fill="rgba(180,200,255,0.10)"
          />
          {/* Accent dots — 4 corners of the disc */}
          {[0, 90, 180, 270].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <Ellipse
                key={deg}
                cx={platCX + platRX * Math.cos(rad)}
                cy={platCY + platRY * Math.sin(rad)}
                rx={3} ry={2}
                fill="rgba(226,209,179,0.80)"
              />
            );
          })}
        </Svg>
      </View>
    </View>
  );
}
