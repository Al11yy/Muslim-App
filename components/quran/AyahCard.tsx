import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface Ayat {
  id: number;
  surah: number;
  nomor: number;
  ar: string;
  tr: string;
  idn: string;
}

type AyahCardTheme = {
  border: string;
  text: string;
  muted: string;
  gold: string;
  surface: string;
  softSurface: string;
  activeBg: string;
  activeBorder: string;
};

type AyahCardProps = {
  ayah: Ayat;
  surahNomor: number;
  theme: AyahCardTheme;
  isCurrent: boolean;
  isBookmarked: boolean;
  isPlaying: boolean;
  arabicFontSize: number;
  translationFontSize: number;
  showTranslation: boolean;
  onPlayToggle: (ayah: Ayat) => void;
  onBookmarkToggle: (ayah: Ayat) => void;
  onShare: (ayah: Ayat) => void;
  onMoreActions: (ayah: Ayat) => void;
};

export function AyahCard({
  ayah,
  surahNomor,
  theme,
  isCurrent,
  isBookmarked,
  isPlaying,
  arabicFontSize,
  translationFontSize,
  showTranslation,
  onPlayToggle,
  onBookmarkToggle,
  onShare,
  onMoreActions,
}: AyahCardProps) {
  return (
    <View
      style={[
        styles.ayahItem,
        { borderBottomColor: theme.border },
        isCurrent && styles.ayahItemActive,
        isCurrent && { backgroundColor: theme.activeBg, borderColor: theme.activeBorder, borderBottomColor: theme.activeBorder },
      ]}>
      <View style={styles.rowTop}>
        <Text style={[styles.ayahRef, { color: theme.muted }, isCurrent && styles.ayahRefActive, isCurrent && { color: theme.gold }]}>
          {surahNomor}:{ayah.nomor}
        </Text>
        <Pressable onPress={() => onMoreActions(ayah)} hitSlop={8}>
          <Ionicons name="ellipsis-horizontal" size={18} color={theme.muted} />
        </Pressable>
      </View>

      <Text
        style={[
          styles.ayahArabic,
          { color: theme.text, fontSize: arabicFontSize, lineHeight: Math.round(arabicFontSize * 1.62) },
          isCurrent && styles.ayahArabicActive,
          isCurrent && { color: theme.gold },
        ]}>
        {ayah.ar}
      </Text>
      {showTranslation ? (
        <Text
          style={[
            styles.ayahTranslation,
            { color: theme.text, fontSize: translationFontSize, lineHeight: Math.round(translationFontSize * 1.55) },
            isCurrent && styles.ayahTranslationActive,
            isCurrent && { color: theme.muted },
          ]}>
          {ayah.idn}
        </Text>
      ) : null}

      <View style={styles.actionRow}>
        <Pressable
          style={[
            styles.actionBtn,
            { backgroundColor: theme.surface, borderColor: theme.border },
            isCurrent && styles.actionBtnActive,
            isCurrent && { backgroundColor: theme.softSurface, borderColor: theme.activeBorder },
          ]}
          onPress={() => onPlayToggle(ayah)}>
          <Ionicons
            name={isCurrent && isPlaying ? 'pause-circle-outline' : 'play-circle-outline'}
            size={19}
            color={theme.muted}
          />
        </Pressable>

        <Pressable
          style={[
            styles.actionBtn,
            { backgroundColor: theme.surface, borderColor: theme.border },
            isCurrent && styles.actionBtnActive,
            isCurrent && { backgroundColor: theme.softSurface, borderColor: theme.activeBorder },
          ]}
          onPress={() => onBookmarkToggle(ayah)}>
          <Ionicons
            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={18}
            color={isBookmarked ? theme.gold : theme.muted}
          />
        </Pressable>

        <Pressable
          style={[
            styles.actionBtn,
            { backgroundColor: theme.surface, borderColor: theme.border },
            isCurrent && styles.actionBtnActive,
            isCurrent && { backgroundColor: theme.softSurface, borderColor: theme.activeBorder },
          ]}
          onPress={() => onShare(ayah)}>
          <MaterialCommunityIcons name="share-variant-outline" size={18} color={theme.muted} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ayahItem: {
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EFE4D3',
  },
  ayahItemActive: {
    backgroundColor: '#FFF4DE',
    borderRadius: 12,
    borderBottomColor: '#E3CDAA',
    borderWidth: 1,
    borderColor: '#F0DFC4',
    paddingHorizontal: 10,
    marginVertical: 4,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ayahRef: {
    fontSize: 12,
    color: '#8B7860',
    fontWeight: '600',
  },
  ayahRefActive: {
    color: '#9B6229',
  },
  ayahArabic: {
    marginTop: 12,
    fontSize: 32,
    lineHeight: 52,
    color: '#2A2014',
    textAlign: 'right',
  },
  ayahArabicActive: {
    color: '#7B4A17',
  },
  ayahTranslation: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 23,
    color: '#3D3125',
  },
  ayahTranslationActive: {
    color: '#51361A',
    fontWeight: '500',
  },
  actionRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7EFDF',
    borderWidth: 1,
    borderColor: '#EEDFC8',
  },
  actionBtnActive: {
    backgroundColor: '#F9E8CA',
    borderColor: '#E7CCA3',
  },
});
