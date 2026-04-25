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
        tabBarActiveTintColor: Colors.cyan,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <LayoutDashboard size={size} color={color} strokeWidth={1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activité',
          tabBarIcon: ({ color, size }) => (
            <Zap size={size} color={color} strokeWidth={1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          title: 'Nutrition',
          tabBarIcon: ({ color, size }) => (
            <Salad size={size} color={color} strokeWidth={1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} strokeWidth={1.5} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'rgba(2,2,2,0.94)',
    borderTopColor: 'rgba(255,255,255,0.08)',
    borderTopWidth: 0.5,
    height: Platform.OS === 'ios' ? 88 : 64,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
    backdropFilter: 'blur(32px)' as any,
    WebkitBackdropFilter: 'blur(32px)' as any,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '300',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
