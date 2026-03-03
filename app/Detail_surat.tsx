import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Audio,
  AVPlaybackStatusSuccess,
  InterruptionModeAndroid,
  InterruptionModeIOS,
} from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ImageBackground,
  Modal,
  PanResponder,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemePreference } from '@/contexts/theme-preference';
import {
  getAyahBookmarks,
  getSurahBookmarks,
  toggleAyahBookmarkStorage,
  toggleSurahBookmarkStorage,
} from '@/lib/quran-bookmarks';
import { showSaveFeedback } from '@/lib/save-feedback';

interface Ayat {
  id: number;
  surah: number;
  nomor: number;
  ar: string;
  tr: string;
  idn: string;
}

interface SurahDetail {
  nomor: number;
  nama: string;
  nama_latin: string;
  jumlah_ayat: number;
  tempat_turun: string;
  arti: string;
  deskripsi: string;
  audio: string;
  status: boolean;
  ayat: Ayat[];
}

interface ReciterAudioEntry {
  reciter: string;
  url: string;
  originalUrl: string;
}

type ReciterAudioMap = Record<string, ReciterAudioEntry>;

type ReciterOption = {
  id: string;
  name: string;
};
type ReciterCatalogItem = ReciterOption & {
  legacyFolder: string;
};

type LoopMode = 'off' | 'ayah' | 'surah';
const BASMALAH_TEXT = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';

const RECITER_CATALOG: ReciterCatalogItem[] = [
  { id: '1', name: 'Mishary Rashid Al Afasy', legacyFolder: 'Alafasy_128kbps' },
  { id: '2', name: 'Abu Bakr Al Shatri', legacyFolder: 'Abu_Bakr_Ash-Shaatree_128kbps' },
  { id: '3', name: 'Nasser Al Qatami', legacyFolder: 'Nasser_Alqatami_128kbps' },
  { id: '4', name: 'Yasser Al Dosari', legacyFolder: 'Yasser_Ad-Dussary_128kbps' },
  { id: '5', name: 'Hani Ar Rifai', legacyFolder: 'Hani_Rifai_128kbps' },
];

