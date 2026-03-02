import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; // Tambah MaterialCommunityIcons
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Doa {
  id: number;
  judul: string;
  latin: string;
  arab: string;
  terjemah: string;
}

export default function DoaHarian() {
  const router = useRouter(); 
  const [data, setData] = useState<Doa[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetch('https://open-api.my.id/api/doa')
      .then((response) => response.json())
      .then((result) => {
        setData(Array.isArray(result) ? result : []);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter((item) => item.judul.toLowerCase().includes(q));
  }, [data, query]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#C68B2F" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      
      {/* ─── HEADER & SEARCH BAR ─── */}
      <View style={styles.headerWrap}>
        <Text style={styles.pageTitle}>Doa Harian</Text>
        <Text style={styles.pageSubtitle}>Kumpulan doa pilihan untuk diamalkan setiap hari.</Text>

        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={18} color="#8A7255" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Cari judul doa..."
            placeholderTextColor="#A89277"
            style={styles.searchInput}
          />
        </View>
      </View>

      {/* ─── LIST DOA (GRID 2 KOLOM) ─── */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2} // BIKIN JADI 2 KOLOM!
        columnWrapperStyle={styles.rowWrapper} // Jarak antar kolom
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>Doa tidak ditemukan.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable 
            style={({ pressed }) => [styles.gridCard, pressed && styles.gridCardPressed]}
            onPress={() => router.push({ pathname: '/Detail_doa', params: { id: item.id } })}
          >
            {/* Watermark Angka Raksasa di Background */}
            <Text style={styles.watermark} numberOfLines={1}>
              {String(item.id).padStart(2, '0')}
            </Text>

            {/* Bagian Atas Card: Icon & Badge Kecil */}
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="hands-pray" size={24} color="#C68B2F" />
              <View style={styles.miniBadge}>
                <Text style={styles.miniBadgeText}>Doa</Text>
              </View>
            </View>

            {/* Judul Doa */}
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle} numberOfLines={3}>
                {item.judul}
              </Text>
            </View>
          </Pressable>
        )}
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
  headerWrap: {
    paddingHorizontal: 16,
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
    marginTop: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#3D2108',
  },
  
  // ─── STYLING UNTUK GRID ───
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 8,
  },
  rowWrapper: {
    gap: 16, // Jarak antar card ke samping
    marginBottom: 16, // Jarak antar baris ke bawah
  },
  
  // ─── STYLING CARD BARU (PREMIUM) ───
  gridCard: {
    flex: 1, // Biar cardnya membelah dua layar sama rata
    backgroundColor: '#FFFFFF', // Putih bersih biar kontras
    borderWidth: 1,
    borderColor: '#EADBC0',
    borderRadius: 20, // Lebih melengkung
    padding: 16,
    minHeight: 140, // Tinggi minimal card
    justifyContent: 'space-between',
    overflow: 'hidden', // Biar teks watermark nggak keluar kotak
    
    // Shadow Lembut
    shadowColor: '#C68B2F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  gridCardPressed: {
    backgroundColor: '#FDF4E4',
    transform: [{ scale: 0.97 }], // Efek ditekan mengecil dikit
  },
  
  // Watermark Angka Besar
  watermark: {
    position: 'absolute',
    bottom: -15, // Ditarik ke bawah biar kepotong dikit
    right: -5,   // Ditarik ke kanan
    fontSize: 75,
    fontWeight: '900',
    color: '#C68B2F',
    opacity: 0.06, // Sangat transparan
    fontFamily: 'serif',
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  miniBadge: {
    backgroundColor: 'rgba(198,139,47,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  miniBadgeText: {
    fontSize: 10,
    color: '#AF7A36',
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  cardBody: {
    flex: 1,
    justifyContent: 'flex-end', // Teks selalu nempel bawah kalau judulnya pendek
  },
  cardTitle: {
    fontSize: 15,
    color: '#1E1508',
    fontWeight: '700',
    lineHeight: 22,
  },

  // State Kosong
  emptyWrap: {
    paddingVertical: 26,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#8A7255',
  },
});