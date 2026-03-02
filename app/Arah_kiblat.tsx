import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

const QIBLA_URL = 'https://qiblafinder.withgoogle.com/';

export default function ArahKiblat() {
  const router = useRouter();
  const webRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={20} color="#2A1F12" />
        </Pressable>

        <Text style={styles.topTitle}>Arah Kiblat</Text>

        <Pressable
          onPress={() => {
            setFailed(false);
            setLoading(true);
            webRef.current?.reload();
          }}
          hitSlop={10}
          style={styles.iconBtn}>
          <Ionicons name="refresh-outline" size={18} color="#2A1F12" />
        </Pressable>
      </View>

      <View style={styles.webWrap}>
        <WebView
          ref={webRef}
          source={{ uri: QIBLA_URL }}
          style={styles.webview}
          javaScriptEnabled
          domStorageEnabled
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          geolocationEnabled
          onLoadStart={() => {
            setLoading(true);
            setFailed(false);
          }}
          onLoadEnd={() => {
            setLoading(false);
          }}
          onError={() => {
            setLoading(false);
            setFailed(true);
          }}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#C68B2F" />
              <Text style={styles.loadingText}>Memuat Qibla Finder...</Text>
            </View>
          )}
        />

        {loading ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#C68B2F" />
            <Text style={styles.loadingText}>Memuat Qibla Finder...</Text>
          </View>
        ) : null}

        {failed ? (
          <View style={styles.errorOverlay}>
            <Ionicons name="warning-outline" size={28} color="#8A5B28" />
            <Text style={styles.errorTitle}>Gagal memuat halaman kiblat</Text>
            <Text style={styles.errorDesc}>Pastikan koneksi internet aktif, lalu coba muat ulang.</Text>
            <Pressable
              style={styles.retryBtn}
              onPress={() => {
                setFailed(false);
                setLoading(true);
                webRef.current?.reload();
              }}>
              <Text style={styles.retryText}>Muat Ulang</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F1E8',
  },
  topBar: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: '#F7F1E8',
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF9ED',
    borderWidth: 1,
    borderColor: '#EADBC0',
  },
  topTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.4,
    color: '#2A1F12',
    fontFamily: 'serif',
  },
  webWrap: {
    flex: 1,
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E7D6B9',
    backgroundColor: '#FFFDF5',
  },
  webview: {
    flex: 1,
    backgroundColor: '#FFFDF5',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,253,245,0.95)',
    gap: 8,
  },
  loadingText: {
    color: '#7A6246',
    fontSize: 13,
    fontWeight: '600',
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255,249,237,0.98)',
  },
  errorTitle: {
    marginTop: 8,
    color: '#5A3E1E',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorDesc: {
    marginTop: 6,
    color: '#8A7255',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 12,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#C68B2F',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  retryText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
