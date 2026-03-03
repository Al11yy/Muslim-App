import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type HadithData = {
  number: number;
  arab: string;
  id: string; // Asumsi: 'id' ini adalah terjemahan bahasa Indonesia dari API lu
};

type HadithResponse = {
  name: string;
  id: string;
  available: number;
  hadiths: HadithData[];
};

export default function DetailHadits() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [data, setData] = useState<HadithResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (isRefresh = false) => {
      if (!id) {
        setData(null);
        setLoading(false);
        setRefreshing(false);
        return;
      }
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const response = await fetch(`https://muslim-api-three.vercel.app/v1/hadits/${id}?range=1-30`);
        const result = await response.json();
        // Pastikan narik data dari .data sesuai struktur API
        setData(result?.data ?? null);
      } catch (error) {
        console.error(error);
        setData(null);
      } finally {
        if (isRefresh) setRefreshing(false);
        else setLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    void load();
  }, [load]);

  const title = useMemo(() => data?.name ?? 'Detail Hadits', [data?.name]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#C68B2F" />
        <Text style={styles.loadingText}>Memuat hadits...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      
      {/* ─── TOP BAR ─── */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={20} color="#2A1F12" />
        </Pressable>
        <Text style={styles.topTitle}>Kitab Hadits</Text>
        <View style={styles.topSpacer} />
      </View>

      {!data ? (
        <View style={styles.center}>
          <Ionicons name="document-text-outline" size={48} color="#D1C4B2" />
          <Text style={styles.emptyText}>Gagal memuat data hadits.</Text>
        </View>
      ) : (
        <FlatList
          data={data.hadiths}
          // Aman pakai toString karena number
          keyExtractor={(item) => item.number.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor="#C68B2F" />
          }
          ListHeaderComponent={
            <View style={styles.hero}>
              <Text style={styles.heroTitle} numberOfLines={2}>
                {title}
              </Text>
              <View style={styles.heroBadge}>
                <Ionicons name="book-outline" size={14} color="#C68B2F" />
                <Text style={styles.heroSubtitle}>{`${data.available} hadits tersedia`}</Text>
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              
              {/* Header Card (Nomor Hadits) */}
              <View style={styles.cardHeader}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.number}</Text>
                </View>
                <Pressable hitSlop={8}>
                  <Ionicons name="share-social-outline" size={20} color="#8A7255" />
                </Pressable>
              </View>

              {/* Teks Arab */}
              <Text style={styles.arabic}>{item.arab}</Text>

              {/* Pemisah Halus */}
              <View style={styles.divider} />

              {/* Terjemahan (Asumsi item.id adalah field teks indonesianya) */}
              <Text style={styles.translation}>{item.id}</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const PRIMARY_GOLD = '#C68B2F';

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
    paddingHorizontal: 20,
    gap: 12,
  },
  loadingText: {
    color: '#8A7255',
    fontWeight: '600',
  },
  topBar: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16, // Dibikin agak lega
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF9ED',
    borderWidth: 1,
    borderColor: '#EADBC0',
  },
  topTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2A1F12',
    fontFamily: 'serif',
  },
  topSpacer: {
    width: 40,
    height: 40,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  
  // ─── HERO HEADER ───
  hero: {
    backgroundColor: '#D99A3E',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 20,
    // Shadow
    elevation: 4,
    shadowColor: PRIMARY_GOLD,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  heroTitle: {
    fontSize: 26,
    lineHeight: 34,
    color: '#FFFFFF',
    fontWeight: '800',
    fontFamily: 'serif',
    marginBottom: 12,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDF5',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  heroSubtitle: {
    fontSize: 12,
    color: PRIMARY_GOLD,
    fontWeight: '800',
  },
  
  // ─── HADITS CARD ───
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EADBC0',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16, // Ganti pemisah jadi margin bottom
    // Shadow ringan
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  badge: {
    backgroundColor: 'rgba(198,139,47,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 13,
    color: '#AF7A36',
    fontWeight: '800',
  },
  arabic: {
    fontSize: 28,
    textAlign: 'right',
    color: '#1C1408',
    fontFamily: 'serif',
    lineHeight: 46,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0E8D8',
    marginBottom: 16,
  },
  translation: {
    fontSize: 15,
    color: '#4A3B2C',
    lineHeight: 24,
    textAlign: 'justify',
  },
  emptyText: {
    color: '#8A7255',
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '500',
  },
});
