import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

interface Doa {
  id: number;
  judul: string;
  latin: string;
  arab: string;
  terjemah: string;
}

export default function Doa_harian() {

  const [data, setData] = useState<Doa[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://open-api.my.id/api/doa')
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
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Link href={{ pathname: '/Detail_doa', params: { id: item.id } }} asChild>
            <Pressable>
              <View style={styles.item}>
                <Text style={styles.number}>{item.id}.</Text>
                <Text style={styles.title}>{item.judul}</Text>
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
  item: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', alignItems: 'center' },
  number: { fontSize: 16, fontWeight: 'bold', color: '#2f95dc', marginRight: 10, width: 30 },
  title: { fontSize: 16, fontWeight: '500', color: '#333', flex: 1 },
});