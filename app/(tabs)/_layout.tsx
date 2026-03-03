import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React, { useMemo } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { useThemePreference } from '@/contexts/theme-preference';

type TabColors = {
  bgTab: string;
  primary: string;
  inactiveIcon: string;
  activeText: string;
  inactiveText: string;
  border: string;
  shadow: string;
  white: string;
  aiFocused: string;
};

function TabIcon({
  focused,
  icon,
  colors,
}: {
  focused: boolean;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  colors: TabColors;
}) {
  return (
    <View style={styles.iconTabItem}>
      <MaterialCommunityIcons size={24} name={icon} color={focused ? colors.primary : colors.inactiveIcon} />
    </View>
  );
}

function CustomAiTabBarButton({
  onPress,
  accessibilityState,
  colors,
}: {
  onPress?: () => void;
  accessibilityState?: { selected?: boolean };
  colors: TabColors;
}) {
  const focused = accessibilityState?.selected ?? false;

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.aiButtonContainer}>
      <View style={styles.aiOuter}>
        <View
          style={[
            styles.aiButton,
            {
              backgroundColor: colors.primary,
              borderColor: colors.bgTab,
              shadowColor: colors.primary,
            },
            focused && { backgroundColor: colors.aiFocused, transform: [{ scale: 1.05 }] },
          ]}>
          <MaterialCommunityIcons name="robot-outline" size={28} color={colors.white} />
        </View>
        <Text style={[styles.label, { color: focused ? colors.activeText : colors.inactiveText }]}>AI Chat</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  const { resolvedTheme } = useThemePreference();
  const isDark = resolvedTheme === 'dark';

  const colors = useMemo<TabColors>(
    () =>
      isDark
        ? {
            bgTab: '#1E160E',
            primary: '#C68B2F',
            inactiveIcon: '#A58C6E',
            activeText: '#E8C48A',
            inactiveText: '#9D8568',
            border: '#4E3A23',
            shadow: '#000000',
            white: '#FFFFFF',
            aiFocused: '#AE742B',
          }
        : {
            bgTab: '#FFF7EA',
            primary: '#C68B2F',
            inactiveIcon: '#9A8465',
            activeText: '#7A4B16',
            inactiveText: '#A38D70',
            border: '#F0DEBF',
            shadow: '#B57D2D',
            white: '#FFFFFF',
            aiFocused: '#B57D2D',
          },
    [isDark]
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.activeText,
        tabBarInactiveTintColor: colors.inactiveText,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: colors.bgTab,
            borderColor: colors.border,
            shadowColor: colors.shadow,
            shadowOpacity: isDark ? 0.35 : 0.12,
          },
        ],
        tabBarLabelStyle: styles.label,
        tabBarItemStyle: styles.tabItem,
      }}>
      <Tabs.Screen
        name="Home"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="home-variant-outline" colors={colors} />,
        }}
      />

      <Tabs.Screen
        name="Quran"
        options={{
          title: 'Quran',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="book-open-page-variant" colors={colors} />,
        }}
      />

      <Tabs.Screen
        name="ai_muslim"
        options={{
          tabBarButton: (props) => <CustomAiTabBarButton {...props} colors={colors} />,
        }}
      />

      <Tabs.Screen
        name="artikel"
        options={{
          title: 'Artikel',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="text-box-outline" colors={colors} />,
        }}
      />

      <Tabs.Screen
        name="setting"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="cog-outline" colors={colors} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: Platform.OS === 'ios' ? 24 : 16,
    height: 72,
    borderRadius: 26,
    borderTopWidth: 0,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 8,
    paddingHorizontal: 6,
  },
  tabItem: {
    paddingTop: 8,
    paddingBottom: 4,
    height: 72,
  },
  iconTabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  aiButtonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 72,
  },
  aiOuter: {
    position: 'absolute',
    top: -26,
    alignItems: 'center',
    width: 70,
  },
  aiButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
});
