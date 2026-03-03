import AsyncStorage from '@react-native-async-storage/async-storage';

export const DZIKIR_SAVED_KEY = '@muslim_app_dzikir_saved_ids_v1';
export const HADITS_SAVED_KEY = '@muslim_app_hadits_saved_ids_v1';

async function readSavedIds(key: string): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

async function writeSavedIds(key: string, ids: string[]) {
  await AsyncStorage.setItem(key, JSON.stringify(ids));
}

async function toggleSavedId(key: string, id: string) {
  const ids = await readSavedIds(key);
  const hasId = ids.includes(id);

  if (hasId) {
    const next = ids.filter((value) => value !== id);
    await writeSavedIds(key, next);
    return { saved: false, ids: next };
  }

  const next = [id, ...ids];
  await writeSavedIds(key, next);
  return { saved: true, ids: next };
}

export async function getDzikirSavedIds() {
  return readSavedIds(DZIKIR_SAVED_KEY);
}

export async function toggleDzikirSavedId(id: string) {
  return toggleSavedId(DZIKIR_SAVED_KEY, id);
}

export async function getHaditsSavedIds() {
  return readSavedIds(HADITS_SAVED_KEY);
}

export async function toggleHaditsSavedId(id: string) {
  return toggleSavedId(HADITS_SAVED_KEY, id);
}

export async function clearSavedContentIds() {
  await AsyncStorage.multiRemove([DZIKIR_SAVED_KEY, HADITS_SAVED_KEY]);
}
