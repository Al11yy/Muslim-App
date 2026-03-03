import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Camera } from 'expo-camera'; // Kita pakai ini sekarang!
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useThemePreference } from '@/contexts/theme-preference';

const QIBLA_URL = 'https://qiblafinder.withgoogle.com/';

// User agent dibikin mirip Chrome mobile biar Google nge-load versi AR
const MOBILE_USER_AGENT = Platform.select({
  android:
    'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',
  ios:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
});

// Script untuk ngebypass konfirmasi izin tambahan di dalam browser
const BOOTSTRAP_PERMISSION_SCRIPT = `
(() => {
  try {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {},
        () => {},
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
      );
    }
  } catch (error) {}

  try {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false })
        .then((stream) => {
          stream.getTracks().forEach((track) => track.stop());
        })
        .catch((error) => {
          window.ReactNativeWebView?.postMessage(
            'media_error:' + (error?.message ?? 'unknown')
          );
        });
    }
  } catch (error) {}
})();
true;
`;

type PermissionState = 'checking' | 'granted' | 'denied';

// ─── LOGIKA REQUEST IZIN EXPO WAY ───
async function requestWebViewPermissions(): Promise<{ granted: boolean; message?: string }> {
  // 1. Minta Izin Lokasi
  const locationPermission = await Location.requestForegroundPermissionsAsync();
  if (locationPermission.status !== 'granted') {
    return {
      granted: false,
      message: 'Izin lokasi wajib diaktifkan agar arah kiblat akurat.',
    };
  }

  // 2. Minta Izin Kamera pakai Expo Camera
  const cameraPermission = await Camera.requestCameraPermissionsAsync();
  if (cameraPermission.status !== 'granted') {
    return {
      granted: false,
      message: !cameraPermission.canAskAgain
        ? 'Izin kamera diblokir permanen. Aktifkan lagi lewat Pengaturan aplikasi.'
        : 'Izin kamera wajib diberikan untuk fitur AR Kiblat.',
    };
  }

  return { granted: true };
}

