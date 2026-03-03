import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

type LoopMode = 'off' | 'ayah' | 'surah';

type SettingsModalTheme = {
  text: string;
  muted: string;
  gold: string;
  goldSoft: string;
  surface: string;
  softSurface: string;
  border: string;
  overlay: string;
};

type SettingsModalProps = {
  visible: boolean;
  theme: SettingsModalTheme;
  // Reciter
  selectedReciterName: string | null;
  onOpenReciterModal: () => void;
  // Loop
  loopMode: LoopMode;
  onSetLoopMode: (mode: LoopMode) => void;
  // Display
  showTranslation: boolean;
  onToggleTranslation: () => void;
  autoScrollPlaying: boolean;
  onToggleAutoScroll: () => void;
  enableSwipeHaptics: boolean;
  onToggleSwipeHaptics: () => void;
  // Font
  arabicFontSize: number;
  onSetArabicFontSize: (size: number) => void;
  translationFontSize: number;
  onSetTranslationFontSize: (size: number) => void;
  // Actions
  onReset: () => void;
  onClose: () => void;
};

function clampFont(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

export function SettingsModal({
  visible,
  theme,
  selectedReciterName,
  onOpenReciterModal,
  loopMode,
  onSetLoopMode,
  showTranslation,
  onToggleTranslation,
  autoScrollPlaying,
  onToggleAutoScroll,
  enableSwipeHaptics,
  onToggleSwipeHaptics,
  arabicFontSize,
  onSetArabicFontSize,
  translationFontSize,
  onSetTranslationFontSize,
  onReset,
  onClose,
}: SettingsModalProps) {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.modalCard, styles.settingsModalCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.settingsHeaderRow}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Pengaturan Detail Quran</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={18} color={theme.muted} />
            </Pressable>
          </View>
          <View style={[styles.modalDivider, { backgroundColor: theme.border }]} />

          <ScrollView style={styles.settingsScroll} showsVerticalScrollIndicator={false}>
            {/* ── Reciter ── */}
            <Text style={[styles.settingsSectionTitle, { color: theme.muted }]}>Pembaca</Text>
            <Pressable
              style={[styles.settingsRow, { backgroundColor: theme.softSurface, borderColor: theme.border }]}
              onPress={() => {
                onClose();
                onOpenReciterModal();
              }}>
              <View style={styles.settingsTextWrap}>
                <Text style={[styles.settingsLabel, { color: theme.text }]}>Pilih reciter sebelum memutar</Text>
                <Text style={[styles.settingsValue, { color: theme.muted }]} numberOfLines={1}>
                  {selectedReciterName ?? 'Belum dipilih'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.gold} />
            </Pressable>

            {/* ── Loop ── */}
            <Text style={[styles.settingsSectionTitle, { color: theme.muted }]}>Loop</Text>
            <View style={styles.loopModeRow}>
              {(['off', 'ayah', 'surah'] as LoopMode[]).map((mode) => {
                const active = loopMode === mode;
                const label = mode === 'off' ? 'Off' : mode === 'ayah' ? 'Ayat' : 'Surat';
                return (
                  <Pressable
                    key={mode}
                    style={[
                      styles.loopModeChip,
                      {
                        borderColor: active ? theme.gold : theme.border,
                        backgroundColor: active ? theme.goldSoft : theme.softSurface,
                      },
                    ]}
                    onPress={() => onSetLoopMode(mode)}>
                    <Text style={[styles.loopModeChipText, { color: active ? '#FFF9EE' : theme.text }]}>{label}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* ── Display ── */}
            <Text style={[styles.settingsSectionTitle, { color: theme.muted }]}>Tampilan</Text>
            <Pressable
              style={[styles.settingsRow, { backgroundColor: theme.softSurface, borderColor: theme.border }]}
              onPress={onToggleTranslation}>
              <Text style={[styles.settingsLabel, { color: theme.text }]}>Tampilkan terjemahan ayat</Text>
              <Ionicons
                name={showTranslation ? 'checkmark-circle' : 'ellipse-outline'}
                size={18}
                color={showTranslation ? theme.gold : theme.muted}
              />
            </Pressable>

            <Pressable
              style={[styles.settingsRow, { backgroundColor: theme.softSurface, borderColor: theme.border }]}
              onPress={onToggleAutoScroll}>
              <Text style={[styles.settingsLabel, { color: theme.text }]}>Auto-scroll ke ayat yang diputar</Text>
              <Ionicons
                name={autoScrollPlaying ? 'checkmark-circle' : 'ellipse-outline'}
                size={18}
                color={autoScrollPlaying ? theme.gold : theme.muted}
              />
            </Pressable>

            <Pressable
              style={[styles.settingsRow, { backgroundColor: theme.softSurface, borderColor: theme.border }]}
              onPress={onToggleSwipeHaptics}>
              <Text style={[styles.settingsLabel, { color: theme.text }]}>Getar saat swipe pindah surat</Text>
              <Ionicons
                name={enableSwipeHaptics ? 'checkmark-circle' : 'ellipse-outline'}
                size={18}
                color={enableSwipeHaptics ? theme.gold : theme.muted}
              />
            </Pressable>

            {/* ── Arabic Font ── */}
            <View style={[styles.fontRow, { backgroundColor: theme.softSurface, borderColor: theme.border }]}>
              <Text style={[styles.settingsLabel, { color: theme.text }]}>Ukuran teks Arab</Text>
              <View style={styles.fontControlWrap}>
                <Pressable
                  style={[styles.fontBtn, { borderColor: theme.border }]}
                  onPress={() => onSetArabicFontSize(clampFont(arabicFontSize - 2, 26, 48))}>
                  <Ionicons name="remove" size={16} color={theme.gold} />
                </Pressable>
                <Text style={[styles.fontValue, { color: theme.muted }]}>{arabicFontSize}</Text>
                <Pressable
                  style={[styles.fontBtn, { borderColor: theme.border }]}
                  onPress={() => onSetArabicFontSize(clampFont(arabicFontSize + 2, 26, 48))}>
                  <Ionicons name="add" size={16} color={theme.gold} />
                </Pressable>
              </View>
            </View>

            {/* ── Translation Font ── */}
            <View style={[styles.fontRow, { backgroundColor: theme.softSurface, borderColor: theme.border }]}>
              <Text style={[styles.settingsLabel, { color: theme.text }]}>Ukuran terjemahan</Text>
              <View style={styles.fontControlWrap}>
                <Pressable
                  style={[styles.fontBtn, { borderColor: theme.border }]}
                  onPress={() => onSetTranslationFontSize(clampFont(translationFontSize - 1, 12, 22))}>
                  <Ionicons name="remove" size={16} color={theme.gold} />
                </Pressable>
                <Text style={[styles.fontValue, { color: theme.muted }]}>{translationFontSize}</Text>
                <Pressable
                  style={[styles.fontBtn, { borderColor: theme.border }]}
                  onPress={() => onSetTranslationFontSize(clampFont(translationFontSize + 1, 12, 22))}>
                  <Ionicons name="add" size={16} color={theme.gold} />
                </Pressable>
              </View>
            </View>

            {/* ── Reset ── */}
            <Pressable style={[styles.resetBtn, { backgroundColor: theme.goldSoft }]} onPress={onReset}>
              <Ionicons name="refresh-outline" size={16} color="#FFF9EE" />
              <Text style={styles.resetBtnText}>Reset ke default</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 18,
    backgroundColor: 'rgba(29, 20, 11, 0.28)',
  },
  modalCard: {
    maxHeight: '72%',
    borderRadius: 16,
    backgroundColor: '#FFF8EC',
    borderWidth: 1,
    borderColor: '#E9D8BC',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
  },
  settingsModalCard: {
    maxHeight: '84%',
  },
  modalTitle: {
    fontSize: 17,
    color: '#3E2A12',
    fontWeight: '700',
    textAlign: 'center',
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#E8DCC8',
    marginTop: 10,
    marginBottom: 8,
  },
  settingsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  settingsScroll: {
    maxHeight: 520,
  },
  settingsSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 6,
  },
  settingsRow: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  settingsTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  settingsLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  settingsValue: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '500',
  },
  loopModeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  loopModeChip: {
    flex: 1,
    minHeight: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loopModeChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  fontRow: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  fontControlWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fontBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fontValue: {
    minWidth: 26,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
  },
  resetBtn: {
    marginTop: 8,
    marginBottom: 8,
    minHeight: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  resetBtnText: {
    color: '#FFF9EE',
    fontSize: 12,
    fontWeight: '700',
  },
});
