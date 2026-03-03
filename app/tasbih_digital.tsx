import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useThemePreference } from '@/contexts/theme-preference';

const PRESETS = [33, 99, 100];

export default function TasbihDigital() {
  const router = useRouter();
  const { resolvedTheme } = useThemePreference();
  const isDark = resolvedTheme === 'dark';
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(33);

  const progress = Math.min(count / target, 1);

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
        <Text style={[styles.title, { color: colors.text }]}>Tasbih Digital</Text>
        <View style={styles.topSpacer} />
      </View>

      <View style={[styles.counterCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.counterLabel, { color: colors.muted }]}>Jumlah Dzikir</Text>
        <Text style={[styles.counterValue, { color: colors.text }]}>{count}</Text>
        <Text style={[styles.counterTarget, { color: colors.gold }]}>{`Target: ${target}`}</Text>

        <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
          <View style={[styles.progressFill, { backgroundColor: colors.gold, width: `${progress * 100}%` }]} />
        </View>
      </View>

      <View style={styles.presetRow}>
        {PRESETS.map((preset) => (
          <Pressable
            key={preset}
            onPress={() => {
              setTarget(preset);
              setCount(0);
            }}
            style={[
              styles.presetChip,
              { borderColor: colors.border, backgroundColor: colors.surface },
              target === preset && { borderColor: colors.gold, backgroundColor: 'rgba(198,139,47,0.14)' },
            ]}>
            <Text style={[styles.presetText, { color: colors.text }]}>{preset}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.actionRow}>
        <Pressable onPress={() => setCount((prev) => Math.max(prev - 1, 0))} style={[styles.smallBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <Ionicons name="remove" size={24} color={colors.text} />
        </Pressable>

        <Pressable onPress={() => setCount((prev) => prev + 1)} style={[styles.mainBtn, { backgroundColor: colors.gold }]}>
          <Text style={styles.mainBtnText}>Tambah</Text>
        </Pressable>

        <Pressable onPress={() => setCount(0)} style={[styles.smallBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <Ionicons name="refresh" size={22} color={colors.text} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F1E8',
    paddingHorizontal: 16,
    gap: 14,
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
  counterCard: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 14,
    alignItems: 'center',
    gap: 6,
  },
  counterLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  counterValue: {
    fontSize: 64,
    fontWeight: '800',
    lineHeight: 76,
  },
  counterTarget: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressTrack: {
    width: '100%',
    height: 10,
    borderRadius: 999,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
  },
  presetChip: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  presetText: {
    fontSize: 13,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  smallBtn: {
    flex: 1,
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainBtn: {
    flex: 2,
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
  },
});
