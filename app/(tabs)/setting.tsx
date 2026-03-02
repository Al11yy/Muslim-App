import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemePreference, useThemePreference } from '@/contexts/theme-preference';

type AppSettings = {
  notifPrayer: boolean;
  notifDzikir: boolean;
  autoPlayAudio: boolean;
  keepScreenAwake: boolean;
  wifiOnlyDownload: boolean;
  arabicSize: 'normal' | 'besar';
};

const SETTINGS_KEY = '@muslim_app_settings_v1';

const DEFAULT_SETTINGS: AppSettings = {
  notifPrayer: true,
  notifDzikir: false,
  autoPlayAudio: false,
  keepScreenAwake: false,
  wifiOnlyDownload: true,
  arabicSize: 'normal',
};

export default function Setting() {
  const { preference, setPreference, resolvedTheme } = useThemePreference();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(SETTINGS_KEY);
        if (!alive || !raw) return;
        const parsed = JSON.parse(raw) as Partial<AppSettings>;
        setSettings((prev) => ({ ...prev, ...parsed }));
      } catch {
        // ignore invalid local settings
      }
    };
    void load();
    return () => {
      alive = false;
    };
  }, []);

  const updateSettings = async (patch: Partial<AppSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  };

  const colors = useMemo(
    () =>
      resolvedTheme === 'dark'
        ? {
            pageBg: '#14110D',
            cardBg: '#211A13',
            cardBorder: '#3A2E22',
            textPrimary: '#F2E7D7',
            textSecondary: '#BFA88C',
            accent: '#D8A24A',
            iconMuted: '#A38D70',
            rowDivider: '#352A20',
            switchTrackOn: '#6E532C',
            switchTrackOff: '#4E4032',
            switchThumbOn: '#D8A24A',
            switchThumbOff: '#E2D3BF',
            tabBg: '#2A2118',
            tabActiveBg: '#D8A24A',
            tabText: '#DCC8B0',
          }
        : {
            pageBg: '#F7F1E8',
            cardBg: '#FFFDF5',
            cardBorder: '#EADBC0',
            textPrimary: '#1C1408',
            textSecondary: '#7E6446',
            accent: '#C68B2F',
            iconMuted: '#C6B29A',
            rowDivider: '#EFE3D0',
            switchTrackOn: '#DDBA82',
            switchTrackOff: '#DCCBB0',
            switchThumbOn: '#C68B2F',
            switchThumbOff: '#F5EFE4',
            tabBg: '#EFE3D0',
            tabActiveBg: '#C68B2F',
            tabText: '#7D664B',
          },
    [resolvedTheme]
  );

  const dynamic = getStyles(colors);

  return (
    <SafeAreaView style={dynamic.container} edges={['top']}>
      <ScrollView contentContainerStyle={dynamic.content} showsVerticalScrollIndicator={false}>
        <View style={dynamic.header}>
          <Text style={dynamic.title}>Settings</Text>
          <Text style={dynamic.subtitle}>Atur preferensi aplikasi sesuai kebutuhanmu.</Text>
        </View>

        <View style={dynamic.sectionCard}>
          <Text style={dynamic.sectionTitle}>Tema Aplikasi</Text>
          <View style={dynamic.themeTabs}>
            {([
              { id: 'system', label: 'System' },
              { id: 'light', label: 'Light' },
              { id: 'dark', label: 'Dark' },
            ] as { id: ThemePreference; label: string }[]).map((item) => (
              <Pressable
                key={item.id}
                style={[dynamic.themeTabBtn, preference === item.id && dynamic.themeTabBtnActive]}
                onPress={() => {
                  void setPreference(item.id);
                }}>
                <Text style={[dynamic.themeTabText, preference === item.id && dynamic.themeTabTextActive]}>
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={dynamic.helperText}>{`Mode aktif: ${resolvedTheme === 'dark' ? 'Dark' : 'Light'}`}</Text>
        </View>

        <View style={dynamic.sectionCard}>
          <Text style={dynamic.sectionTitle}>Notifikasi</Text>

          <View style={dynamic.row}>
            <View style={dynamic.rowLeft}>
              <MaterialCommunityIcons name="bell-ring-outline" size={18} color={colors.accent} />
              <Text style={dynamic.rowLabel}>Pengingat Waktu Sholat</Text>
            </View>
            <Switch
              value={settings.notifPrayer}
              onValueChange={(value) => {
                void updateSettings({ notifPrayer: value });
              }}
              trackColor={{ false: colors.switchTrackOff, true: colors.switchTrackOn }}
              thumbColor={settings.notifPrayer ? colors.switchThumbOn : colors.switchThumbOff}
            />
          </View>

          <View style={dynamic.rowDivider} />

          <View style={dynamic.row}>
            <View style={dynamic.rowLeft}>
              <MaterialCommunityIcons name="calendar-heart" size={18} color={colors.accent} />
              <Text style={dynamic.rowLabel}>Pengingat Dzikir Harian</Text>
            </View>
            <Switch
              value={settings.notifDzikir}
              onValueChange={(value) => {
                void updateSettings({ notifDzikir: value });
              }}
              trackColor={{ false: colors.switchTrackOff, true: colors.switchTrackOn }}
              thumbColor={settings.notifDzikir ? colors.switchThumbOn : colors.switchThumbOff}
            />
          </View>
        </View>

        <View style={dynamic.sectionCard}>
          <Text style={dynamic.sectionTitle}>Quran & Audio</Text>

          <View style={dynamic.row}>
            <View style={dynamic.rowLeft}>
              <Ionicons name="play-circle-outline" size={18} color={colors.accent} />
              <Text style={dynamic.rowLabel}>Auto Play Ayat</Text>
            </View>
            <Switch
              value={settings.autoPlayAudio}
              onValueChange={(value) => {
                void updateSettings({ autoPlayAudio: value });
              }}
              trackColor={{ false: colors.switchTrackOff, true: colors.switchTrackOn }}
              thumbColor={settings.autoPlayAudio ? colors.switchThumbOn : colors.switchThumbOff}
            />
          </View>

          <View style={dynamic.rowDivider} />

          <View style={dynamic.row}>
            <View style={dynamic.rowLeft}>
              <Ionicons name="eye-outline" size={18} color={colors.accent} />
              <Text style={dynamic.rowLabel}>Layar Tetap Menyala saat Murotal</Text>
            </View>
            <Switch
              value={settings.keepScreenAwake}
              onValueChange={(value) => {
                void updateSettings({ keepScreenAwake: value });
              }}
              trackColor={{ false: colors.switchTrackOff, true: colors.switchTrackOn }}
              thumbColor={settings.keepScreenAwake ? colors.switchThumbOn : colors.switchThumbOff}
            />
          </View>

          <View style={dynamic.rowDivider} />

          <View style={dynamic.row}>
            <View style={dynamic.rowLeft}>
              <Ionicons name="download-outline" size={18} color={colors.accent} />
              <Text style={dynamic.rowLabel}>Download hanya via Wi-Fi</Text>
            </View>
            <Switch
              value={settings.wifiOnlyDownload}
              onValueChange={(value) => {
                void updateSettings({ wifiOnlyDownload: value });
              }}
              trackColor={{ false: colors.switchTrackOff, true: colors.switchTrackOn }}
              thumbColor={settings.wifiOnlyDownload ? colors.switchThumbOn : colors.switchThumbOff}
            />
          </View>
        </View>

        <View style={dynamic.sectionCard}>
          <Text style={dynamic.sectionTitle}>Tampilan Bacaan</Text>
          <View style={dynamic.themeTabs}>
            {([
              { id: 'normal', label: 'Arab Normal' },
              { id: 'besar', label: 'Arab Besar' },
            ] as const).map((item) => (
              <Pressable
                key={item.id}
                style={[dynamic.themeTabBtn, settings.arabicSize === item.id && dynamic.themeTabBtnActive]}
                onPress={() => {
                  void updateSettings({ arabicSize: item.id });
                }}>
                <Text
                  style={[
                    dynamic.themeTabText,
                    settings.arabicSize === item.id && dynamic.themeTabTextActive,
                  ]}>
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={dynamic.sectionCard}>
          <Text style={dynamic.sectionTitle}>Task Selanjutnya</Text>
          <View style={dynamic.todoBox}>
            <MaterialCommunityIcons name="playlist-play" size={18} color={colors.accent} />
            <View style={dynamic.todoBody}>
              <Text style={dynamic.todoTitle}>Kontrol Murotal di Lockscreen</Text>
              <Text style={dynamic.todoDesc}>
                Rencana upgrade ke player background service (next/prev/stop dari lockscreen & notifikasi).
              </Text>
            </View>
          </View>
        </View>

        <View style={dynamic.sectionCard}>
          <Text style={dynamic.sectionTitle}>Lainnya</Text>

          <Pressable style={dynamic.linkRow}>
            <View style={dynamic.rowLeft}>
              <Ionicons name="document-text-outline" size={18} color={colors.accent} />
              <Text style={dynamic.rowLabel}>Kebijakan Privasi</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.iconMuted} />
          </Pressable>

          <View style={dynamic.rowDivider} />

          <Pressable style={dynamic.linkRow}>
            <View style={dynamic.rowLeft}>
              <Ionicons name="information-circle-outline" size={18} color={colors.accent} />
              <Text style={dynamic.rowLabel}>Tentang Aplikasi</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.iconMuted} />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getStyles(colors: {
  pageBg: string;
  cardBg: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  iconMuted: string;
  rowDivider: string;
  switchTrackOn: string;
  switchTrackOff: string;
  switchThumbOn: string;
  switchThumbOff: string;
  tabBg: string;
  tabActiveBg: string;
  tabText: string;
}) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.pageBg,
    },
    content: {
      paddingHorizontal: 16,
      paddingBottom: 28,
      gap: 12,
    },
    header: {
      paddingTop: 8,
      paddingBottom: 6,
    },
    title: {
      fontSize: 30,
      fontWeight: '800',
      color: colors.textPrimary,
      fontFamily: 'serif',
    },
    subtitle: {
      marginTop: 4,
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    sectionCard: {
      backgroundColor: colors.cardBg,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      borderRadius: 16,
      padding: 14,
    },
    sectionTitle: {
      fontSize: 14,
      color: colors.accent,
      fontWeight: '800',
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.3,
    },
    row: {
      minHeight: 44,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    linkRow: {
      minHeight: 44,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    rowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flex: 1,
    },
    rowLabel: {
      fontSize: 14,
      color: colors.textPrimary,
      fontWeight: '600',
      flex: 1,
    },
    rowDivider: {
      height: 1,
      backgroundColor: colors.rowDivider,
      marginVertical: 4,
    },
    themeTabs: {
      flexDirection: 'row',
      backgroundColor: colors.tabBg,
      borderRadius: 14,
      padding: 4,
      gap: 4,
    },
    themeTabBtn: {
      flex: 1,
      height: 34,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
    },
    themeTabBtnActive: {
      backgroundColor: colors.tabActiveBg,
    },
    themeTabText: {
      fontSize: 12,
      color: colors.tabText,
      fontWeight: '700',
    },
    themeTabTextActive: {
      color: '#FFFFFF',
    },
    helperText: {
      marginTop: 8,
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    todoBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
      backgroundColor: colors.tabBg,
      borderRadius: 12,
      padding: 10,
    },
    todoBody: {
      flex: 1,
      minWidth: 0,
    },
    todoTitle: {
      fontSize: 13,
      color: colors.textPrimary,
      fontWeight: '700',
      marginBottom: 3,
    },
    todoDesc: {
      fontSize: 12,
      color: colors.textSecondary,
      lineHeight: 18,
    },
  });
}