export default function Detail_surat() {
  const { nomor, ayah } = useLocalSearchParams<{ nomor: string; ayah?: string }>();
  const router = useRouter();
  const { resolvedTheme } = useThemePreference();
  const isDark = resolvedTheme === 'dark';

  const initialSurah = Number(nomor) || 1;

  const [currentSurahNo, setCurrentSurahNo] = useState(initialSurah);
  const [data, setData] = useState<SurahDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const [reciters, setReciters] = useState<ReciterOption[]>([]);
  const [selectedReciterId, setSelectedReciterId] = useState<string | null>(null);
  const [loadingReciters, setLoadingReciters] = useState(false);
  const [showReciterModal, setShowReciterModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
  const [playingAyahKey, setPlayingAyahKey] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(0);
  const [progressBarWidth, setProgressBarWidth] = useState(1);
  const [loopMode, setLoopMode] = useState<LoopMode>('off');
  const [surahBookmarked, setSurahBookmarked] = useState(false);
  const [swipeNotice, setSwipeNotice] = useState<string | null>(null);
  const [isAudioBusy, setIsAudioBusy] = useState(false);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showTranslation, setShowTranslation] = useState(true);
  const [autoScrollPlaying, setAutoScrollPlaying] = useState(true);
  const [enableSwipeHaptics, setEnableSwipeHaptics] = useState(true);
  const [arabicFontSize, setArabicFontSize] = useState(32);
  const [translationFontSize, setTranslationFontSize] = useState(15);

  const soundRef = useRef<Audio.Sound | null>(null);
  const flatListRef = useRef<FlatList<Ayat> | null>(null);
  const audioCacheRef = useRef<Record<string, ReciterAudioMap>>({});
  const surahCacheRef = useRef<Record<number, SurahDetail>>({});
  const playingContextRef = useRef<{ surahNo: number; ayahNo: number } | null>(null);
  const selectedReciterRef = useRef<string | null>(null);
  const loopModeRef = useRef<LoopMode>('off');
  const swipeNoticeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const theme = useMemo(
    () =>
      isDark
        ? {
            bg: '#15100A',
            surface: '#22180F',
            softSurface: '#2D2014',
            border: '#4D3923',
            text: '#F3E4CF',
            muted: '#BEA486',
            gold: '#C68B2F',
            goldSoft: '#A96F30',
            activeBg: '#3A2814',
            activeBorder: '#6A4B25',
            overlay: 'rgba(0, 0, 0, 0.5)',
          }
        : {
            bg: '#FCF8F1',
            surface: '#FFF9ED',
            softSurface: '#FFF4DE',
            border: '#EADBC0',
            text: '#2A1F12',
            muted: '#8A7255',
            gold: '#B06D1B',
            goldSoft: '#B77836',
            activeBg: '#FFF4DE',
            activeBorder: '#E3CDAA',
            overlay: 'rgba(29, 20, 11, 0.28)',
          },
    [isDark]
  );

  useEffect(() => {
    selectedReciterRef.current = selectedReciterId;
  }, [selectedReciterId]);

  useEffect(() => {
    loopModeRef.current = loopMode;
  }, [loopMode]);

  useEffect(() => {
    setCurrentSurahNo(Number(nomor) || 1);
  }, [nomor]);

  const getVerseKey = (surahNo: number, ayahNo: number) => `${surahNo}:${ayahNo}`;
  const pad3 = (value: number) => String(value).padStart(3, '0');

  const buildReciterAudioMap = useCallback((surahNo: number, ayahNo: number): ReciterAudioMap => {
    const surahPart = pad3(surahNo);
    const ayahPart = pad3(ayahNo);

    return RECITER_CATALOG.reduce<ReciterAudioMap>((acc, reciter) => {
      acc[reciter.id] = {
        reciter: reciter.name,
        url: `https://the-quran-project.github.io/Quran-Audio/Data/${reciter.id}/${surahNo}_${ayahNo}.mp3`,
        originalUrl: `https://everyayah.com/data/${reciter.legacyFolder}/${surahPart}${ayahPart}.mp3`,
      };
      return acc;
    }, {});
  }, []);

  const ensureBackgroundAudioMode = useCallback(async () => {
    try {
      await Audio.setIsEnabledAsync(true);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Failed to set audio mode:', error);
    }
  }, []);

  const showSwipeChangeNotice = (label: string) => {
    if (swipeNoticeTimeoutRef.current) clearTimeout(swipeNoticeTimeoutRef.current);
    setSwipeNotice(label);
    swipeNoticeTimeoutRef.current = setTimeout(() => {
      setSwipeNotice(null);
    }, 900);
  };

  const clampFont = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

  const scrollToAyah = useCallback((surahNo: number, ayahNo: number, animated = true) => {
    if (!data || data.nomor !== surahNo) return;
    const index = data.ayat.findIndex((item) => item.nomor === ayahNo);
    if (index < 0) return;

    setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index,
        animated,
        viewPosition: 0.24,
      });
    }, 120);
  }, [data]);

  const selectedReciterName = useMemo(() => {
    if (!selectedReciterId) return null;
    return reciters.find((item) => item.id === selectedReciterId)?.name ?? null;
  }, [reciters, selectedReciterId]);

  const unloadSound = async () => {
    if (!soundRef.current) return;

    try {
      await soundRef.current.unloadAsync();
    } catch (error) {
      console.error('Failed to unload audio:', error);
    }

    soundRef.current = null;
  };

  const ensureSurahDetail = useCallback(async (surahNo: number) => {
    const cached = surahCacheRef.current[surahNo];
    if (cached) return cached;

    const response = await fetch(`https://quran-api.santrikoding.com/api/surah/${surahNo}`);
    if (!response.ok) throw new Error(`Failed to fetch surah ${surahNo}`);

    const result = (await response.json()) as SurahDetail;
    surahCacheRef.current[surahNo] = result;
    return result;
  }, []);

  const getAudioForAyah = useCallback(async (surahNo: number, ayahNo: number) => {
    const cacheKey = `${surahNo}:${ayahNo}`;
    const cached = audioCacheRef.current[cacheKey];
    if (cached) return cached;

    const result = buildReciterAudioMap(surahNo, ayahNo);
    audioCacheRef.current[cacheKey] = result;
    return result;
  }, [buildReciterAudioMap]);

  const warmAudioWindow = useCallback((surahNo: number, ayahNo: number) => {
    void getAudioForAyah(surahNo, ayahNo).catch(() => undefined);
    if (ayahNo > 1) void getAudioForAyah(surahNo, ayahNo - 1).catch(() => undefined);
    void getAudioForAyah(surahNo, ayahNo + 1).catch(() => undefined);
  }, [getAudioForAyah]);

  const stopPlayback = async () => {
    await unloadSound();
    playingContextRef.current = null;
    setPlayingAyahKey(null);
    setIsPlaying(false);
    setPositionMillis(0);
    setDurationMillis(0);
    setIsPlayerVisible(false);
  };

  const moveToSurah = async (surahNo: number) => {
    const clamped = Math.max(1, Math.min(114, surahNo));
    const detail = await ensureSurahDetail(clamped);
    setCurrentSurahNo(clamped);
    setData(detail);
    return detail;
  };

  const playSpecificAyah = async (surahNo: number, ayahNo: number) => {
    await ensureBackgroundAudioMode();

    const verseKey = getVerseKey(surahNo, ayahNo);
    setIsPlayerVisible(true);
    setPlayingAyahKey(verseKey);
    setIsPlaying(true);
    setIsAudioBusy(true);

    try {
      const targetSurah = await moveToSurah(surahNo);
      const targetAyah = Math.max(1, Math.min(targetSurah.jumlah_ayat, ayahNo));
      const reciterMap = await getAudioForAyah(targetSurah.nomor, targetAyah);

      const availableReciterId =
        selectedReciterRef.current && reciterMap[selectedReciterRef.current]
          ? selectedReciterRef.current
          : Object.keys(reciterMap)[0] ?? null;

      if (!availableReciterId) {
        Alert.alert('Audio tidak tersedia', 'Audio untuk ayat ini belum tersedia.');
        return;
      }

      if (availableReciterId !== selectedReciterRef.current) {
        setSelectedReciterId(availableReciterId);
      }

      const targetAudio = reciterMap[availableReciterId];

      await unloadSound();
      const sourceCandidates = [targetAudio.url, targetAudio.originalUrl];
      const onPlaybackStatus = (status: unknown) => {
        if (!status || typeof status !== 'object' || !('isLoaded' in status)) return;
        const loadedStatus = status as AVPlaybackStatusSuccess;
        if (!loadedStatus.isLoaded) return;

        setIsPlaying(loadedStatus.isPlaying);
        setPositionMillis(loadedStatus.positionMillis ?? 0);
        setDurationMillis(loadedStatus.durationMillis ?? 0);

        if (loadedStatus.didJustFinish) {
          void handleTrackFinished();
        }
      };

      let createdSound: Audio.Sound | null = null;
      let lastError: unknown = null;
      for (const uri of sourceCandidates) {
        try {
          const created = await Audio.Sound.createAsync({ uri }, { shouldPlay: true }, onPlaybackStatus);
          createdSound = created.sound;
          break;
        } catch (error) {
          lastError = error;
        }
      }

      if (!createdSound) {
        throw lastError ?? new Error('No playable source for this ayah');
      }

      soundRef.current = createdSound;
      playingContextRef.current = { surahNo: targetSurah.nomor, ayahNo: targetAyah };
      setPlayingAyahKey(getVerseKey(targetSurah.nomor, targetAyah));
      setIsPlaying(true);
      if (autoScrollPlaying) {
        scrollToAyah(targetSurah.nomor, targetAyah);
      }
      warmAudioWindow(targetSurah.nomor, targetAyah);
    } catch (error) {
      console.warn('Failed to play ayah:', error);
      setIsPlaying(false);
      Alert.alert('Gagal memutar audio', 'Periksa koneksi internet lalu coba lagi.');
    } finally {
      setIsAudioBusy(false);
    }
  };

  const handleTrackFinished = async () => {
    const current = playingContextRef.current;
    if (!current) return;

    const mode = loopModeRef.current;

    if (mode === 'ayah') {
      await playSpecificAyah(current.surahNo, current.ayahNo);
      return;
    }

    const currentSurah = await ensureSurahDetail(current.surahNo);

    if (current.ayahNo < currentSurah.jumlah_ayat) {
      await playSpecificAyah(current.surahNo, current.ayahNo + 1);
      return;
    }

    if (mode === 'surah') {
      await playSpecificAyah(current.surahNo, 1);
      return;
    }

    if (current.surahNo < 114) {
      await playSpecificAyah(current.surahNo + 1, 1);
      return;
    }

    await stopPlayback();
  };

  const togglePlayAyah = async (ayah: Ayat) => {
    const verseKey = getVerseKey(ayah.surah, ayah.nomor);

    if (soundRef.current && playingAyahKey === verseKey) {
      const status = await soundRef.current.getStatusAsync();
      if (status.isLoaded) {
        if (status.isPlaying) {
          await soundRef.current.pauseAsync();
          setIsPlaying(false);
        } else {
          await soundRef.current.playAsync();
          setIsPlaying(true);
        }
        return;
      }
    }

    await playSpecificAyah(ayah.surah, ayah.nomor);
  };

  const seekByRatio = async (ratio: number) => {
    if (!soundRef.current || durationMillis <= 0) return;

    const clamped = Math.max(0, Math.min(1, ratio));
    const target = Math.floor(durationMillis * clamped);

    await soundRef.current.setPositionAsync(target);
    setPositionMillis(target);
  };

  const playNextAyah = async () => {
    const current = playingContextRef.current;
    if (!current) {
      await playSpecificAyah(currentSurahNo, 1);
      return;
    }

    const detail = await ensureSurahDetail(current.surahNo);
    if (current.ayahNo < detail.jumlah_ayat) {
      await playSpecificAyah(current.surahNo, current.ayahNo + 1);
      return;
    }

    if (current.surahNo < 114) {
      await playSpecificAyah(current.surahNo + 1, 1);
      return;
    }

    await stopPlayback();
  };

  const playPreviousAyah = async () => {
    const current = playingContextRef.current;
    if (!current) {
      await playSpecificAyah(currentSurahNo, 1);
      return;
    }

    if (soundRef.current) {
      const status = await soundRef.current.getStatusAsync();
      if (status.isLoaded) {
        const loaded = status as AVPlaybackStatusSuccess;
        if ((loaded.positionMillis ?? 0) > 3000) {
          await soundRef.current.setPositionAsync(0);
          return;
        }
      }
    }

    if (current.ayahNo > 1) {
      await playSpecificAyah(current.surahNo, current.ayahNo - 1);
      return;
    }

    if (current.surahNo > 1) {
      const prevSurah = await ensureSurahDetail(current.surahNo - 1);
      await playSpecificAyah(prevSurah.nomor, prevSurah.jumlah_ayat);
    }
  };

  const jumpSurah = async (delta: number) => {
    const target = Math.max(1, Math.min(114, currentSurahNo + delta));
    const hasPlayback = Boolean(playingContextRef.current);

    if (hasPlayback) {
      await playSpecificAyah(target, 1);
      const targetDetail = await ensureSurahDetail(target);
      showSwipeChangeNotice(`Surat ${targetDetail.nomor} · ${targetDetail.nama_latin}`);
      if (enableSwipeHaptics) {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      return;
    }

    try {
      const targetDetail = await moveToSurah(target);
      showSwipeChangeNotice(`Surat ${targetDetail.nomor} · ${targetDetail.nama_latin}`);
      if (enableSwipeHaptics) {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      console.error('Failed to load surah:', error);
      Alert.alert('Gagal memuat surat', 'Coba lagi beberapa saat.');
    }
  };

  const refreshSurah = async () => {
    setRefreshing(true);
    try {
      delete surahCacheRef.current[currentSurahNo];

      const freshDetail = await ensureSurahDetail(currentSurahNo);
      setData(freshDetail);

      if (freshDetail.ayat[0]?.nomor) {
        delete audioCacheRef.current[`${currentSurahNo}:${freshDetail.ayat[0].nomor}`];
      }
    } catch (error) {
      console.error('Failed to refresh surah:', error);
      Alert.alert('Gagal refresh', 'Coba lagi beberapa saat.');
    } finally {
      setRefreshing(false);
    }
  };

  const toggleLoopMode = () => {
    setLoopMode((prev) => {
      if (prev === 'off') return 'ayah';
      if (prev === 'ayah') return 'surah';
      return 'off';
    });
  };

  const toggleSurahBookmark = async () => {
    if (!data) return;
    const result = await toggleSurahBookmarkStorage({
      nomor: data.nomor,
      nama: data.nama,
      nama_latin: data.nama_latin,
      jumlah_ayat: data.jumlah_ayat,
      tempat_turun: data.tempat_turun,
      arti: data.arti,
    });
    setSurahBookmarked(result.bookmarked);
    showSaveFeedback({
      saved: result.bookmarked,
      label: data.nama_latin,
      entity: 'Surat',
    });
  };

  const toggleBookmark = async (ayah: Ayat) => {
    if (!data) return;

    const result = await toggleAyahBookmarkStorage({
      surahNo: ayah.surah,
      surahNama: data.nama,
      surahLatin: data.nama_latin,
      ayahNo: ayah.nomor,
      arabic: ayah.ar,
      translation: ayah.idn,
    });

    const map = result.list.reduce<Record<string, boolean>>((acc, item) => {
      acc[item.key] = true;
      return acc;
    }, {});
    setBookmarks(map);
    showSaveFeedback({
      saved: result.bookmarked,
      label: `${data.nama_latin} ${ayah.nomor}`,
      entity: 'Ayat',
    });
  };

  const shareAyah = async (ayah: Ayat) => {
    if (!data) return;

    try {
      await Share.share({
        message: `${data.nama_latin} ${data.nomor}:${ayah.nomor}\n${ayah.ar}\n${ayah.idn}`,
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const openAyahActions = (ayah: Ayat) => {
    const key = getVerseKey(ayah.surah, ayah.nomor);
    const isBookmarked = Boolean(bookmarks[key]);

    Alert.alert('Aksi Ayat', `${data?.nama_latin} ${data?.nomor}:${ayah.nomor}`, [
      {
        text: isBookmarked ? 'Hapus Bookmark' : 'Tambah Bookmark',
        onPress: () => {
          void toggleBookmark(ayah);
        },
      },
      {
        text: 'Bagikan Ayat',
        onPress: () => {
          void shareAyah(ayah);
        },
      },
      {
        text: 'Putar Audio',
        onPress: () => {
          void togglePlayAyah(ayah);
        },
      },
      { text: 'Batal', style: 'cancel' },
    ]);
  };

  const formatTime = (ms: number) => {
    const total = Math.floor(ms / 1000);
    const min = Math.floor(total / 60)
      .toString()
      .padStart(2, '0');
    const sec = (total % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  const loopLabel = loopMode === 'off' ? 'Loop Off' : loopMode === 'ayah' ? 'Loop Ayat' : 'Loop Surat';

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) =>
      Math.abs(gestureState.dx) > 24 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.2,
    onPanResponderRelease: (_, gestureState) => {
      if (Math.abs(gestureState.dx) < 70) return;
      if (gestureState.dx > 0) {
        void jumpSurah(-1);
      } else {
        void jumpSurah(1);
      }
    },
  });

  useEffect(() => {
    void ensureBackgroundAudioMode();
  }, [ensureBackgroundAudioMode]);

  useEffect(() => {
    let cancelled = false;

    const loadSurah = async () => {
      setLoading(true);
      try {
        const detail = await ensureSurahDetail(currentSurahNo);
        if (cancelled) return;
        setData(detail);
      } catch (error) {
        console.error(error);
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadSurah();

    return () => {
      cancelled = true;
    };
  }, [currentSurahNo, ensureSurahDetail]);

  useEffect(() => {
    let cancelled = false;

    const loadReciters = () => {
      if (!data?.nomor || !data.ayat.length) return;
      setLoadingReciters(true);

      try {
        const options = RECITER_CATALOG.map(({ id, name }) => ({ id, name }));

        if (cancelled) return;

        setReciters(options);
        setSelectedReciterId((prev) => {
          if (prev && options.some((item) => item.id === prev)) return prev;
          return options[0]?.id ?? null;
        });
      } catch (error) {
        console.error('Failed to load reciters:', error);
        if (!cancelled) {
          setReciters([]);
          setSelectedReciterId(null);
        }
      } finally {
        if (!cancelled) setLoadingReciters(false);
      }
    };

    loadReciters();

    return () => {
      cancelled = true;
    };
  }, [data?.nomor, data?.ayat]);

  useEffect(() => {
    let cancelled = false;

    const loadBookmarks = async () => {
      const [ayahList, surahList] = await Promise.all([getAyahBookmarks(), getSurahBookmarks()]);
      if (cancelled) return;

      const ayahMap = ayahList.reduce<Record<string, boolean>>((acc, item) => {
        acc[item.key] = true;
        return acc;
      }, {});
      setBookmarks(ayahMap);

      if (data) {
        setSurahBookmarked(surahList.some((item) => item.nomor === data.nomor));
      }
    };

    void loadBookmarks();
    return () => {
      cancelled = true;
    };
  }, [data, warmAudioWindow]);

  useEffect(() => {
    return () => {
      if (swipeNoticeTimeoutRef.current) clearTimeout(swipeNoticeTimeoutRef.current);
      void unloadSound();
    };
  }, []);

  useEffect(() => {
    const current = playingContextRef.current;
    if (!current || !data) return;
    if (data.nomor !== current.surahNo) return;
    if (!autoScrollPlaying) return;

    scrollToAyah(current.surahNo, current.ayahNo);
  }, [playingAyahKey, data, scrollToAyah, autoScrollPlaying]);

  useEffect(() => {
    if (!data || !ayah) return;
    const targetAyahNo = Number(ayah);
    if (!Number.isFinite(targetAyahNo) || targetAyahNo < 1) return;
    scrollToAyah(data.nomor, targetAyahNo, true);
  }, [ayah, data, scrollToAyah]);

  useEffect(() => {
    if (!data?.nomor || !data.ayat?.length) return;
    warmAudioWindow(data.nomor, data.ayat[0].nomor);
  }, [data, warmAudioWindow]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={theme.gold} />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={[styles.center, { backgroundColor: theme.bg }]}>
        <Text style={[styles.errorText, { color: theme.text }]}>Gagal memuat detail surat.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top']} {...panResponder.panHandlers}>
      <View style={styles.topBarWrap}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={10}
            style={[styles.backBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="chevron-back" size={20} color={theme.text} />
          </Pressable>

          <Text style={[styles.topTitle, { color: theme.text }]}>QURAN</Text>

          <View style={styles.topRightActions}>
            <Pressable
              onPress={() => setShowSettingsModal(true)}
              hitSlop={10}
              style={[styles.moreBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Ionicons name="options-outline" size={18} color={theme.text} />
            </Pressable>

            <Pressable
              onPress={() => void toggleSurahBookmark()}
              hitSlop={10}
              style={[styles.moreBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Ionicons
                name={surahBookmarked ? 'bookmark' : 'bookmark-outline'}
                size={18}
                color={surahBookmarked ? theme.gold : theme.text}
              />
            </Pressable>

            <Pressable
              onPress={() => void refreshSurah()}
              hitSlop={10}
              style={[styles.moreBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Ionicons name="refresh-outline" size={18} color={theme.text} />
            </Pressable>
          </View>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={data.ayat}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[styles.listContent, { paddingBottom: isPlayerVisible ? 230 : 90 }]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={(event) => {
          const shouldShow = event.nativeEvent.contentOffset.y > 280;
          if (shouldShow !== showScrollTop) {
            setShowScrollTop(shouldShow);
          }
        }}
        onScrollToIndexFailed={({ index, averageItemLength }) => {
          flatListRef.current?.scrollToOffset({
            offset: Math.max(0, index * averageItemLength - 120),
            animated: true,
          });
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({
              index,
              animated: true,
              viewPosition: 0.24,
            });
          }, 200);
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void refreshSurah()} tintColor={theme.gold} />
        }
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <ImageBackground
              source={require('../assets/images/bg_detail_surat.png')}
              style={styles.surahCard}
              imageStyle={styles.surahCardImage}>
              <Text style={[styles.surahLatin, { color: theme.gold }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
                {data.nama_latin}
              </Text>
              <Text style={[styles.surahMeta, { color: theme.muted }]}>
                {data.arti} - {data.jumlah_ayat} Ayahs
              </Text>
              <Text style={[styles.bismillah, { color: theme.muted }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                {BASMALAH_TEXT}
              </Text>
            </ImageBackground>
            <Text style={[styles.swipeHint, { color: theme.muted }]}>Geser kiri/kanan untuk pindah surat</Text>
          </View>
        }
        renderItem={({ item }) => {
          const verseKey = getVerseKey(item.surah, item.nomor);
          const isCurrent = verseKey === playingAyahKey;
          const isBookmarked = Boolean(bookmarks[verseKey]);

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
                  {data.nomor}:{item.nomor}
                </Text>
                <Pressable onPress={() => openAyahActions(item)} hitSlop={8}>
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
                {item.ar}
              </Text>
              {showTranslation ? (
                <Text
                  style={[
                    styles.ayahTranslation,
                    { color: theme.text, fontSize: translationFontSize, lineHeight: Math.round(translationFontSize * 1.55) },
                    isCurrent && styles.ayahTranslationActive,
                    isCurrent && { color: theme.muted },
                  ]}>
                  {item.idn}
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
                  onPress={() => {
                    void togglePlayAyah(item);
                  }}>
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
                  onPress={() => {
                    void toggleBookmark(item);
                  }}>
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
                  onPress={() => {
                    void shareAyah(item);
                  }}>
                  <MaterialCommunityIcons name="share-variant-outline" size={18} color={theme.muted} />
                </Pressable>
              </View>
            </View>
          );
        }}
      />

      {swipeNotice ? (
        <View style={[styles.swipeNotice, { backgroundColor: theme.softSurface, borderColor: theme.activeBorder }]}>
          <Ionicons name="swap-horizontal" size={14} color={theme.gold} />
          <Text style={[styles.swipeNoticeText, { color: theme.gold }]}>{swipeNotice}</Text>
        </View>
      ) : null}

      {showScrollTop ? (
        <Pressable
          style={[
            styles.scrollTopBtn,
            {
              bottom: isPlayerVisible ? 262 : 94,
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
          onPress={() => {
            flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
          }}>
          <Ionicons name="arrow-up" size={18} color={theme.gold} />
        </Pressable>
      ) : null}

      {!isPlayerVisible ? (
        <Pressable
          style={[styles.fullPlayBtn, { backgroundColor: theme.goldSoft, borderColor: theme.border }]}
          onPress={() => {
            void playSpecificAyah(data.nomor, 1);
          }}>
          <Ionicons name="play-circle-outline" size={18} color="#FFF9EE" />
          <Text style={styles.fullPlayText}>Play Full Surah</Text>
        </Pressable>
      ) : null}

      {isPlayerVisible ? (
        <View style={[styles.playerCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.playerTopRow}>
          <Text style={[styles.playerTitle, { color: theme.text }]} numberOfLines={1}>
            {isAudioBusy
              ? 'Menyiapkan audio...'
              : playingAyahKey
              ? `${data.nama_latin} ${playingAyahKey.split(':')[1]}`
              : 'Belum ada ayat diputar'}
          </Text>
          <Pressable style={styles.loopBtn} onPress={toggleLoopMode}>
            <Ionicons name="repeat" size={16} color={theme.gold} />
            <Text style={[styles.loopText, { color: theme.gold }]}>{loopLabel}</Text>
          </Pressable>
        </View>

        <Pressable
          style={[styles.playerReciterRow, { borderColor: theme.border, backgroundColor: theme.softSurface }]}
          onPress={() => setShowReciterModal(true)}>
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
          onLayout={(e) => setProgressBarWidth(e.nativeEvent.layout.width)}
          onPress={(e) => {
            const ratio = e.nativeEvent.locationX / progressBarWidth;
            void seekByRatio(ratio);
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
          <Pressable style={styles.controlBtn} onPress={() => void jumpSurah(-1)}>
            <Ionicons name="play-skip-back-circle-outline" size={22} color={theme.gold} />
            <Text style={[styles.controlSubText, { color: theme.gold }]}>Surat -</Text>
          </Pressable>

          <Pressable style={styles.controlBtn} onPress={() => void playPreviousAyah()}>
            <Ionicons name="play-back-outline" size={22} color={theme.gold} />
            <Text style={[styles.controlSubText, { color: theme.gold }]}>Ayat -</Text>
          </Pressable>

          <Pressable
            style={[styles.playPauseBtn, { backgroundColor: theme.goldSoft }, !playingAyahKey && styles.playPauseBtnDisabled]}
            onPress={() => {
              if (isAudioBusy) return;
              if (!playingAyahKey) {
                void playSpecificAyah(data.nomor, 1);
                return;
              }
              if (isPlaying) {
                void soundRef.current?.pauseAsync();
                setIsPlaying(false);
              } else {
                void soundRef.current?.playAsync();
                setIsPlaying(true);
              }
            }}>
            <Ionicons
              name={isAudioBusy ? 'hourglass-outline' : isPlaying ? 'pause' : 'play'}
              size={20}
              color="#FFF9EE"
            />
          </Pressable>

          <Pressable style={styles.controlBtn} onPress={() => void playNextAyah()}>
            <Ionicons name="play-forward-outline" size={22} color={theme.gold} />
            <Text style={[styles.controlSubText, { color: theme.gold }]}>Ayat +</Text>
          </Pressable>

          <Pressable style={styles.controlBtn} onPress={() => void jumpSurah(1)}>
            <Ionicons name="play-skip-forward-circle-outline" size={22} color={theme.gold} />
            <Text style={[styles.controlSubText, { color: theme.gold }]}>Surat +</Text>
          </Pressable>
        </View>

        <View style={styles.stopRow}>
          <Pressable
            style={[styles.seekBtn, { borderColor: theme.border, backgroundColor: theme.softSurface }]}
            onPress={() => {
              void stopPlayback();
            }}>
            <Ionicons name="stop-circle-outline" size={16} color={theme.gold} />
            <Text style={[styles.seekText, { color: theme.gold }]}>Stop</Text>
          </Pressable>
        </View>
        </View>
      ) : null}

      <Modal
        animationType="fade"
        transparent
        visible={showSettingsModal}
        onRequestClose={() => setShowSettingsModal(false)}>
        <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowSettingsModal(false)} />
          <View style={[styles.modalCard, styles.settingsModalCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.settingsHeaderRow}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Pengaturan Detail Quran</Text>
              <Pressable onPress={() => setShowSettingsModal(false)} hitSlop={8}>
                <Ionicons name="close" size={18} color={theme.muted} />
              </Pressable>
            </View>
            <View style={[styles.modalDivider, { backgroundColor: theme.border }]} />

            <ScrollView style={styles.settingsScroll} showsVerticalScrollIndicator={false}>
              <Text style={[styles.settingsSectionTitle, { color: theme.muted }]}>Pembaca</Text>
              <Pressable
                style={[styles.settingsRow, { backgroundColor: theme.softSurface, borderColor: theme.border }]}
                onPress={() => {
                  setShowSettingsModal(false);
                  setShowReciterModal(true);
                }}>
                <View style={styles.settingsTextWrap}>
                  <Text style={[styles.settingsLabel, { color: theme.text }]}>Pilih reciter sebelum memutar</Text>
                  <Text style={[styles.settingsValue, { color: theme.muted }]} numberOfLines={1}>
                    {selectedReciterName ?? 'Belum dipilih'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.gold} />
              </Pressable>

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
                      onPress={() => setLoopMode(mode)}>
                      <Text style={[styles.loopModeChipText, { color: active ? '#FFF9EE' : theme.text }]}>{label}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={[styles.settingsSectionTitle, { color: theme.muted }]}>Tampilan</Text>
              <Pressable
                style={[styles.settingsRow, { backgroundColor: theme.softSurface, borderColor: theme.border }]}
                onPress={() => setShowTranslation((prev) => !prev)}>
                <Text style={[styles.settingsLabel, { color: theme.text }]}>Tampilkan terjemahan ayat</Text>
                <Ionicons
                  name={showTranslation ? 'checkmark-circle' : 'ellipse-outline'}
                  size={18}
                  color={showTranslation ? theme.gold : theme.muted}
                />
              </Pressable>

              <Pressable
                style={[styles.settingsRow, { backgroundColor: theme.softSurface, borderColor: theme.border }]}
                onPress={() => setAutoScrollPlaying((prev) => !prev)}>
                <Text style={[styles.settingsLabel, { color: theme.text }]}>Auto-scroll ke ayat yang diputar</Text>
                <Ionicons
                  name={autoScrollPlaying ? 'checkmark-circle' : 'ellipse-outline'}
                  size={18}
                  color={autoScrollPlaying ? theme.gold : theme.muted}
                />
              </Pressable>

              <Pressable
                style={[styles.settingsRow, { backgroundColor: theme.softSurface, borderColor: theme.border }]}
                onPress={() => setEnableSwipeHaptics((prev) => !prev)}>
                <Text style={[styles.settingsLabel, { color: theme.text }]}>Getar saat swipe pindah surat</Text>
                <Ionicons
                  name={enableSwipeHaptics ? 'checkmark-circle' : 'ellipse-outline'}
                  size={18}
                  color={enableSwipeHaptics ? theme.gold : theme.muted}
                />
              </Pressable>

              <View style={[styles.fontRow, { backgroundColor: theme.softSurface, borderColor: theme.border }]}>
                <Text style={[styles.settingsLabel, { color: theme.text }]}>Ukuran teks Arab</Text>
                <View style={styles.fontControlWrap}>
                  <Pressable
                    style={[styles.fontBtn, { borderColor: theme.border }]}
                    onPress={() => setArabicFontSize((prev) => clampFont(prev - 2, 26, 48))}>
                    <Ionicons name="remove" size={16} color={theme.gold} />
                  </Pressable>
                  <Text style={[styles.fontValue, { color: theme.muted }]}>{arabicFontSize}</Text>
                  <Pressable
                    style={[styles.fontBtn, { borderColor: theme.border }]}
                    onPress={() => setArabicFontSize((prev) => clampFont(prev + 2, 26, 48))}>
                    <Ionicons name="add" size={16} color={theme.gold} />
                  </Pressable>
                </View>
              </View>

              <View style={[styles.fontRow, { backgroundColor: theme.softSurface, borderColor: theme.border }]}>
                <Text style={[styles.settingsLabel, { color: theme.text }]}>Ukuran terjemahan</Text>
                <View style={styles.fontControlWrap}>
                  <Pressable
                    style={[styles.fontBtn, { borderColor: theme.border }]}
                    onPress={() => setTranslationFontSize((prev) => clampFont(prev - 1, 12, 22))}>
                    <Ionicons name="remove" size={16} color={theme.gold} />
                  </Pressable>
                  <Text style={[styles.fontValue, { color: theme.muted }]}>{translationFontSize}</Text>
                  <Pressable
                    style={[styles.fontBtn, { borderColor: theme.border }]}
                    onPress={() => setTranslationFontSize((prev) => clampFont(prev + 1, 12, 22))}>
                    <Ionicons name="add" size={16} color={theme.gold} />
                  </Pressable>
                </View>
              </View>

              <Pressable
                style={[styles.resetBtn, { backgroundColor: theme.goldSoft }]}
                onPress={() => {
                  setShowTranslation(true);
                  setAutoScrollPlaying(true);
                  setEnableSwipeHaptics(true);
                  setArabicFontSize(32);
                  setTranslationFontSize(15);
                  setLoopMode('off');
                }}>
                <Ionicons name="refresh-outline" size={16} color="#FFF9EE" />
                <Text style={styles.resetBtnText}>Reset ke default</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent
        visible={showReciterModal}
        onRequestClose={() => setShowReciterModal(false)}>
        <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowReciterModal(false)} />
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
                      setSelectedReciterId(item.id);
                      setShowReciterModal(false);
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCF8F1',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FCF8F1',
  },
  errorText: {
    color: '#5A4530',
  },
  listContent: {
    paddingHorizontal: 14,
    paddingBottom: 230,
  },
  topBarWrap: {
    paddingHorizontal: 14,
    paddingTop: 2,
    paddingBottom: 4,
  },
  headerWrap: {
    gap: 10,
    marginBottom: 8,
    paddingTop: 0,
  },
  swipeHint: {
    textAlign: 'center',
    color: '#8A7255',
    fontSize: 11,
    marginTop: 6,
    fontWeight: '600',
  },
  topBar: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF9ED',
    borderWidth: 1,
    borderColor: '#EADBC0',
  },
  moreBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF9ED',
    borderWidth: 1,
    borderColor: '#EADBC0',
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  topTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.4,
    color: '#2A1F12',
    fontFamily: 'serif',
  },
  surahCard: {
    minHeight: 152,
    borderRadius: 18,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  surahCardImage: {
    borderRadius: 18,
    resizeMode: 'cover',
  },
  surahLatin: {
    fontSize: 34,
    color: '#7E531F',
    fontWeight: '700',
    fontFamily: 'serif',
    maxWidth: '100%',
  },
  surahMeta: {
    fontSize: 13,
    color: '#8F6335',
    marginTop: 2,
    fontWeight: '600',
  },
  bismillah: {
    marginTop: 14,
    fontSize: 34,
    color: '#8B6C3D',
    textAlign: 'center',
    width: '100%',
  },
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
  swipeNotice: {
    position: 'absolute',
    top: 188,
    alignSelf: 'center',
    zIndex: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 14,
    backgroundColor: '#FFF0D5',
    borderWidth: 1,
    borderColor: '#E8CE9F',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  swipeNoticeText: {
    color: '#7A4A17',
    fontSize: 12,
    fontWeight: '700',
  },
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
  fullPlayBtn: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 18,
    minHeight: 46,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  fullPlayText: {
    color: '#FFF9EE',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  scrollTopBtn: {
    position: 'absolute',
    right: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
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
  settingsModalCard: {
    maxHeight: '84%',
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
