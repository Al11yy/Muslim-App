import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#9E6020',
        tabBarInactiveTintColor: '#A99882',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#FFF8ED',
          borderTopColor: '#E9DDC8',
          borderTopWidth: 1,
          height: 72,
          paddingTop: 8,
          paddingBottom: 9,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
      }}>
      <Tabs.Screen
        name="Home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="Quran"
        options={{
          title: 'Quran',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="book.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="for_you"
        options={{
          title: 'For You',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="sparkles" color={color} />,
        }}
      />
      <Tabs.Screen
        name="setting"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
