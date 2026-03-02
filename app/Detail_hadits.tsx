import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

interface HadithData {
  number: number;
  arab: string;
  id: string;
}

interface HadithResponse {
  name: string;
  id: string;
  available: number;
  hadiths: HadithData[];
}

export default function Detail_hadits() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [data, setData] = useState<HadithResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    // Mengambil 20 hadits pertama agar loading tidak terlalu lama
    fetch(`https://muslim-api-three.vercel.app/v1/hadits/${id}?range=1-20`)
      .then(response => response.json())
      .then(result => {
        setData(result.data); // API ini biasanya membungkus response dalam object 'data'
        setLoading(false);
      })
      .catch(error => {
        console.error(error);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2f95dc" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {data && (
        <FlatList
          data={data.hadiths}
          keyExtractor={(item) => item.number.toString()}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.headerTitle}>{data.name}</Text>
              <Text style={styles.headerSubtitle}>{data.available} Hadits Tersedia</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.number}>Hadits No. {item.number}</Text>
              <Text style={styles.arabic}>{item.arab}</Text>
              <Text style={styles.translation}>{item.id}</Text>
            </View>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#2f95dc' },
  headerSubtitle: { fontSize: 14, color: '#666', marginTop: 5 },
  item: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  number: { fontSize: 14, fontWeight: 'bold', color: '#2f95dc', marginBottom: 10 },
  arabic: { fontSize: 22, fontWeight: 'bold', textAlign: 'right', marginBottom: 15, lineHeight: 35 },
  translation: { fontSize: 16, color: '#444', lineHeight: 24 },
});