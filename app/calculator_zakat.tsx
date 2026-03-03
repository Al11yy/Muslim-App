import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useThemePreference } from '@/contexts/theme-preference';

function parseNumber(input: string) {
  const clean = input.replace(/[^0-9]/g, '');
  return Number(clean || '0');
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function CalculatorZakat() {
  const router = useRouter();
  const { resolvedTheme } = useThemePreference();
  const isDark = resolvedTheme === 'dark';

  const [totalAssetsInput, setTotalAssetsInput] = useState('');
  const [totalDebtsInput, setTotalDebtsInput] = useState('');
  const [goldPriceInput, setGoldPriceInput] = useState('1200000');

  const totalAssets = parseNumber(totalAssetsInput);
  const totalDebts = parseNumber(totalDebtsInput);
  const goldPrice = parseNumber(goldPriceInput);

  const nisab = useMemo(() => goldPrice * 85, [goldPrice]);
  const netAssets = useMemo(() => Math.max(totalAssets - totalDebts, 0), [totalAssets, totalDebts]);
  const isWajibZakat = netAssets >= nisab;
  const zakatAmount = isWajibZakat ? netAssets * 0.025 : 0;

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
            success: '#88D17A',
          }
        : {
            bg: '#F7F1E8',
            text: '#1C1408',
            muted: '#8A7255',
            surface: '#FFFDF5',
            border: '#EADBC0',
            gold: '#C68B2F',
            success: '#2E8B57',
          },
    [isDark]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={[styles.backBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>Calculator Zakat</Text>
        <View style={styles.topSpacer} />
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.muted }]}>Total harta (Rp)</Text>
        <TextInput
          value={totalAssetsInput}
          onChangeText={setTotalAssetsInput}
          placeholder="Contoh: 150000000"
          placeholderTextColor={colors.muted}
          keyboardType="number-pad"
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
        />

        <Text style={[styles.label, { color: colors.muted }]}>Total utang jatuh tempo (Rp)</Text>
        <TextInput
          value={totalDebtsInput}
          onChangeText={setTotalDebtsInput}
          placeholder="Contoh: 20000000"
          placeholderTextColor={colors.muted}
          keyboardType="number-pad"
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
        />

        <Text style={[styles.label, { color: colors.muted }]}>Harga emas per gram (Rp)</Text>
        <TextInput
          value={goldPriceInput}
          onChangeText={setGoldPriceInput}
          placeholder="Harga emas hari ini"
          placeholderTextColor={colors.muted}
          keyboardType="number-pad"
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
        />
      </View>

      <View style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.resultLabel, { color: colors.muted }]}>Nisab (85 gram emas)</Text>
        <Text style={[styles.resultValue, { color: colors.text }]}>{formatRupiah(nisab)}</Text>

        <Text style={[styles.resultLabel, { color: colors.muted }]}>Harta bersih</Text>
        <Text style={[styles.resultValue, { color: colors.text }]}>{formatRupiah(netAssets)}</Text>

        <Text style={[styles.resultLabel, { color: colors.muted }]}>Status</Text>
        <Text style={[styles.resultStatus, { color: isWajibZakat ? colors.success : colors.muted }]}>
          {isWajibZakat ? 'Wajib zakat' : 'Belum wajib zakat'}
        </Text>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Text style={[styles.resultLabel, { color: colors.muted }]}>Estimasi zakat (2.5%)</Text>
        <Text style={[styles.zakatValue, { color: colors.gold }]}>{formatRupiah(zakatAmount)}</Text>
      </View>
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
    color: '#1C1408',
  },
  topSpacer: {
    width: 40,
    height: 40,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 6,
  },
  label: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '700',
    color: '#8A7255',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 2,
  },
  resultCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 2,
  },
  resultLabel: {
    fontSize: 12,
    color: '#8A7255',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  resultStatus: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#EADBC0',
    marginVertical: 8,
  },
  zakatValue: {
    fontSize: 24,
    fontWeight: '800',
  },
});
