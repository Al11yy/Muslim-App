import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type QuickMenuItem = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
  route?: string;
};

const PRAYER_TIMES = [
  { name: 'Subuh', time: '04:43', icon: 'sunny-outline' as const },
  { name: 'Dzuhur', time: '12:09', icon: 'partly-sunny-outline' as const },
  { name: 'Ashar', time: '15:12', icon: 'cloud-outline' as const },
  { name: 'Maghrib', time: '18:15', icon: 'moon-outline' as const },
  { name: 'Isya', time: '19:24', icon: 'star-outline' as const },
];

const QUICK_MENU: QuickMenuItem[] = [
  { title: 'Al-Quran', icon: 'book-outline', color: '#8B5E3C', bg: '#FFF0E0', route: '/Quran' },
  { title: 'Doa Harian', icon: 'chatbubble-ellipses-outline', color: '#A07040', bg: '#FFF8E7', route: '/Doa_harian' },
  { title: 'Dzikir', icon: 'heart-outline', color: '#C0392B', bg: '#FFF0EE', route: '/Dzikir' },
  { title: 'Hadits', icon: 'library-outline', color: '#2E7D32', bg: '#F0FFF1', route: '/Hadits' },
  { title: 'Arah Kiblat', icon: 'compass-outline', color: '#1565C0', bg: '#EEF4FF', route: '/Arah_kiblat' },
  { title: 'Donasi', icon: 'gift-outline', color: '#6A1B9A', bg: '#F8F0FF' },
  { title: 'Asmaul Husna', icon: 'sparkles-outline', color: '#E65100', bg: '#FFF3E0', route: '/Asmaul_husna' },
  { title: 'Lainnya', icon: 'apps-outline', color: '#37474F', bg: '#F0F4F8', route: '/other' },
];

const COMMUNITY_DOA = [
  {
    title: 'Doa kesembuhan ibu',
    summary: 'Mohon doanya untuk kesembuhan ibu saya.',
    count: 48,
  },
  {
    title: 'Diberi kelancaran ujian',
    summary: 'Mohon doanya untuk ujian akhir pekan ini.',
    count: 32,
  },
];

