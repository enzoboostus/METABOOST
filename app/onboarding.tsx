import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Dimensions, Animated, Platform, Alert, Keyboard, ScrollView, Image, Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Flame, TrendingUp, Shield, ChevronRight, ChevronLeft, ScanLine,
  Activity, Users, ChevronDown, Bot, Mail,
} from 'lucide-react-native';
import { useShallow } from 'zustand/react/shallow';
import { useUserStore, Gender, Goal } from '@/store/userStore';
import { supabase, SUPABASE_URL } from '@/lib/supabase';
import { Colors, Spacing, Radius } from '@/constants/theme';
import * as Haptics from 'expo-haptics';
import React, { useState, useEffect, useRef } from 'react';

const { width: W, height: H } = Dimensions.get('window');
const PROFILE_CARD_W = Math.round(W * 0.76);
const PROFILE_GAP = 12;
const PROFILES = [
  {
    title: 'MUSCULATION & PROGRAMMATION',
    subTag: '(renforcement musculaire)',
    desc: "Que votre objectif soit une prise de masse, une perte de poids, de l'entretien ou du renforcement fonctionnel et adapté (APA / Santé), notre système s'ajuste à chaque profil, du débutant absolu à l'athlète exigeant. Cette carte débloque un écosystème unique : bénéficiez de protocoles évolutifs automatisés, connectés directement à une plateforme de suivi personnalisé. Que ce soit avec mes propres programmes ou via votre coach et salle de sport partenaire, chaque professionnel peut piloter, valider et vous envoyer vos séances sur mesure pour un accompagnement à la fois humain, sécurisé et ultra-précis.",
    accent: '#00C8D4', emoji: '💪', tag: 'UNIVERS DE LA MUSCULATION',
    trioImg: require('../assets/avatars/musculation_trio.jpeg'),
  },
];

type Step = 'login' | 'welcome' | 'goal' | 'measures';
const STEPS: Step[] = ['login', 'welcome', 'goal', 'measures'];
const PROGRESS: Record<Step, number> = { login: 0, welcome: 0.33, goal: 0.66, measures: 1 };

export default function Onboarding() {
  const [step, setStep] = useState<Step>('login');
  const [userName, setUserName] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleGoogle() {
    if (googleLoading) return;
    setGoogleLoading(true);
    try {
      if (Platform.OS === 'web') {
        try {
          localStorage.setItem('metaboost-pending-onboarding', JSON.stringify({ userName: userName.trim(), gender }));
        } catch {}
      }
      const redirectTo = Platform.OS === 'web'
        ? `${window.location.origin}/auth/callback`
        : 'metaboost://auth/callback';
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo, queryParams: { access_type: 'offline', prompt: 'consent' }, skipBrowserRedirect: true },
      });
      if (error) { Alert.alert('Erreur', error.message); setGoogleLoading(false); return; }
      if (data?.url && Platform.OS === 'web') { (window as any).location.href = data.url; }
      else { Alert.alert('Erreur', 'Impossible de se connecter.'); setGoogleLoading(false); }
    } catch (e: any) {
      Alert.alert('Erreur', e?.message || 'Connexion Google indisponible.');
      setGoogleLoading(false);
    }
  }

  return <View style={{ flex: 1 }} />;
}
