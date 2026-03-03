import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MORE_MENU_ITEMS } from '@/constants/feature-menu';
import { useThemePreference } from '@/contexts/theme-preference';

export default function More() {
  const router = useRouter();
  const { resolvedTheme } = useThemePreference();
  const isDark = resolvedTheme === 'dark';

  const theme = useMemo(
    () => ({
      bg: isDark ? '#1A130B' : '#F7F1E8',
      text: isDark ? '#F6ECDD' : '#1C1408',
      muted: isDark ? '#CAB79C' : '#8A7255',
      body: isDark ? '#E9D8BF' : '#5D452D',
      surface: isDark ? '#2A1F12' : '#FFFDF5',
      pressed: isDark ? '#352818' : '#F7ECD9',
      border: isDark ? '#4A3825' : '#EADBC0',
      gold: '#C68B2F',
      goldSoft: isDark ? 'rgba(198,139,47,0.22)' : 'rgba(198,139,47,0.13)',
    }),
    [isDark]
  );

  const quickFeatures = MORE_MENU_ITEMS.filter((item) => item.section === 'quick');
  const extraFeatures = MORE_MENU_ITEMS.filter((item) => item.section === 'extra');

  const renderFeatureCard = (
    item: (typeof MORE_MENU_ITEMS)[number],
    index: number
  ) => (
    <Pressable
      key={item.id}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.surface, borderColor: theme.border },
        pressed && [styles.cardPressed, { backgroundColor: theme.pressed }],
      ]}
      onPress={() => router.push(item.route as never)}>
      <View style={[styles.iconWrap, { backgroundColor: theme.goldSoft }]}>
        <MaterialCommunityIcons name={item.icon} size={20} color={theme.gold} />
      </View>

      <View style={styles.cardBody}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
        <Text style={[styles.cardDesc, { color: theme.body }]} numberOfLines={2}>
          {item.description ?? 'Fitur siap dipakai.'}
        </Text>
      </View>

      <View style={styles.trailingWrap}>
        <View style={[styles.orderBadge, { backgroundColor: theme.goldSoft }]}>
          <Text style={[styles.orderBadgeText, { color: theme.gold }]}>{String(index + 1).padStart(2, '0')}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={theme.muted} />
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={[styles.backBtn, { borderColor: theme.border, backgroundColor: theme.surface }]}>
          <Ionicons name="chevron-back" size={22} color={theme.text} />
        </Pressable>
        <Text style={[styles.topTitle, { color: theme.text }]}>More Features</Text>
        <View style={styles.topSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionWrap}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Akses Cepat</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.muted }]}>
            Semua fitur utama dari halaman Home.
          </Text>
          <View style={styles.listWrap}>{quickFeatures.map((item, index) => renderFeatureCard(item, index))}</View>
        </View>

        <View style={styles.sectionWrap}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Tambahan</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.muted }]}>
            Kalender Hijriah, Donasi, Kalkulator Zakat, dan fitur pendukung lainnya.
          </Text>
          <View style={styles.listWrap}>{extraFeatures.map((item, index) => renderFeatureCard(item, index))}</View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F1E8',
  },
  topBar: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'serif',
    color: '#1C1408',
  },
  topSpacer: {
    width: 40,
    height: 40,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 28,
    gap: 18,
  },
  sectionWrap: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1408',
    fontFamily: 'serif',
  },
  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: '#8A7255',
  },
  listWrap: {
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDF5',
    borderWidth: 1,
    borderColor: '#EADBC0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
  },
  cardPressed: {
    backgroundColor: '#F7ECD9',
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(198,139,47,0.13)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1408',
  },
  cardDesc: {
    fontSize: 12,
    lineHeight: 18,
    color: '#5D452D',
  },
  trailingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  orderBadge: {
    minWidth: 28,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  orderBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
});
