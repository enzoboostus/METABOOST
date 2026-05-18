import React, { useEffect, useState } from 'react';
import { Platform, View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';

const STORAGE_KEY = 'mb_install_banner_dismissed';

function isIOSSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  const isSafari = /safari/i.test(ua) && !/crios|fxios|opios|chrome/i.test(ua);
  const isStandalone = (navigator as any).standalone === true;
  return isIOS && isSafari && !isStandalone;
}

export default function InstallBanner() {
  const [visible, setVisible] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(120)).current;

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (!isIOSSafari()) return;
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch (_) {}
    const t = setTimeout(() => {
      setVisible(true);
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 60, friction: 12 }).start();
    }, 3000);
    return () => clearTimeout(t);
  }, []);

  function dismiss() {
    Animated.timing(slideAnim, { toValue: 120, duration: 280, useNativeDriver: true }).start(() => setVisible(false));
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch (_) {}
  }

  if (!visible) return null;

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.handle} />
      <View style={styles.row}>
        <View style={styles.iconBadge}>
          <Text style={styles.iconText}>⚡</Text>
        </View>
        <View style={styles.textBlock}>
          <Text style={styles.title}>Installer METABOOST</Text>
          <Text style={styles.sub}>Lance l'app en plein écran, sans barre Safari</Text>
        </View>
        <TouchableOpacity onPress={dismiss} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.closeX}>✕</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.steps}>
        <View style={styles.step}>
          <View style={styles.stepNum}><Text style={styles.stepNumTxt}>1</Text></View>
          <Text style={styles.stepTxt}>
            Appuie sur{' '}
            <Text style={styles.accent}>Partager</Text>
            {' '}— l'icône <Text style={styles.accent}>□↑</Text> en bas de Safari
          </Text>
        </View>
        <View style={styles.dividerLine} />
        <View style={styles.step}>
          <View style={styles.stepNum}><Text style={styles.stepNumTxt}>2</Text></View>
          <Text style={styles.stepTxt}>
            Défile et appuie sur{' '}
            <Text style={styles.accent}>"Sur l'écran d'accueil"</Text>
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute' as any,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    backgroundColor: '#0D1F3C',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: 'rgba(0,200,212,0.25)',
    shadowColor: '#00C8D4',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
  } as any,
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'center', marginBottom: 16,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  iconBadge: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: 'rgba(0,200,212,0.12)',
    borderWidth: 1, borderColor: 'rgba(0,200,212,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  iconText: { fontSize: 22 },
  textBlock: { flex: 1 },
  title: { fontSize: 15, fontWeight: '700', color: '#E2D1B3', letterSpacing: 0.2 },
  sub: { fontSize: 12, color: 'rgba(226,209,179,0.5)', marginTop: 2 },
  closeBtn: { padding: 4 },
  closeX: { fontSize: 14, color: 'rgba(255,255,255,0.35)', fontWeight: '600' },
  steps: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    gap: 12,
  },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stepNum: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: 'rgba(0,200,212,0.18)',
    borderWidth: 1, borderColor: '#00C8D4',
    alignItems: 'center', justifyContent: 'center',
    marginTop: 1,
  },
  stepNumTxt: { fontSize: 11, fontWeight: '800', color: '#00C8D4' },
  stepTxt: { flex: 1, fontSize: 13, color: 'rgba(226,209,179,0.75)', lineHeight: 19 },
  accent: { color: '#00C8D4', fontWeight: '700' },
  dividerLine: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginLeft: 34 },
});
