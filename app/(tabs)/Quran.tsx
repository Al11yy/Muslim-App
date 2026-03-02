import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getSurahBookmarks, toggleSurahBookmarkStorage } from '@/lib/quran-bookmarks';
import { useThemePreference } from '@/contexts/theme-preference';

// ─── 1. MAPPING DATA UNTUK FILTER JUZ & HALAMAN ──────────────────────────────
const SURAH_TO_JUZ: Record<number, number> = {
  1:1,2:1,3:3,4:4,5:6,6:7,7:8,8:9,9:10,10:11,11:11,12:12,13:13,14:13,15:14,
  16:14,17:15,18:15,19:16,20:16,21:17,22:17,23:18,24:18,25:18,26:19,27:19,
  28:20,29:20,30:21,31:21,32:21,33:21,34:22,35:22,36:22,37:23,38:23,39:23,
  40:24,41:24,42:24,43:25,44:25,45:25,46:26,47:26,48:26,49:26,50:26,51:26,
  52:27,53:27,54:27,55:27,56:27,57:27,58:28,59:28,60:28,61:28,62:28,63:28,
  64:28,65:28,66:28,67:29,68:29,69:29,70:29,71:29,72:29,73:29,74:29,75:29,
  76:29,77:29,78:30,79:30,80:30,81:30,82:30,83:30,84:30,85:30,86:30,87:30,
  88:30,89:30,90:30,91:30,92:30,93:30,94:30,95:30,96:30,97:30,98:30,99:30,
  100:30,101:30,102:30,103:30,104:30,105:30,106:30,107:30,108:30,109:30,
  110:30,111:30,112:30,113:30,114:30,
};

const SURAH_TO_PAGE: Record<number, number> = {
  1:1,2:2,3:50,4:77,5:106,6:128,7:151,8:177,9:187,10:208,11:221,12:235,
  13:249,14:255,15:262,16:267,17:282,18:293,19:305,20:312,21:322,22:332,
  23:342,24:350,25:359,26:367,27:377,28:385,29:396,30:404,31:411,32:415,
  33:418,34:428,35:434,36:440,37:446,38:453,39:458,40:467,41:477,42:483,
  43:489,44:496,45:499,46:502,47:507,48:511,49:515,50:518,51:520,52:523,
  53:526,54:528,55:531,56:534,57:537,58:542,59:545,60:549,61:551,62:553,
  63:554,64:556,65:558,66:560,67:562,68:564,69:566,70:568,71:570,72:572,
  73:574,74:575,75:577,76:578,77:580,78:582,79:583,80:585,81:586,82:587,
  83:587,84:589,85:590,86:591,87:591,88:592,89:593,90:594,91:595,92:595,
  93:596,94:596,95:597,96:597,97:598,98:598,99:599,100:599,101:600,102:601,
  103:601,104:601,105:602,106:602,107:602,108:603,109:603,110:603,111:603,
  112:604,113:604,114:604,
};

const PAGE_GROUP_SIZE = 20;
type FilterTab = 'Surah' | 'Juz' | 'Page';

type SurahListItem = {
  nomor: number;
  nama: string;
  nama_latin: string;
  jumlah_ayat: number;
  tempat_turun: string;
  arti?: string;
};

