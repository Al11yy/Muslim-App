import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemePreference } from '@/contexts/theme-preference';
import { notifyTabBarScroll } from '@/lib/tab-bar-visibility';

type ArticleItem = {
  title: string;
  link: string;
  pubDate: string;
  thumbnail: string;
  description: string;
};

type RssResponse = {
  status: string;
  items: ArticleItem[];
};

type PeriodFilter = 'all' | 'today' | 'week' | 'month';

const ARTICLE_API =
  'https://api.rss2json.com/v1/api.json?rss_url=https://republika.co.id/rss/khazanah';

function matchPeriod(dateStr: string, periodFilter: PeriodFilter) {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDay = diffMs / (1000 * 60 * 60 * 24);

  if (periodFilter === 'today') {
    return date.toDateString() === now.toDateString();
  }
  if (periodFilter === 'week') {
    return diffDay >= 0 && diffDay <= 7;
  }
  if (periodFilter === 'month') {
    return diffDay >= 0 && diffDay <= 30;
  }
  return true;
}

export default function Artikel() {
  const { resolvedTheme } = useThemePreference();
  const isDark = resolvedTheme === 'dark';
  const [data, setData] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');
  const theme = useMemo(
    () => ({
      bg: isDark ? '#1A130B' : '#F7F1E8',
      text: isDark ? '#F6ECDD' : '#1C1408',
      muted: isDark ? '#CAB79C' : '#8A7255',
      body: isDark ? '#E9D8BF' : '#7E6446',
      surface: isDark ? '#2A1F12' : '#FFFDF5',
      softSurface: isDark ? '#332516' : '#FFF9ED',
      pressed: isDark ? '#352818' : '#FDF4E4',
      border: isDark ? '#4A3825' : '#EADBC0',
      gold: '#C68B2F',
      iconMuted: isDark ? '#C4AB8A' : '#AF7A36',
    }),
    [isDark]
  );

  useEffect(() => {
    fetch(ARTICLE_API)
      .then((response) => response.json())
      .then((result: RssResponse) => {
        setData(Array.isArray(result?.items) ? result.items : []);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.filter((item) => {
      const matchQuery =
        !q || item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
      return matchQuery && matchPeriod(item.pubDate, periodFilter);
    });
  }, [data, query, periodFilter]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color="#C68B2F" />
        <Text style={[styles.loadingText, { color: theme.muted }]}>Memuat artikel...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top']}>
      <View style={styles.topBarWrap}>
        <Text style={[styles.pageTitle, { color: theme.text }]}>Artikel</Text>
        <Text style={[styles.pageSubtitle, { color: theme.body }]}>Khazanah Islami terbaru dari Republika.</Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item, index) => `${item.link}-${index}`}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onScroll={notifyTabBarScroll}
        onScrollBeginDrag={notifyTabBarScroll}
        scrollEventThrottle={16}
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <View style={[styles.searchWrap, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Ionicons name="search-outline" size={18} color={theme.muted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Cari artikel..."
                placeholderTextColor={theme.muted}
                style={[styles.searchInput, { color: theme.text }]}
              />
            </View>

            <View style={styles.filterRow}>
              {([
                { id: 'all', label: 'Semua' },
                { id: 'today', label: 'Hari Ini' },
                { id: 'week', label: '7 Hari' },
                { id: 'month', label: '30 Hari' },
              ] as { id: PeriodFilter; label: string }[]).map((item) => (
                <Pressable
                  key={item.id}
                  style={[
                    styles.filterChip,
                    { borderColor: theme.border, backgroundColor: theme.softSurface },
                    periodFilter === item.id && styles.filterChipActive,
                  ]}
                  onPress={() => setPeriodFilter(item.id)}>
                  <Text
                    style={[
                      styles.filterChipText,
                      { color: theme.body },
                      periodFilter === item.id && styles.filterChipTextActive,
                    ]}>
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [
              styles.card,
              { backgroundColor: theme.surface, borderColor: theme.border },
              pressed && [styles.cardPressed, { backgroundColor: theme.pressed }],
            ]}
            onPress={() => {
              void WebBrowser.openBrowserAsync(item.link);
            }}>
            {item.thumbnail ? <Image source={{ uri: item.thumbnail }} style={styles.thumb} /> : null}

            <View style={styles.cardBody}>
              <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={2}>{item.title}</Text>
              <Text style={[styles.cardDate, { color: theme.iconMuted }]}>{new Date(item.pubDate).toLocaleDateString('id-ID')}</Text>
              <Text style={[styles.cardDesc, { color: theme.body }]} numberOfLines={3}>
                {item.description.replace(/<[^>]*>?/gm, '')}
              </Text>
            </View>

            <Ionicons name="open-outline" size={18} color={theme.iconMuted} />
          </Pressable>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={<Text style={[styles.emptyText, { color: theme.muted }]}>Artikel tidak ditemukan.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F1E8',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F1E8',
  },
  loadingText: {
    marginTop: 10,
    color: '#8A7255',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  topBarWrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 2,
  },
  headerWrap: {
    paddingTop: 4,
    paddingBottom: 14,
    gap: 10,
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1C1408',
    fontFamily: 'serif',
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#7E6446',
    lineHeight: 20,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFDF5',
    borderColor: '#EADBC0',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 42,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#3D2108',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5D5BA',
    backgroundColor: '#FFF9ED',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  filterChipActive: {
    backgroundColor: '#C68B2F',
    borderColor: '#C68B2F',
  },
  filterChipText: {
    color: '#7E6446',
    fontSize: 12,
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: '#FFF',
  },
  card: {
    backgroundColor: '#FFFDF5',
    borderWidth: 1,
    borderColor: '#EADBC0',
    borderRadius: 16,
    padding: 12,
    gap: 10,
  },
  cardPressed: {
    backgroundColor: '#FDF4E4',
  },
  thumb: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    backgroundColor: '#EEDFC8',
  },
  cardBody: {
    gap: 4,
  },
  cardTitle: {
    fontSize: 16,
    color: '#1E1508',
    fontWeight: '700',
    lineHeight: 22,
  },
  cardDate: {
    fontSize: 12,
    color: '#AF7A36',
    fontWeight: '700',
  },
  cardDesc: {
    fontSize: 13,
    color: '#7E6446',
    lineHeight: 20,
  },
  separator: {
    height: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: '#8A7255',
    marginTop: 30,
    fontSize: 14,
  },
});
