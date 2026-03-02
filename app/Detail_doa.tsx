import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type DoaDetail = {
  id: number;
  judul: string;
  latin: string;
  arab: string;
  terjemah: string;
};

const PRIMARY_GOLD = '#C68B2F';
const BG_MAIN = '#F7F1E8';

export default function DetailDoa() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [data, setData] = useState<DoaDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    fetch(`https://open-api.my.id/api/doa/${id}`)
      .then((response) => response.json())
      .then((result) => {
        setData(result ?? null);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={PRIMARY_GOLD} />
        <Text style={styles.loadingText}>Memuat Doa...</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#1A1209" />
          </Pressable>
          <Text style={styles.topTitle}>Detail Doa</Text>
          <View style={styles.topSpacer} />
        </View>

        <View style={styles.emptyWrap}>
          <Ionicons name="document-text-outline" size={48} color="#D1C4B2" />
          <Text style={styles.emptyText}>Data doa tidak ditemukan.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={BG_MAIN} />

      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#1A1209" />
        </Pressable>
        <Text style={styles.topTitle}>Detail Doa</Text>
        <View style={styles.topSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ImageBackground
          source={require('../assets/images/bg_header.png')}
          style={styles.hero}
          imageStyle={styles.heroBg}
          resizeMode="cover"
        >
          <View style={styles.heroBadge}>
            <MaterialCommunityIcons name="hands-pray" size={14} color={PRIMARY_GOLD} />
            <Text style={styles.heroLabel}>{`Doa #${String(data.id).padStart(2, '0')}`}</Text>
          </View>
          <Text style={styles.title}>{data.judul}</Text>
        </ImageBackground>

        <View style={styles.arabicContainer}>
          <Text style={styles.arabicText}>{data.arab}</Text>
        </View>

        <View style={styles.latinContainer}>
          <Text style={styles.sectionTitle}>Bacaan Latin:</Text>
          <Text style={styles.latinText}>{data.latin}</Text>
        </View>

        <View style={styles.translationContainer}>
          <Text style={styles.sectionTitle}>Artinya:</Text>
          <Text style={styles.translationText}>{data.terjemah}</Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_MAIN,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BG_MAIN,
  },
  loadingText: {
    marginTop: 12,
    color: '#8A7255',
    fontWeight: '600',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  topSpacer: {
    width: 40,
    height: 40,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF9ED',
    borderWidth: 1,
    borderColor: '#EADBC0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    fontSize: 18,
    color: '#1A1209',
    fontWeight: '800',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 26,
    paddingTop: 8,
  },
  hero: {
    backgroundColor: '#D99A3E',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginBottom: 24,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: PRIMARY_GOLD,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  heroBg: {
    opacity: 0.15,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDF5',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
    gap: 6,
  },
  heroLabel: {
    fontSize: 12,
    color: PRIMARY_GOLD,
    fontWeight: '800',
  },
  title: {
    fontSize: 24,
    lineHeight: 34,
    color: '#FFFFFF',
    fontWeight: '800',
    fontFamily: 'serif',
  },
  arabicContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 32,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EADBC0',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  arabicText: {
    fontSize: 34,
    lineHeight: 56,
    textAlign: 'center',
    color: '#1C1408',
    fontFamily: 'serif',
  },
  latinContainer: {
    paddingHorizontal: 8,
    marginBottom: 20,
  },
  latinText: {
    fontSize: 16,
    lineHeight: 26,
    color: '#7E6446',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  translationContainer: {
    backgroundColor: '#FFF9ED',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderLeftWidth: 4,
    borderLeftColor: PRIMARY_GOLD,
  },
  sectionTitle: {
    fontSize: 13,
    color: PRIMARY_GOLD,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
    textAlign: 'center',
  },
  translationText: {
    fontSize: 16,
    lineHeight: 26,
    color: '#3D2108',
    textAlign: 'center',
    fontWeight: '500',
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: '#8A7255',
    textAlign: 'center',
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 40,
  },
});
