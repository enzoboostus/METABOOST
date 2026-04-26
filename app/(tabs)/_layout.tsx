import { Tabs } from 'expo-router';
import PremiumTabBar from '@/components/PremiumTabBar';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <PremiumTabBar {...props} />}
    >
      <Tabs.Screen name="index"       options={{ title: 'Dashboard'  }} />
      <Tabs.Screen name="programmes"  options={{ title: 'Programmes' }} />
      <Tabs.Screen name="activity"    options={{ title: 'Suivi'      }} />
      <Tabs.Screen name="nutrition"   options={{ title: 'Nutrition'  }} />
      <Tabs.Screen name="profile"     options={{ title: 'Profil'     }} />
    </Tabs>
  );
}
