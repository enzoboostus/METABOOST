import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';

const COUNT = 18;
const MAX_R = 90;

function Particle({ angle, delay, trigger }: { angle: number; delay: number; trigger: number }) {
  const progress = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);

  useEffect(() => {
    if (trigger > 0) {
      progress.value = 0;
      opacity.value = 0;
      scale.value = 0.5;
      progress.value = withDelay(
        delay,
        withTiming(1, { duration: 700, easing: Easing.out(Easing.quad) }),
      );
      opacity.value = withDelay(
        delay,
        withSequence(
          withTiming(1, { duration: 80 }),
          withTiming(1, { duration: 370 }),
          withTiming(0, { duration: 250 }),
        ),
      );
      scale.value = withDelay(
        delay,
        withSequence(
          withTiming(1.4, { duration: 120 }),
          withTiming(1, { duration: 580 }),
        ),
      );
    }
  }, [trigger]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: Math.cos(angle) * MAX_R * progress.value },
      { translateY: Math.sin(angle) * MAX_R * progress.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.dot, animStyle]} />;
}

export default function ParticleEffect({ trigger }: { trigger: number }) {
  return (
    <View style={styles.root} pointerEvents="none">
      {Array.from({ length: COUNT }, (_, i) => (
        <Particle
          key={i}
          angle={(i / COUNT) * Math.PI * 2}
          delay={i * 15}
          trigger={trigger}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: '50%' as any,
    top: '50%' as any,
    width: 0,
    height: 0,
    zIndex: 99,
    pointerEvents: 'none' as any,
  },
  dot: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.gold,
    shadowColor: Colors.gold,
    shadowOpacity: 0.9,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
});
