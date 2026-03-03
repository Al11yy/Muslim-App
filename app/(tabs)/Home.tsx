import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import {
    Alert,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Animated, {
    FadeIn,
    FadeInDown,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS } from '@/constants/colors';
import { HOME_QUICK_MENU } from '@/constants/feature-menu';
import { useAppTheme } from '@/hooks/useAppTheme';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { useRealtimeClock } from '@/hooks/useRealtimeClock';
import { notifyTabBarScroll } from '@/lib/tab-bar-visibility';

const ICON_COLOR = '#C68B2F';
const ICON_BG = 'rgba(198,139,47,0.12)';

const PRAYER_ICONS: React.ComponentProps<typeof MaterialCommunityIcons>['name'][] = [
  'weather-sunset-up',
  'white-balance-sunny',
  'weather-partly-cloudy',
  'weather-sunset-down',
  'moon-waning-crescent',
];

const HADITS_HARIAN = {
  text: 'Sesungguhnya setiap amalan tergantung pada niatnya, dan setiap orang akan mendapatkan sesuai dengan niatnya.',
  source: 'HR. Bukhari & Muslim',
};

const MONTHS_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export default function Home() {
  const router = useRouter();
  const theme = useAppTheme();
  const { isDark } = theme;
  const now = useRealtimeClock();
  const { prayers, activePrayerIndex, countdown, city, loading: prayerLoading } = usePrayerTimes();

  const pulseScale = useSharedValue(1);
  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.18, { duration: 800 }),
        withTiming(1, { duration: 800 }),
      ),
      -1,
    );
  }, [pulseScale]);
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulseScale.value }] }));

  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const dateStr = `${now.getDate()} ${MONTHS_ID[now.getMonth()]}, ${now.getFullYear()}`;

  const nextIdx = prayers.length > 0 ? (activePrayerIndex + 1) % prayers.length : 0;
  const nextPrayer = prayers[nextIdx]?.name ?? 'Sholat berikutnya';

  const prayerList =
    prayerLoading || prayers.length === 0
      ? [
          { name: 'Subuh', time: '--:--' },
          { name: 'Dzuhur', time: '--:--' },
          { name: 'Ashar', time: '--:--' },
          { name: 'Maghrib', time: '--:--' },
          { name: 'Isya', time: '--:--' },
        ]
      : prayers;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.bg }]} edges={['top']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <Animated.View entering={FadeIn.duration(320)} style={styles.topBar}>
        <Pressable hitSlop={10} onPress={() => router.push('/setting')}>
          <Ionicons name="person-circle-outline" size={26} color={theme.text} />
        </Pressable>
        <Text style={[styles.appName, { color: theme.text }]}>Al Ukhuwah</Text>
        <Pressable hitSlop={10} onPress={() => Alert.alert('Info', 'Fitur Pencarian segera hadir')}>
          <Ionicons name="search-outline" size={22} color={theme.text} />
        </Pressable>
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        onScroll={notifyTabBarScroll}
        onScrollBeginDrag={notifyTabBarScroll}
        scrollEventThrottle={16}>
        <Animated.View entering={FadeInDown.duration(420).delay(40)} style={styles.hero}>
          <Image
            source={require('../../assets/images/bg_header.png')}
            style={styles.heroBackdrop}
            resizeMode="contain"
          />
          <Text style={styles.heroDate}>{dateStr}</Text>
          <Text style={styles.heroClock}>
            {hh}<Text style={styles.heroClockColon}>:</Text>{mm}
          </Text>
          <Text style={styles.heroMeta}>{prayerLoading ? 'Memuat jadwal...' : `${nextPrayer} dalam ${countdown}`}</Text>
          <View style={styles.heroLocationRow}>
            <Ionicons name="location-outline" size={14} color="#ffffff" />
            <Text style={styles.heroLocation}>{city}</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(420).delay(90)} style={styles.quickWrap}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Akses Cepat</Text>
          <View style={styles.chipGrid}>
            {HOME_QUICK_MENU.map((item) => (
              <Pressable
                key={item.id}
                style={({ pressed }) => [
                  styles.quickChip,
                  { backgroundColor: theme.cardSoft, borderColor: theme.border },
                  pressed && styles.quickChipPressed,
                ]}
                onPress={() => router.push(item.route as never)}
              >
                <View style={[styles.quickChipIcon, { backgroundColor: theme.goldSoft }]}>
                  <MaterialCommunityIcons name={item.icon} size={18} color={theme.gold} />
                </View>
                <Text style={[styles.quickChipText, { color: theme.bodyText }]}>{item.title}</Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(420).delay(140)} style={[styles.block, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.blockHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Jadwal Sholat Hari Ini</Text>
            <Text style={[styles.blockSub, { color: theme.muted }]}>{city}</Text>
          </View>

          <View style={styles.prayerList}>
            {prayerList.map((p, i) => {
              const isActive = !prayerLoading && i === activePrayerIndex;
              return (
                <View key={p.name} style={[styles.prayerRow, { backgroundColor: theme.cardSoft }, isActive && styles.prayerRowActive]}>
                  <View style={styles.prayerLeft}>
                    <View style={[styles.prayerIcon, { backgroundColor: theme.goldSoft }, isActive && styles.prayerIconActive]}>
                      <MaterialCommunityIcons
                        name={PRAYER_ICONS[i] ?? 'clock-outline'}
                        size={16}
                        color={isActive ? '#FFFFFF' : theme.gold}
                      />
                    </View>
                    <Text style={[styles.prayerName, { color: theme.prayerText }, isActive && styles.prayerNameActive]}>{p.name}</Text>
                  </View>

                  <View style={styles.prayerRight}>
                    {isActive ? <Animated.View style={[styles.liveDot, pulseStyle]} /> : null}
                    <Text style={[styles.prayerTime, { color: theme.text }, isActive && styles.prayerTimeActive]}>{p.time}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(420).delay(190)} style={[styles.block, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Renungan Hari Ini</Text>
          <Text style={[styles.haditsText, { color: theme.bodyText }]}>{`"${HADITS_HARIAN.text}"`}</Text>
          <Text style={[styles.haditsSource, { color: theme.gold }]}>{HADITS_HARIAN.source}</Text>

          <View style={[styles.ayatDivider, { backgroundColor: theme.border }]} />

          <Text style={[styles.ayatArabic, { color: theme.text }]}>لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا</Text>
          <Text style={[styles.ayatSource, { color: theme.gold }]}>QS. Al-Baqarah : 286</Text>
          <Text style={[styles.ayatTrans, { color: theme.bodyText }]}>
            Allah tidak membebani seseorang melainkan sesuai dengan kesanggupannya.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(420).delay(230)} style={styles.doaSection}>
          <View style={styles.blockHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Aminkan Doa Saudaramu</Text>
            <Pressable hitSlop={10}>
              <Text style={[styles.linkBtn, { color: theme.gold }]}>Buat Doa +</Text>
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.doaScroll}>
            {[
              { title: 'Doa kesembuhan ibu', summary: 'Mohon doakan kesembuhan ibu saya.', count: 48 },
              { title: 'Kelancaran ujian', summary: 'Mohon doanya untuk ujian akhir.', count: 32 },
              { title: 'Rizki yang berkah', summary: 'Semoga dimudahkan rezeki halal.', count: 27 },
            ].map((d) => (
              <View key={d.title} style={[styles.doaCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[styles.doaTitle, { color: theme.text }]}>{d.title}</Text>
                <Text style={[styles.doaSummary, { color: theme.muted }]}>{d.summary}</Text>
                <Pressable style={[styles.aminBtn, { backgroundColor: theme.goldSoft }]}>
                  <Ionicons name="heart-outline" size={13} color={theme.gold} />
                  <Text style={[styles.aminText, { color: theme.gold }]}>Aamiin · {d.count}</Text>
                </Pressable>
              </View>
            ))}
          </ScrollView>
        </Animated.View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F7F1E8',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  appName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primaryDeeper,
    letterSpacing: 0.5,
    fontFamily: 'serif',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    gap: 14,
  },
  hero: {
    backgroundColor: '#D99A3E',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 20,
    overflow: 'hidden',
    minHeight: 190,
  },
  heroBackdrop: {
    position: 'absolute',
    right: -10,
    bottom: -8,
    width: 210,
    height: 124,
    opacity: 0.2,
  },
  heroDate: {
    fontSize: 12,
    color: '#af6923',
    letterSpacing: 0.4,
    fontWeight: '700',
  },
  heroClock: {
    fontSize: 68,
    lineHeight: 76,
    marginTop: 4,
    color: '#FFF',
    fontWeight: '900',
    fontFamily: 'serif',
    letterSpacing: -2,
  },
  heroClockColon: {
    color: '#af6923',
  },
  heroMeta: {
    marginTop: 6,
    fontSize: 14,
    color: '#FFF',
    fontWeight: '700',
  },
  heroLocationRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heroLocation: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primaryDeeper,
    fontFamily: 'serif',
  },
  quickWrap: {
    paddingVertical: 4,
    gap: 12,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickChip: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: '#FFF9ED',
    borderWidth: 1,
    borderColor: '#EDDFC4',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 9,
  },
  quickChipPressed: {
    opacity: 0.72,
  },
  quickChipIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ICON_BG,
  },
  quickChipText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.primaryDeep,
    fontWeight: '700',
  },
  block: {
    backgroundColor: '#FFFDF5',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EDDFC4',
    padding: 16,
    gap: 12,
  },
  blockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  blockSub: {
    fontSize: 11,
    color: '#7E6446',
    fontWeight: '700',
  },
  prayerList: {
    gap: 8,
  },
  prayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: '#FFF8EB',
  },
  prayerRowActive: {
    backgroundColor: '#C68B2F',
  },
  prayerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  prayerIcon: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: ICON_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prayerIconActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  prayerName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6D4D2A',
  },
  prayerNameActive: {
    color: '#FFF',
  },
  prayerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFF',
  },
  prayerTime: {
    fontSize: 13,
    fontWeight: '800',
    color: '#3D2108',
  },
  prayerTimeActive: {
    color: '#FFF',
  },
  haditsText: {
    fontSize: 14,
    color: '#5C3D1E',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  haditsSource: {
    fontSize: 12,
    color: ICON_COLOR,
    fontWeight: '700',
  },
  ayatDivider: {
    height: 1,
    backgroundColor: '#F0E3CB',
    marginVertical: 2,
  },
  ayatArabic: {
    fontSize: 22,
    textAlign: 'right',
    color: '#1C1408',
    fontFamily: 'serif',
    lineHeight: 36,
  },
  ayatSource: {
    fontSize: 12,
    color: ICON_COLOR,
    fontWeight: '700',
  },
  ayatTrans: {
    fontSize: 14,
    color: '#5C3D1E',
    lineHeight: 22,
  },
  doaSection: {
    gap: 12,
  },
  linkBtn: {
    fontSize: 13,
    color: ICON_COLOR,
    fontWeight: '700',
  },
  doaScroll: {
    gap: 12,
  },
  doaCard: {
    width: 190,
    backgroundColor: '#FFFDF5',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EDDFC4',
    gap: 8,
  },
  doaTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDeeper,
  },
  doaSummary: {
    fontSize: 12,
    color: '#7E6446',
    lineHeight: 18,
  },
  aminBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: ICON_BG,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  aminText: {
    fontSize: 12,
    color: ICON_COLOR,
    fontWeight: '700',
  },
});
