import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAyahBookmarks, getSurahBookmarks, type AyahBookmark, type SurahBookmark } from '@/lib/quran-bookmarks';

type Tab = 'surah' | 'ayat';

export default function BookmarkQuran() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('surah');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [surahBookmarks, setSurahBookmarks] = useState<SurahBookmark[]>([]);
  const [ayahBookmarks, setAyahBookmarks] = useState<AyahBookmark[]>([]);

  const loadBookmarks = useCallback(async () => {
    setLoading(true);
    const [surahs, ayahs] = await Promise.all([getSurahBookmarks(), getAyahBookmarks()]);
    setSurahBookmarks(surahs);
    setAyahBookmarks(ayahs);
    setLoading(false);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const [surahs, ayahs] = await Promise.all([getSurahBookmarks(), getAyahBookmarks()]);
    setSurahBookmarks(surahs);
    setAyahBookmarks(ayahs);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadBookmarks();
    }, [loadBookmarks])
  );

  const surahContent = (
    <FlatList
      data={surahBookmarks}
      keyExtractor={(item) => `surah-${item.nomor}`}
      contentContainerStyle={styles.listContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} tintColor="#C68B2F" />}
      renderItem={({ item }) => (
        <Pressable
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          onPress={() => router.push({ pathname: '/Detail_surat', params: { nomor: item.nomor } })}>
          <View style={styles.numberBadge}>
            <Text style={styles.numberBadgeText}>{String(item.nomor).padStart(2, '0')}</Text>
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>{item.nama_latin}</Text>
            <Text style={styles.cardSubtitle}>
              {item.tempat_turun} • {item.jumlah_ayat} ayat
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={18} color="#C6B29A" />
        </Pressable>
      )}
      ListEmptyComponent={!loading ? <Text style={styles.emptyText}>Belum ada bookmark surat.</Text> : null}
    />
  );

  const ayahContent = (
    <FlatList
      data={ayahBookmarks}
      keyExtractor={(item) => `ayah-${item.key}`}
      contentContainerStyle={styles.listContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} tintColor="#C68B2F" />}
      renderItem={({ item }) => (
        <Pressable
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          onPress={() => router.push({ pathname: '/Detail_surat', params: { nomor: item.surahNo, ayah: item.ayahNo } })}>
          <View style={styles.numberBadge}>
            <Text style={styles.numberBadgeText}>{item.ayahNo}</Text>
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>
              {item.surahLatin} {item.ayahNo}
            </Text>
            <Text style={styles.cardSubtitle} numberOfLines={2}>
              {item.translation}
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={18} color="#C6B29A" />
        </Pressable>
      )}
      ListEmptyComponent={!loading ? <Text style={styles.emptyText}>Belum ada bookmark ayat.</Text> : null}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="chevron-back" size={24} color="#1A1209" />
        </Pressable>
        <Text style={styles.topTitle}>Bookmark Quran</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.tabRow}>
        <Pressable
          style={[styles.tabBtn, activeTab === 'surah' && styles.tabBtnActive]}
          onPress={() => setActiveTab('surah')}>
          <Text style={[styles.tabText, activeTab === 'surah' && styles.tabTextActive]}>Surat</Text>
        </Pressable>
        <Pressable
          style={[styles.tabBtn, activeTab === 'ayat' && styles.tabBtnActive]}
          onPress={() => setActiveTab('ayat')}>
          <Text style={[styles.tabText, activeTab === 'ayat' && styles.tabTextActive]}>Ayat</Text>
        </Pressable>
      </View>

      {activeTab === 'surah' ? surahContent : ayahContent}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F1E8',
  },
  topBar: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  topTitle: {
    fontSize: 18,
    color: '#1A1209',
    fontWeight: '800',
    fontFamily: 'serif',
  },
  tabRow: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 6,
    flexDirection: 'row',
    backgroundColor: '#EFE3D0',
    borderRadius: 18,
    padding: 4,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    height: 34,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnActive: {
    backgroundColor: '#C68B2F',
  },
  tabText: {
    color: '#7D664B',
    fontSize: 13,
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#FFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 8,
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDF5',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E9DAC3',
    paddingHorizontal: 12,
    paddingVertical: 11,
    gap: 12,
  },
  cardPressed: {
    backgroundColor: '#F7EDD9',
  },
  numberBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(198,139,47,0.15)',
  },
  numberBadgeText: {
    color: '#A56E2C',
    fontSize: 12,
    fontWeight: '700',
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
  },
  cardTitle: {
    color: '#23170D',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  cardSubtitle: {
    color: '#8A7255',
    fontSize: 12,
    lineHeight: 18,
  },
  emptyText: {
    textAlign: 'center',
    color: '#8A7255',
    marginTop: 30,
    fontSize: 14,
  },
});
