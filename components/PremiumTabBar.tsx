import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  LayoutDashboard,
  Dumbbell,
  Timer,
  Salad,
  User,
} from 'lucide-react-native';

const CHAMPAGNE = '#E2D1B3';
const INACTIVE  = 'rgba(226,209,179,0.33)';

type TabConfig = {
  label: string;
  icon: (color: string) => React.ReactNode;
};

const TAB_CONFIG: Record<string, TabConfig> = {
  index: {
    label: 'Dashboard',
    icon: (c) => <LayoutDashboard size={22} color={c} strokeWidth={1.4} />,
  },
  programmes: {
    label: 'Programmes',
    icon: (c) => <Dumbbell size={22} color={c} strokeWidth={1.4} />,
  },
  activity: {
    label: 'Suivi',
    icon: (c) => <Timer size={22} color={c} strokeWidth={1.4} />,
  },
  nutrition: {
    label: 'Nutrition',
    icon: (c) => <Salad size={22} color={c} strokeWidth={1.4} />,
  },
  profile: {
    label: 'Profil',
    icon: (c) => <User size={22} color={c} strokeWidth={1.4} />,
  },
};

function GlowTab({
  config,
  isActive,
  onPress,
}: {
  config: TabConfig;
  isActive: boolean;
  onPress: () => void;
}) {
  const glowAnim  = useRef(new Animated.Value(isActive ? 1 : 0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const loopRef   = useRef<{ start: () => void; stop: () => void } | null>(null);

  useEffect(() => {
    Animated.timing(glowAnim, {
      toValue: isActive ? 1 : 0,
      duration: 320,
      useNativeDriver: true,
    }).start();

    if (loopRef.current) {
      loopRef.current.stop();
      loopRef.current = null;
    }

    if (isActive) {
      loopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.13, duration: 1900, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.00, duration: 1900, useNativeDriver: true }),
        ])
      );
      loopRef.current.start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isActive]);

  return (
    <TouchableOpacity style={styles.tabItem} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.iconWrap}>
        {/* Glow halo — visible only on active tab */}
        <Animated.View
          style={[
            styles.glowCircle,
            { opacity: glowAnim, transform: [{ scale: pulseAnim }] },
          ]}
        />
        {config.icon(isActive ? CHAMPAGNE : INACTIVE)}
      </View>
      <Text style={[styles.tabLabel, { color: isActive ? CHAMPAGNE : INACTIVE }]}>
        {config.label}
      </Text>
    </TouchableOpacity>
  );
}

export default function PremiumTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 6) }]}>
      <View style={styles.pill}>
        {/* Lapis-lazuli gradient */}
        <LinearGradient
          colors={['#0B1D3F', '#0E3054', '#083A48']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0.2 }}
          style={[StyleSheet.absoluteFill, { borderRadius: 38 }]}
        />
        {/* Glass film */}
        <View style={styles.glassFilm} />

        {state.routes.map((route: any, index: number) => {
          const config  = TAB_CONFIG[route.name];
          if (!config) return null;
          const isActive = state.index === index;

          return (
            <GlowTab
              key={route.key}
              config={config}
              isActive={isActive}
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!isActive && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 14,
    paddingTop: 8,
    backgroundColor: 'transparent',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 38,
    overflow: 'hidden',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(226,209,179,0.13)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 22,
    elevation: 16,
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow:
            '0 8px 32px rgba(0,0,0,0.50), 0 0 0 1px rgba(226,209,179,0.10)',
        } as any)
      : {}),
  },
  glassFilm: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 38,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    gap: 3,
  },
  iconWrap: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowCircle: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(226,209,179,0.13)',
    shadowColor: CHAMPAGNE,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: 18,
    elevation: 10,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow:
            '0 0 16px rgba(226,209,179,0.60), 0 0 36px rgba(226,209,179,0.28)',
        } as any)
      : {}),
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
