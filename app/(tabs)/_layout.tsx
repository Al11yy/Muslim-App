import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomTabBar, BottomTabBarButtonProps, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { useThemePreference } from '@/contexts/theme-preference';
import { subscribeTabBarScroll } from '@/lib/tab-bar-visibility';

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
  onPress?: BottomTabBarButtonProps['onPress'];
  accessibilityState?: BottomTabBarButtonProps['accessibilityState'];
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
          <Image source={require('../../assets/images/logo-AlUkhuwah-noBg.png')} style={styles.aiLogo} resizeMode="contain" />
        </View>
        <Text style={[styles.label, { color: focused ? colors.activeText : colors.inactiveText }]}>AI Chat</Text>
      </View>
    </TouchableOpacity>
  );
}

function AnimatedTabBar(props: BottomTabBarProps) {
  const [isInteractive, setIsInteractive] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(56)).current;
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHideTimer = useCallback(() => {
    if (!hideTimerRef.current) return;
    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = null;
  }, []);

  const hideBar = useCallback(() => {
    clearHideTimer();
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 56,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) setIsInteractive(false);
    });
  }, [clearHideTimer, opacity, translateY]);

  const showBar = useCallback(() => {
    setIsInteractive(true);
    clearHideTimer();
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    hideTimerRef.current = setTimeout(() => {
      hideBar();
    }, 5000);
  }, [clearHideTimer, hideBar, opacity, translateY]);

  useEffect(() => {
    const unsubscribe = subscribeTabBarScroll(showBar);
    return () => {
      unsubscribe();
      clearHideTimer();
    };
  }, [clearHideTimer, showBar]);

  return (
    <Animated.View
      pointerEvents={isInteractive ? 'auto' : 'none'}
      style={[styles.tabBarAnimator, { opacity, transform: [{ translateY }] }]}>
      <BottomTabBar {...props} />
    </Animated.View>
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
      tabBar={(props) => <AnimatedTabBar {...props} />}
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
    left: 30,
    right: 30,
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
  aiLogo: {
    width: 34,
    height: 34,
  },
  tabBarAnimator: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});
