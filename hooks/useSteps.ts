import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { Pedometer } from 'expo-pedometer';
import { useUserStore } from '@/store/userStore';

export function useSteps() {
  const [available, setAvailable] = useState(false);
  const setSteps = useUserStore((s) => s.setSteps);

  useEffect(() => {
    let sub: any;

    async function init() {
      try {
        const { granted } = await Pedometer.requestPermissionsAsync();
        if (!granted) return;

        const { available: avail } = await Pedometer.isAvailableAsync();
        setAvailable(avail);
        if (!avail) return;

        const now = new Date();
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);

        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - 7);

        const [dayResult, weekResult] = await Promise.all([
          Pedometer.getStepCountAsync(startOfDay, now),
          Pedometer.getStepCountAsync(startOfWeek, now),
        ]);

        setSteps(dayResult.steps, weekResult.steps);

        sub = Pedometer.watchStepCount((result) => {
          setSteps(result.steps, weekResult.steps);
        });
      } catch (_) {
        // Pedometer unavailable on simulator
      }
    }

    init();
    return () => sub?.remove();
  }, []);

  return { available };
}
