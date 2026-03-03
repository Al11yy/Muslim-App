import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemePreference } from '@/contexts/theme-preference';

type DzikirApiItem = {
  type?: string;
  arab?: string;
  indo?: string;
  ulang?: string;
};

type DzikirItem = {
  id: string;
  title: string;
  arabic: string;
  latin: string;
  translation: string;
  repeat: string;
  type: string;
};

export default function Dzikir() {
  const { resolvedTheme } = useThemePreference();
  const isDark = resolvedTheme === 'dark';

  const [data, setData] = useState<DzikirItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const theme = useMemo(
    () => ({
      bg: isDark ? '#1A130B' : '#F7F1E8',
      text: isDark ? '#F6ECDD' : '#1C1408',
      muted: isDark ? '#CAB79C' : '#8A7255',
      body: isDark ? '#E9D8BF' : '#3D2108',
      surface: isDark ? '#2A1F12' : '#FFFDF5',
      pressed: isDark ? '#352818' : '#FDF4E4',
      border: isDark ? '#4A3825' : '#EADBC0',
      gold: '#C68B2F',
      chip: isDark ? 'rgba(198,139,47,0.22)' : 'rgba(198,139,47,0.12)',
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

    const loadDzikir = async () => {
      try {
        const response = await fetch('https://muslim-api-three.vercel.app/v1/dzikir');
        const result = await response.json();
        const rawList: DzikirApiItem[] = Array.isArray(result)
          ? result
          : Array.isArray(result?.data)
            ? result.data
            : [];

        const normalized: DzikirItem[] = rawList.map((item, index) => {
          const type = item.type?.trim() || 'umum';
          const title = `Dzikir ${type.charAt(0).toUpperCase()}${type.slice(1)} #${index + 1}`;
          return {
            id: `${type}-${index + 1}`,
            title,
            arabic: item.arab?.trim() || '-',
            latin: item.arab?.trim() || '-',
            translation: item.indo?.trim() || '-',
            repeat: item.ulang?.trim() || '-',
            type,
          };
        });

        if (!mounted) return;
        setData(normalized);
      } catch (error) {
        console.error(error);
        if (mounted) setData([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void loadDzikir();

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;

    return data.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.translation.toLowerCase().includes(q) ||
        item.latin.toLowerCase().includes(q) ||
        item.arabic.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q)
    );
  }, [data, query]);

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color="#C68B2F" />
        <Text style={[styles.loadingText, { color: theme.muted }]}>Memuat dzikir...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top']}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <Text style={[styles.pageTitle, { color: theme.text }]}>Dzikir</Text>
            <Text style={[styles.pageSubtitle, { color: theme.muted }]}>Sekarang sudah sinkron dengan API terbaru + animasi expand yang halus.</Text>

            <View style={[styles.searchWrap, { backgroundColor: theme.surface, borderColor: theme.border }]}> 
              <Ionicons name="search-outline" size={18} color={theme.muted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Cari dzikir..."
                placeholderTextColor={theme.muted}
                style={[styles.searchInput, { color: theme.text }]}
              />
            </View>
          </View>
        }
        renderItem={({ item, index }) => {
          const isExpanded = Boolean(expanded[item.id]);
          return (
            <Animated.View entering={FadeInDown.duration(320).delay(Math.min(index * 22, 260))}>
              <Pressable
                style={({ pressed }) => [
                  styles.card,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                  pressed && [styles.cardPressed, { backgroundColor: theme.pressed }],
                ]}
                onPress={() => toggleExpand(item.id)}>
                <View style={styles.cardTopRow}>
                  <View style={[styles.typeChip, { backgroundColor: theme.chip }]}> 
                    <Text style={[styles.typeChipText, { color: theme.gold }]}>{item.type.toUpperCase()}</Text>
                  </View>
                  <Text style={[styles.repeatText, { color: theme.muted }]}>Ulang: {item.repeat}</Text>
                </View>

                <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
                <Text style={[styles.arabic, { color: theme.text }]} numberOfLines={isExpanded ? undefined : 2}>{item.arabic}</Text>
                <Text style={[styles.translation, { color: theme.body }]} numberOfLines={isExpanded ? undefined : 4}>
                  {item.translation}
                </Text>

                <View style={styles.expandRow}>
                  <Text style={[styles.expandText, { color: theme.gold }]}>{isExpanded ? 'Ringkas' : 'Lihat lengkap'}</Text>
                  <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={14} color={theme.gold} />
                </View>
              </Pressable>
            </Animated.View>
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={<Text style={[styles.emptyText, { color: theme.muted }]}>Dzikir tidak ditemukan.</Text>}
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
  headerWrap: {
    paddingTop: 8,
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
  card: {
    backgroundColor: '#FFFDF5',
    borderWidth: 1,
    borderColor: '#EADBC0',
    borderRadius: 16,
    padding: 14,
  },
  cardPressed: {
    backgroundColor: '#FDF4E4',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  typeChipText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  repeatText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8A7255',
  },
  cardTitle: {
    fontSize: 15,
    color: '#1E1508',
    fontWeight: '700',
    marginBottom: 8,
  },
  arabic: {
    fontSize: 28,
    textAlign: 'right',
    color: '#1C1408',
    fontFamily: 'serif',
    lineHeight: 46,
    marginBottom: 8,
  },
  translation: {
    fontSize: 14,
    color: '#3D2108',
    lineHeight: 22,
  },
  expandRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 2,
  },
  expandText: {
    fontSize: 12,
    color: '#AF7A36',
    fontWeight: '700',
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
