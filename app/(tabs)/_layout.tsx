import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View, Text, Platform, TouchableOpacity } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';

// ─── KONSTANTA WARNA (TEMA LU) ────────────────────────────────────────────────
const COLORS = {
  bgTab: '#FFF7EA',
  primary: '#C68B2F',
  inactiveIcon: '#9A8465', 
  activeText: '#7A4B16',   
  inactiveText: '#A38D70', 
  border: '#F0DEBF',
  shadow: '#B57D2D',
  white: '#FFFFFF',
};

// ─── KOMPONEN ICON SAMPING (CLEAN STYLE) ──────────────────────────────────────
function TabIcon({ focused, icon }: { focused: boolean; icon: any }) {
  return (
    <View style={styles.iconTabItem}>
      <MaterialCommunityIcons 
        size={24} 
        name={icon} 
        color={focused ? COLORS.primary : COLORS.inactiveIcon} 
      />
    </View>
  );
}

// ─── KOMPONEN CUSTOM TOMBOL AI (FLOATING & STABIL) ─────────────────────────────
function CustomAiTabBarButton({ onPress, accessibilityState }: any) {
  // FIX CRASH DI SINI: Pakai tanda tanya (?) biar gak crash pas undefined
  const focused = accessibilityState?.selected ?? false; 
  
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.aiButtonContainer}
    >
      <View style={styles.aiOuter}>
        <View style={[styles.aiButton, focused && styles.aiButtonFocused]}>
          <MaterialCommunityIcons name="robot-outline" size={28} color={COLORS.white} />
        </View>
        <Text style={[styles.label, styles.aiLabel, focused && styles.aiLabelFocused]}>
          AI Chat
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── LAYOUT UTAMA ─────────────────────────────────────────────────────────────
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab, 
        tabBarShowLabel: true,
        tabBarActiveTintColor: COLORS.activeText,
        tabBarInactiveTintColor: COLORS.inactiveText,
        
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.label,
        tabBarItemStyle: styles.tabItem,
      }}>
      
      <Tabs.Screen
        name="Home"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="home-variant-outline" />,
        }}
      />
      
      <Tabs.Screen
        name="Quran"
        options={{
          title: 'Quran',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="book-open-page-variant" />,
        }}
      />

      {/* TAB KHUSUS AI - Kita custom total buttonnya */}
      <Tabs.Screen
        name="ai_muslim"
        options={{
          tabBarButton: (props) => <CustomAiTabBarButton {...props} />,
        }}
      />

      <Tabs.Screen
        name="artikel"
        options={{
          title: 'Artikel',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="text-box-outline" />,
        }}
      />

      <Tabs.Screen
        name="setting"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="cog-outline" />,
        }}
      />
    </Tabs>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: Platform.OS === 'ios' ? 24 : 16, 
    height: 72, 
    backgroundColor: COLORS.bgTab,
    borderRadius: 24,
    borderTopWidth: 0, 
    borderWidth: 1.5,
    borderColor: COLORS.border,
    
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    
    paddingHorizontal: 10,
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
    top: -24, 
    alignItems: 'center',
    width: 70, 
  },
  
  aiButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    borderWidth: 4,
    borderColor: COLORS.bgTab, 
    justifyContent: 'center',
    alignItems: 'center',
    
    elevation: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  aiButtonFocused: {
    backgroundColor: '#B57D2D', 
    transform: [{ scale: 1.05 }], 
  },
  
  aiLabel: {
    color: COLORS.inactiveText, 
    fontSize: 10,
    fontWeight: '800',
    marginTop: 4, 
  },
  aiLabelFocused: {
    color: COLORS.activeText, 
  },
});