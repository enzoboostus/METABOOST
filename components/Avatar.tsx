import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import Svg, {
  Circle, Ellipse, Rect, Path, G,
  Defs, LinearGradient as LGrad, Stop,
} from 'react-native-svg';
import { AvatarParams } from '@/hooks/useAvatarParams';

interface Props {
  gender: 'male' | 'female';
  params: AvatarParams;
  size?: number;
  minimal?: boolean;
}

const SKIN  = '#C07438';
const SKIND = '#9A5C28';
const HAIR  = '#0D0600';
const BLK   = '#111118';
const BLKH  = '#1E1E2A';
const SOLE  = '#080810';
const EYEC  = '#1A0C04';
const LIPC  = '#7A3D1E';
const WHT   = 'rgba(255,255,255,0.82)';

const VB_W = 200;
const VB_H = 520;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.min(1, Math.max(0, t));
}

function bmiT(bmi: number) {
  return (bmi - 18) / 16;
}

// ── Female figure ─────────────────────────────────────────────────────────

function FemaleFigure({ bmi }: { bmi: number }) {
  const t  = bmiT(bmi);
  const cx = 100;

  const sW  = lerp(26, 38, t);
  const buW = lerp(18, 31, t);
  const wW  = lerp(13, 28, t);
  const hW  = lerp(22, 40, t);
  const tW  = lerp(9,  18, t);
  const cW  = lerp(5,  10, t);
  const aW  = lerp(5,   9, t);

  const fcY = 50;
  const shY = 92;
  const bbY = 124;
  const mbY = 150;
  const htY = 152;
  const crY = 255;
  const knY = 363;
  const anY = 466;
  const sbY = 506;
  const hY  = shY + 176;

  const lAox = cx - sW + 3;
  const lAix = cx - sW + 3 + aW * 2;
  const lHox = cx - sW - 7;
  const lHix = cx - sW - 7 + aW * 2;
  const rAox = cx + sW - 3;
  const rAix = cx + sW - 3 - aW * 2;
  const rHox = cx + sW + 7;
  const rHix = cx + sW + 7 - aW * 2;

  return (
    <G>
      {/* Hair back */}
      <Ellipse cx={cx} cy={fcY} rx={30} ry={28} fill={HAIR} />
      {/* Bun */}
      <Ellipse cx={cx}    cy={12} rx={18} ry={15} fill={HAIR} />
      <Ellipse cx={cx-9}  cy={18} rx={11} ry={9}  fill={HAIR} />
      <Ellipse cx={cx+9}  cy={18} rx={11} ry={9}  fill={HAIR} />
      <Ellipse cx={cx}    cy={8}  rx={12} ry={9}  fill={HAIR} />
      {/* Curly wisps at sides */}
      <Path d={`M ${cx-27} ${fcY-6} Q ${cx-33} ${fcY+6} ${cx-28} ${fcY+18}`}
        stroke={HAIR} strokeWidth={4} fill="none" strokeLinecap="round" />
      <Path d={`M ${cx+27} ${fcY-6} Q ${cx+33} ${fcY+6} ${cx+28} ${fcY+18}`}
        stroke={HAIR} strokeWidth={4} fill="none" strokeLinecap="round" />

      {/* Arms — drawn before torso so bra overlaps shoulders */}
      <Path
        d={`M ${lAox} ${shY} Q ${lAox-9} ${shY+90} ${lHox} ${hY} L ${lHix} ${hY} Q ${lAix-9} ${shY+90} ${lAix} ${shY} Z`}
        fill={SKIN}
      />
      <Path
        d={`M ${rAox} ${shY} Q ${rAox+9} ${shY+90} ${rHox} ${hY} L ${rHix} ${hY} Q ${rAix+9} ${shY+90} ${rAix} ${shY} Z`}
        fill={SKIN}
      />
      <Ellipse cx={lHox + aW} cy={hY + 8} rx={aW + 1} ry={5.5} fill={SKIN} />
      <Ellipse cx={rHox - aW} cy={hY + 8} rx={aW + 1} ry={5.5} fill={SKIN} />

      {/* Face */}
      <Ellipse cx={cx} cy={fcY + 2} rx={27} ry={28} fill={SKIN} />
      <Ellipse cx={cx - 26} cy={fcY + 4} rx={4}   ry={6}   fill={SKIN} />
      <Ellipse cx={cx + 26} cy={fcY + 4} rx={4}   ry={6}   fill={SKIN} />
      {/* Hair front */}
      <Path d={`M ${cx-26} ${fcY-16} Q ${cx} ${22} ${cx+26} ${fcY-16}`} fill={HAIR} />
      {/* Eyebrows */}
      <Path d={`M ${cx-16} ${fcY-7} Q ${cx-8} ${fcY-11} ${cx-3} ${fcY-9}`}
        stroke={HAIR} strokeWidth={2} fill="none" strokeLinecap="round" />
      <Path d={`M ${cx+3} ${fcY-9} Q ${cx+8} ${fcY-11} ${cx+16} ${fcY-7}`}
        stroke={HAIR} strokeWidth={2} fill="none" strokeLinecap="round" />
      {/* Eyes */}
      <Ellipse cx={cx - 9} cy={fcY - 1} rx={5.5} ry={6}   fill={EYEC} />
      <Ellipse cx={cx + 9} cy={fcY - 1} rx={5.5} ry={6}   fill={EYEC} />
      <Circle  cx={cx - 8} cy={fcY - 3} r={1.8}            fill={WHT} />
      <Circle  cx={cx + 10} cy={fcY - 3} r={1.8}           fill={WHT} />
      {/* Nose */}
      <Path d={`M ${cx} ${fcY+5} Q ${cx-4} ${fcY+12} ${cx-5} ${fcY+14} Q ${cx} ${fcY+16} ${cx+5} ${fcY+14} Q ${cx+4} ${fcY+12} ${cx} ${fcY+5}`}
        fill={SKIND} opacity={0.5} />
      {/* Lips */}
      <Path d={`M ${cx-7} ${fcY+18} Q ${cx} ${fcY+16} ${cx+7} ${fcY+18} Q ${cx+4} ${fcY+22} ${cx} ${fcY+23} Q ${cx-4} ${fcY+22} ${cx-7} ${fcY+18} Z`}
        fill={LIPC} />
      <Ellipse cx={cx - 18} cy={fcY + 8} rx={8} ry={5} fill={SKIND} opacity={0.2} />
      <Ellipse cx={cx + 18} cy={fcY + 8} rx={8} ry={5} fill={SKIND} opacity={0.2} />

      {/* Neck */}
      <Rect x={cx - 6} y={fcY + 26} width={12} height={14} rx={5} fill={SKIN} />

      {/* Sports bra */}
      <Path
        d={`M ${cx-sW+2} ${shY} Q ${cx-buW-2} ${shY+28} ${cx-buW} ${bbY} L ${cx+buW} ${bbY} Q ${cx+buW+2} ${shY+28} ${cx+sW-2} ${shY} Z`}
        fill={BLK}
      />
      <Path d={`M ${cx-sW+5} ${shY+2} Q ${cx-8} ${shY+20} ${cx-5} ${bbY}`}
        stroke={BLKH} strokeWidth={7} fill="none" strokeLinecap="round" />
      <Path d={`M ${cx+sW-5} ${shY+2} Q ${cx+8} ${shY+20} ${cx+5} ${bbY}`}
        stroke={BLKH} strokeWidth={7} fill="none" strokeLinecap="round" />
      <Path d={`M ${cx-buW} ${bbY} Q ${cx} ${bbY+6} ${cx+buW} ${bbY}`}
        stroke={BLKH} strokeWidth={6} fill="none" />

      {/* Midriff skin */}
      <Path
        d={`M ${cx-buW} ${bbY} Q ${cx-wW-2} ${(bbY+mbY)/2} ${cx-wW} ${mbY} L ${cx+wW} ${mbY} Q ${cx+wW+2} ${(bbY+mbY)/2} ${cx+buW} ${bbY} Z`}
        fill={SKIN}
      />
      <Circle cx={cx} cy={(bbY + mbY) / 2 + 5} r={2.5} fill={SKIND} opacity={0.45} />

      {/* Waistband */}
      <Path
        d={`M ${cx-hW-2} ${htY+5} Q ${cx} ${htY-3} ${cx+hW+2} ${htY+5} L ${cx+hW} ${htY+16} Q ${cx} ${htY+10} ${cx-hW} ${htY+16} Z`}
        fill={BLKH}
      />
      {/* Upper legging / hip block */}
      <Path
        d={`M ${cx-hW} ${htY+16} Q ${cx-hW+2} ${crY-24} ${cx-tW} ${crY} Q ${cx-2} ${crY+6} ${cx+2} ${crY+6} Q ${cx+tW} ${crY} ${cx+hW-2} ${crY-24} Q ${cx+hW} ${htY+16} ${cx} ${htY+16} Z`}
        fill={BLK}
      />
      {/* Left leg */}
      <Path
        d={`M ${cx-tW} ${crY} Q ${cx-tW-2} ${knY-18} ${cx-cW-2} ${knY} Q ${cx-cW} ${anY-18} ${cx-cW} ${anY} L ${cx-2} ${anY} Q ${cx-2} ${anY-18} ${cx-2} ${knY} Q ${cx-2} ${crY+8} ${cx-2} ${crY+6} Z`}
        fill={BLK}
      />
      {/* Right leg */}
      <Path
        d={`M ${cx+tW} ${crY} Q ${cx+tW+2} ${knY-18} ${cx+cW+2} ${knY} Q ${cx+cW} ${anY-18} ${cx+cW} ${anY} L ${cx+2} ${anY} Q ${cx+2} ${anY-18} ${cx+2} ${knY} Q ${cx+2} ${crY+8} ${cx+2} ${crY+6} Z`}
        fill={BLK}
      />
      <Ellipse cx={cx - cW - 1} cy={knY} rx={cW - 1} ry={4.5} fill={BLKH} opacity={0.7} />
      <Ellipse cx={cx + cW + 1} cy={knY} rx={cW - 1} ry={4.5} fill={BLKH} opacity={0.7} />

      {/* Left shoe */}
      <Path
        d={`M ${cx-cW} ${anY} Q ${cx-cW-12} ${anY+20} ${cx-cW-15} ${anY+36} Q ${cx-cW-15} ${sbY} ${cx-cW+12} ${sbY} L ${cx-2} ${sbY} L ${cx-2} ${anY} Z`}
        fill={BLK}
      />
      <Ellipse cx={cx - cW - 3} cy={sbY - 1} rx={14} ry={4} fill={SOLE} />
      {/* Right shoe */}
      <Path
        d={`M ${cx+cW} ${anY} Q ${cx+cW+12} ${anY+20} ${cx+cW+15} ${anY+36} Q ${cx+cW+15} ${sbY} ${cx+cW-12} ${sbY} L ${cx+2} ${sbY} L ${cx+2} ${anY} Z`}
        fill={BLK}
      />
      <Ellipse cx={cx + cW + 3} cy={sbY - 1} rx={14} ry={4} fill={SOLE} />
    </G>
  );
}