const Home = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <Pressable>
          <Ionicons name="menu-outline" size={24} color="#5C3D1E" />
        </Pressable>
        <Text style={styles.appName}>MUSLIM</Text>
        <Pressable>
          <Ionicons name="search-outline" size={22} color="#5C3D1E" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>

        {/* Hero Card */}
        <View style={styles.heroCard}>
          {/* Glow circles */}
          <View style={styles.glowCircle1} />
          <View style={styles.glowCircle2} />

          {/* Moon crescent */}
          <View style={styles.moonOuter}>
            <View style={styles.moonInner} />
          </View>

          {/* Time */}
          <Text style={styles.heroTime}>18<Text style={styles.heroColon}>:</Text>36</Text>

          {/* Countdown info */}
          <View style={styles.heroInfoRow}>
            <View style={styles.heroInfoItem}>
              <Text style={styles.heroInfoLabel}>REMAINING TIME</Text>
              <Text style={styles.heroInfoValue}>Maghrib 05:33:10</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroInfoItem}>
              <Text style={styles.heroInfoLabel}>LOCATION</Text>
              <Text style={styles.heroInfoValue}>Bogor, Indonesia</Text>
            </View>
          </View>

          {/* Mosque silhouette */}
          <View style={styles.mosqueWrap}>
            {/* Main dome */}
            <View style={[styles.dome, { width: 70, height: 42, bottom: 22, alignSelf: 'center', zIndex: 3, left: 0 }]} />
            {/* Side domes */}
            <View style={[styles.dome, { width: 44, height: 28, bottom: 22, position: 'absolute', left: '15%', zIndex: 2 }]} />
            <View style={[styles.dome, { width: 44, height: 28, bottom: 22, position: 'absolute', right: '15%', zIndex: 2 }]} />
            {/* Side small domes */}
            <View style={[styles.dome, { width: 30, height: 20, bottom: 22, position: 'absolute', left: '5%', zIndex: 1 }]} />
            <View style={[styles.dome, { width: 30, height: 20, bottom: 22, position: 'absolute', right: '5%', zIndex: 1 }]} />
            {/* Minarets */}
            <View style={[styles.minaret, { left: '26%', height: 52 }]} />
            <View style={[styles.minaret, { right: '26%', height: 52 }]} />
            {/* Base wall */}
            <View style={styles.mosqueBase} />
          </View>
        </View>

        {/* Prayer Times */}
        <View style={styles.prayerCard}>
          <Text style={styles.prayerCardTitle}>Prayer Times</Text>
          <View style={styles.prayerRow}>
            {PRAYER_TIMES.map((item, index) => {
              const isActive = item.name === 'Maghrib';
              return (
                <View
                  key={item.name}
                  style={[styles.prayerItem, isActive && styles.prayerItemActive]}>
                  <Ionicons
                    name={item.icon}
                    size={18}
                    color={isActive ? '#FFF' : '#B08050'}
                  />
                  <Text style={[styles.prayerName, isActive && styles.prayerNameActive]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.prayerTime, isActive && styles.prayerTimeActive]}>
                    {item.time}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Quick Menu */}
        <View style={styles.quickMenuGrid}>
          {QUICK_MENU.map((item) => (
            <Pressable
              key={item.title}
              style={styles.quickMenuItem}
              onPress={() => item.route && router.push(item.route as never)}>
              <View style={[styles.quickIconBox, { backgroundColor: item.bg }]}>
                <Ionicons name={item.icon} size={22} color={item.color} />
              </View>
              <Text style={styles.quickLabel}>{item.title}</Text>
            </Pressable>
          ))}
        </View>

        {/* Ramadan Banner */}
        <View style={styles.ramadanBanner}>
          <MaterialCommunityIcons name="moon-waning-crescent" size={28} color="#C8860A" />
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Ramadhan Mubarak! 🌙</Text>
            <Text style={styles.bannerSub}>Selamat menjalankan ibadah puasa</Text>
          </View>
        </View>

        {/* Community Doa */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Aminkan doa saudaramu</Text>
          <Pressable>
            <Text style={styles.sectionAction}>Buat doa +</Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.doaScroll}>
          {COMMUNITY_DOA.map((item) => (
            <View key={item.title} style={styles.doaCard}>
              <Text style={styles.doaTitle}>{item.title}</Text>
              <Text style={styles.doaSummary}>{item.summary}</Text>
              <Pressable style={styles.aminBtn}>
                <Ionicons name="heart-outline" size={14} color="#C0622A" />
                <Text style={styles.aminText}>Aamiin • {item.count}</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>

        <View style={{ height: 10 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const CARD_PAD = 16;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5EDD8',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#F5EDD8',
  },
  appName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3D2410',
    letterSpacing: 2,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 14,
  },

  /* ── HERO ── */
  heroCard: {
    backgroundColor: '#F0C97A',
    borderRadius: 24,
    height: 230,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: CARD_PAD,
  },
  glowCircle1: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.28)',
    top: -70,
    right: -60,
  },
  glowCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(230,160,40,0.35)',
    bottom: -100,
    left: -60,
  },
  moonOuter: {
    position: 'absolute',
    top: 16,
    right: 24,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8B050',
    overflow: 'hidden',
  },
  moonInner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F0C97A',
    top: 2,
    left: 8,
  },
  heroTime: {
    fontSize: 72,
    fontWeight: '800',
    color: '#5C3210',
    lineHeight: 80,
    letterSpacing: -2,
    fontFamily: 'serif',
    zIndex: 2,
  },
  heroColon: {
    color: '#C8860A',
  },
  heroInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
    zIndex: 2,
  },
  heroInfoItem: {
    alignItems: 'center',
  },
  heroInfoLabel: {
    fontSize: 9,
    color: '#8B5E2A',
    letterSpacing: 1,
    fontWeight: '600',
  },
  heroInfoValue: {
    fontSize: 13,
    color: '#4A2E0E',
    fontWeight: '700',
    marginTop: 2,
  },
  heroDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(100,60,20,0.2)',
  },

  /* Mosque silhouette */
  mosqueWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 68,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  dome: {
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
    backgroundColor: 'rgba(60,30,8,0.45)',
    position: 'absolute',
  },
  minaret: {
    position: 'absolute',
    bottom: 0,
    width: 10,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    backgroundColor: 'rgba(60,30,8,0.45)',
  },
  mosqueBase: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 22,
    backgroundColor: 'rgba(60,30,8,0.45)',
  },

  /* ── PRAYER TIMES ── */
  prayerCard: {
    backgroundColor: '#FFFDF5',
    borderRadius: 20,
    padding: CARD_PAD,
    borderWidth: 1,
    borderColor: '#E8D8B8',
  },
  prayerCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3D2410',
    marginBottom: 12,
  },
  prayerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  prayerItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    gap: 4,
    backgroundColor: '#FFF8EB',
  },
  prayerItemActive: {
    backgroundColor: '#D4873A',
  },
  prayerName: {
    fontSize: 10,
    color: '#8B6540',
    fontWeight: '600',
  },
  prayerNameActive: {
    color: '#FFF',
  },
  prayerTime: {
    fontSize: 12,
    color: '#3D2410',
    fontWeight: '700',
  },
  prayerTimeActive: {
    color: '#FFF',
  },

  /* ── QUICK MENU ── */
  quickMenuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#FFFDF5',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8D8B8',
    paddingVertical: 16,
    paddingHorizontal: 8,
    rowGap: 16,
  },
  quickMenuItem: {
    width: '25%',
    alignItems: 'center',
    gap: 6,
  },
  quickIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    fontSize: 11,
    color: '#5C3D1E',
    textAlign: 'center',
    lineHeight: 14,
  },

  /* ── RAMADAN BANNER ── */
  ramadanBanner: {
    backgroundColor: '#FFF3DC',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EAD4A0',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5C3210',
  },
  bannerSub: {
    fontSize: 12,
    color: '#906A3A',
    marginTop: 2,
  },

  /* ── COMMUNITY DOA ── */
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3D2410',
  },
  sectionAction: {
    fontSize: 13,
    color: '#C07828',
    fontWeight: '600',
  },
  doaScroll: {
    gap: 12,
    paddingBottom: 4,
  },
  doaCard: {
    width: 200,
    backgroundColor: '#FFFDF5',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8D8B8',
    padding: 14,
    gap: 8,
  },
  doaTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3D2410',
  },
  doaSummary: {
    fontSize: 12,
    color: '#7E6446',
    lineHeight: 18,
  },
  aminBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF0E4',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  aminText: {
    fontSize: 12,
    color: '#C0622A',
    fontWeight: '600',
  },
});

export default Home;