import AsyncStorage from '@react-native-async-storage/async-storage';

export const SURAH_BOOKMARKS_KEY = '@muslim_app_quran_bookmark_surahs';
export const AYAH_BOOKMARKS_KEY = '@muslim_app_quran_bookmark_ayahs';

export type SurahBookmark = {
  nomor: number;
  nama: string;
  nama_latin: string;
  jumlah_ayat: number;
  tempat_turun: string;
  arti?: string;
  savedAt: string;
};

export type AyahBookmark = {
  key: string;
  surahNo: number;
  surahNama: string;
  surahLatin: string;
  ayahNo: number;
  arabic: string;
  translation: string;
  savedAt: string;
};

export type SurahBookmarkInput = Omit<SurahBookmark, 'savedAt'>;
export type AyahBookmarkInput = Omit<AyahBookmark, 'key' | 'savedAt'>;

async function readJsonArray<T>(key: string): Promise<T[]> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

async function writeJsonArray<T>(key: string, data: T[]) {
  await AsyncStorage.setItem(key, JSON.stringify(data));
}

export async function getSurahBookmarks() {
  const list = await readJsonArray<SurahBookmark>(SURAH_BOOKMARKS_KEY);
  return list.sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

export async function getAyahBookmarks() {
  const list = await readJsonArray<AyahBookmark>(AYAH_BOOKMARKS_KEY);
  return list.sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

export async function toggleSurahBookmarkStorage(input: SurahBookmarkInput) {
  const list = await readJsonArray<SurahBookmark>(SURAH_BOOKMARKS_KEY);
  const idx = list.findIndex((item) => item.nomor === input.nomor);

  if (idx >= 0) {
    list.splice(idx, 1);
    await writeJsonArray(SURAH_BOOKMARKS_KEY, list);
    return { bookmarked: false, list };
  }

  const next: SurahBookmark = { ...input, savedAt: new Date().toISOString() };
  const updated = [next, ...list];
  await writeJsonArray(SURAH_BOOKMARKS_KEY, updated);
  return { bookmarked: true, list: updated };
}

export async function toggleAyahBookmarkStorage(input: AyahBookmarkInput) {
  const key = `${input.surahNo}:${input.ayahNo}`;
  const list = await readJsonArray<AyahBookmark>(AYAH_BOOKMARKS_KEY);
  const idx = list.findIndex((item) => item.key === key);

  if (idx >= 0) {
    list.splice(idx, 1);
    await writeJsonArray(AYAH_BOOKMARKS_KEY, list);
    return { bookmarked: false, list };
  }

  const next: AyahBookmark = {
    ...input,
    key,
    savedAt: new Date().toISOString(),
  };
  const updated = [next, ...list];
  await writeJsonArray(AYAH_BOOKMARKS_KEY, updated);
  return { bookmarked: true, list: updated };
}

