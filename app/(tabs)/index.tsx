import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Svg, Circle } from 'react-native-svg';
import { Search, Droplets, Moon } from 'lucide-react-native';
import Avatar from '@/components/Avatar';
import Avatar3D from '@/components/Avatar3D';
import { useShallow } from 'zustand/react/shallow';
import { useUserStore } from '@/store/userStore';
import { useAvatarParams } from '@/hooks/useAvatarParams';
import { useSteps } from '@/hooks/useSteps';
import { Colors, Spacing, Radius, Shadow } from '@/constants/theme';

const { width: W } = Dimensions.get('window');

const MEAL_KCAL: Record<string, number> = {
  balanced: 550,
  rich: 800,
  protein: 640,
  light: 360,
  unknown: 480,
};

const RING_SIZE  = Math.round(W * 0.52);
const OUTER_R    = RING_SIZE * 0.37;
const INNER_R    = RING_SIZE * 0.265;
const OUTER_W    = RING_SIZE * 0.075;
const INNER_W    = RING_SIZE * 0.065;

function EnergyRing({ burned, consumed }: { burned: number; consumed: number }) {
  const cx = RING_SIZE / 2;
  const cy = RING_SIZE / 2;

  const outerC = 2 * Math.PI * OUTER_R;
  const innerC = 2 * Math.PI * INNER_R;

  const DAILY_GOAL = 2500;
  const burnedFrac   = Math.min(burned   / DAILY_GOAL, 1);
  const consumedFrac = Math.min(consumed / DAILY_GOAL, 1);
  const balance      = burned - consumed;

  return (
    <View style={styles.ringWrap}>
      <Svg width={RING_SIZE} height={RING_SIZE} style={StyleSheet.absoluteFill}>
        {/* Outer bg */}
        <Circle cx={cx} cy={cy} r={OUTER_R} fill="none"
          stroke="rgba(226,209,179,0.10)" strokeWidth={OUTER_W} />
        {/* Outer burned — champagne */}
        {burnedFrac > 0.01 && (
          <Circle cx={cx} cy={cy} r={OUTER_R} fill="none"
            stroke="#E2D1B3" strokeWidth={OUTER_W}
            strokeDasharray={`${burnedFrac * outerC} ${(1 - burnedFrac) * outerC}`}
            strokeLinecap="round"
            transform={`rotate(-90, ${cx}, ${cy})`}
          />
        )}
        {/* Inner bg */}
        <Circle cx={cx} cy={cy} r={INNER_R} fill="none"
          stroke="rgba(0,200,212,0.10)" strokeWidth={INNER_W} />
        {/* Inner consumed — teal */}
        {consumedFrac > 0.01 && (
          <Circle cx={cx} cy={cy} r={INNER_R} fill="none"
            stroke="#00C8D4" strokeWidth={INNER_W}
            strokeDasharray={`${consumedFrac * innerC} ${(1 - consumedFrac) * innerC}`}
            strokeLinecap="round"
            transform={`rotate(-90, ${cx}, ${cy})`}
          />
        )}
      </Svg>

      {/* Center text overlay */}
      <View style={[StyleSheet.absoluteFillObject, styles.ringCenter]}>
        <Text style={styles.ringSubLabel}>Bilan</Text>
        <Text style={[styles.ringBalance, { color: balance >= 0 ? '#E2D1B3' : '#00C8D4' }]}>
          {balance >= 0 ? '+' : ''}{balance}
        </Text>
        <Text style={styles.ringUnit}>kcal</Text>
      </View>
    </View>
  );
}

