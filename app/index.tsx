import { Redirect } from 'expo-router';
import { useUserStore } from '@/store/userStore';

export default function Index() {
  const onboardingDone = useUserStore((s) => s.profile.onboardingDone);
  return <Redirect href={onboardingDone ? '/(tabs)/' : '/onboarding'} />;
}
