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
  id: string;
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

  const load = useCallback(async (isRefresh = false) => {
    if (!id) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await fetch(`https://muslim-api-three.vercel.app/v1/hadits/${id}?range=1-30`);
      const result = await response.json();
      setData(result?.data ?? null);
    } catch (error) {
      console.error(error);
      setData(null);
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  }, [id]);

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
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={20} color="#2A1F12" />
        </Pressable>
        <Text style={styles.topTitle}>Hadits</Text>
        <View style={styles.topSpacer} />
      </View>

      {!data ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Gagal memuat data hadits.</Text>
        </View>
      ) : (
        <FlatList
          data={data.hadiths}
          keyExtractor={(item) => item.number.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor="#C68B2F" />}
          ListHeaderComponent={
            <View style={styles.hero}>
              <Text style={styles.heroTitle} numberOfLines={2}>{title}</Text>
              <Text style={styles.heroSubtitle}>{`${data.available} hadits tersedia`}</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.number}>{`Hadits No. ${item.number}`}</Text>
              <Text style={styles.arabic}>{item.arab}</Text>
              <Text style={styles.translation}>{item.id}</Text>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
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
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 10,
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
    paddingBottom: 10,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
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
    width: 38,
    height: 38,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  hero: {
    backgroundColor: '#D99A3E',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 24,
    lineHeight: 30,
    color: '#FFFFFF',
    fontWeight: '800',
    fontFamily: 'serif',
  },
  heroSubtitle: {
    marginTop: 6,
    fontSize: 12,
    color: '#FFE8C0',
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#FFFDF5',
    borderWidth: 1,
    borderColor: '#EADBC0',
    borderRadius: 14,
    padding: 14,
  },
  number: {
    fontSize: 12,
    color: '#AF7A36',
    fontWeight: '800',
    marginBottom: 8,
  },
  arabic: {
    fontSize: 28,
    textAlign: 'right',
    color: '#1C1408',
    fontFamily: 'serif',
    lineHeight: 48,
    marginBottom: 10,
  },
  translation: {
    fontSize: 14,
    color: '#3D2108',
    lineHeight: 22,
  },
  separator: {
    height: 10,
  },
  emptyText: {
    color: '#8A7255',
    fontSize: 14,
    textAlign: 'center',
  },
});
