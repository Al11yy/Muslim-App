import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

interface DoaDetail {
  id: number;
  judul: string;
  latin: string;
  arab: string;
  terjemah: string;
}

export default function Detail_doa() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [data, setData] = useState<DoaDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    fetch(`https://open-api.my.id/api/doa/${id}`)
      .then(response => response.json())
      .then(result => {
        setData(result)
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

  if (!data) {
    return (
      <View style={styles.center}>
        <Text>Data tidak ditemukan</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{data.judul}</Text>
        <Text style={styles.arabic}>{data.arab}</Text>
        <Text style={styles.latin}>{data.latin}</Text>
        <Text style={styles.translation}>"{data.terjemah}"</Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#2f95dc', textAlign: 'center', marginBottom: 20 },
  arabic: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 15, lineHeight: 40 },
  latin: { fontSize: 16, color: '#555', textAlign: 'center', marginBottom: 10, fontStyle: 'italic' },
  translation: { fontSize: 16, color: '#333', textAlign: 'center', marginTop: 10 },
});