// ── Male figure ───────────────────────────────────────────────────────────

function MaleFigure({ bmi }: { bmi: number }) {
  const t  = bmiT(bmi);
  const cx = 100;

  const sW  = lerp(33, 46, t);
  const chW = lerp(25, 38, t);
  const wW  = lerp(20, 36, t);
  const hW  = lerp(22, 36, t);
  const tW  = lerp(11, 21, t);
  const cW  = lerp(7,  13, t);
  const aW  = lerp(7,  12, t);

  const fcY = 54;
  const shY = 100;
  const tbY = 198;
  const htY = 200;
  const ssB = 310;
  const knY = 386;
  const anY = 468;
  const sbY = 510;
  const hY  = shY + 182;

  const lAox = cx - sW + 4;
  const lAix = cx - sW + 4 + aW * 2;
  const lHox = cx - sW - 10;
  const lHix = cx - sW - 10 + aW * 2;
  const rAox = cx + sW - 4;
  const rAix = cx + sW - 4 - aW * 2;
  const rHox = cx + sW + 10;
  const rHix = cx + sW + 10 - aW * 2;

  return (
    <G>
      {/* Short curly hair */}
      <Ellipse cx={cx}    cy={fcY - 6}  rx={32} ry={30} fill={HAIR} />
      <Ellipse cx={cx-16} cy={fcY - 26} rx={9}  ry={8}  fill={HAIR} />
      <Ellipse cx={cx+16} cy={fcY - 26} rx={9}  ry={8}  fill={HAIR} />
      <Ellipse cx={cx}    cy={fcY - 30} rx={10} ry={8}  fill={HAIR} />
      <Ellipse cx={cx-7}  cy={fcY - 22} rx={7}  ry={6}  fill={HAIR} />
      <Ellipse cx={cx+7}  cy={fcY - 22} rx={7}  ry={6}  fill={HAIR} />

      {/* Arms — drawn before torso */}
      <Path
        d={`M ${lAox} ${shY} Q ${lAox-12} ${shY+90} ${lHox} ${hY} L ${lHix} ${hY} Q ${lAix-12} ${shY+90} ${lAix} ${shY} Z`}
        fill={SKIN}
      />
      <Path
        d={`M ${rAox} ${shY} Q ${rAox+12} ${shY+90} ${rHox} ${hY} L ${rHix} ${hY} Q ${rAix+12} ${shY+90} ${rAix} ${shY} Z`}
        fill={SKIN}
      />
      <Ellipse cx={lHox + aW} cy={hY + 10} rx={aW + 1} ry={7} fill={SKIN} />
      <Ellipse cx={rHox - aW} cy={hY + 10} rx={aW + 1} ry={7} fill={SKIN} />

      {/* Face */}
      <Ellipse cx={cx} cy={fcY + 1} rx={30} ry={32} fill={SKIN} />
      <Ellipse cx={cx - 30} cy={fcY + 4} rx={5} ry={7} fill={SKIN} />
      <Ellipse cx={cx + 30} cy={fcY + 4} rx={5} ry={7} fill={SKIN} />
      {/* Hair front */}
      <Path d={`M ${cx-28} ${fcY-22} Q ${cx} ${18} ${cx+28} ${fcY-22}`} fill={HAIR} />
      {/* Eyebrows */}
      <Path d={`M ${cx-17} ${fcY-10} Q ${cx-9} ${fcY-14} ${cx-3} ${fcY-11}`}
        stroke={HAIR} strokeWidth={3} fill="none" strokeLinecap="round" />
      <Path d={`M ${cx+3} ${fcY-11} Q ${cx+9} ${fcY-14} ${cx+17} ${fcY-10}`}
        stroke={HAIR} strokeWidth={3} fill="none" strokeLinecap="round" />
      {/* Eyes */}
      <Ellipse cx={cx - 9}  cy={fcY - 2} rx={5.5} ry={6}  fill={EYEC} />
      <Ellipse cx={cx + 9}  cy={fcY - 2} rx={5.5} ry={6}  fill={EYEC} />
      <Circle  cx={cx - 8}  cy={fcY - 4} r={1.8}           fill={WHT} />
      <Circle  cx={cx + 10} cy={fcY - 4} r={1.8}           fill={WHT} />
      {/* Nose */}
      <Path d={`M ${cx} ${fcY+5} Q ${cx-5} ${fcY+14} ${cx-6} ${fcY+18} Q ${cx} ${fcY+21} ${cx+6} ${fcY+18} Q ${cx+5} ${fcY+14} ${cx} ${fcY+5}`}
        fill={SKIND} opacity={0.5} />
      {/* Lips */}
      <Path d={`M ${cx-9} ${fcY+23} Q ${cx} ${fcY+21} ${cx+9} ${fcY+23} Q ${cx+5} ${fcY+27} ${cx} ${fcY+28} Q ${cx-5} ${fcY+27} ${cx-9} ${fcY+23} Z`}
        fill={LIPC} opacity={0.6} />

      {/* Neck */}
      <Rect x={cx - 9} y={fcY + 31} width={18} height={16} rx={6} fill={SKIN} />

      {/* Tank top */}
      <Path
        d={`M ${cx-sW+2} ${shY} Q ${cx-chW-2} ${shY+36} ${cx-chW} ${shY+70} Q ${cx-wW-2} ${tbY-30} ${cx-wW} ${tbY} L ${cx+wW} ${tbY} Q ${cx+wW+2} ${tbY-30} ${cx+chW} ${shY+70} Q ${cx+chW+2} ${shY+36} ${cx+sW-2} ${shY} Z`}
        fill={BLK}
      />
      {/* Tank shoulder straps (thick) */}
      <Path d={`M ${cx-sW+5} ${shY} Q ${cx-sW+9} ${shY+10} ${cx-sW+9} ${shY+20}`}
        stroke={BLKH} strokeWidth={12} fill="none" strokeLinecap="round" />
      <Path d={`M ${cx+sW-5} ${shY} Q ${cx+sW-9} ${shY+10} ${cx+sW-9} ${shY+20}`}
        stroke={BLKH} strokeWidth={12} fill="none" strokeLinecap="round" />
      {/* Collar scoop */}
      <Path d={`M ${cx-sW+16} ${shY+2} Q ${cx} ${shY+24} ${cx+sW-16} ${shY+2}`}
        stroke={BLKH} strokeWidth={2.5} fill="none" />
      {/* Muscle lines */}
      <Path d={`M ${cx-4} ${shY+50} L ${cx-4} ${tbY-10}`}
        stroke={BLKH} strokeWidth={1.5} fill="none" opacity={0.5} />
      <Path d={`M ${cx+4} ${shY+50} L ${cx+4} ${tbY-10}`}
        stroke={BLKH} strokeWidth={1.5} fill="none" opacity={0.5} />

      {/* Shorts waistband */}
      <Path
        d={`M ${cx-hW-2} ${htY+4} Q ${cx} ${htY-4} ${cx+hW+2} ${htY+4} L ${cx+hW} ${htY+16} Q ${cx} ${htY+10} ${cx-hW} ${htY+16} Z`}
        fill={BLKH}
      />
      {/* Shorts body */}
      <Path
        d={`M ${cx-hW} ${htY+16} Q ${cx-tW-4} ${ssB-12} ${cx-tW-4} ${ssB} L ${cx+tW+4} ${ssB} Q ${cx+tW+4} ${ssB-12} ${cx+hW} ${htY+16} Q ${cx} ${htY+12} ${cx-hW} ${htY+16} Z`}
        fill={BLK}
      />
      <Path d={`M ${cx} ${htY+14} Q ${cx} ${ssB-28} ${cx-1} ${ssB}`}
        stroke={BLKH} strokeWidth={1.5} fill="none" />
      <Path d={`M ${cx-tW-4} ${ssB} Q ${cx} ${ssB+5} ${cx+tW+4} ${ssB}`}
        stroke={BLKH} strokeWidth={3} fill="none" />

      {/* Legs skin below shorts */}
      <Path
        d={`M ${cx-tW-4} ${ssB} Q ${cx-tW-2} ${knY-16} ${cx-cW-2} ${knY} Q ${cx-cW} ${anY-18} ${cx-cW} ${anY} L ${cx-3} ${anY} Q ${cx-3} ${anY-18} ${cx-3} ${knY} Q ${cx-4} ${knY-16} ${cx-4} ${ssB} Z`}
        fill={SKIN}
      />
      <Path
        d={`M ${cx+tW+4} ${ssB} Q ${cx+tW+2} ${knY-16} ${cx+cW+2} ${knY} Q ${cx+cW} ${anY-18} ${cx+cW} ${anY} L ${cx+3} ${anY} Q ${cx+3} ${anY-18} ${cx+3} ${knY} Q ${cx+4} ${knY-16} ${cx+4} ${ssB} Z`}
        fill={SKIN}
      />
      <Ellipse cx={cx - cW - 1} cy={knY} rx={cW}   ry={6} fill={SKIND} opacity={0.25} />
      <Ellipse cx={cx + cW + 1} cy={knY} rx={cW}   ry={6} fill={SKIND} opacity={0.25} />

      {/* Left shoe */}
      <Path
        d={`M ${cx-cW} ${anY} Q ${cx-cW-14} ${anY+20} ${cx-cW-18} ${anY+38} Q ${cx-cW-18} ${sbY-2} ${cx-cW+14} ${sbY} L ${cx-3} ${sbY} L ${cx-3} ${anY} Z`}
        fill={BLK}
      />
      <Ellipse cx={cx - cW - 4} cy={sbY - 1} rx={18} ry={4.5} fill={SOLE} />
      {/* Right shoe */}
      <Path
        d={`M ${cx+cW} ${anY} Q ${cx+cW+14} ${anY+20} ${cx+cW+18} ${anY+38} Q ${cx+cW+18} ${sbY-2} ${cx+cW-14} ${sbY} L ${cx+3} ${sbY} L ${cx+3} ${anY} Z`}
        fill={BLK}
      />
      <Ellipse cx={cx + cW + 4} cy={sbY - 1} rx={18} ry={4.5} fill={SOLE} />
    </G>
  );
}

