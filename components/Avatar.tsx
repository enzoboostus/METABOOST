import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import Svg, {
  Circle, Ellipse, Rect, Path, G,
  Defs, RadialGradient as RGrad, LinearGradient as LGrad, Stop,
} from 'react-native-svg';
import { AvatarParams } from '@/hooks/useAvatarParams';

interface Props {
  gender: 'male' | 'female';
  params: AvatarParams;
  size?: number;
  minimal?: boolean;
}

const SKIN_F   = '#F4C4A1';
const SKIN_M   = '#E8A87C';
const HAIR_F   = '#3D2314';
const HAIR_M   = '#1E1610';
const CYAN_TOP = '#00C8D4';
const DARK_LEG = '#0A3038';
const NAVY     = '#0B1D2E';
const SHOE_C   = '#191722';
const SOLE_C   = '#111';

// ─── Female figure ────────────────────────────────────────────────────────
function FemaleFigure() {
  return (
    <G>
      <Ellipse cx={100} cy={32} rx={32} ry={25} fill={HAIR_F} />
      <Path d="M 70 44 Q 62 65 64 90 Q 72 78 80 74 Z" fill={HAIR_F} />
      <Path d="M 130 44 Q 138 65 136 90 Q 128 78 120 74 Z" fill={HAIR_F} />
      <Circle cx={100} cy={48} r={30} fill={SKIN_F} />
      <Path d="M 70 44 Q 72 12 100 10 Q 128 12 130 44 Q 118 32 100 30 Q 82 32 70 44 Z" fill={HAIR_F} />
      <Ellipse cx={70} cy={50} rx={6} ry={9} fill={SKIN_F} />
      <Ellipse cx={130} cy={50} rx={6} ry={9} fill={SKIN_F} />
      <Path d="M 83 37 Q 88 34 93 36" stroke={HAIR_F} strokeWidth={2} fill="none" strokeLinecap="round" />
      <Path d="M 107 36 Q 112 34 117 37" stroke={HAIR_F} strokeWidth={2} fill="none" strokeLinecap="round" />
      <Ellipse cx={88} cy={45} rx={5} ry={6} fill="#281208" />
      <Ellipse cx={112} cy={45} rx={5} ry={6} fill="#281208" />
      <Circle cx={90} cy={43} r={1.8} fill="rgba(255,255,255,0.88)" />
      <Circle cx={114} cy={43} r={1.8} fill="rgba(255,255,255,0.88)" />
      <Path d="M 100 53 Q 97 58 100 60 Q 103 58 100 53" fill="rgba(0,0,0,0.09)" />
      <Path d="M 93 64 Q 100 68 107 64 Q 104 70 100 71 Q 96 70 93 64 Z" fill="#E88275" opacity={0.7} />
      <Rect x={91} y={76} width={18} height={16} rx={6} fill={SKIN_F} />
      <Ellipse cx={54} cy={102} rx={22} ry={17} fill={SKIN_F} />
      <Ellipse cx={146} cy={102} rx={22} ry={17} fill={SKIN_F} />
      <Path d="M 44,102 Q 34,144 31,182" stroke={SKIN_F} strokeWidth={19} fill="none" strokeLinecap="round" />
      <Path d="M 31,182 Q 26,218 24,254" stroke={SKIN_F} strokeWidth={15} fill="none" strokeLinecap="round" />
      <Ellipse cx={23} cy={262} rx={10} ry={12} fill={SKIN_F} />
      <Path d="M 156,102 Q 166,144 169,182" stroke={SKIN_F} strokeWidth={19} fill="none" strokeLinecap="round" />
      <Path d="M 169,182 Q 174,218 176,254" stroke={SKIN_F} strokeWidth={15} fill="none" strokeLinecap="round" />
      <Ellipse cx={177} cy={262} rx={10} ry={12} fill={SKIN_F} />
      <Path d="M 44,102 Q 38,122 40,138 Q 64,155 100,156 Q 136,155 160,138 Q 162,122 156,102 Q 132,95 100,93 Q 68,95 44,102 Z" fill={CYAN_TOP} />
      <Path d="M 40,136 Q 70,152 100,153 Q 130,152 160,136 Q 130,146 100,147 Q 70,146 40,136 Z" fill={`${CYAN_TOP}88`} />
      <Path d="M 52,152 Q 56,174 60,187 Q 78,196 100,197 Q 122,196 140,187 Q 144,174 148,152 Q 124,158 100,158 Q 76,158 52,152 Z" fill={SKIN_F} />
      <Path d="M 58,184 Q 62,202 64,218 L 136,218 Q 138,202 142,184 Q 120,197 100,197 Q 80,197 58,184 Z" fill={DARK_LEG} />
      <Path d="M 58,184 Q 100,198 142,184" stroke={`${CYAN_TOP}55`} strokeWidth={2.5} fill="none" />
      <Path d="M 64,218 Q 58,286 56,350 Q 56,366 60,384 L 80,384 Q 84,366 86,350 Q 92,286 100,218 Z" fill={DARK_LEG} />
      <Path d="M 136,218 Q 142,286 144,350 Q 144,366 140,384 L 120,384 Q 116,366 114,350 Q 108,286 100,218 Z" fill={DARK_LEG} />
      <Path d="M 100,218 L 100,370" stroke={`${DARK_LEG}88`} strokeWidth={1.5} fill="none" />
      <Ellipse cx={70} cy={308} rx={8} ry={10} fill={`${CYAN_TOP}18`} />
      <Ellipse cx={130} cy={308} rx={8} ry={10} fill={`${CYAN_TOP}18`} />
      <Path d="M 56,382 Q 50,394 48,408 Q 52,416 72,416 Q 86,416 88,406 Q 86,394 82,382 Z" fill={SHOE_C} />
      <Ellipse cx={68} cy={414} rx={22} ry={5} fill={SOLE_C} />
      <Path d="M 144,382 Q 150,394 152,408 Q 148,416 128,416 Q 114,416 112,406 Q 114,394 118,382 Z" fill={SHOE_C} />
      <Ellipse cx={132} cy={414} rx={22} ry={5} fill={SOLE_C} />
    </G>
  );
}