// ─── KOMPONEN UTAMA ───
export default function ArahKiblat() {
  const router = useRouter();
  const { resolvedTheme } = useThemePreference();
  const isDark = resolvedTheme === 'dark';
  const webRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [permissionState, setPermissionState] = useState<PermissionState>('checking');
  const [permissionMessage, setPermissionMessage] = useState('');
  const [webHint, setWebHint] = useState('');

  const theme = useMemo(
    () => ({
      bg: isDark ? '#1A130B' : '#F7F1E8',
      text: isDark ? '#F6ECDD' : '#2A1F12',
      muted: isDark ? '#CAB79C' : '#8A7255',
      surface: isDark ? '#2A1F12' : '#FFFDF5',
      softSurface: isDark ? '#332516' : '#FFF9ED',
      border: isDark ? '#4A3825' : '#E7D6B9',
      gold: '#C68B2F',
      overlay: isDark ? 'rgba(25, 18, 10, 0.95)' : 'rgba(255,253,245,0.95)',
      overlayError: isDark ? 'rgba(25, 18, 10, 0.98)' : 'rgba(255,249,237,0.98)',
      webBg: isDark ? '#24190F' : '#FFFDF5',
      secondaryText: isDark ? '#D8C4A6' : '#8A5B28',
      hintText: isDark ? '#DDBB84' : '#7B5A2B',
      hintBg: isDark ? '#2C2013' : '#FFF9ED',
    }),
    [isDark]
  );

  const ensurePermissions = useCallback(async () => {
    setPermissionState('checking');
    setPermissionMessage('');
    setFailed(false);
    setLoading(true);

    try {
      const result = await requestWebViewPermissions();
      if (!result.granted) {
        setPermissionState('denied');
        setPermissionMessage(result.message ?? 'Izin belum aktif.');
        setLoading(false);
        return;
      }

      setPermissionState('granted');
      setWebHint('');
    } catch {
      setPermissionState('denied');
      setPermissionMessage('Gagal meminta izin kamera/lokasi.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void ensurePermissions();
  }, [ensurePermissions]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top']}>
      <View style={[styles.topBar, { backgroundColor: theme.bg }]}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={[styles.iconBtn, { backgroundColor: theme.softSurface, borderColor: theme.border }]}>
          <Ionicons name="chevron-back" size={20} color={theme.text} />
        </Pressable>

        <Text style={[styles.topTitle, { color: theme.text }]}>Arah Kiblat</Text>

        <Pressable
          onPress={() => {
            if (permissionState !== 'granted') {
              void ensurePermissions();
              return;
            }
            setWebHint('');
            setFailed(false);
            setLoading(true);
            webRef.current?.reload();
          }}
          hitSlop={10}
          style={[styles.iconBtn, { backgroundColor: theme.softSurface, borderColor: theme.border }]}>
          <Ionicons name="refresh-outline" size={18} color={theme.text} />
        </Pressable>
      </View>

      <View style={[styles.webWrap, { borderColor: theme.border, backgroundColor: theme.surface }]}>
        {permissionState === 'granted' ? (
          <WebView
            ref={webRef}
            source={{ uri: QIBLA_URL }}
            style={[styles.webview, { backgroundColor: theme.webBg }]}
            originWhitelist={['*']}
            userAgent={MOBILE_USER_AGENT}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            geolocationEnabled={true}
            allowsInlineMediaPlayback={true}
            allowsFullscreenVideo={true}
            mediaPlaybackRequiresUserAction={false}
            // INI PENTING BANGET BUAT ANDROID!
            mediaCapturePermissionGrantType="grant" 
            mixedContentMode="always"
            injectedJavaScriptBeforeContentLoaded={BOOTSTRAP_PERMISSION_SCRIPT}
            onMessage={(event) => {
              const message = event.nativeEvent.data ?? '';
              if (message.startsWith('media_error:')) {
                setWebHint('Kamera ditolak oleh sistem WebView. Pastikan izin kamera aktif.');
              }
            }}
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
              <View style={[styles.loadingOverlay, { backgroundColor: theme.overlay }]}>
                <ActivityIndicator size="large" color={theme.gold} />
                <Text style={[styles.loadingText, { color: theme.muted }]}>Memuat Qibla Finder...</Text>
              </View>
            )}
          />
        ) : null}

        {loading ? (
          <View style={[styles.loadingOverlay, { backgroundColor: theme.overlay }]}>
            <ActivityIndicator size="large" color={theme.gold} />
            <Text style={[styles.loadingText, { color: theme.muted }]}>
              {permissionState === 'checking' ? 'Memeriksa izin kamera & lokasi...' : 'Memuat Qibla Finder...'}
            </Text>
          </View>
        ) : null}

        {permissionState === 'denied' ? (
          <View style={[styles.errorOverlay, { backgroundColor: theme.overlayError }]}>
            <Ionicons name="lock-closed-outline" size={28} color={theme.secondaryText} />
            <Text style={[styles.errorTitle, { color: theme.text }]}>Izin Belum Aktif</Text>
            <Text style={[styles.errorDesc, { color: theme.muted }]}>{permissionMessage}</Text>
            <View style={styles.rowAction}>
              <Pressable style={[styles.retryBtn, { backgroundColor: theme.gold }]} onPress={() => void ensurePermissions()}>
                <Text style={styles.retryText}>Minta Izin</Text>
              </Pressable>
              <Pressable
                style={[styles.retryBtn, styles.secondaryBtn, { backgroundColor: theme.softSurface, borderColor: theme.border }]}
                onPress={() => void Linking.openSettings()}>
                <Text style={[styles.retryText, styles.secondaryText, { color: theme.secondaryText }]}>Pengaturan</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {webHint ? (
          <View style={[styles.hintBox, { borderColor: theme.border, backgroundColor: theme.hintBg }]}>
            <Ionicons name="information-circle-outline" size={16} color={theme.hintText} />
            <Text style={[styles.hintText, { color: theme.hintText }]}>{webHint}</Text>
          </View>
        ) : null}

        {failed ? (
          <View style={[styles.errorOverlay, { backgroundColor: theme.overlayError }]}>
            <Ionicons name="warning-outline" size={28} color={theme.secondaryText} />
            <Text style={[styles.errorTitle, { color: theme.text }]}>Koneksi Terputus</Text>
            <Text style={[styles.errorDesc, { color: theme.muted }]}>Gagal memuat halaman, pastikan internet aktif.</Text>
            <Pressable
              style={[styles.retryBtn, { backgroundColor: theme.gold }]}
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

// STYLES TETAP SAMA KAYA PUNYA LU KARENA UDAH CAKEP BANGET
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
  rowAction: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
  },
  secondaryBtn: {
    backgroundColor: '#FFF6E6',
    borderWidth: 1,
    borderColor: '#E7D6B9',
  },
  secondaryText: {
    color: '#8A5B28',
  },
  hintBox: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E7D6B9',
    backgroundColor: '#FFF9ED',
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hintText: {
    flex: 1,
    color: '#7B5A2B',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },
});
