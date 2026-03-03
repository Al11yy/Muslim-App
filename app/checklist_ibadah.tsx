import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useThemePreference } from '@/contexts/theme-preference';

type ChecklistItem = {
  id: string;
  title: string;
  subtitle: string;
};

const CHECKLIST_ITEMS: ChecklistItem[] = [
  { id: 'subuh', title: 'Sholat Subuh', subtitle: 'Tepat waktu dan berjamaah jika memungkinkan.' },
  { id: 'tilawah', title: 'Tilawah Quran', subtitle: 'Minimal 1 halaman.' },
  { id: 'dzikir', title: 'Dzikir Pagi/Petang', subtitle: 'Jaga konsistensi harian.' },
  { id: 'sedekah', title: 'Sedekah', subtitle: 'Walau sedikit, tetap rutin.' },
  { id: 'doa', title: 'Doa Harian', subtitle: 'Luangkan waktu berdoa dengan khusyuk.' },
];

export default function ChecklistIbadah() {
  const router = useRouter();
  const { resolvedTheme } = useThemePreference();
  const isDark = resolvedTheme === 'dark';
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const doneCount = Object.values(checked).filter(Boolean).length;
  const totalCount = CHECKLIST_ITEMS.length;

  const colors = useMemo(
    () =>
      isDark
        ? {
            bg: '#1A130B',
            text: '#F6ECDD',
            muted: '#CAB79C',
            surface: '#2A1F12',
            border: '#4A3825',
            gold: '#C68B2F',
          }
        : {
            bg: '#F7F1E8',
            text: '#1C1408',
            muted: '#8A7255',
            surface: '#FFFDF5',
            border: '#EADBC0',
            gold: '#C68B2F',
          },
    [isDark]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={[styles.backBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>Checklist Ibadah</Text>
        <View style={styles.topSpacer} />
      </View>

      <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.summaryLabel, { color: colors.muted }]}>Progres Hari Ini</Text>
        <Text style={[styles.summaryValue, { color: colors.gold }]}>{`${doneCount}/${totalCount}`}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.listWrap} showsVerticalScrollIndicator={false}>
        {CHECKLIST_ITEMS.map((item) => {
          const active = Boolean(checked[item.id]);
          return (
            <Pressable
              key={item.id}
              style={[
                styles.itemCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
                active && { borderColor: colors.gold },
              ]}
              onPress={() => setChecked((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}>
              <View style={styles.itemBody}>
                <Text style={[styles.itemTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.itemSubtitle, { color: colors.muted }]}>{item.subtitle}</Text>
              </View>
              <View style={[styles.checkWrap, { backgroundColor: active ? colors.gold : colors.border }]}>
                <Ionicons name={active ? 'checkmark' : 'ellipse-outline'} size={16} color={active ? '#FFF' : colors.muted} />
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F1E8',
    paddingHorizontal: 16,
    gap: 12,
  },
  topBar: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  title: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'serif',
  },
  topSpacer: {
    width: 40,
    height: 40,
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  summaryValue: {
    fontSize: 30,
    fontWeight: '800',
    marginTop: 4,
  },
  listWrap: {
    gap: 10,
    paddingBottom: 20,
  },
  itemCard: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  itemBody: {
    flex: 1,
    minWidth: 0,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  itemSubtitle: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 18,
  },
  checkWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
