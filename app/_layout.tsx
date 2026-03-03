import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { ThemePreferenceProvider, useThemePreference } from '@/contexts/theme-preference';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <ThemePreferenceProvider>
      <RootNavigator />
    </ThemePreferenceProvider>
  );
}

function RootNavigator() {
  const { resolvedTheme } = useThemePreference();

  return (
    <ThemeProvider value={resolvedTheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="Detail_surat" options={{ headerShown: false }} />
        <Stack.Screen name="Doa_harian" options={{ headerShown: false }} />
        <Stack.Screen name="Arah_kiblat" options={{ headerShown: false }} />
        <Stack.Screen name="Asmaul_husna" options={{ headerShown: false }} />
        <Stack.Screen name="Hadits" options={{ headerShown: false }} />
        <Stack.Screen name="Dzikir" options={{ headerShown: false }} />
        <Stack.Screen name="bookmark_Quran" options={{ headerShown: false }} />
        <Stack.Screen name="Detail_doa" options={{ headerShown: false }} />
        <Stack.Screen name="Detail_hadits" options={{ headerShown: false}} />
        <Stack.Screen name="More" options={{ headerShown: false }} />
        <Stack.Screen name="calender_islami" options={{ headerShown: false }} />
        <Stack.Screen name="Donasi" options={{ headerShown: false }} />
        <Stack.Screen name="calculator_zakat" options={{ headerShown: false }} />
        <Stack.Screen name="tasbih_digital" options={{ headerShown: false }} />
        <Stack.Screen name="checklist_ibadah" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
