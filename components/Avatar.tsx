import React from 'react';
import { View } from 'react-native';
import Svg, {
  Ellipse,
  Path,
  Circle,
  G,
  Line,
  Defs,
  ClipPath,
} from 'react-native-svg';
import { AvatarParams } from '@/hooks/useAvatarParams';

interface AvatarProps {
  gender: 'male' | 'female';
  params: AvatarParams;
  size?: number;
  minimal?: boolean;
}

const C = '#00F2FF';
const FILL = 'rgba(0, 242, 255, 0.04)';

export default function Avatar({ gender, params, size = 280, minimal = false }: AvatarProps) {
  const isMale = gender === 'male';

  const { bodyWidth, waistWidth, toneLevel, posture, stepSlim } = params;
  const slim = 1 - stepSlim;

  const shoulderW = 70 * bodyWidth * slim * (isMale ? 1.15 : 0.95);
  const waistW    = 44 * waistWidth * slim;
  const hipW      = isMale ? 50 * bodyWidth * slim : 58 * bodyWidth * slim;
  const legW      = 22 * bodyWidth * slim;

  const postureOffset = posture * 3;
  const cx = 140;

  const headRx = isMale ? 32 : 30;
  const headRy = isMale ? 36 : 34;
  const hcx    = cx - postureOffset;
  const hcy    = 75;

  const torsoPath = [
    `M${cx - shoulderW} 118`,
    `C${cx - shoulderW * 0.95} 140 ${cx - waistW} 158 ${cx - waistW} 175`,
    `C${cx - waistW * 0.95} 195 ${cx - hipW * 0.85} 210 ${cx - hipW} 220`,
    `L${cx + hipW} 220`,
    `C${cx + hipW * 0.85} 210 ${cx + waistW * 0.95} 195 ${cx + waistW} 175`,
    `C${cx + waistW} 158 ${cx + shoulderW * 0.95} 140 ${cx + shoulderW} 118 Z`,
  ].join(' ');

  const leftLegPath = [
    `M${cx - hipW * 0.45} 220`,
    `C${cx - hipW * 0.48} 250 ${cx - legW * 1.1} 270 ${cx - legW * 1.05} 300`,
    `L${cx - legW * 0.4} 302`,
    `C${cx - legW * 0.4} 275 ${cx - hipW * 0.1} 252 ${cx - hipW * 0.08} 222 Z`,
  ].join(' ');

  const rightLegPath = [
    `M${cx + hipW * 0.45} 220`,
    `C${cx + hipW * 0.48} 250 ${cx + legW * 1.1} 270 ${cx + legW * 1.05} 300`,
    `L${cx + legW * 0.4} 302`,
    `C${cx + legW * 0.4} 275 ${cx + hipW * 0.1} 252 ${cx + hipW * 0.08} 222 Z`,
  ].join(' ');

  const leftArmPath = [
    `M${cx - shoulderW + 8} 120`,
    `C${cx - shoulderW - 15} 140 ${cx - shoulderW - 20} 165 ${cx - shoulderW - 12} 185`,
    `L${cx - shoulderW + 2} 183`,
    `C${cx - shoulderW - 5} 164 ${cx - shoulderW - 2} 140 ${cx - shoulderW + 16} 122 Z`,
  ].join(' ');

  const rightArmPath = [
    `M${cx + shoulderW - 8} 120`,
    `C${cx + shoulderW + 15} 140 ${cx + shoulderW + 20} 165 ${cx + shoulderW + 12} 185`,
    `L${cx + shoulderW - 2} 183`,
    `C${cx + shoulderW + 5} 164 ${cx + shoulderW + 2} 140 ${cx + shoulderW - 16} 122 Z`,
  ].join(' ');

  const scanYs = [132, 144, 156, 167, 177, 188, 198, 208];

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 280 320">
        <Defs>
          <ClipPath id="bodyClip">
            <Path d={torsoPath} />
          </ClipPath>
          <ClipPath id="headClip">
            <Ellipse cx={hcx} cy={hcy} rx={headRx} ry={headRy} />
          </ClipPath>
        </Defs>

        {/* ── Ambient aura ── */}
        <Ellipse cx={cx} cy={165} rx={85 * bodyWidth * slim} ry={115}
          fill="rgba(0,242,255,0.045)" />
        <Ellipse cx={hcx} cy={hcy} rx={52} ry={54}
          fill="rgba(0,242,255,0.04)" />

        {/* ── LEGS ── */}
        <Path d={leftLegPath}  fill="none" stroke={C} strokeWidth={8}   strokeOpacity={0.03} />
        <Path d={leftLegPath}  fill="none" stroke={C} strokeWidth={4}   strokeOpacity={0.07} />
        <Path d={leftLegPath}  fill="none" stroke={C} strokeWidth={2}   strokeOpacity={0.18} />
        <Path d={leftLegPath}  fill={FILL} stroke={C} strokeWidth={1}   strokeOpacity={0.72} />

        <Path d={rightLegPath} fill="none" stroke={C} strokeWidth={8}   strokeOpacity={0.03} />
        <Path d={rightLegPath} fill="none" stroke={C} strokeWidth={4}   strokeOpacity={0.07} />
        <Path d={rightLegPath} fill="none" stroke={C} strokeWidth={2}   strokeOpacity={0.18} />
        <Path d={rightLegPath} fill={FILL} stroke={C} strokeWidth={1}   strokeOpacity={0.72} />

        {/* ── HIPS ── */}
        <Ellipse cx={cx} cy={215} rx={hipW} ry={18}
          fill="none" stroke={C} strokeWidth={8} strokeOpacity={0.03} />
        <Ellipse cx={cx} cy={215} rx={hipW} ry={18}
          fill="none" stroke={C} strokeWidth={3} strokeOpacity={0.10} />
        <Ellipse cx={cx} cy={215} rx={hipW} ry={18}
          fill={FILL} stroke={C} strokeWidth={1} strokeOpacity={0.65} />

        {/* ── TORSO ── */}
        <Path d={torsoPath} fill="none" stroke={C} strokeWidth={12}  strokeOpacity={0.025} />
        <Path d={torsoPath} fill="none" stroke={C} strokeWidth={6}   strokeOpacity={0.06} />
        <Path d={torsoPath} fill="none" stroke={C} strokeWidth={2.5} strokeOpacity={0.16} />
        <Path d={torsoPath} fill={FILL} stroke={C} strokeWidth={1}   strokeOpacity={0.78} />

        {/* ── Scan lines (clipped to torso) ── */}
        {!minimal && (
          <G clipPath="url(#bodyClip)">
            {scanYs.map((y, i) => (
              <Line
                key={y}
                x1={cx - shoulderW - 5}
                y1={y}
                x2={cx + shoulderW + 5}
                y2={y}
                stroke={C}
                strokeWidth={0.5}
                strokeOpacity={0.13 - i * 0.012}
              />
            ))}
          </G>
        )}

        {/* ── Tone geometry ── */}
        {!minimal && toneLevel > 0.3 && (
          <G>
            <Line x1={cx} y1={128} x2={cx} y2={205}
              stroke={C} strokeWidth={0.7} strokeOpacity={toneLevel * 0.22} />
            <Path d={`M${cx - 18} 136 C${cx - 15} 158 ${cx - 13} 172 ${cx - 11} 184`}
              stroke={C} strokeWidth={0.7} strokeOpacity={toneLevel * 0.18} fill="none" />
            <Path d={`M${cx + 18} 136 C${cx + 15} 158 ${cx + 13} 172 ${cx + 11} 184`}
              stroke={C} strokeWidth={0.7} strokeOpacity={toneLevel * 0.18} fill="none" />
          </G>
        )}

        {/* ── ARMS ── */}
        <Path d={leftArmPath}  fill="none" stroke={C} strokeWidth={7}  strokeOpacity={0.03} />
        <Path d={leftArmPath}  fill="none" stroke={C} strokeWidth={3}  strokeOpacity={0.08} />
        <Path d={leftArmPath}  fill="none" stroke={C} strokeWidth={1.5} strokeOpacity={0.18} />
        <Path d={leftArmPath}  fill={FILL} stroke={C} strokeWidth={0.8} strokeOpacity={0.65} />

        <Path d={rightArmPath} fill="none" stroke={C} strokeWidth={7}  strokeOpacity={0.03} />
        <Path d={rightArmPath} fill="none" stroke={C} strokeWidth={3}  strokeOpacity={0.08} />
        <Path d={rightArmPath} fill="none" stroke={C} strokeWidth={1.5} strokeOpacity={0.18} />
        <Path d={rightArmPath} fill={FILL} stroke={C} strokeWidth={0.8} strokeOpacity={0.65} />

        {/* ── Hands ── */}
        <Ellipse cx={cx - shoulderW - 7} cy={190} rx={7} ry={9}
          fill={FILL} stroke={C} strokeWidth={0.8} strokeOpacity={0.60} />
        <Ellipse cx={cx + shoulderW + 7} cy={190} rx={7} ry={9}
          fill={FILL} stroke={C} strokeWidth={0.8} strokeOpacity={0.60} />

        {/* ── Neck ── */}
        <Path d={`M${hcx - 13} 98 C${hcx - 12} 112 ${hcx + 12} 112 ${hcx + 13} 98 Z`}
          fill={FILL} stroke={C} strokeWidth={0.8} strokeOpacity={0.50} />

        {/* ── HEAD ── */}
        <Ellipse cx={hcx} cy={hcy} rx={headRx} ry={headRy}
          fill="none" stroke={C} strokeWidth={10} strokeOpacity={0.025} />
        <Ellipse cx={hcx} cy={hcy} rx={headRx} ry={headRy}
          fill="none" stroke={C} strokeWidth={5}  strokeOpacity={0.06} />
        <Ellipse cx={hcx} cy={hcy} rx={headRx} ry={headRy}
          fill="none" stroke={C} strokeWidth={2}  strokeOpacity={0.18} />
        <Ellipse cx={hcx} cy={hcy} rx={headRx} ry={headRy}
          fill={FILL} stroke={C} strokeWidth={1}  strokeOpacity={0.80} />

        {/* ── Head scan lines ── */}
        {!minimal && (
          <G clipPath="url(#headClip)">
            {[62, 70, 78, 86].map((y, i) => (
              <Line key={y}
                x1={hcx - headRx + 4} y1={y}
                x2={hcx + headRx - 4} y2={y}
                stroke={C} strokeWidth={0.4} strokeOpacity={0.14 - i * 0.02}
              />
            ))}
          </G>
        )}

        {/* ── Joint data-points ── */}
        {!minimal && (
          <G>
            {/* Shoulders */}
            <Circle cx={cx - shoulderW + 5} cy={120} r={2.5} fill={C} fillOpacity={0.75} />
            <Circle cx={cx - shoulderW + 5} cy={120} r={5.5} fill="none" stroke={C} strokeWidth={0.8} strokeOpacity={0.22} />
            <Circle cx={cx + shoulderW - 5} cy={120} r={2.5} fill={C} fillOpacity={0.75} />
            <Circle cx={cx + shoulderW - 5} cy={120} r={5.5} fill="none" stroke={C} strokeWidth={0.8} strokeOpacity={0.22} />

            {/* Waist center */}
            <Circle cx={cx} cy={175} r={2}   fill={C} fillOpacity={0.55} />
            <Circle cx={cx} cy={175} r={5}   fill="none" stroke={C} strokeWidth={0.7} strokeOpacity={0.18} />

            {/* Head center */}
            <Circle cx={hcx} cy={hcy} r={2.5} fill={C} fillOpacity={0.45} />
            <Circle cx={hcx} cy={hcy} r={6}   fill="none" stroke={C} strokeWidth={0.7} strokeOpacity={0.14} />

            {/* Hip joints */}
            <Circle cx={cx - hipW * 0.6} cy={218} r={1.8} fill={C} fillOpacity={0.50} />
            <Circle cx={cx + hipW * 0.6} cy={218} r={1.8} fill={C} fillOpacity={0.50} />

            {/* Elbow joints */}
            <Circle cx={cx - shoulderW - 14} cy={163} r={1.8} fill={C} fillOpacity={0.45} />
            <Circle cx={cx + shoulderW + 14} cy={163} r={1.8} fill={C} fillOpacity={0.45} />
          </G>
        )}

        {/* ── Waist dashed indicator ── */}
        {!minimal && (
          <Line
            x1={cx - waistW - 8} y1={175}
            x2={cx + waistW + 8} y2={175}
            stroke={C} strokeWidth={0.7} strokeOpacity={0.22}
            strokeDasharray="3,5"
          />
        )}
      </Svg>
    </View>
  );
}