// ─── KOMPONEN UTAMA ──────────────────────────────────────────────────────────
export default function Quran() {
  const router = useRouter(); 
  const { resolvedTheme } = useThemePreference();
  const isDark = resolvedTheme === 'dark';
  const [data, setData] = useState<SurahListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>('Surah');
  const [lastRead, setLastRead] = useState<SurahListItem | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [surahBookmarks, setSurahBookmarks] = useState<Record<number, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const theme = useMemo(
    () => ({
      bg: isDark ? '#1A130B' : '#F7F1E8',
      text: isDark ? '#F6ECDD' : '#1A1209',
      muted: isDark ? '#CAB79C' : '#8A7255',
      surface: isDark ? '#2A1F12' : '#FFFDF5',
      softSurface: isDark ? '#332516' : 'rgba(255,255,255,0.7)',
      border: isDark ? '#4A3825' : '#E5D3B8',
      cardBorder: isDark ? '#4A3825' : '#EDDFC4',
      overlay: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.08)',
      gold: '#C68B2F',
    }),
    [isDark]
  );

  // Load API 
  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://quran-api.santrikoding.com/api/surah');
      const json = await response.json();
      const finalData = (Array.isArray(json) ? json : json.data || []) as SurahListItem[];
      setData(finalData);
      setLastRead(finalData[0] ?? null);

      const savedSurahs = await getSurahBookmarks();
      const bookmarkMap = savedSurahs.reduce<Record<number, boolean>>((acc, item) => {
        acc[item.nomor] = true;
        return acc;
      }, {});
      setSurahBookmarks(bookmarkMap);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat Al-Quran');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const toggleSurahBookmark = async (surah: SurahListItem) => {
    const result = await toggleSurahBookmarkStorage({
      nomor: surah.nomor,
      nama: surah.nama,
      nama_latin: surah.nama_latin,
      jumlah_ayat: surah.jumlah_ayat,
      tempat_turun: surah.tempat_turun,
      arti: surah.arti,
    });

    setSurahBookmarks((prev) => ({
      ...prev,
      [surah.nomor]: result.bookmarked,
    }));
  };

  const filteredData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return data;

    return data.filter((item) => {
      const nomorMatch = String(item.nomor) === q;
      const latinMatch = item.nama_latin.toLowerCase().includes(q);
      const arabicMatch = item.nama.includes(q);
      const artiMatch = (item.arti ?? '').toLowerCase().includes(q);
      return nomorMatch || latinMatch || arabicMatch || artiMatch;
    });
  }, [data, searchQuery]);

  // Logika Grouping (Filter Juz / Page / Surah)
  const groupedData = useMemo(() => {
    if (activeTab === 'Surah') return filteredData;

    if (activeTab === 'Juz') {
      const groups: Map<number, SurahListItem[]> = new Map();
      filteredData.forEach((s) => {
        const juz = SURAH_TO_JUZ[s.nomor] ?? 1;
        if (!groups.has(juz)) groups.set(juz, []);
        groups.get(juz)!.push(s);
      });
      const flat: (SurahListItem | { __header: string })[] = [];
      for (const [juz, surahs] of Array.from(groups.entries()).sort(([a], [b]) => a - b)) {
        flat.push({ __header: `Juz ${juz}` });
        flat.push(...surahs);
      }
      return flat;
    }

    const groups: Map<number, SurahListItem[]> = new Map();
    filteredData.forEach((s) => {
      const pg = Math.ceil((SURAH_TO_PAGE[s.nomor] ?? 1) / PAGE_GROUP_SIZE);
      if (!groups.has(pg)) groups.set(pg, []);
      groups.get(pg)!.push(s);
    });
    const flat: (SurahListItem | { __header: string })[] = [];
    for (const [pg, surahs] of Array.from(groups.entries()).sort(([a], [b]) => a - b)) {
      flat.push({ __header: `Halaman ${(pg - 1) * PAGE_GROUP_SIZE + 1}–${pg * PAGE_GROUP_SIZE}` });
      flat.push(...surahs);
    }
    return flat;
  }, [filteredData, activeTab]);

  // Loading & Error States
  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, styles.center, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color="#C68B2F" />
        <Text style={[styles.loadingText, { color: theme.muted }]}>Memuat Al-Quran...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.safe, styles.center, { backgroundColor: theme.bg }]}>
        <Text style={{ color: 'red' }}>Error: {error}</Text>
        <TouchableOpacity onPress={load} style={{ marginTop: 10 }}>
          <Text style={{ color: '#C68B2F', fontWeight: 'bold' }}>Coba Lagi</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isHeader = (item: any): item is { __header: string } => typeof item?.__header === 'string';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.bg} />

      {/* Main Container with Repeating Background Pattern */}
      <ImageBackground
        source={require('../../assets/images/bg_header.png')} 
        style={styles.mainBackground}
        imageStyle={styles.mainBackgroundImage}
        resizeMode="repeat"
      >
        <FlatList
          data={groupedData}
          keyExtractor={(item, i) => isHeader(item) ? `h-${i}` : String(item.nomor)}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={() => {
            if (isFilterOpen) setIsFilterOpen(false);
          }}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={[styles.emptyText, { color: theme.muted }]}>Surat tidak ditemukan.</Text>
            </View>
          }
          ListHeaderComponent={
            <>
              {/* Top bar */}
              <View style={styles.topBar}>
                <TouchableOpacity hitSlop={8} onPress={() => router.push('/bookmark_Quran')}>
                  <Ionicons name="bookmark-outline" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.screenTitle, { color: theme.text }]}>QURAN</Text>
                <TouchableOpacity hitSlop={8} onPress={() => setIsFilterOpen((prev) => !prev)}>
                  <Ionicons name="options-outline" size={24} color={theme.text} />
                </TouchableOpacity>
              </View>

              {/* ─── Hero: Last Read ─── */}
              <View style={styles.hero}>
                <Image
                  source={require('../../assets/images/bg_header.png')}
                  style={styles.heroMosque}
                  resizeMode="contain"
                />
                <View style={styles.heroTextWrap}>
                  <View style={styles.heroLabelRow}>
                    <MaterialCommunityIcons name="bookmark-outline" size={14} color="rgba(255,255,255,0.85)" />
                    <Text style={styles.heroLabel}> Last Read</Text>
                  </View>
                  <Text style={styles.heroSurahName} numberOfLines={1}>
                    {lastRead?.nama_latin ?? 'Al-Quran'}
                  </Text>
                  <Text style={styles.heroAyah}>Ayah No: 1</Text>
                </View>
              </View>

              {/* ─── Filter Row: Sura List & Dropdown ─── */}
              <View style={[styles.searchWrap, { borderColor: theme.border, backgroundColor: theme.surface }]}>
                <Ionicons name="search-outline" size={18} color={theme.muted} />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Cari surat (nama / arti / nomor)"
                  placeholderTextColor={theme.muted}
                  style={[styles.searchInput, { color: theme.text }]}
                />
              </View>

              <View style={styles.filterRow}>
                <Text style={[styles.listTitle, { color: theme.text }]}>Surah list</Text>

                <TouchableOpacity 
                  style={[styles.dropdownBtn, { borderColor: theme.border, backgroundColor: theme.softSurface }]}
                  onPress={() => setIsFilterOpen(true)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dropdownBtnText, { color: theme.text }]}>View: {activeTab}</Text>
                  <Ionicons name="chevron-down" size={14} color={theme.text} />
                </TouchableOpacity>
              </View>
            </>
          }
          renderItem={({ item }) => {
            // Render Header (Juz / Page)
            if (isHeader(item)) {
              return (
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionHeaderText, { color: theme.gold }]}>{item.__header}</Text>
                </View>
              );
            }

            // Fallback subtitle kalau API gak kasih 'arti'
            const subTitle = item.arti ?? `${item.tempat_turun} • ${item.jumlah_ayat} Ayat`;

            return (
              <Pressable
                style={({ pressed }) => [
                  styles.card,
                  { backgroundColor: theme.surface, borderColor: theme.cardBorder },
                  pressed && [styles.cardPressed, { backgroundColor: isDark ? '#352818' : '#F3E8D6' }],
                ]}
                onPress={() => {
                  setLastRead(item); // Update state Last Read memori lokal
                  router.push({ pathname: '/Detail_surat', params: { nomor: item.nomor } }); 
                }}
              >
                {/* Bagian Kiri: KOTAK NOMOR */}
                <View style={styles.numberBox}>
                  <ImageBackground
                    source={require('../../assets/images/bg_no.png')}
                    style={styles.badgeContainer}
                    imageStyle={styles.badgeImage}
                    resizeMode="contain"
                  >
                    <Text style={[styles.badgeText, { color: theme.text }]}>{String(item.nomor)}</Text>
                  </ImageBackground>
                </View>

                {/* Bagian Tengah: KOTAK ARAB */}
                <View style={styles.arabicBox}>
                  <Text
                    style={[styles.cardArabic, { color: theme.gold }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit 
                  >
                    {item.nama}
                  </Text>
                </View>

                {/* Bagian Kanan: KOTAK NAMA LATIN & ARTI */}
                <View style={styles.detailsBox}>
                  <Text style={[styles.cardLatin, { color: theme.text }]} numberOfLines={1}>
                    {item.nama_latin}
                  </Text>
                  <Text style={[styles.cardTranslation, { color: theme.muted }]} numberOfLines={1}>
                    {subTitle}
                  </Text>
                </View>

                {/* Bagian Ujung Kanan: ICON PANAH */}
                <View style={styles.iconBox}>
                  <Pressable
                    hitSlop={8}
                    style={styles.bookmarkBtn}
                    onPress={(event) => {
                      event.stopPropagation();
                      void toggleSurahBookmark(item);
                    }}>
                    <Ionicons
                      name={surahBookmarks[item.nomor] ? 'bookmark' : 'bookmark-outline'}
                      size={18}
                      color={surahBookmarks[item.nomor] ? theme.gold : (isDark ? '#9F8A73' : '#D1C4B2')}
                    />
                  </Pressable>
                  <Ionicons name="chevron-forward" size={20} color={isDark ? '#9F8A73' : '#D1C4B2'} />
                </View>
              </Pressable>
            );
          }}
        />

        <Modal
          visible={isFilterOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setIsFilterOpen(false)}>
          <View style={[styles.dropdownOverlay, { backgroundColor: theme.overlay }]}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setIsFilterOpen(false)} />
            <View style={[styles.filterDropdownModal, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
              {(['Surah', 'Juz', 'Page'] as FilterTab[]).map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={styles.filterMenuItem}
                  onPress={() => {
                    setActiveTab(tab);
                    setIsFilterOpen(false);
                  }}>
                  <Text style={[styles.filterMenuText, { color: theme.muted }, activeTab === tab && styles.filterMenuTextActive]}>
                    {tab}
                  </Text>
                  {activeTab === tab ? <Ionicons name="checkmark" size={16} color={theme.gold} /> : null}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>
      </ImageBackground>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const PRIMARY_GOLD = '#C68B2F';
const BG_MAIN = '#F7F1E8'; 
// Card Background sekarang pakai warna warm cream persis kayak akses cepat
const CARD_BG = '#FFFDF5'; 
const CARD_BORDER = '#EDDFC4'; // Warna border kalem
const TEXT_DARK = '#1A1209';
const TEXT_MUTED = '#8A7255';

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG_MAIN },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: TEXT_MUTED, fontWeight: '600' },
  
  mainBackground: {
    flex: 1,
  },
  mainBackgroundImage: {
    opacity: 0.04, 
  },
  listContainer: {
    paddingBottom: 40,
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  /* ─── Top bar ─── */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  screenTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: TEXT_DARK,
    letterSpacing: 1.2,
    fontFamily: 'serif',
  },

  /* ─── Hero card ─── */
  hero: {
    borderRadius: 20,
    backgroundColor: '#D99A3E',
    overflow: 'hidden',
    height: 140,
    marginBottom: 24,
    elevation: 4,
    shadowColor: PRIMARY_GOLD,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  heroMosque: {
    position: 'absolute', right: -10, bottom: -8, width: 200, height: 120, opacity: 0.2,
  },
  heroTextWrap: {
    flex: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 18,
  },
  heroLabelRow: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 6,
  },
  heroLabel: {
    fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: '600', marginLeft: 4,
  },
  heroSurahName: {
    fontSize: 26, fontWeight: '800', color: '#FFF', fontFamily: 'serif',
  },
  heroAyah: {
    fontSize: 13, color: '#FFE8C0', marginTop: 6, fontWeight: '500',
  },

  /* ─── Filter & Dropdown Row ─── */
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_DARK,
    fontFamily: 'serif',
  },
  searchWrap: {
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5D3B8',
    backgroundColor: '#FFFDF5',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#3D2A18',
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1C4B2',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.7)', 
  },
  dropdownBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXT_DARK,
    marginRight: 6,
  },
  dropdownOverlay: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 270,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  filterDropdownModal: {
    alignSelf: 'flex-end',
    minWidth: 160,
    borderRadius: 14,
    backgroundColor: '#FFF',
    paddingTop: 4,
    paddingBottom: 8,
    borderWidth: 1,
    borderColor: '#EEDFC8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 6,
  },
  filterMenuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E8D8',
  },
  filterMenuText: {
    fontSize: 14,
    color: TEXT_MUTED,
    fontWeight: '500',
  },
  filterMenuTextActive: {
    color: PRIMARY_GOLD,
    fontWeight: '700',
  },

  /* ─── Section headers (Juz / Page) ─── */
  sectionHeader: {
    paddingVertical: 12,
    marginBottom: 8,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: PRIMARY_GOLD,
    textTransform: 'uppercase',
    fontFamily: 'serif',
  },

  /* ─── STYLE CARD UTAMA (PREMIUM WOW + AKSES CEPAT VIBE) ─── */
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG, // Pakai krem dari akses cepat
    borderRadius: 16, 
    paddingVertical: 18, 
    paddingHorizontal: 16,
    marginBottom: 16, 
    
    // Border memutar tipis
    borderWidth: 1,
    borderColor: CARD_BORDER,

    // Aksen Garis Kiri
    borderLeftWidth: 5,
    borderLeftColor: PRIMARY_GOLD,

    // Efek Shadow Mewah
    shadowColor: PRIMARY_GOLD,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, // Disesuaikan biar ga terlalu gelap
    shadowRadius: 8,
    elevation: 3, 
  },
  cardPressed: {
    backgroundColor: '#F3E8D6', // Sedikit lebih gelap pas ditekan
    transform: [{ scale: 0.98 }], 
  },

  /* 1. Box Nomor */
  numberBox: {
    width: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeContainer: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeImage: { opacity: 0.95 },
  badgeText: {
    fontSize: 13, fontWeight: '800', color: '#2C2216',
  },

  /* 2. Box Arab */
  arabicBox: {
    width: 95, 
    alignItems: 'flex-start',
    paddingHorizontal: 12,
  },
  cardArabic: {
    fontSize: 26, color: PRIMARY_GOLD, fontFamily: 'serif', fontWeight: '600',
  },

  /* 3. Box Detail (Latin & Arti) */
  detailsBox: {
    flex: 1, justifyContent: 'center',
  },
  cardLatin: {
    fontSize: 16, fontWeight: '800', color: TEXT_DARK, marginBottom: 4, letterSpacing: 0.3, 
    fontFamily: 'serif',
  },
  cardTranslation: {
    fontSize: 13, color: TEXT_MUTED, fontWeight: '600',
  },

  /* 4. Box Icon Panah */
  iconBox: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  bookmarkBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyWrap: {
    paddingTop: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: TEXT_MUTED,
    fontSize: 14,
    fontWeight: '600',
  },
});