// ── Main animated component ───────────────────────────────────────────────

export default function Avatar({ gender, params, size = 200, minimal = false }: Props) {
  const svgH = Math.round(size * (VB_H / VB_W));

  const floatAnim  = useRef(new Animated.Value(0)).current;
  const breathAnim = useRef(new Animated.Value(1)).current;
  const swayAnim   = useRef(new Animated.Value(0)).current;
  const glowAnim   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -10, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue:   0, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(breathAnim, { toValue: 1.025, duration: 1200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(breathAnim, { toValue: 1,     duration: 1200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(swayAnim, { toValue:  3, duration: 1250, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(swayAnim, { toValue:  0, duration: 1250, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(swayAnim, { toValue: -3, duration: 1250, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(swayAnim, { toValue:  0, duration: 1250, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 1000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const glowBase = 0.18 + params.toneLevel * 0.20;

  return (
    <View style={{ width: size, height: svgH, alignItems: 'center' }}>
      {!minimal && (
        <Animated.View
          style={{
            position:        'absolute',
            alignSelf:       'center',
            top:             svgH * 0.12,
            width:           size * 0.5,
            height:          svgH * 0.55,
            borderRadius:    9999,
            backgroundColor: '#E2D1B3',
            opacity:         glowAnim.interpolate({ inputRange: [0, 1], outputRange: [glowBase, glowBase + 0.12] }),
            transform:       [{ translateY: floatAnim }],
            ...({ boxShadow: `0 0 ${Math.round(size * 0.9)}px ${Math.round(size * 0.45)}px rgba(226,209,179,0.28)` } as any),
          }}
        />
      )}

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
              <Stop offset="0%"   stopColor="#0A1128" stopOpacity={0} />
              <Stop offset="100%" stopColor="#0A1128" stopOpacity={1} />
            </LGrad>
          </Defs>
          {gender === 'female' ? <FemaleFigure bmi={params.bmi} /> : <MaleFigure bmi={params.bmi} />}
          {!minimal && (
            <Rect x={0} y={380} width={200} height={140} fill="url(#fade)" />
          )}
        </Svg>
      </Animated.View>
    </View>
  );
}