// ─── Male figure ──────────────────────────────────────────────────────────
function MaleFigure() {
  return (
    <G>
      <Path d="M 64,34 Q 66,8 100,6 Q 134,8 136,34 Q 126,20 100,18 Q 74,20 64,34 Z" fill={HAIR_M} />
      <Circle cx={100} cy={50} r={32} fill={SKIN_M} />
      <Path d="M 64,34 Q 66,8 100,6 Q 134,8 136,34 Q 124,24 100,22 Q 76,24 64,34 Z" fill={HAIR_M} />
      <Ellipse cx={68} cy={52} rx={7} ry={10} fill={SKIN_M} />
      <Ellipse cx={132} cy={52} rx={7} ry={10} fill={SKIN_M} />
      <Path d="M 82 40 Q 88 37 94 39" stroke={HAIR_M} strokeWidth={2.5} fill="none" strokeLinecap="round" />
      <Path d="M 106 39 Q 112 37 118 40" stroke={HAIR_M} strokeWidth={2.5} fill="none" strokeLinecap="round" />
      <Ellipse cx={88} cy={47} rx={5.5} ry={6.5} fill="#281208" />
      <Ellipse cx={112} cy={47} rx={5.5} ry={6.5} fill="#281208" />
      <Circle cx={90} cy={45} r={2} fill="rgba(255,255,255,0.88)" />
      <Circle cx={114} cy={45} r={2} fill="rgba(255,255,255,0.88)" />
      <Path d="M 98 56 Q 96 62 100 64 Q 104 62 102 56" fill="rgba(0,0,0,0.1)" />
      <Path d="M 92 70 Q 100 73 108 70" stroke="#B06050" strokeWidth={2} fill="none" strokeLinecap="round" />
      <Rect x={86} y={79} width={28} height={18} rx={7} fill={SKIN_M} />
      <Ellipse cx={44} cy={106} rx={26} ry={19} fill={SKIN_M} />
      <Ellipse cx={156} cy={106} rx={26} ry={19} fill={SKIN_M} />
      <Path d="M 30,106 Q 20,150 18,188" stroke={SKIN_M} strokeWidth={25} fill="none" strokeLinecap="round" />
      <Path d="M 18,188 Q 14,226 12,264" stroke={SKIN_M} strokeWidth={21} fill="none" strokeLinecap="round" />
      <Ellipse cx={11} cy={274} rx={12} ry={14} fill={SKIN_M} />
      <Path d="M 170,106 Q 180,150 182,188" stroke={SKIN_M} strokeWidth={25} fill="none" strokeLinecap="round" />
      <Path d="M 182,188 Q 186,226 188,264" stroke={SKIN_M} strokeWidth={21} fill="none" strokeLinecap="round" />
      <Ellipse cx={189} cy={274} rx={12} ry={14} fill={SKIN_M} />
      <Path d="M 30,106 Q 24,140 28,172 Q 54,188 100,190 Q 146,188 172,172 Q 176,140 170,106 Q 144,98 100,96 Q 56,98 30,106 Z" fill={NAVY} />
      <Ellipse cx={36} cy={116} rx={18} ry={22} fill={SKIN_M} />
      <Ellipse cx={164} cy={116} rx={18} ry={22} fill={SKIN_M} />
      <Path d="M 48,96 Q 34,104 28,126 Q 34,120 50,118 Z" fill={NAVY} />
      <Path d="M 152,96 Q 166,104 172,126 Q 166,120 150,118 Z" fill={NAVY} />
      <Path d="M 96,138 L 96,185" stroke={`${NAVY}99`} strokeWidth={2} fill="none" />
      <Path d="M 104,138 L 104,185" stroke={`${NAVY}99`} strokeWidth={2} fill="none" />
      <Path d="M 84,153 Q 100,149 116,153" stroke={`${NAVY}66`} strokeWidth={1.5} fill="none" />
      <Path d="M 84,168 Q 100,164 116,168" stroke={`${NAVY}66`} strokeWidth={1.5} fill="none" />
      <Path d="M 52,188 Q 55,208 58,222 L 142,222 Q 145,208 148,188 Q 124,194 100,194 Q 76,194 52,188 Z" fill={`${NAVY}EE`} />
      <Path d="M 58,222 Q 54,258 56,278 L 92,278 Q 92,256 98,222 Z" fill={NAVY} />
      <Path d="M 142,222 Q 146,258 144,278 L 108,278 Q 108,256 102,222 Z" fill={NAVY} />
      <Path d="M 56,278 Q 52,330 54,375 L 76,375 Q 80,330 92,278 Z" fill={SKIN_M} />
      <Path d="M 144,278 Q 148,330 146,375 L 124,375 Q 120,330 108,278 Z" fill={SKIN_M} />
      <Path d="M 52,360 Q 48,376 50,392 L 82,392 Q 82,376 76,360 Z" fill="rgba(255,255,255,0.88)" />
      <Path d="M 148,360 Q 152,376 150,392 L 118,392 Q 118,376 124,360 Z" fill="rgba(255,255,255,0.88)" />
      <Path d="M 46,388 Q 40,400 38,416 Q 42,424 68,424 Q 88,424 92,412 Q 90,400 84,388 Z" fill={SHOE_C} />
      <Ellipse cx={65} cy={422} rx={28} ry={6} fill={SOLE_C} />
      <Path d="M 154,388 Q 160,400 162,416 Q 158,424 132,424 Q 112,424 108,412 Q 110,400 116,388 Z" fill={SHOE_C} />
      <Ellipse cx={135} cy={422} rx={28} ry={6} fill={SOLE_C} />
    </G>
  );
}

