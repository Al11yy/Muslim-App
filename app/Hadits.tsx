import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemePreference } from '@/contexts/theme-preference';
import { getHaditsSavedIds, toggleHaditsSavedId } from '@/lib/content-bookmarks';
import { showSaveFeedback } from '@/lib/save-feedback';

type HadithApiItem = {
  no?: number | string;
  judul?: string;
  arab?: string;
  indo?: string;
};

type HadithItem = {
  id: string;
  title: string;
  arabic: string;
  translation: string;
};

export default function Hadits() {
  const router = useRouter();
  const { resolvedTheme } = useThemePreference();
  const isDark = resolvedTheme === 'dark';

  const [data, setData] = useState<HadithItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({});
  const [activeFilter, setActiveFilter] = useState<'all' | 'saved' | 'short' | 'long'>('all');

  const theme = useMemo(
    () => ({
      bg: isDark ? '#1A130B' : '#F7F1E8',
      text: isDark ? '#F6ECDD' : '#1C1408',
      muted: isDark ? '#CAB79C' : '#8A7255',
      subtitle: isDark ? '#BFA883' : '#AF7A36',
      surface: isDark ? '#2A1F12' : '#FFFDF5',
      pressed: isDark ? '#352818' : '#FDF4E4',
      border: isDark ? '#4A3825' : '#EADBC0',
      gold: '#C68B2F',
      body: isDark ? '#E8D6BD' : '#3D2108',
    }),
    [isDark]
  );

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadHadits = async () => {
      try {
        const [response, saved] = await Promise.all([
          fetch('https://muslim-api-three.vercel.app/v1/hadits'),
          getHaditsSavedIds(),
        ]);
        const result = await response.json();
        const rawList: HadithApiItem[] = Array.isArray(result)
          ? result
          : Array.isArray(result?.data)
            ? result.data
            : [];

        const normalized: HadithItem[] = rawList.map((item, index) => ({
          id: String(item.no ?? index + 1),
          title: item.judul?.trim() || `Hadits ${index + 1}`,
          arabic: item.arab?.trim() || '-',
          translation: item.indo?.trim() || '-',
        }));

        if (!mounted) return;
        setData(normalized);
        setSavedIds(
          saved.reduce<Record<string, boolean>>((acc, id) => {
            acc[id] = true;
            return acc;
          }, {})
        );
      } catch (error) {
        console.error(error);
        if (mounted) setData([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void loadHadits();

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return data.filter((item) => {
      const matchQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.translation.toLowerCase().includes(q) ||
        item.arabic.toLowerCase().includes(q);

      const translationLength = item.translation.length;
      const matchFilter =
        activeFilter === 'all'
          ? true
          : activeFilter === 'saved'
            ? Boolean(savedIds[item.id])
            : activeFilter === 'short'
              ? translationLength <= 220
              : translationLength > 220;

      return matchQuery && matchFilter;
    });
  }, [data, query, activeFilter, savedIds]);

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSave = async (id: string) => {
    const result = await toggleHaditsSavedId(id);
    setSavedIds(
      result.ids.reduce<Record<string, boolean>>((acc, itemId) => {
        acc[itemId] = true;
        return acc;
      }, {})
    );
    const selected = data.find((item) => item.id === id);
    showSaveFeedback({
      saved: result.saved,
      label: selected?.title ?? `Hadits #${id}`,
      entity: 'Hadits',
    });
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color="#C68B2F" />
        <Text style={[styles.loadingText, { color: theme.muted }]}>Memuat daftar hadits...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top']}>
      <View style={styles.topBarWrap}>
        <Pressable hitSlop={10} onPress={() => router.back()} style={[styles.backBtn, { borderColor: theme.border, backgroundColor: theme.surface }]}>
          <Ionicons name="chevron-back" size={20} color={theme.text} />
        </Pressable>
        <Text style={[styles.topBarTitle, { color: theme.text }]}>Hadits</Text>
        <View style={styles.topBarSpacer} />
      </View>

      <View style={styles.headerWrap}>
        <Text style={[styles.pageSubtitle, { color: theme.muted }]}>Filter hadits lalu simpan yang ingin kamu baca ulang.</Text>

        <View style={[styles.searchWrap, { backgroundColor: theme.surface, borderColor: theme.border }]}> 
          <Ionicons name="search-outline" size={18} color={theme.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Cari judul atau isi hadits..."
            placeholderTextColor={theme.muted}
            style={[styles.searchInput, { color: theme.text }]}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          <Pressable style={[styles.filterChip, activeFilter === 'all' && styles.filterChipActive]} onPress={() => setActiveFilter('all')}>
            <Text style={[styles.filterChipText, activeFilter === 'all' && styles.filterChipTextActive]}>Semua</Text>
          </Pressable>
          <Pressable style={[styles.filterChip, activeFilter === 'saved' && styles.filterChipActive]} onPress={() => setActiveFilter('saved')}>
            <Text style={[styles.filterChipText, activeFilter === 'saved' && styles.filterChipTextActive]}>Tersimpan</Text>
          </Pressable>
          <Pressable style={[styles.filterChip, activeFilter === 'short' && styles.filterChipActive]} onPress={() => setActiveFilter('short')}>
            <Text style={[styles.filterChipText, activeFilter === 'short' && styles.filterChipTextActive]}>Ringkas</Text>
          </Pressable>
          <Pressable style={[styles.filterChip, activeFilter === 'long' && styles.filterChipActive]} onPress={() => setActiveFilter('long')}>
            <Text style={[styles.filterChipText, activeFilter === 'long' && styles.filterChipTextActive]}>Panjang</Text>
          </Pressable>
        </ScrollView>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item, index }) => {
          const isExpanded = Boolean(expanded[item.id]);
          return (
            <Animated.View entering={FadeInDown.duration(320).delay(Math.min(index * 25, 280))}>
              <Pressable
                onPress={() => toggleExpand(item.id)}
                style={({ pressed }) => [
                  styles.card,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                  pressed && [styles.cardPressed, { backgroundColor: theme.pressed }],
                ]}>
                <View style={styles.cardHeader}>
                  <View style={[styles.iconWrap, { backgroundColor: isDark ? 'rgba(198,139,47,0.2)' : 'rgba(198,139,47,0.14)' }]}>
                    <MaterialCommunityIcons name="book-open-page-variant-outline" size={20} color={theme.gold} />
                  </View>
                  <View style={styles.cardBody}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
                    <Text style={[styles.cardSubtitle, { color: theme.subtitle }]}>Hadits #{item.id}</Text>
                  </View>
                  <View style={styles.headerActions}>
                    <Pressable
                      hitSlop={8}
                      onPress={(event) => {
                        event.stopPropagation();
                        void toggleSave(item.id);
                      }}>
                      <Ionicons
                        name={savedIds[item.id] ? 'bookmark' : 'bookmark-outline'}
                        size={18}
                        color={savedIds[item.id] ? theme.gold : theme.subtitle}
                      />
                    </Pressable>
                    <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={theme.subtitle} />
                  </View>
                </View>

                <Text style={[styles.arabic, { color: theme.text }]} numberOfLines={isExpanded ? undefined : 2}>
                  {item.arabic}
                </Text>
                <Text style={[styles.translation, { color: theme.body }]} numberOfLines={isExpanded ? undefined : 3}>
                  {item.translation}
                </Text>
              </Pressable>
            </Animated.View>
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={<Text style={[styles.emptyText, { color: theme.muted }]}>Hadits tidak ditemukan.</Text>}
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
    paddingTop: 8,
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
  headerWrap: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 14,
    gap: 10,
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
    marginTop: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#3D2108',
  },
  filterRow: {
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
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
  },
  cardPressed: {
    backgroundColor: '#FDF4E4',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(198,139,47,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
  },
  cardTitle: {
    fontSize: 15,
    color: '#1E1508',
    fontWeight: '700',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#8A7255',
  },
  arabic: {
    fontSize: 24,
    textAlign: 'right',
    lineHeight: 40,
    fontFamily: 'serif',
  },
  translation: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'left',
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
