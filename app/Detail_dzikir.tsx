import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function DetailDzikir() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Detail Dzikir</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F1E8',
  },
  text: {
    fontSize: 16,
    color: '#3D2108',
    fontWeight: '700',
  },
});
