import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

interface DzikirItem {
  id: number;
  title: string;
  arabic: string;
  latin: string;
  translation: string;
}

export default function Dzikir() {

  const [data, setData] = useState<DzikirItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://muslim-api-three.vercel.app/v1/dzikir')
      .then(response => response.json())
      .then(result => {
        setData(result);
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
        keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.arabic}>{item.arabic}</Text>
            <Text style={styles.latin}>{item.latin}</Text>
            <Text style={styles.translation}>"{item.translation}"</Text>
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  item: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#2f95dc', marginBottom: 10 },
  arabic: { fontSize: 24, fontWeight: 'bold', textAlign: 'right', marginBottom: 10, lineHeight: 35 },
  latin: { fontSize: 14, color: '#555', marginBottom: 5, fontStyle: 'italic' },
  translation: { fontSize: 14, color: '#333' },
});