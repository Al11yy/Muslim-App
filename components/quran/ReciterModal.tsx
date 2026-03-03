import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

type ReciterOption = {
  id: string;
  name: string;
};

type ReciterModalTheme = {
  text: string;
  muted: string;
  gold: string;
  surface: string;
  softSurface: string;
  border: string;
  overlay: string;
};

type ReciterModalProps = {
  visible: boolean;
  theme: ReciterModalTheme;
  reciters: ReciterOption[];
  selectedReciterId: string | null;
  loadingReciters: boolean;
  onSelect: (id: string) => void;
  onClose: () => void;
};

export function ReciterModal({
  visible,
  theme,
  reciters,
  selectedReciterId,
  loadingReciters,
  onSelect,
  onClose,
}: ReciterModalProps) {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.modalCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>Pilih Reciter</Text>
          <View style={[styles.modalDivider, { backgroundColor: theme.border }]} />

          <FlatList
            data={reciters}
            keyExtractor={(item) => item.id}
            style={styles.modalList}
            renderItem={({ item }) => {
              const active = item.id === selectedReciterId;
              return (
                <Pressable
                  style={[styles.reciterItem, active && styles.reciterItemActive, active && { backgroundColor: theme.softSurface }]}
                  onPress={() => {
                    onSelect(item.id);
                    onClose();
                  }}>
                  <Text
                    style={[
                      styles.reciterItemText,
                      { color: theme.muted },
                      active && styles.reciterItemTextActive,
                      active && { color: theme.gold },
                    ]}>
                    {item.name}
                  </Text>
                  {active ? <Ionicons name="checkmark" size={16} color={theme.gold} /> : null}
                </Pressable>
              );
            }}
            ListEmptyComponent={
              <Text style={[styles.modalEmptyText, { color: theme.muted }]}>
                {loadingReciters ? 'Memuat reciter...' : 'Reciter belum tersedia'}
              </Text>
            }
          />
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
  modalList: {
    minHeight: 140,
  },
  reciterItem: {
    minHeight: 42,
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reciterItemActive: {
    backgroundColor: '#F4E5CE',
  },
  reciterItemText: {
    flex: 1,
    color: '#5A452B',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
  },
  reciterItemTextActive: {
    color: '#9E6A2F',
    fontWeight: '700',
  },
  modalEmptyText: {
    textAlign: 'center',
    color: '#8F7858',
    marginTop: 14,
    marginBottom: 16,
  },
});
