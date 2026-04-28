import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, View } from 'react-native';
import Svg, {
  Defs, Ellipse, LinearGradient as SvgLG,
  Path, RadialGradient as SvgRG, Stop,
} from 'react-native-svg';
import { AvatarParams } from '@/hooks/useAvatarParams';

interface Props {
  gender: 'male' | 'female';
  params: AvatarParams;
  size?: number;
  minimal?: boolean;
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

const q = (n: number) => Math.round(n * 10) / 10;

type Morph = 'slim' | 'athletic' | 'full';
function getMorph(bmi: number): Morph {
  if (bmi < 18.5) return 'slim';
  if (bmi < 30)   return 'athletic';
  return 'full';
}

// Body dimension ratios (fraction of size/height)
const DIMS = {
  male: {
    slim:     { shW:.268, chW:.270, waW:.148, hiW:.185, lx:.090, thW:.090, caW:.066, anW:.046, arW:.054 },
    athletic: { shW:.318, chW:.332, waW:.176, hiW:.228, lx:.108, thW:.118, caW:.085, anW:.055, arW:.071 },
    full:     { shW:.340, chW:.372, waW:.298, hiW:.345, lx:.118, thW:.155, caW:.108, anW:.068, arW:.088 },
  },
  female: {
    slim:     { shW:.232, chW:.235, waW:.135, hiW:.205, lx:.086, thW:.092, caW:.066, anW:.044, arW:.048 },
    athletic: { shW:.262, chW:.268, waW:.150, hiW:.258, lx:.098, thW:.114, caW:.080, anW:.050, arW:.060 },
    full:     { shW:.282, chW:.308, waW:.252, hiW:.350, lx:.112, thW:.148, caW:.102, anW:.062, arW:.075 },
  },
} as const;

// ── SVG character renderer ────────────────────────────────────────────────────
function CharSvg({ gender, morph, s, h }: {
  gender: 'male' | 'female'; morph: Morph; s: number; h: number;
}) {
  const cx = s / 2;
  const d  = DIMS[gender][morph];

  // Scaled widths
  const shW = s * d.shW; const chW = s * d.chW; const waW = s * d.waW;
  const hiW = s * d.hiW; const thW = s * d.thW; const caW = s * d.caW;
  const anW = s * d.anW; const arW = s * d.arW;
  const lLX = cx - s * d.lx;
  const rLX = cx + s * d.lx;

  // Y positions
  const hCY = h * .082;  const hRX = s * .122;  const hRY = s * .112;
  const nTY = hCY + hRY * .83;
  const nBY = h * .190;  const nHW = s * .045;
  const sY  = h * .193;
  const cY  = h * .228;
  const wY  = h * .402;
  const hiY = h * .440;
  const crY = h * .474;
  const knY = h * .670;
  const akY = h * .876;
  const stY = h * .882;
  const sbY = h * .918;
  const elY = wY * .968;
  const eLX = cx - shW - s * .013;
  const wrY = h * .520;
  const wrLX = cx - shW + s * .020;
  const haCY = h * .556;
  const haRX = arW * .82;
  const haRY = s * .056;

  // Colors — dark skin tones matching photos, dark navy outfit
  const SKH = '#C87848'; const SKM = '#A05830'; const SKD = '#703018';
  const OUH = '#1A2248'; const OUD = '#060810';
  const HAIR = '#180A08'; const SHH = '#181828'; const SHD = '#060608';

  // ── Arm path (L or R) ────────────────────────────────────────────
  const arm = (side: 'L' | 'R') => {
    const sgn = side === 'L' ? -1 : 1;
    const eX  = side === 'L' ? eLX : cx + (cx - eLX);
    const wX  = side === 'L' ? wrLX : cx + (cx - wrLX);
    const sO  = cx + sgn * shW;
    const sI  = cx + sgn * (shW - arW * 2);
    const eO  = eX + sgn * arW * .95;
    const eI  = eX - sgn * arW * .95;
    const wO  = wX + sgn * arW * .70;
    const wI  = wX - sgn * arW * .70;
    const ds  = s * .014 * sgn;
    return `M ${q(sO)},${q(sY)}
      C ${q(sO+ds)},${q(sY+h*.055)} ${q(eO)},${q(elY-h*.035)} ${q(eO)},${q(elY)}
      C ${q(eO)},${q(elY+h*.025)} ${q(wO)},${q(wrY-h*.022)} ${q(wO)},${q(wrY)}
      L ${q(wI)},${q(wrY)}
      C ${q(wI)},${q(wrY-h*.022)} ${q(eI)},${q(elY+h*.025)} ${q(eI)},${q(elY)}
      C ${q(eI)},${q(elY-h*.035)} ${q(sI-ds)},${q(sY+h*.055)} ${q(sI)},${q(sY)} Z`;
  };

  // ── Torso path ───────────────────────────────────────────────────
  const torso = () =>
    `M ${q(cx-nHW)},${q(nBY)}
     L ${q(cx-shW)},${q(sY)}
     C ${q(cx-chW-s*.018)},${q(cY-h*.01)} ${q(cx-chW)},${q(cY+h*.065)} ${q(cx-waW)},${q(wY)}
     L ${q(cx-hiW)},${q(hiY)}
     Q ${q(lLX+thW*.3)},${q(crY+h*.005)} ${q(cx)},${q(crY+h*.015)}
     Q ${q(rLX-thW*.3)},${q(crY+h*.005)} ${q(cx+hiW)},${q(hiY)}
     L ${q(cx+waW)},${q(wY)}
     C ${q(cx+chW)},${q(cY+h*.065)} ${q(cx+chW+s*.018)},${q(cY-h*.01)} ${q(cx+shW)},${q(sY)}
     L ${q(cx+nHW)},${q(nBY)} Z`;

  // ── Leg path ─────────────────────────────────────────────────────
  const leg = (side: 'L' | 'R') => {
    const lx = side === 'L' ? lLX : rLX;
    const kW = caW * 1.02;
    return `M ${q(lx-thW)},${q(crY)}
      C ${q(lx-thW)},${q(crY+h*.04)} ${q(lx-kW*1.08)},${q(knY-h*.04)} ${q(lx-kW)},${q(knY)}
      C ${q(lx-kW)},${q(knY+h*.018)} ${q(lx-caW)},${q(akY-h*.04)} ${q(lx-anW)},${q(stY)}
      L ${q(lx+anW)},${q(stY)}
      C ${q(lx+caW)},${q(akY-h*.04)} ${q(lx+kW)},${q(knY+h*.018)} ${q(lx+kW)},${q(knY)}
      C ${q(lx+kW*1.08)},${q(knY-h*.04)} ${q(lx+thW)},${q(crY+h*.04)} ${q(lx+thW)},${q(crY)} Z`;
  };

  // ── Shoe path ────────────────────────────────────────────────────
  const shoe = (side: 'L' | 'R') => {
    const lx  = side === 'L' ? lLX : rLX;
    const sw  = thW * .88;
    const toe = s * .026;
    return `M ${q(lx-anW)},${q(stY)}
      C ${q(lx-sw*1.12)},${q(stY+h*.005)} ${q(lx-sw*1.15)},${q(sbY-h*.003)} ${q(lx-sw*.95)},${q(sbY)}
      L ${q(lx+sw+toe)},${q(sbY)}
      C ${q(lx+sw*1.12+toe)},${q(sbY-h*.003)} ${q(lx+sw*1.05+toe)},${q(stY+h*.005)} ${q(lx+anW)},${q(stY)} Z`;
  };

  // ── Hair path ────────────────────────────────────────────────────
  const hair = () =>
    gender === 'male'
      ? `M ${q(cx-hRX*.96)},${q(hCY-hRY*.28)}
         C ${q(cx-hRX*1.04)},${q(hCY-hRY*1.22)} ${q(cx-hRX*.36)},${q(hCY-hRY*1.56)} ${q(cx)},${q(hCY-hRY*1.54)}
         C ${q(cx+hRX*.36)},${q(hCY-hRY*1.56)} ${q(cx+hRX*1.04)},${q(hCY-hRY*1.22)} ${q(cx+hRX*.96)},${q(hCY-hRY*.28)}
         C ${q(cx+hRX*.75)},${q(hCY-hRY*.10)} ${q(cx-hRX*.75)},${q(hCY-hRY*.10)} ${q(cx-hRX*.96)},${q(hCY-hRY*.28)} Z`
      : `M ${q(cx-hRX*.96)},${q(hCY-hRY*.22)}
         C ${q(cx-hRX*1.05)},${q(hCY-hRY*1.26)} ${q(cx-hRX*.38)},${q(hCY-hRY*1.60)} ${q(cx)},${q(hCY-hRY*1.58)}
         C ${q(cx+hRX*.38)},${q(hCY-hRY*1.60)} ${q(cx+hRX*1.05)},${q(hCY-hRY*1.26)} ${q(cx+hRX*.96)},${q(hCY-hRY*.22)}
         C ${q(cx+hRX*.80)},${q(hCY-hRY*.05)} ${q(cx-hRX*.80)},${q(hCY-hRY*.05)} ${q(cx-hRX*.96)},${q(hCY-hRY*.22)} Z`;

  const eyeW = q(hRX * .128); const eyeH = q(hRX * .112);
  const brow = q(s * (gender === 'male' ? .013 : .010));

  return (
    <>
      <Defs>
        <SvgLG id="av_suit" x1={q(cx-chW)} y1="0" x2={q(cx+chW)} y2="0" gradientUnits="userSpaceOnUse">
          <Stop offset="0%"   stopColor={OUD} />
          <Stop offset="42%"  stopColor={OUH} />
          <Stop offset="100%" stopColor={OUD} />
        </SvgLG>
        <SvgLG id="av_legL" x1={q(lLX-thW)} y1="0" x2={q(lLX+thW)} y2="0" gradientUnits="userSpaceOnUse">
          <Stop offset="0%"   stopColor={OUD} />
          <Stop offset="45%"  stopColor="#131B38" />
          <Stop offset="100%" stopColor={OUD} />
        </SvgLG>
        <SvgLG id="av_legR" x1={q(rLX-thW)} y1="0" x2={q(rLX+thW)} y2="0" gradientUnits="userSpaceOnUse">
          <Stop offset="0%"   stopColor={OUD} />
          <Stop offset="45%"  stopColor="#131B38" />
          <Stop offset="100%" stopColor={OUD} />
        </SvgLG>
        <SvgLG id="av_armL" x1={q(eLX-arW*1.2)} y1="0" x2={q(eLX+arW*3.5)} y2="0" gradientUnits="userSpaceOnUse">
          <Stop offset="0%"   stopColor={OUD} />
          <Stop offset="50%"  stopColor="#141B36" />
          <Stop offset="100%" stopColor={OUD} />
        </SvgLG>
        <SvgLG id="av_armR" x1={q(cx+(cx-eLX)-arW*3.5)} y1="0" x2={q(cx+(cx-eLX)+arW*1.2)} y2="0" gradientUnits="userSpaceOnUse">
          <Stop offset="0%"   stopColor={OUD} />
          <Stop offset="50%"  stopColor="#141B36" />
          <Stop offset="100%" stopColor={OUD} />
        </SvgLG>
        <SvgRG id="av_face" cx="44%" cy="38%" r="60%" gradientUnits="objectBoundingBox">
          <Stop offset="0%"   stopColor={SKH} />
          <Stop offset="58%"  stopColor={SKM} />
          <Stop offset="100%" stopColor={SKD} />
        </SvgRG>
        <SvgLG id="av_neck" x1={q(cx-nHW)} y1="0" x2={q(cx+nHW)} y2="0" gradientUnits="userSpaceOnUse">
          <Stop offset="0%"   stopColor={SKD} />
          <Stop offset="50%"  stopColor={SKM} />
          <Stop offset="100%" stopColor={SKD} />
        </SvgLG>
        <SvgRG id="av_hand" cx="42%" cy="35%" r="65%" gradientUnits="objectBoundingBox">
          <Stop offset="0%"   stopColor={SKM} />
          <Stop offset="100%" stopColor={SKD} />
        </SvgRG>
        <SvgLG id="av_shoe" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%"   stopColor={SHH} />
          <Stop offset="100%" stopColor={SHD} />
        </SvgLG>
      </Defs>

      {/* Back arm → legs → shoes → torso → front arm → neck → head */}
      <Path d={arm('R')}  fill="url(#av_armR)" />
      <Path d={leg('L')}  fill="url(#av_legL)" />
      <Path d={shoe('L')} fill="url(#av_shoe)" />
      <Path d={leg('R')}  fill="url(#av_legR)" />
      <Path d={shoe('R')} fill="url(#av_shoe)" />
      <Path d={torso()}   fill="url(#av_suit)" />

      {/* Athletic muscle definition */}
      {morph === 'athletic' && <>
        <Path d={`M ${q(cx)},${q(sY+h*.032)} L ${q(cx)},${q(wY-h*.055)}`}
          stroke="rgba(4,6,18,.55)" strokeWidth={q(s*.005)} fill="none" />
        <Path d={`M ${q(cx-chW*.48)},${q(sY+h*.048)} Q ${q(cx-s*.04)},${q(cY+h*.042)} ${q(cx)},${q(cY+h*.038)}`}
          stroke="rgba(4,6,18,.40)" strokeWidth={q(s*.004)} fill="none" />
        <Path d={`M ${q(cx+chW*.48)},${q(sY+h*.048)} Q ${q(cx+s*.04)},${q(cY+h*.042)} ${q(cx)},${q(cY+h*.038)}`}
          stroke="rgba(4,6,18,.40)" strokeWidth={q(s*.004)} fill="none" />
      </>}

      <Path d={arm('L')} fill="url(#av_armL)" />

      {/* Neck */}
      <Path
        d={`M ${q(cx-nHW*1.12)},${q(nTY)} L ${q(cx-nHW)},${q(nBY)} L ${q(cx+nHW)},${q(nBY)} L ${q(cx+nHW*1.12)},${q(nTY)} Z`}
        fill="url(#av_neck)"
      />

      {/* Head */}
      <Ellipse cx={q(cx)} cy={q(hCY)} rx={q(hRX)} ry={q(hRY)} fill="url(#av_face)" />

      {/* Hair */}
      <Path d={hair()} fill={HAIR} />

      {/* Female hair bun */}
      {gender === 'female' && (
        <Ellipse cx={q(cx+hRX*.62)} cy={q(hCY-hRY*1.44)} rx={q(s*.054)} ry={q(s*.046)} fill={HAIR} />
      )}

      {/* Eyes */}
      <Ellipse cx={q(cx-hRX*.30)} cy={q(hCY-hRY*.08)} rx={eyeW} ry={eyeH} fill="#F0E8E0" />
      <Ellipse cx={q(cx+hRX*.30)} cy={q(hCY-hRY*.08)} rx={eyeW} ry={eyeH} fill="#F0E8E0" />
      <Ellipse cx={q(cx-hRX*.28)} cy={q(hCY-hRY*.07)} rx={q(hRX*.086)} ry={q(hRX*.098)} fill="#100808" />
      <Ellipse cx={q(cx+hRX*.28)} cy={q(hCY-hRY*.07)} rx={q(hRX*.086)} ry={q(hRX*.098)} fill="#100808" />
      <Ellipse cx={q(cx-hRX*.25)} cy={q(hCY-hRY*.13)} rx={q(hRX*.030)} ry={q(hRX*.030)} fill="rgba(255,255,255,.65)" />
      <Ellipse cx={q(cx+hRX*.31)} cy={q(hCY-hRY*.13)} rx={q(hRX*.030)} ry={q(hRX*.030)} fill="rgba(255,255,255,.65)" />

      {/* Eyebrows */}
      <Path d={`M ${q(cx-hRX*.45)},${q(hCY-hRY*.30)} L ${q(cx-hRX*.14)},${q(hCY-hRY*.26)}`}
        stroke={HAIR} strokeWidth={brow} strokeLinecap="round" />
      <Path d={`M ${q(cx+hRX*.14)},${q(hCY-hRY*.26)} L ${q(cx+hRX*.45)},${q(hCY-hRY*.30)}`}
        stroke={HAIR} strokeWidth={brow} strokeLinecap="round" />

      {/* Nose */}
      <Path d={`M ${q(cx-hRX*.08)},${q(hCY+hRY*.08)} L ${q(cx)},${q(hCY+hRY*.20)} L ${q(cx+hRX*.08)},${q(hCY+hRY*.08)}`}
        stroke="#7A3818" strokeWidth={q(s*.006)} fill="none" strokeLinecap="round" />

      {/* Mouth */}
      <Path d={`M ${q(cx-hRX*.22)},${q(hCY+hRY*.34)} Q ${q(cx)},${q(hCY+hRY*.44)} ${q(cx+hRX*.22)},${q(hCY+hRY*.34)}`}
        stroke="#7A3818" strokeWidth={q(s*.009)} fill="none" strokeLinecap="round" />

      {/* Hands */}
      <Ellipse cx={q(wrLX)}           cy={q(haCY)} rx={q(haRX)} ry={q(haRY)} fill="url(#av_hand)" />
      <Ellipse cx={q(cx+(cx-wrLX))}   cy={q(haCY)} rx={q(haRX)} ry={q(haRY)} fill="url(#av_hand)" />
    </>
  );
}

// ── Main Avatar component ─────────────────────────────────────────────────────
export default function Avatar({ gender, params, size = 200, minimal = false }: Props) {
  const morph   = getMorph(params.bmi);
  const charKey = `${gender}-${morph}`;
  const h       = Math.round(size * ASPECT);

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

  const [displayKey, setDisplayKey] = useState(charKey);
  const [displayGender, setDisplayGender] = useState(gender);
  const [displayMorph, setDisplayMorph]   = useState(morph);
  const prevKeyRef = useRef(charKey);

  useEffect(() => {
    if (charKey === prevKeyRef.current) return;
    prevKeyRef.current = charKey;

    fadeAnim.setValue(0);
    setDisplayGender(gender);
    setDisplayMorph(morph);
    setDisplayKey(charKey);
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
  }, [charKey]);

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(glowAnim, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(glowAnim, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ])).start();
    Animated.loop(
      Animated.timing(orbitAnim, { toValue: 1, duration: 9000, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, []);

  const glowBase   = 0.10 + params.toneLevel * 0.12;
  const platGlowOp = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.18, 0.52] });
  const orbitCX    = size / 2;
  const orbitCY    = h * 0.37;

  const rx = platDiscW / 2;
  const ry = platDiscH / 2;
  const platDots = ([0, 90, 180, 270] as const).map((deg) => {
    const rad = (deg * Math.PI) / 180;
    return { deg, dx: rx * Math.cos(rad), dy: ry * Math.sin(rad) };
  });

  return (
    <View style={{ width: size, height: totalH, alignItems: 'center' }}>

      {/* Glow halo */}
      {!minimal && (
        <Animated.View style={{
          position: 'absolute', alignSelf: 'center',
          top: h * 0.04, width: size * 0.72, height: h * 0.92,
          borderRadius: 9999, backgroundColor: '#E2D1B3',
          opacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [glowBase, glowBase + 0.14] }),
          ...({ boxShadow: `0 0 ${Math.round(size * 1.3)}px ${Math.round(size * 0.65)}px rgba(226,209,179,0.28)` } as any),
        }} />
      )}

      {/* SVG character — no background, fully transparent */}
      <Animated.View style={{ width: size, height: h, opacity: fadeAnim }}>
        <Svg width={size} height={h} viewBox={`0 0 ${size} ${h}`}>
          <CharSvg gender={displayGender} morph={displayMorph} s={size} h={h} />
        </Svg>
      </Animated.View>

      {/* Orbiting particles — on character change only */}
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

      {/* Scan line — on character change only */}
      {!minimal && (
        <Animated.View style={{
          position: 'absolute', left: 0, right: 0, height: 1.5,
          backgroundColor: 'rgba(190,210,255,0.32)',
          transform: [{ translateY: scanAnim.interpolate({ inputRange: [0, 1], outputRange: [0, h] }) }],
          ...({ boxShadow: '0 0 10px 5px rgba(190,210,255,0.18)' } as any),
        }} />
      )}

      {/* Platform disc */}
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
