import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av'; // Import dari expo-av
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemePreference } from '@/contexts/theme-preference';

interface AsmaulHusnaItem {
  urutan: number;
  latin: string;
  arab: string;
  arti: string;
}

export default function AsmaulHusna() {
  const { resolvedTheme } = useThemePreference();
  const isDark = resolvedTheme === 'dark';
  const [data, setData] = useState<AsmaulHusnaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  // ─── STATE UNTUK AUDIO ───
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playingId, setPlayingId] = useState<number | null>(null);

  const theme = useMemo(
    () => ({
      bg: isDark ? '#1A130B' : '#F7F1E8',
      text: isDark ? '#F6ECDD' : '#1C1408',
      muted: isDark ? '#CAB79C' : '#8A7255',
      surface: isDark ? '#2A1F12' : '#FFFFFF',
      softSurface: isDark ? '#332516' : '#FFF9ED',
      border: isDark ? '#4A3825' : '#EADBC0',
      gold: '#C68B2F',
    }),
    [isDark]
  );

  useEffect(() => {
    fetch('https://asmaul-husna-api.vercel.app/api/all')
      .then((response) => response.json())
      .then((result) => {
        setData(Array.isArray(result?.data) ? result.data : []);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  // Membersihkan memory audio kalau pindah halaman
  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;

    return data.filter(
      (item) =>
        item.latin.toLowerCase().includes(q) ||
        item.arti.toLowerCase().includes(q) ||
        item.arab.includes(q) ||
        String(item.urutan) === q
    );
  }, [data, query]);

 // Ingat tambahin 'Alert' di import react-native atas lu:
// import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View, Alert } from 'react-native';

const playAudio = async (urutan: number) => {
  if (playingId === urutan) return;

  try {
    setPlayingId(urutan); 
    
    if (sound) {
      await sound.unloadAsync();
    }

    const formattedNumber = String(urutan).padStart(3, '0');
    // Karena URL ini rentan mati, kita harus siap-siap nangkep errornya
    const audioUrl = `https://github.com/Kiraa11/Asmaul-Husna-API/raw/main/audio/${formattedNumber}.mp3`;

    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri: audioUrl },
      { shouldPlay: true }
    );
    setSound(newSound);

    newSound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        setPlayingId(null);
      }
    });
  } catch (error) {
    console.error('Gagal memutar audio:', error);
    setPlayingId(null); // Batalin efek loading
    
    // Tampilin Alert biar app gak crash
    Alert.alert(
      'Audio Tidak Tersedia',
      'Maaf, server audio sedang mengalami gangguan (404 Not Found).'
    );
  }
};

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color="#C68B2F" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top']}>
      
      {/* ─── HEADER ─── */}
      <View style={styles.headerWrap}>
        <Text style={[styles.pageTitle, { color: theme.text }]}>Asmaul Husna</Text>
        <Text style={[styles.pageSubtitle, { color: theme.muted }]}>99 nama Allah yang indah untuk dzikir dan tadabbur.</Text>

        <View style={[styles.searchWrap, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Ionicons name="search-outline" size={18} color={theme.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Cari nama atau arti..."
            placeholderTextColor={theme.muted}
            style={[styles.searchInput, { color: theme.text }]}
          />
        </View>
      </View>

      {/* ─── GRID LIST ─── */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.urutan.toString()}
        numColumns={2}
        columnWrapperStyle={styles.rowWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={[styles.emptyText, { color: theme.muted }]}>Data tidak ditemukan.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isPlaying = playingId === item.urutan; // Cek apakah item ini lagi dimainin audionya
          
          return (
            <View style={[styles.gridCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={styles.watermark} numberOfLines={1}>
                {String(item.urutan).padStart(2, '0')}
              </Text>

              <View style={styles.cardHeader}>
                <View style={[styles.miniBadge, { backgroundColor: isDark ? 'rgba(198,139,47,0.2)' : 'rgba(198,139,47,0.1)' }]}>
                  <Text style={styles.miniBadgeText}>{String(item.urutan).padStart(2, '0')}</Text>
                </View>
                
                {/* ─── TOMBOL AUDIO BISA DIPENCET SEKARANG ─── */}
                <Pressable 
                  style={({ pressed }) => [styles.audioBtn, { backgroundColor: theme.softSurface }, pressed && { opacity: 0.5 }]}
                  onPress={() => playAudio(item.urutan)}
                  disabled={isPlaying} // Jangan dipencet kalau udah loading/main
                >
                  {isPlaying ? (
                    // Kalau lagi muter/loading, kasih efek muter
                    <ActivityIndicator size="small" color={theme.gold} />
                  ) : (
                    // Kalau idle, tampilin tombol volume biasa
                    <Ionicons name="volume-medium" size={16} color={theme.gold} />
                  )}
                </Pressable>
              </View>

              <View style={styles.arabicWrapper}>
                 <Text style={[styles.arabicText, { color: theme.gold }]} adjustsFontSizeToFit numberOfLines={1}>
                   {item.arab}
                 </Text>
              </View>

              <View style={styles.cardBody}>
                <Text style={[styles.latinName, { color: theme.text }]} numberOfLines={1}>{item.latin}</Text>
                <Text style={[styles.meaningText, { color: theme.muted }]} numberOfLines={2}>{item.arti}</Text>
              </View>
            </View>
          );
        }}
      />
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
    paddingBottom: 32,
    paddingTop: 8,
  },
  rowWrapper: {
    gap: 14, 
    marginBottom: 14, 
  },

  // ─── STYLING CARD ───
  gridCard: {
    flex: 1, 
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EADBC0',
    borderRadius: 20, 
    padding: 14,
    minHeight: 165,
    justifyContent: 'space-between',
    overflow: 'hidden', 
    
    shadowColor: PRIMARY_GOLD,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  
  watermark: {
    position: 'absolute',
    bottom: -10, 
    right: -5,   
    fontSize: 85,
    fontWeight: '900',
    color: PRIMARY_GOLD,
    opacity: 0.05, 
    fontFamily: 'serif',
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  miniBadge: {
    backgroundColor: 'rgba(198,139,47,0.1)',
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniBadgeText: {
    fontSize: 11,
    color: '#AF7A36',
    fontWeight: '800',
  },
  audioBtn: {
    width: 28, // Fix ukuran biar icon loading gak gepeng
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF9ED', 
    alignItems: 'center',
    justifyContent: 'center',
  },

  arabicWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  arabicText: {
    fontSize: 32,
    color: PRIMARY_GOLD,
    fontFamily: 'serif',
    fontWeight: '600',
  },

  cardBody: {
    alignItems: 'center', 
  },
  latinName: {
    fontSize: 15,
    color: '#1E1508',
    fontWeight: '800',
    marginBottom: 2,
    textAlign: 'center',
  },
  meaningText: {
    fontSize: 11,
    color: '#8A7255',
    textAlign: 'center',
    lineHeight: 16,
  },

  emptyWrap: {
    paddingVertical: 26,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#8A7255',
  },
});