import React from 'react';
import { View } from 'react-native';
import Svg, {
  Ellipse,
  Path,
  Circle,
  G,
  Defs,
  RadialGradient,
  Stop,
  LinearGradient,
} from 'react-native-svg';
import { AvatarParams } from '@/hooks/useAvatarParams';
import { Colors } from '@/constants/theme';

interface AvatarProps {
  gender: 'male' | 'female';
  params: AvatarParams;
  size?: number;
  minimal?: boolean;
}

export default function Avatar({ gender, params, size = 280, minimal = false }: AvatarProps) {
  const isMale = gender === 'male';
  const scale = size / 280;

  const {
    bodyWidth,
    waistWidth,
    toneLevel,
    posture,
    stepSlim,
  } = params;

  const slim = 1 - stepSlim;

  // Skin tone
  const skinBase = isMale ? '#D4956A' : '#E8A87C';
  const skinShadow = isMale ? '#B87A50' : '#CC8860';
  const clothTop = isMale ? Colors.male : Colors.female;
  const clothBottom = isMale ? '#2A3A5C' : '#5C2A4A';

  // Body proportions
  const shoulderW = 70 * bodyWidth * slim * (isMale ? 1.15 : 0.95);
  const torsoW = 52 * bodyWidth * slim;
  const waistW = 44 * waistWidth * slim;
  const hipW = isMale ? 50 * bodyWidth * slim : 58 * bodyWidth * slim;
  const legW = 22 * bodyWidth * slim;

  // Posture offset: straighter = head slightly back, chest forward
  const postureOffset = posture * 3;

  // Tone: muscle definition opacity
  const muscleOpacity = toneLevel * 0.4;

  const cx = 140; // center X

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 280 320">
        <Defs>
          <RadialGradient id="skinGrad" cx="50%" cy="40%" r="60%">
            <Stop offset="0%" stopColor={skinBase} />
            <Stop offset="100%" stopColor={skinShadow} />
          </RadialGradient>
          <LinearGradient id="topGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={clothTop} />
            <Stop offset="100%" stopColor={clothTop + 'BB'} />
          </LinearGradient>
          <LinearGradient id="botGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={clothBottom} />
            <Stop offset="100%" stopColor={clothBottom + 'CC'} />
          </LinearGradient>
          <RadialGradient id="headGrad" cx="45%" cy="35%" r="65%">
            <Stop offset="0%" stopColor={skinBase} />
            <Stop offset="100%" stopColor={skinShadow} />
          </RadialGradient>
        </Defs>

        {/* ── Bio-energy aura ── */}
        <Ellipse cx={cx} cy={160} rx={92 * bodyWidth * slim} ry={120} fill="rgba(0,229,255,0.055)" />
        <Ellipse cx={cx} cy={148} rx={74 * bodyWidth * slim} ry={96} fill="rgba(0,229,255,0.04)" />
        <Ellipse cx={cx - postureOffset} cy={75} rx={52} ry={54} fill="rgba(0,229,255,0.05)" />

        {/* === LEGS === */}
        <G>
          {/* Left leg */}
          <Path
            d={`M${cx - hipW * 0.45} 220
                C${cx - hipW * 0.48} 250 ${cx - legW * 1.1} 270 ${cx - legW * 1.05} 300
                L${cx - legW * 0.4} 302
                C${cx - legW * 0.4} 275 ${cx - hipW * 0.1} 252 ${cx - hipW * 0.08} 222 Z`}
            fill="url(#botGrad)"
          />
          {/* Right leg */}
          <Path
            d={`M${cx + hipW * 0.45} 220
                C${cx + hipW * 0.48} 250 ${cx + legW * 1.1} 270 ${cx + legW * 1.05} 300
                L${cx + legW * 0.4} 302
                C${cx + legW * 0.4} 275 ${cx + hipW * 0.1} 252 ${cx + hipW * 0.08} 222 Z`}
            fill="url(#botGrad)"
          />
        </G>

        {/* === HIPS === */}
        <Ellipse
          cx={cx}
          cy={215}
          rx={hipW}
          ry={18}
          fill="url(#botGrad)"
        />

        {/* === TORSO / WAIST === */}
        <Path
          d={`M${cx - shoulderW} 118
              C${cx - shoulderW * 0.95} 140 ${cx - waistW} 158 ${cx - waistW} 175
              C${cx - waistW * 0.95} 195 ${cx - hipW * 0.85} 210 ${cx - hipW} 220
              L${cx + hipW} 220
              C${cx + hipW * 0.85} 210 ${cx + waistW * 0.95} 195 ${cx + waistW} 175
              C${cx + waistW} 158 ${cx + shoulderW * 0.95} 140 ${cx + shoulderW} 118
              Z`}
          fill="url(#topGrad)"
        />

        {/* Cyan bio wireframe outline */}
        <Path
          d={`M${cx - shoulderW} 118
              C${cx - shoulderW * 0.95} 140 ${cx - waistW} 158 ${cx - waistW} 175
              C${cx - waistW * 0.95} 195 ${cx - hipW * 0.85} 210 ${cx - hipW} 220
              L${cx + hipW} 220
              C${cx + hipW * 0.85} 210 ${cx + waistW * 0.95} 195 ${cx + waistW} 175
              C${cx + waistW} 158 ${cx + shoulderW * 0.95} 140 ${cx + shoulderW} 118 Z`}
          stroke="#00E5FF"
          strokeWidth={1.5}
          strokeOpacity={0.22}
          fill="none"
        />

        {/* Muscle definition overlay */}
        {!minimal && toneLevel > 0.2 && (
          <Path
            d={`M${cx - 15} 130 C${cx - 12} 155 ${cx - 10} 170 ${cx - 8} 185
                M${cx + 15} 130 C${cx + 12} 155 ${cx + 10} 170 ${cx + 8} 185`}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
            opacity={muscleOpacity}
          />
        )}

        {/* === ARMS === */}
        {/* Left arm */}
        <Path
          d={`M${cx - shoulderW + 8} 120
              C${cx - shoulderW - 15} 140 ${cx - shoulderW - 20} 165 ${cx - shoulderW - 12} 185
              L${cx - shoulderW + 2} 183
              C${cx - shoulderW - 5} 164 ${cx - shoulderW - 2} 140 ${cx - shoulderW + 16} 122 Z`}
          fill="url(#skinGrad)"
        />
        {/* Right arm */}
        <Path
          d={`M${cx + shoulderW - 8} 120
              C${cx + shoulderW + 15} 140 ${cx + shoulderW + 20} 165 ${cx + shoulderW + 12} 185
              L${cx + shoulderW - 2} 183
              C${cx + shoulderW + 5} 164 ${cx + shoulderW + 2} 140 ${cx + shoulderW - 16} 122 Z`}
          fill="url(#skinGrad)"
        />

        {/* Hands */}
        <Ellipse cx={cx - shoulderW - 7} cy={190} rx={7} ry={9} fill="url(#skinGrad)" />
        <Ellipse cx={cx + shoulderW + 7} cy={190} rx={7} ry={9} fill="url(#skinGrad)" />

        {/* === NECK === */}
        <Path
          d={`M${cx - 14} 98 C${cx - 13} 112 ${cx + 13} 112 ${cx + 14} 98 Z`}
          fill="url(#skinGrad)"
        />

        {/* === HEAD === */}
        <Ellipse
          cx={cx - postureOffset}
          cy={75}
          rx={isMale ? 32 : 30}
          ry={isMale ? 36 : 34}
          fill="url(#headGrad)"
        />

        {/* Head bio outline */}
        <Ellipse
          cx={cx - postureOffset}
          cy={75}
          rx={(isMale ? 32 : 30) + 3}
          ry={(isMale ? 36 : 34) + 3}
          stroke="#00E5FF"
          strokeWidth={1}
          strokeOpacity={0.18}
          fill="none"
        />

        {/* Hair */}
        {isMale ? (
          <Path
            d={`M${cx - postureOffset - 30} 68
                C${cx - postureOffset - 32} 45 ${cx - postureOffset - 15} 35 ${cx - postureOffset} 34
                C${cx - postureOffset + 15} 35 ${cx - postureOffset + 32} 45 ${cx - postureOffset + 30} 68
                C${cx - postureOffset + 20} 52 ${cx - postureOffset} 48 ${cx - postureOffset - 20} 52 Z`}
            fill="#2A1F14"
          />
        ) : (
          <>
            <Path
              d={`M${cx - postureOffset - 30} 68
                  C${cx - postureOffset - 32} 40 ${cx - postureOffset - 10} 32 ${cx - postureOffset} 32
                  C${cx - postureOffset + 10} 32 ${cx - postureOffset + 32} 40 ${cx - postureOffset + 30} 68
                  C${cx - postureOffset + 18} 48 ${cx - postureOffset} 44 ${cx - postureOffset - 18} 48 Z`}
              fill="#4A2820"
            />
            {/* Long hair strands */}
            <Path
              d={`M${cx - postureOffset - 30} 68 C${cx - postureOffset - 38} 90 ${cx - postureOffset - 40} 115 ${cx - postureOffset - 35} 130`}
              stroke="#4A2820"
              strokeWidth={10}
              strokeLinecap="round"
              fill="none"
            />
            <Path
              d={`M${cx - postureOffset + 30} 68 C${cx - postureOffset + 38} 90 ${cx - postureOffset + 40} 115 ${cx - postureOffset + 35} 130`}
              stroke="#4A2820"
              strokeWidth={10}
              strokeLinecap="round"
              fill="none"
            />
          </>
        )}

        {/* Eyes */}
        <Circle cx={cx - postureOffset - 11} cy={74} r={4} fill="#FFFFFF" />
        <Circle cx={cx - postureOffset + 11} cy={74} r={4} fill="#FFFFFF" />
        <Circle cx={cx - postureOffset - 11} cy={74} r={2.5} fill="#2A1F14" />
        <Circle cx={cx - postureOffset + 11} cy={74} r={2.5} fill="#2A1F14" />
        <Circle cx={cx - postureOffset - 10} cy={73} r={0.8} fill="#FFFFFF" />
        <Circle cx={cx - postureOffset + 12} cy={73} r={0.8} fill="#FFFFFF" />

        {/* Nose */}
        <Path
          d={`M${cx - postureOffset - 3} 82 C${cx - postureOffset - 4} 86 ${cx - postureOffset + 4} 86 ${cx - postureOffset + 3} 82`}
          stroke={skinShadow}
          strokeWidth={1.5}
          fill="none"
          strokeLinecap="round"
        />

        {/* Mouth */}
        <Path
          d={`M${cx - postureOffset - 8} 91 C${cx - postureOffset - 4} 95 ${cx - postureOffset + 4} 95 ${cx - postureOffset + 8} 91`}
          stroke={skinShadow}
          strokeWidth={1.8}
          fill="none"
          strokeLinecap="round"
        />

        {/* Shoulders line for posture */}
        {!minimal && posture > 0.4 && (
          <Path
            d={`M${cx - shoulderW + 5} 115 L${cx + shoulderW - 5} 115`}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={2}
            fill="none"
          />
        )}

        {/* Female chest hint */}
        {!minimal && !isMale && (
          <>
            <Ellipse cx={cx - 16} cy={140} rx={14 * bodyWidth} ry={10} fill={clothTop + 'DD'} />
            <Ellipse cx={cx + 16} cy={140} rx={14 * bodyWidth} ry={10} fill={clothTop + 'DD'} />
          </>
        )}

        {/* Male chest definition */}
        {!minimal && isMale && toneLevel > 0.3 && (
          <>
            <Ellipse cx={cx - 18} cy={135} rx={15 * bodyWidth * 0.8} ry={10} fill="rgba(255,255,255,0.04)" />
            <Ellipse cx={cx + 18} cy={135} rx={15 * bodyWidth * 0.8} ry={10} fill="rgba(255,255,255,0.04)" />
          </>
        )}
      </Svg>
    </View>
  );
}
