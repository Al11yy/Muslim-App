import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

type AudioPlayerTheme = {
  text: string;
  muted: string;
  gold: string;
  goldSoft: string;
  surface: string;
  softSurface: string;
  border: string;
};

type AudioPlayerProps = {
  theme: AudioPlayerTheme;
  isAudioBusy: boolean;
  playingAyahKey: string | null;
  surahNamaLatin: string;
  isPlaying: boolean;
  loopLabel: string;
  selectedReciterName: string | null;
  loadingReciters: boolean;
  positionMillis: number;
  durationMillis: number;
  progressBarWidth: number;
  onToggleLoopMode: () => void;
  onOpenReciterModal: () => void;
  onProgressLayout: (width: number) => void;
  onSeek: (ratio: number) => void;
  onJumpSurah: (dir: number) => void;
  onPlayPrevAyah: () => void;
  onPlayNextAyah: () => void;
  onPlayPause: () => void;
  onPlayFromStart: () => void;
  onStop: () => void;
};

function formatTime(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const m = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const s = String(totalSec % 60).padStart(2, '0');
  return `${m}:${s}`;
}

export function AudioPlayer({
  theme,
  isAudioBusy,
  playingAyahKey,
  surahNamaLatin,
  isPlaying,
  loopLabel,
  selectedReciterName,
  loadingReciters,
  positionMillis,
  durationMillis,
  progressBarWidth,
  onToggleLoopMode,
  onOpenReciterModal,
  onProgressLayout,
  onSeek,
  onJumpSurah,
  onPlayPrevAyah,
  onPlayNextAyah,
  onPlayPause,
  onPlayFromStart,
  onStop,
}: AudioPlayerProps) {
  return (
    <View style={[styles.playerCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.playerTopRow}>
        <Text style={[styles.playerTitle, { color: theme.text }]} numberOfLines={1}>
          {isAudioBusy
            ? 'Menyiapkan audio...'
            : playingAyahKey
            ? `${surahNamaLatin} ${playingAyahKey.split(':')[1]}`
            : 'Belum ada ayat diputar'}
        </Text>
        <Pressable style={styles.loopBtn} onPress={onToggleLoopMode}>
          <Ionicons name="repeat" size={16} color={theme.gold} />
          <Text style={[styles.loopText, { color: theme.gold }]}>{loopLabel}</Text>
        </Pressable>
      </View>

      <Pressable
        style={[styles.playerReciterRow, { borderColor: theme.border, backgroundColor: theme.softSurface }]}
        onPress={onOpenReciterModal}>
        <Text style={[styles.playerReciterLabel, { color: theme.muted }]}>Pembaca</Text>
        <View style={styles.playerReciterValueWrap}>
          {loadingReciters ? (
            <ActivityIndicator size="small" color={theme.gold} />
          ) : (
            <Text style={[styles.playerReciterValue, { color: theme.text }]} numberOfLines={1}>
              {selectedReciterName ?? 'Pilih reciter'}
            </Text>
          )}
          <Ionicons name="chevron-down" size={14} color={theme.gold} />
        </View>
      </Pressable>

      <Pressable
        style={[styles.progressTrack, { backgroundColor: theme.border }]}
        onLayout={(e) => onProgressLayout(e.nativeEvent.layout.width)}
        onPress={(e) => {
          const ratio = e.nativeEvent.locationX / progressBarWidth;
          onSeek(ratio);
        }}>
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: theme.goldSoft,
              width: `${durationMillis ? (positionMillis / durationMillis) * 100 : 0}%`,
            },
          ]}
        />
      </Pressable>

      <View style={styles.timeRow}>
        <Text style={[styles.timeText, { color: theme.muted }]}>{formatTime(positionMillis)}</Text>
        <Text style={[styles.timeText, { color: theme.muted }]}>{formatTime(durationMillis)}</Text>
      </View>

      <View style={styles.mainControlsRow}>
        <Pressable style={styles.controlBtn} onPress={() => onJumpSurah(-1)}>
          <Ionicons name="play-skip-back-circle-outline" size={22} color={theme.gold} />
          <Text style={[styles.controlSubText, { color: theme.gold }]}>Surat -</Text>
        </Pressable>

        <Pressable style={styles.controlBtn} onPress={onPlayPrevAyah}>
          <Ionicons name="play-back-outline" size={22} color={theme.gold} />
          <Text style={[styles.controlSubText, { color: theme.gold }]}>Ayat -</Text>
        </Pressable>

        <Pressable
          style={[styles.playPauseBtn, { backgroundColor: theme.goldSoft }, !playingAyahKey && styles.playPauseBtnDisabled]}
          onPress={() => {
            if (isAudioBusy) return;
            if (!playingAyahKey) {
              onPlayFromStart();
              return;
            }
            onPlayPause();
          }}>
          <Ionicons
            name={isAudioBusy ? 'hourglass-outline' : isPlaying ? 'pause' : 'play'}
            size={20}
            color="#FFF9EE"
          />
        </Pressable>

        <Pressable style={styles.controlBtn} onPress={onPlayNextAyah}>
          <Ionicons name="play-forward-outline" size={22} color={theme.gold} />
          <Text style={[styles.controlSubText, { color: theme.gold }]}>Ayat +</Text>
        </Pressable>

        <Pressable style={styles.controlBtn} onPress={() => onJumpSurah(1)}>
          <Ionicons name="play-skip-forward-circle-outline" size={22} color={theme.gold} />
          <Text style={[styles.controlSubText, { color: theme.gold }]}>Surat +</Text>
        </Pressable>
      </View>

      <View style={styles.stopRow}>
        <Pressable
          style={[styles.seekBtn, { borderColor: theme.border, backgroundColor: theme.softSurface }]}
          onPress={onStop}>
          <Ionicons name="stop-circle-outline" size={16} color={theme.gold} />
          <Text style={[styles.seekText, { color: theme.gold }]}>Stop</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  playerCard: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 10,
    borderRadius: 18,
    backgroundColor: '#FFF7EA',
    borderWidth: 1,
    borderColor: '#E9D8BD',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    gap: 8,
  },
  playerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  playerTitle: {
    flex: 1,
    color: '#473118',
    fontWeight: '700',
    fontSize: 13,
  },
  loopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  loopText: {
    color: '#8A5B28',
    fontSize: 11,
    fontWeight: '600',
  },
  playerReciterRow: {
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E8D8C0',
    backgroundColor: '#FAF1E1',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playerReciterLabel: {
    color: '#7C5A34',
    fontSize: 12,
    fontWeight: '600',
  },
  playerReciterValueWrap: {
    maxWidth: '72%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  playerReciterValue: {
    color: '#5A3F1E',
    fontSize: 12,
    fontWeight: '700',
  },
  progressTrack: {
    height: 8,
    borderRadius: 10,
    backgroundColor: '#F2E4CF',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#B77836',
    borderRadius: 10,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    color: '#856949',
    fontSize: 11,
  },
  mainControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 4,
  },
  controlBtn: {
    width: 54,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  controlSubText: {
    fontSize: 10,
    color: '#8A5B28',
    fontWeight: '600',
  },
  playPauseBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#B77836',
  },
  playPauseBtnDisabled: {
    opacity: 0.88,
  },
  stopRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  seekBtn: {
    minWidth: 76,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E4D2B5',
    backgroundColor: '#F9F0DF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  seekText: {
    fontSize: 11,
    color: '#8A5B28',
    fontWeight: '700',
  },
});
