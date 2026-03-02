import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ImageBackground,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

interface Surah {
  nomor: number;
  nama: string;
  nama_latin: string;
  jumlah_ayat: number;
  tempat_turun: string;
  arti: string;
  deskripsi: string;
  audio: string;
}

type FilterTab = 'Surah' | 'Juz' | 'Page';

export default function Quran() {
  const [data, setData] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('Surah');
  const { width } = useWindowDimensions();

  const isCompact = width < 370;

  useEffect(() => {
    fetch('https://quran-api.santrikoding.com/api/surah')
      .then((res) => res.json())
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const lastRead = useMemo(() => data[0], [data]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#C68B2F" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FCF8F1" />

      <FlatList
        data={data}
        keyExtractor={(item) => item.nomor.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View style={styles.topBar}>
              <TouchableOpacity hitSlop={8}>
                <Ionicons name="menu" size={20} color="#2C2216" />
              </TouchableOpacity>

              <Text style={styles.screenTitle}>QURAN</Text>

              <TouchableOpacity hitSlop={8}>
                <Ionicons name="search-outline" size={20} color="#2C2216" />
              </TouchableOpacity>
            </View>

            <View style={[styles.heroCard, isCompact && styles.heroCardCompact]}>
              <View style={styles.glowOrbTopRight} />
              <View style={styles.glowOrbBottomLeft} />

              <View style={styles.heroContent}>
                <View style={styles.lastReadRow}>
                  <MaterialCommunityIcons name="bookmark-outline" size={13} color="#FFF2D1" />
                  <Text style={styles.lastReadLabel}> Last Read</Text>
                </View>

                <Text style={[styles.lastReadSurah, isCompact && styles.lastReadSurahCompact]} numberOfLines={1}>
                  {lastRead?.nama_latin ?? 'Al-Quran'}
                </Text>
                <Text style={styles.lastReadAyah}>Ayah No: 1</Text>
              </View>

              <MaterialCommunityIcons
                name="mosque-outline"
                size={isCompact ? 52 : 60}
                color="rgba(255, 245, 222, 0.45)"
              />
            </View>

            <View style={styles.filterRow}>
              <Text style={[styles.alQuranTitle, isCompact && styles.alQuranTitleCompact]}>Al Quran</Text>

              <View style={[styles.tabGroup, isCompact && styles.tabGroupCompact]}>
                {(['Surah', 'Juz', 'Page'] as FilterTab[]).map((tab) => (
                  <TouchableOpacity
                    key={tab}
                    onPress={() => setActiveTab(tab)}
                    style={[styles.tab, activeTab === tab && styles.activeTab]}>
                    <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.divider} />
          </>
        }
        renderItem={({ item }) => (
          <Link href={{ pathname: '/Detail_surat', params: { nomor: item.nomor } }} asChild>
            <Pressable style={({ pressed }) => [styles.surahRow, pressed && styles.surahRowPressed]}>
              <ImageBackground
                source={require('../../assets/images/bg_no.png')}
                style={styles.numberBadge}
                imageStyle={styles.numberBadgeImage}
                resizeMode="contain">
                <Text style={styles.numberText}>{item.nomor.toString().padStart(2, '0')}</Text>
              </ImageBackground>

              <View style={styles.surahInfo}>
                <Text style={styles.latinName} numberOfLines={1}>
                  {item.nama_latin}
                </Text>

                <View style={styles.metaRow}>
                  <Text style={styles.turunText}>
                    {item.tempat_turun.charAt(0).toUpperCase() + item.tempat_turun.slice(1).toLowerCase()}
                  </Text>
                  <View style={styles.dot} />
                  <Text style={styles.metaText}>{item.jumlah_ayat} Ayahs</Text>
                </View>
              </View>

              <Text style={styles.arabicName} numberOfLines={1}>
                {item.nama}
              </Text>
            </Pressable>
          </Link>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const CARD_BG = '#D4924A';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCF8F1',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FCF8F1',
  },
  listContent: {
    paddingBottom: 26,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 12,
  },
  screenTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1209',
    letterSpacing: 1.2,
  },
  heroCard: {
    marginHorizontal: 14,
    borderRadius: 18,
    backgroundColor: CARD_BG,
    overflow: 'hidden',
    minHeight: 116,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  heroCardCompact: {
    minHeight: 108,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  glowOrbTopRight: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,220,140,0.35)',
    right: -32,
    top: -44,
  },
  glowOrbBottomLeft: {
    position: 'absolute',
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(255,255,255,0.08)',
    left: -14,
    bottom: -22,
  },
  heroContent: {
    flex: 1,
  },
  lastReadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  lastReadLabel: {
    fontSize: 11,
    color: '#FFF3D6',
    fontWeight: '600',
    opacity: 0.9,
  },
  lastReadSurah: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'serif',
  },
  lastReadSurahCompact: {
    fontSize: 24,
    lineHeight: 30,
  },
  lastReadAyah: {
    fontSize: 11,
    color: '#FFE8BC',
    marginTop: 2,
    fontWeight: '500',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  alQuranTitle: {
    fontSize: 31,
    fontWeight: '800',
    color: '#1C1408',
    fontFamily: 'serif',
  },
  alQuranTitleCompact: {
    fontSize: 27,
  },
  tabGroup: {
    flexDirection: 'row',
    backgroundColor: '#EFE7D5',
    borderRadius: 20,
    padding: 3,
    gap: 2,
  },
  tabGroupCompact: {
    transform: [{ scale: 0.95 }],
  },
  tab: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  activeTab: {
    backgroundColor: '#C68B2F',
  },
  tabText: {
    fontSize: 11,
    color: '#8A7255',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#EDE4D4',
    marginHorizontal: 16,
    marginBottom: 2,
  },
  surahRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  surahRowPressed: {
    backgroundColor: '#FBF3E4',
  },
  numberBadge: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  numberBadgeImage: {
    opacity: 0.95,
  },
  numberText: {
    fontSize: 11,
    color: '#ffe9cd',
    fontWeight: '700',
  },
  surahInfo: {
    flex: 1,
    minWidth: 0,
  },
  latinName: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1E1508',
    fontFamily: 'serif',
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  turunText: {
    fontSize: 11,
    color: '#A08A68',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#C8B090',
  },
  metaText: {
    fontSize: 11,
    color: '#A08A68',
  },
  arabicName: {
    fontSize: 17,
    color: '#AF7A36',
    fontWeight: '700',
    textAlign: 'right',
    marginLeft: 8,
    maxWidth: '34%',
  },
  separator: {
    height: 1,
    backgroundColor: '#F0E8D8',
    marginLeft: 66,
    marginRight: 16,
  },
});
