import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

interface HadithBook {
  name: string;
  id: string;
  available: number;
}

export default function Hadits() {

  const [data, setData] = useState<HadithBook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://muslim-api-three.vercel.app/v1/hadits')
      .then(response => response.json())
      .then(result => {
        setData(result)
        setLoading(false);
      })
      .catch(error => {
        console.error(error);
        setLoading(false);
      });
  }, []); 

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2f95dc" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Link href={{ pathname: '/Detail_hadits', params: { id: item.id } }} asChild>
            <Pressable>
              <View style={styles.item}>
                <Text style={styles.title}>{item.name}</Text>
                <Text style={styles.subtitle}>Jumlah Hadits: {item.available}</Text>
              </View>
            </Pressable>
          </Link>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  item: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
});