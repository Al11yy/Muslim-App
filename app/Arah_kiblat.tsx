import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Arah_kiblat() {

  const openQiblaFinder = () => {
    // Membuka layanan Qibla Finder dari Google di browser
    Linking.openURL('https://qiblafinder.withgoogle.com/');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Arah Kiblat</Text>
      <Text style={styles.description}>
        Gunakan layanan Google Qibla Finder untuk menemukan arah kiblat menggunakan kamera dan lokasi Anda.
      </Text>
      
      <TouchableOpacity style={styles.button} onPress={openQiblaFinder}>
        <Text style={styles.buttonText}>Buka Qibla Finder</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2f95dc',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#555',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#2f95dc',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});