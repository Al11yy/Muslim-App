import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

interface AsmaulHusnaItem {
  urutan: number;
  latin: string;
  arab: string;
  arti: string;
}

const Asmaul_husna = () => {

  const [data, setData] = useState<AsmaulHusnaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://asmaul-husna-api.vercel.app/api/all')
      .then(response => response.json())
      .then(result => {
        setData(result.data)
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
        keyExtractor={(item) => item.urutan.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.numberContainer}>
              <Text style={styles.number}>{item.urutan}</Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.latin}>{item.latin}</Text>
              <Text style={styles.meaning}>{item.arti}</Text>
            </View>
            <Text style={styles.arabic}>{item.arab}</Text>
          </View>
        )}
      />
    </View>
  )
}

export default Asmaul_husna

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  item: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', alignItems: 'center' },
  numberContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e6f7ff', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  number: { fontSize: 16, fontWeight: 'bold', color: '#2f95dc' },
  textContainer: { flex: 1 },
  latin: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  meaning: { fontSize: 14, color: '#666', marginTop: 2 },
  arabic: { fontSize: 24, fontWeight: 'bold', color: '#000' },
});