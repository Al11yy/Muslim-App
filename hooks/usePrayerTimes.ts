import { useEffect, useMemo, useState } from 'react';

type PrayerItem = {
  name: string;
  time: string;
};

type PrayerTimesState = {
  prayers: PrayerItem[];
  activePrayerIndex: number;
  countdown: string;
  city: string;
  loading: boolean;
};

const DEFAULT_CITY = 'Jakarta';
const DEFAULT_COUNTRY = 'Indonesia';

const FALLBACK_PRAYERS: PrayerItem[] = [
  { name: 'Subuh', time: '04:45' },
  { name: 'Dzuhur', time: '12:05' },
  { name: 'Ashar', time: '15:20' },
  { name: 'Maghrib', time: '18:10' },
  { name: 'Isya', time: '19:20' },
];

function parseApiTime(value: string | undefined): string {
  if (!value) return '00:00';
  const hhmm = value.split(' ')[0];
  return hhmm.slice(0, 5);
}

function toDateToday(hhmm: string): Date {
  const [h, m] = hhmm.split(':').map(Number);
  const date = new Date();
  date.setHours(Number.isFinite(h) ? h : 0, Number.isFinite(m) ? m : 0, 0, 0);
  return date;
}

function formatCountdown(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
  const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
  const s = String(totalSec % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export function usePrayerTimes(): PrayerTimesState {
  const [prayers, setPrayers] = useState<PrayerItem[]>(FALLBACK_PRAYERS);
  const [city, setCity] = useState(DEFAULT_CITY);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let alive = true;

    const loadPrayerTimes = async () => {
      setLoading(true);
      try {
        const url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(DEFAULT_CITY)}&country=${encodeURIComponent(DEFAULT_COUNTRY)}&method=11`;
        const response = await fetch(url);
        const json = await response.json();
        const timings = json?.data?.timings;

        const mapped: PrayerItem[] = [
          { name: 'Subuh', time: parseApiTime(timings?.Fajr) },
          { name: 'Dzuhur', time: parseApiTime(timings?.Dhuhr) },
          { name: 'Ashar', time: parseApiTime(timings?.Asr) },
          { name: 'Maghrib', time: parseApiTime(timings?.Maghrib) },
          { name: 'Isya', time: parseApiTime(timings?.Isha) },
        ];

        const valid = mapped.every((p) => /^\d{2}:\d{2}$/.test(p.time));
        if (alive) {
          setPrayers(valid ? mapped : FALLBACK_PRAYERS);
          setCity(DEFAULT_CITY);
        }
      } catch {
        if (alive) {
          setPrayers(FALLBACK_PRAYERS);
          setCity(DEFAULT_CITY);
        }
      } finally {
        if (alive) setLoading(false);
      }
    };

    void loadPrayerTimes();
    return () => {
      alive = false;
    };
  }, []);

  const { activePrayerIndex, countdown } = useMemo(() => {
    if (prayers.length === 0) {
      return { activePrayerIndex: 0, countdown: '00:00:00' };
    }

    const prayerDates = prayers.map((p) => toDateToday(p.time));
    let nextIndex = prayerDates.findIndex((date) => date.getTime() > now.getTime());

    if (nextIndex === -1) {
      nextIndex = 0;
      prayerDates[0] = new Date(prayerDates[0].getTime() + 24 * 60 * 60 * 1000);
    }

    const activeIndex = (nextIndex - 1 + prayers.length) % prayers.length;
    const diffMs = prayerDates[nextIndex].getTime() - now.getTime();

    return {
      activePrayerIndex: activeIndex,
      countdown: formatCountdown(diffMs),
    };
  }, [prayers, now]);

  return {
    prayers,
    activePrayerIndex,
    countdown,
    city,
    loading,
  };
}