export default function Dashboard() {
  const [avatarGender, setAvatarGender] = useState<'male' | 'female'>('female');
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [sleepHours,   setSleepHours]   = useState(7);

  const { profile, getCurrentMeasure, sessions, todaySteps, meals } = useUserStore(
    useShallow((s) => ({
      profile:           s.profile,
      getCurrentMeasure: s.getCurrentMeasure,
      sessions:          s.sessions,
      todaySteps:        s.todaySteps,
      meals:             s.meals,
    }))
  );

  useSteps();

  React.useEffect(() => {
    if (profile.gender) setAvatarGender(profile.gender);
  }, [profile.gender]);

  const currentMeasure = getCurrentMeasure();
  const params         = useAvatarParams();
  const stepPct        = Math.min(100, Math.round((todaySteps / 10000) * 100));

  const today = new Date().toDateString();

  const todaySessions = sessions.filter(s => new Date(s.date).toDateString() === today);

  const burnedCalories = Math.round(todaySteps * 0.04)
    + todaySessions.reduce((acc, s) => acc + 180 + s.effort * 28, 0);

  const consumedCalories = meals
    .filter(m => new Date(m.date).toDateString() === today)
    .reduce((acc, m) => acc + (MEAL_KCAL[m.category] ?? 480), 0);

  const bmiColor =
    params.bmi < 18.5 ? Colors.warning
    : params.bmi < 25  ? Colors.success
    : params.bmi < 30  ? Colors.warning
    : Colors.red;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ── */}
      <SafeAreaView edges={['top']} style={styles.headerArea}>
        <LinearGradient
          colors={['rgba(28,37,65,0.95)', 'rgba(10,17,40,0)']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bonjour,</Text>
            <Text style={styles.name}>{profile.name || 'Athlète'}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtn}>
              <Search size={20} color={Colors.text} strokeWidth={1.8} />
            </TouchableOpacity>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>
                {(profile.name || 'A').charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>

      {/* ── Avatar Hero ── */}
      <View style={[styles.avatarSection, Shadow.md]}>
        <LinearGradient
          colors={['#0C1428', '#060E1C', '#0C1428']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.avatarTopAccent} />

        <View style={styles.genderRow}>
          {(['female', 'male'] as const).map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.genderPill, avatarGender === g && styles.genderPillActive]}
              onPress={() => setAvatarGender(g)}
              activeOpacity={0.8}
            >
              <Text style={[styles.genderPillTxt, avatarGender === g && styles.genderPillTxtActive]}>
                {g === 'female' ? '♀  Femme' : '♂  Homme'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.avatarBodyRow}>
          <Avatar3D gender={avatarGender} params={params} size={W * 0.36} />
          <View style={styles.statsCol}>
            <View style={styles.statItem}>
              <Text style={styles.statBigVal}>{currentMeasure?.weight ?? '—'}</Text>
              <Text style={styles.statBigUnit}>kg</Text>
              <Text style={styles.statBigLbl}>POIDS</Text>
            </View>
            <View style={styles.statSep} />
            <View style={styles.statItem}>
              <Text style={[styles.statBigVal, { color: bmiColor, fontSize: 28 }]}>
                {params.bmi.toFixed(1)}
              </Text>
              <Text style={[styles.statBigUnit, { color: bmiColor }]}>IMC</Text>
              <Text style={[styles.statBigLbl, { color: bmiColor }]}>
                {params.bmi < 18.5 ? 'MAIGREUR' : params.bmi < 25 ? 'NORMAL' : params.bmi < 30 ? 'SURPOIDS' : 'OBÉSITÉ'}
              </Text>
            </View>
            <View style={styles.statSep} />
            <View style={styles.statItem}>
              <Text style={styles.statBigVal}>{currentMeasure?.waist ?? '—'}</Text>
              <Text style={styles.statBigUnit}>cm</Text>
              <Text style={styles.statBigLbl}>TAILLE</Text>
            </View>
          </View>
        </View>
      </View>

      {/* ── 5-Stat Bar ── */}
      <View style={styles.stepWrap}>
        <View style={styles.statsStrip}>
          {/* Pas */}
          <View style={[styles.statBlock, styles.statDivider]}>
            <Text style={styles.statVal}>{todaySteps.toLocaleString('fr-FR')}</Text>
            <Text style={styles.statLbl}>Pas</Text>
          </View>
          {/* Séances */}
          <View style={[styles.statBlock, styles.statDivider]}>
            <Text style={styles.statVal}>{sessions.length}</Text>
            <Text style={styles.statLbl}>Séances</Text>
          </View>
          {/* Objectif */}
          <View style={[styles.statBlock, styles.statDivider]}>
            <Text style={[styles.statVal, { color: stepPct >= 100 ? Colors.success : Colors.text }]}>
              {stepPct}%
            </Text>
            <Text style={styles.statLbl}>Objectif</Text>
          </View>
          {/* Eau — tappable */}
          <TouchableOpacity
            style={[styles.statBlock, styles.statDivider]}
            onPress={() => setWaterGlasses((w) => (w >= 8 ? 0 : w + 1))}
            activeOpacity={0.7}
          >
            <View style={styles.statValRow}>
              <Droplets size={11} color={Colors.teal} strokeWidth={2} />
              <Text style={[styles.statVal, { color: Colors.teal }]}>{waterGlasses}</Text>
            </View>
            <Text style={styles.statLbl}>Eau</Text>
          </TouchableOpacity>
          {/* Sommeil */}
          <TouchableOpacity
            style={styles.statBlock}
            onPress={() => setSleepHours((h) => (h >= 12 ? 4 : h + 0.5))}
            activeOpacity={0.7}
          >
            <View style={styles.statValRow}>
              <Moon size={11} color={Colors.accent} strokeWidth={2} />
              <Text style={[styles.statVal, { color: Colors.accent }]}>{sleepHours}h</Text>
            </View>
            <Text style={styles.statLbl}>Sommeil</Text>
          </TouchableOpacity>
        </View>

        {/* Step progress bar */}
        <View style={styles.stepTrack}>
          <View style={[styles.stepFill, { width: `${stepPct}%` } as any]} />
        </View>
      </View>

      {/* ── Bilan Énergétique ── */}
      <View style={styles.sectionRow}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.accentBar} />
          <Text style={styles.sectionTitle}>BILAN ÉNERGÉTIQUE</Text>
        </View>
        <Text style={styles.sectionDate}>
          {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
        </Text>
      </View>

      <View style={[styles.energyCard, Shadow.md]}>
        <LinearGradient
          colors={['#0C1428', '#060E1C']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: Radius.xl }]}
        />

        <View style={styles.energyCardInner}>
          {/* Ring */}
          <View style={{ width: RING_SIZE, height: RING_SIZE }}>
            <EnergyRing burned={burnedCalories} consumed={consumedCalories} />
          </View>

          {/* Legend */}
          <View style={styles.energyLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#E2D1B3' }]} />
              <View>
                <Text style={styles.legendVal}>{burnedCalories} kcal</Text>
                <Text style={styles.legendLbl}>Brûlées</Text>
              </View>
            </View>
            <View style={styles.legendSep} />
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#00C8D4' }]} />
              <View>
                <Text style={styles.legendVal}>{consumedCalories} kcal</Text>
                <Text style={styles.legendLbl}>Consommées</Text>
              </View>
            </View>
            <View style={styles.legendSep} />
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: 'rgba(255,255,255,0.20)' }]} />
              <View>
                <Text style={styles.legendVal}>2 500 kcal</Text>
                <Text style={styles.legendLbl}>Objectif</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Hint if no data */}
        {burnedCalories === 0 && consumedCalories === 0 && (
          <Text style={styles.energyHint}>
            Marchez et enregistrez vos repas pour voir votre bilan du jour.
          </Text>
        )}
      </View>

      {/* ── Sessions récentes ── */}
      {sessions.length > 0 && (
        <>
          <View style={[styles.sectionRow, { marginTop: Spacing.xl }]}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.accentBar} />
              <Text style={styles.sectionTitle}>RÉCENT</Text>
            </View>
          </View>
          {sessions.slice(0, 3).map((s) => (
            <View key={s.id} style={[styles.sessionRow, Shadow.sm]}>
              <View style={[styles.sessionDot, { backgroundColor: s.effort >= 8 ? Colors.red + '20' : Colors.accentLight }]}>
                <Text style={{ fontSize: 18 }}>
                  {s.feeling === 'top' ? '🔥' : s.feeling === 'medium' ? '😐' : '😓'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sessionDate}>
                  {new Date(s.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })}
                </Text>
                <Text style={styles.sessionSub}>
                  Effort {s.effort}/10 · {s.steps.toLocaleString('fr-FR')} pas
                </Text>
              </View>
              <View style={[styles.effortTag, { backgroundColor: (s.effort >= 8 ? Colors.red : Colors.accent) + '18' }]}>
                <Text style={[styles.effortTagTxt, { color: s.effort >= 8 ? Colors.red : Colors.accent }]}>
                  {s.effort}/10
                </Text>
              </View>
            </View>
          ))}
        </>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll:  { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: Spacing.xxl },

  /* Header */
  headerArea:    { overflow: 'hidden' },
  header:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, paddingBottom: Spacing.md },
  greeting:      { fontSize: 12, color: Colors.textSecondary, fontWeight: '400', letterSpacing: 0.3 },
  name:          { fontSize: 28, fontWeight: '900', color: Colors.text, letterSpacing: -1, marginTop: 1 },
  headerRight:   { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  iconBtn:       { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: Colors.cardBorder },
  avatarCircle:  { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: 16, fontWeight: '800', color: '#333' },

  /* Avatar card */
  avatarSection:    { marginHorizontal: Spacing.md, borderRadius: Radius.xxl, borderWidth: 1, borderColor: 'rgba(226,209,179,0.22)' },
  avatarTopAccent:  { height: 3, backgroundColor: Colors.accent },
  genderRow:        { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, marginBottom: 4 },
  genderPill:       { flex: 1, paddingVertical: 9, borderRadius: Radius.full, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.10)' },
  genderPillActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  genderPillTxt:       { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.40)' },
  genderPillTxtActive: { color: '#333', fontWeight: '800' },

  avatarBodyRow: { flexDirection: 'row', alignItems: 'center', paddingRight: Spacing.md },
  statsCol:      { flex: 1, paddingLeft: Spacing.md },
  statItem:      { alignItems: 'center', paddingVertical: 16 },
  statSep:       { height: 0.5, backgroundColor: 'rgba(255,255,255,0.08)', marginHorizontal: Spacing.sm },
  statBigVal:    { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: -1.2 },
  statBigUnit:   { fontSize: 11, fontWeight: '400', color: 'rgba(255,255,255,0.45)', marginTop: 2 },
  statBigLbl:    { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 4 },

  /* 5-stat bar */
  stepWrap:   { marginHorizontal: Spacing.md, marginTop: Spacing.md },
  statsStrip: { flexDirection: 'row', backgroundColor: Colors.card, borderRadius: Radius.xl, overflow: 'hidden', borderWidth: 0.5, borderColor: Colors.cardBorder },
  statBlock:  { flex: 1, paddingVertical: 12, alignItems: 'center' },
  statDivider:{ borderRightWidth: 0.5, borderRightColor: Colors.cardBorder },
  statValRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  statVal:    { fontSize: 17, fontWeight: '900', color: Colors.text, letterSpacing: -0.5 },
  statLbl:    { fontSize: 8, color: Colors.textSecondary, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  stepTrack:  { height: 4, backgroundColor: Colors.surface, borderRadius: Radius.full, overflow: 'hidden', marginTop: 8 },
  stepFill:   { height: '100%', backgroundColor: Colors.accent, borderRadius: Radius.full },

  /* Section headers */
  sectionRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, marginTop: Spacing.xl, marginBottom: Spacing.md },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  accentBar:       { width: 3, height: 16, borderRadius: 2, backgroundColor: Colors.accent },
  sectionTitle:    { fontSize: 12, fontWeight: '800', color: Colors.text, letterSpacing: 2.5, textTransform: 'uppercase' },
  sectionDate:     { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },

  /* Energy balance card */
  energyCard:      { marginHorizontal: Spacing.md, borderRadius: Radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(226,209,179,0.15)', paddingBottom: Spacing.md },
  energyCardInner: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.md },
  energyLegend:    { flex: 1, gap: 10 },
  legendItem:      { flexDirection: 'row', alignItems: 'center', gap: 10 },
  legendDot:       { width: 10, height: 10, borderRadius: 5 },
  legendVal:       { fontSize: 15, fontWeight: '800', color: Colors.text },
  legendLbl:       { fontSize: 10, color: Colors.textSecondary, marginTop: 1 },
  legendSep:       { height: 0.5, backgroundColor: Colors.cardBorder },
  energyHint:      { fontSize: 11, color: Colors.textTertiary, textAlign: 'center', paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm, lineHeight: 17 },

  /* Ring */
  ringWrap:     { width: RING_SIZE, height: RING_SIZE },
  ringCenter:   { alignItems: 'center', justifyContent: 'center' },
  ringSubLabel: { fontSize: 8, fontWeight: '700', color: 'rgba(255,255,255,0.35)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 2 },
  ringBalance:  { fontSize: 30, fontWeight: '900', letterSpacing: -1.5 },
  ringUnit:     { fontSize: 10, fontWeight: '500', color: 'rgba(255,255,255,0.45)', marginTop: 2 },

  /* Recent sessions */
  sessionRow:  { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.md, marginHorizontal: Spacing.md, marginBottom: Spacing.sm, gap: Spacing.md, borderWidth: 0.5, borderColor: Colors.cardBorder },
  sessionDot:  { width: 44, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  sessionDate: { fontSize: 14, fontWeight: '700', color: Colors.text, textTransform: 'capitalize' },
  sessionSub:  { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  effortTag:   { borderRadius: Radius.sm, paddingHorizontal: 8, paddingVertical: 5 },
  effortTagTxt:{ fontSize: 12, fontWeight: '800' },
});