// ─── Main animated component ──────────────────────────────────────────────
const VB_W = 200;
const VB_H = 430;

export default function Avatar({ gender, params, size = 200, minimal = false }: Props) {
  const svgH = Math.round(size * (VB_H / VB_W));

  // Floating idle (up / down)
  const floatAnim  = useRef(new Animated.Value(0)).current;
  // Breathing (scale)
  const breathAnim = useRef(new Animated.Value(1)).current;
  // Subtle sway (left / right)
  const swayAnim   = useRef(new Animated.Value(0)).current;
  // Glow pulse
  const glowAnim   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Float: 0 → -10 → 0 every 3 s
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -10, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue:   0, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();

    // Breathe: 1 → 1.025 → 1 every 2.4 s
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathAnim, { toValue: 1.025, duration: 1200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(breathAnim, { toValue: 1,     duration: 1200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    ).start();

    // Sway: 0 → 3 → 0 → -3 → 0 every 5 s
    Animated.loop(
      Animated.sequence([
        Animated.timing(swayAnim, { toValue:  3, duration: 1250, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(swayAnim, { toValue:  0, duration: 1250, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(swayAnim, { toValue: -3, duration: 1250, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(swayAnim, { toValue:  0, duration: 1250, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();

    // Glow pulse: 0 → 1 → 0 every 2 s
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 1000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const glowBaseAlpha = 0.18 + params.toneLevel * 0.20;

  return (
    <View style={{ width: size, height: svgH, alignItems: 'center' }}>

      {/* Animated glow ring behind character */}
      {!minimal && (
        <Animated.View
          style={{
            position:        'absolute',
            alignSelf:       'center',
            top:             svgH * 0.12,
            width:           size * 0.5,
            height:          svgH * 0.55,
            borderRadius:    9999,
            backgroundColor: '#00F2FF',
            opacity:         glowAnim.interpolate({ inputRange: [0, 1], outputRange: [glowBaseAlpha, glowBaseAlpha + 0.12] }),
            transform:       [{ translateY: floatAnim }],
            // web box-shadow
            ...({ boxShadow: `0 0 ${Math.round(size * 0.9)}px ${Math.round(size * 0.45)}px rgba(0,242,255,0.35)` } as any),
          }}
        />
      )}

      {/* Character — float + breathe + sway */}
      <Animated.View
        style={{
          transform: [
            { translateY: floatAnim },
            { translateX: swayAnim  },
            { scale:      breathAnim },
          ],
        }}
      >
        <Svg viewBox={`0 0 ${VB_W} ${VB_H}`} width={size} height={svgH}>
          <Defs>
            <LGrad id="fade" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%"   stopColor="#0A0A0A" stopOpacity={0} />
              <Stop offset="100%" stopColor="#0A0A0A" stopOpacity={1} />
            </LGrad>
          </Defs>

          {gender === 'female' ? <FemaleFigure /> : <MaleFigure />}

          {/* Bottom fade */}
          {!minimal && (
            <Rect x={0} y={330} width={200} height={100} fill="url(#fade)" />
          )}
        </Svg>
      </Animated.View>
    </View>
  );
}
