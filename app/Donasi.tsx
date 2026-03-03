import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useThemePreference } from '@/contexts/theme-preference';

type DonationMethod = {
  id: 'qris' | 'transfer' | 'ewallet';
  name: string;
  desc: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
};

type Program = {
  id: string;
  title: string;
  collected: number;
  target: number;
};

const AMOUNT_OPTIONS = [10000, 25000, 50000, 100000, 250000];

const DONATION_METHODS: DonationMethod[] = [
  { id: 'qris', name: 'QRIS', desc: 'Scan QR untuk donasi cepat', icon: 'qrcode-scan' },
  { id: 'transfer', name: 'Transfer Bank', desc: 'BCA 1234567890 a.n. Yayasan Al Ukhuwah', icon: 'bank-outline' },
  { id: 'ewallet', name: 'E-Wallet', desc: 'DANA/OVO/Gopay 08xx-xxxx-xxxx', icon: 'wallet-outline' },
];

const PROGRAMS: Program[] = [
  { id: 'masjid', title: 'Renovasi Masjid Kampung', collected: 22500000, target: 50000000 },
  { id: 'santri', title: 'Beasiswa Santri Dhuafa', collected: 14800000, target: 30000000 },
  { id: 'pangan', title: 'Paket Pangan Jumat Berkah', collected: 6900000, target: 12000000 },
];

function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Donasi() {
  const router = useRouter();
  const { resolvedTheme } = useThemePreference();
  const isDark = resolvedTheme === 'dark';

  const [selectedAmount, setSelectedAmount] = useState(50000);
  const [selectedMethod, setSelectedMethod] = useState<DonationMethod['id']>('qris');

  const theme = useMemo(
    () => ({
      bg: isDark ? '#1A130B' : '#F7F1E8',
      text: isDark ? '#F6ECDD' : '#1C1408',
      muted: isDark ? '#CAB79C' : '#8A7255',
      surface: isDark ? '#2A1F12' : '#FFFDF5',
      softSurface: isDark ? '#332516' : '#FFF9ED',
      border: isDark ? '#4A3825' : '#EADBC0',
      gold: '#C68B2F',
      pressed: isDark ? '#352818' : '#F7ECD9',
    }),
    [isDark]
  );

  const selectedMethodObj = DONATION_METHODS.find((method) => method.id === selectedMethod) ?? DONATION_METHODS[0];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top']}>
      <View style={styles.topBarWrap}>
        <Pressable
          hitSlop={10}
          onPress={() => router.back()}
          style={[styles.backBtn, { borderColor: theme.border, backgroundColor: theme.surface }]}>
          <Ionicons name="chevron-back" size={20} color={theme.text} />
        </Pressable>
        <Text style={[styles.topBarTitle, { color: theme.text }]}>Donasi</Text>
        <View style={styles.topBarSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.heroCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.heroTitle, { color: theme.text }]}>Sedekah Terbaik Dimulai Hari Ini</Text>
          <Text style={[styles.heroSubtitle, { color: theme.muted }]}>
            Pilih nominal dan metode donasi. Dana akan disalurkan ke program sosial dan dakwah.
          </Text>
        </View>

        <View style={styles.sectionWrap}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Pilih Nominal</Text>
          <View style={styles.amountGrid}>
            {AMOUNT_OPTIONS.map((amount) => {
              const selected = selectedAmount === amount;
              return (
                <Pressable
                  key={amount}
                  onPress={() => setSelectedAmount(amount)}
                  style={[
                    styles.amountChip,
                    { borderColor: theme.border, backgroundColor: theme.surface },
                    selected && { borderColor: theme.gold, backgroundColor: theme.softSurface },
                  ]}>
                  <Text style={[styles.amountText, { color: selected ? theme.gold : theme.text }]}>
                    {formatRupiah(amount)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.sectionWrap}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Metode Pembayaran</Text>
          <View style={styles.methodList}>
            {DONATION_METHODS.map((method) => {
              const selected = selectedMethod === method.id;
              return (
                <Pressable
                  key={method.id}
                  onPress={() => setSelectedMethod(method.id)}
                  style={[
                    styles.methodItem,
                    { borderColor: theme.border, backgroundColor: theme.surface },
                    selected && { borderColor: theme.gold, backgroundColor: theme.softSurface },
                  ]}>
                  <View style={[styles.methodIconWrap, { backgroundColor: theme.softSurface }]}>
                    <MaterialCommunityIcons name={method.icon} size={18} color={theme.gold} />
                  </View>
                  <View style={styles.methodBody}>
                    <Text style={[styles.methodName, { color: theme.text }]}>{method.name}</Text>
                    <Text style={[styles.methodDesc, { color: theme.muted }]}>{method.desc}</Text>
                  </View>
                  <Ionicons
                    name={selected ? 'radio-button-on' : 'radio-button-off'}
                    size={18}
                    color={selected ? theme.gold : theme.muted}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.sectionWrap}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Program Donasi</Text>
          <View style={styles.programList}>
            {PROGRAMS.map((program) => {
              const progress = Math.min(program.collected / program.target, 1);
              return (
                <View key={program.id} style={[styles.programItem, { borderColor: theme.border, backgroundColor: theme.surface }]}>
                  <Text style={[styles.programTitle, { color: theme.text }]}>{program.title}</Text>
                  <Text style={[styles.programAmount, { color: theme.muted }]}>
                    {`${formatRupiah(program.collected)} / ${formatRupiah(program.target)}`}
                  </Text>
                  <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
                    <View style={[styles.progressFill, { backgroundColor: theme.gold, width: `${progress * 100}%` }]} />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.donateBtn,
            { backgroundColor: theme.gold },
            pressed && { opacity: 0.85 },
          ]}
          onPress={() => {
            Alert.alert(
              'Konfirmasi Donasi',
              `Nominal: ${formatRupiah(selectedAmount)}\nMetode: ${selectedMethodObj.name}\n\nTerima kasih, semoga jadi amal jariyah.`
            );
          }}>
          <Ionicons name="heart" size={16} color="#FFF" />
          <Text style={styles.donateBtnText}>Donasi Sekarang</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F1E8',
  },
  topBarWrap: {
    minHeight: 50,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1408',
    fontFamily: 'serif',
  },
  topBarSpacer: {
    width: 38,
    height: 38,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 26,
    gap: 14,
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 6,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'serif',
  },
  heroSubtitle: {
    fontSize: 13,
    lineHeight: 20,
  },
  sectionWrap: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'serif',
  },
  amountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amountChip: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  amountText: {
    fontSize: 12,
    fontWeight: '700',
  },
  methodList: {
    gap: 8,
  },
  methodItem: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  methodIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodBody: {
    flex: 1,
    minWidth: 0,
  },
  methodName: {
    fontSize: 14,
    fontWeight: '700',
  },
  methodDesc: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 17,
  },
  programList: {
    gap: 8,
  },
  programItem: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
  },
  programTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  programAmount: {
    fontSize: 12,
  },
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  donateBtn: {
    marginTop: 4,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  donateBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF',
  },
});
