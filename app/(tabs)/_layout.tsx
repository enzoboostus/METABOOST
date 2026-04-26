import { Tabs } from 'expo-router';
import { LayoutDashboard, Zap, Salad, User } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { Platform, StyleSheet } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#E2D1B3',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.30)',
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, size }) => (
            <LayoutDashboard size={22} color={color} strokeWidth={1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activité',
          tabBarIcon: ({ color, size }) => (
            <Zap size={22} color={color} strokeWidth={1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          title: 'Nutrition',
          tabBarIcon: ({ color, size }) => (
            <Salad size={22} color={color} strokeWidth={1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <User size={22} color={color} strokeWidth={1.5} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0A1128',
    borderTopColor: 'rgba(255,255,255,0.06)',
    borderTopWidth: 0.5,
    height: Platform.OS === 'ios' ? 84 : 62,
    paddingBottom: Platform.OS === 'ios' ? 24 : 6,
    paddingTop: 10,
    backdropFilter: 'blur(40px)' as any,
    WebkitBackdropFilter: 'blur(40px)' as any,
  },
  tabItem: {
    gap: 3,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.3,
    textTransform: 'none',
  },
});
