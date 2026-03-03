import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useThemePreference } from '@/contexts/theme-preference';

const WEEKDAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

// ─── FUNGSI HELPER: KONVERSI KE ANGKA ARAB ───
const toArabic = (num: number | string) => {
  return String(num).replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
};

// ─── FUNGSI HELPER: AMBIL DATA HIJRIAH DARI TANGGAL ───
function getHijriDetails(date: Date) {
  try {
    const formatter = new Intl.DateTimeFormat('id-ID-u-ca-islamic', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const parts = formatter.formatToParts(date);
    let day = 1, monthName = '', year = '';

    for (const p of parts) {
      if (p.type === 'day') day = parseInt(p.value, 10);
      if (p.type === 'month') monthName = p.value;
      if (p.type === 'year') year = p.value.replace(/[^0-9]/g, '');
    }
    return { day, monthName, year };
  } catch {
    // Fallback darurat kalau engine JS HP-nya gak support
    return { day: date.getDate(), monthName: 'Bulan', year: '1447' };
  }
}

// ─── GENERATOR KALENDER ───
function useHijriCalendarGrid(baseDate: Date) {
  return useMemo(() => {
    const currentHijri = getHijriDetails(baseDate);

    // Cari tanggal 1 di bulan Hijriah ini
    let firstDayDate = new Date(baseDate);
    while (getHijriDetails(firstDayDate).day > 1) {
      firstDayDate.setDate(firstDayDate.getDate() - 1);
    }

    // Generate hari-harinya
    const days = [];
    let current = new Date(firstDayDate);
    let i = 0;
    while (true) {
      const hd = getHijriDetails(current);
      // Stop kalau udah masuk bulan depan (Max 30 hari)
      if (hd.monthName !== currentHijri.monthName && i >= 28) break;
      
      days.push({
        date: new Date(current),
        hijriDay: hd.day,
        isToday: current.toDateString() === new Date().toDateString(),
      });
      current.setDate(current.getDate() + 1);
      i++;
    }

    // Nentuin hari apa tanggal 1 dimulai (0 = Senin, 6 = Minggu)
    let startWeekday = firstDayDate.getDay() - 1;
    if (startWeekday < 0) startWeekday = 6;

    // Isi slot kosong di awal bulan
    const grid: any[] = Array(startWeekday).fill(null).concat(days);

    // Bikin genap barisnya (kelipatan 7)
    const remainder = grid.length % 7;
    if (remainder !== 0) {
      grid.push(...Array(7 - remainder).fill(null));
    }

    return {
      monthName: currentHijri.monthName,
      year: currentHijri.year,
      grid,
      firstDayDate,
      nextMonthFirstDay: new Date(current), // Ini nyimpen tgl 1 bulan depannya
    };
  }, [baseDate]);
}

// ─── KOMPONEN UTAMA ───
export default function CalenderIslami() {
  const router = useRouter();
  const { resolvedTheme } = useThemePreference();
  const isDark = resolvedTheme === 'dark';

  const theme = useMemo(
    () => ({
      bg: isDark ? '#1A130B' : '#F7F1E8',
      text: isDark ? '#F6ECDD' : '#1C1408',
      muted: isDark ? '#CAB79C' : '#8A7255',
      surface: isDark ? '#2A1F12' : '#FFFDF5',
      softSurface: isDark ? '#332516' : '#FFF9ED',
      border: isDark ? '#4A3825' : '#EADBC0',
      gold: '#C68B2F',
      // Warna lingkaran hari ini ngikutin gambar lu
      todayCircle: isDark ? '#4A6966' : '#6E8E8A', 
      eventDot: '#E67E22',
    }),
    [isDark]
  );

  // State untuk navigasi bulan (Maju/Mundur)
  const [baseDate, setBaseDate] = useState(new Date());
  const calendar = useHijriCalendarGrid(baseDate);

  const handlePrevMonth = () => {
    const prev = new Date(calendar.firstDayDate);
    prev.setDate(prev.getDate() - 1); // Mundur 1 hari dari tgl 1 -> masuk bulan kemaren
    setBaseDate(prev);
  };

  const handleNextMonth = () => {
    setBaseDate(calendar.nextMonthFirstDay); // Langsung lompat ke tgl 1 bulan depan
  };

  // Teks Tanggal Hari Ini (Header)
  const todayHijriDetails = useMemo(() => getHijriDetails(new Date()), []);
  const gregorianTodayStr = useMemo(() => {
    return new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
  }, []);

  // Generator Event Palsu (Disesuaikan dengan tanggal)
  const monthEvents = useMemo(() => {
    const evs = [];
    const name = calendar.monthName.toLowerCase();
    if (name.includes('ramadan')) {
      evs.push({ day: 1, title: 'Awal Ramadan' });
      evs.push({ day: 17, title: 'Nuzulul Quran' });
    } else if (name.includes('syawal')) {
      evs.push({ day: 1, title: 'Idul Fitri' });
      evs.push({ day: 2, title: 'Puasa Sunnah Syawal' });
    } else {
      // Event default buat bulan lain (Ayyamul Bidh)
      evs.push({ day: 13, title: 'Puasa Ayyamul Bidh' });
      evs.push({ day: 14, title: 'Puasa Ayyamul Bidh' });
      evs.push({ day: 15, title: 'Puasa Ayyamul Bidh' });
    }
    return evs;
  }, [calendar.monthName]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top']}>
      
      {/* ─── TOP BAR ─── */}
      <View style={styles.topBarWrap}>
        <Pressable
          hitSlop={10}
          onPress={() => router.back()}
          style={[styles.backBtn, { borderColor: theme.border, backgroundColor: theme.surface }]}>
          <Ionicons name="chevron-back" size={20} color={theme.text} />
        </Pressable>
        <Text style={[styles.topBarTitle, { color: theme.text }]}>Kalender Hijriah</Text>
        <View style={styles.topBarSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* ─── CARD: HARI INI ─── */}
        <View style={[styles.todayCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.todayHeader}>
            <Text style={[styles.todayTitle, { color: theme.text }]}>Tanggal Hijriah Hari Ini</Text>
            <View style={[styles.iconCircle, { backgroundColor: theme.softSurface }]}>
              <MaterialCommunityIcons name="calendar-month" size={18} color={theme.muted} />
            </View>
          </View>
          <Text style={[styles.gregorianSub, { color: theme.muted }]}>{gregorianTodayStr}</Text>
          <Text style={[styles.hijriMain, { color: theme.text }]}>
            {gregorianTodayStr.split(',')[0]}, {toArabic(todayHijriDetails.day)} {todayHijriDetails.monthName} {toArabic(todayHijriDetails.year)} H
          </Text>
        </View>

        {/* ─── CARD: GRID KALENDER ─── */}
        <View style={[styles.calendarCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          
          {/* Header Navigasi Bulan */}
          <View style={styles.calendarNav}>
            <Pressable onPress={handlePrevMonth} hitSlop={15} style={styles.navBtn}>
              <Ionicons name="chevron-back" size={20} color={theme.muted} />
            </Pressable>
            <View style={styles.navCenter}>
              <Text style={[styles.monthLabel, { color: theme.text }]}>{calendar.monthName}</Text>
              <Text style={[styles.yearLabel, { color: theme.muted }]}>{toArabic(calendar.year)} هـ</Text>
            </View>
            <Pressable onPress={handleNextMonth} hitSlop={15} style={styles.navBtn}>
              <Ionicons name="chevron-forward" size={20} color={theme.muted} />
            </Pressable>
          </View>

          {/* Baris Nama Hari */}
          <View style={styles.weekdayRow}>
            {WEEKDAYS.map((day) => (
              <Text key={day} style={[styles.weekdayText, { color: theme.text }]}>
                {day}
              </Text>
            ))}
          </View>

          {/* Kotak Tanggal */}
          <View style={styles.gridWrap}>
            {calendar.grid.map((cell, index) => {
              if (!cell) {
                return <View key={`empty-${index}`} style={styles.cellBox} />;
              }

              // Cek apakah tanggal ini punya event
              const hasEvent = monthEvents.some((e) => e.day === cell.hijriDay);

              return (
                <View key={`day-${cell.hijriDay}-${index}`} style={styles.cellBox}>
                  <View
                    style={[
                      styles.cellCircle,
                      { backgroundColor: theme.softSurface },
                      cell.isToday && { backgroundColor: theme.todayCircle },
                    ]}>
                    <Text style={[styles.cellText, { color: cell.isToday ? '#FFFFFF' : theme.text }]}>
                      {toArabic(cell.hijriDay)}
                    </Text>
                  </View>
                  {/* Titik Orange kalau ada event */}
                  {hasEvent && <View style={[styles.eventDot, { backgroundColor: theme.eventDot }]} />}
                </View>
              );
            })}
          </View>
        </View>

        {/* ─── CARD: LIST EVENT BULAN INI ─── */}
        <View style={[styles.eventCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.eventSectionTitle, { color: theme.text }]}>Peringatan Bulan Ini</Text>
          
          <View style={styles.eventList}>
            {monthEvents.length > 0 ? (
              monthEvents.map((ev, i) => (
                <View key={i} style={styles.eventRow}>
                  <Text style={[styles.eventRowNumber, { color: theme.text }]}>{toArabic(ev.day)}</Text>
                  <Text style={[styles.eventRowName, { color: theme.muted }]}>{ev.title}</Text>
                </View>
              ))
            ) : (
              <Text style={{ color: theme.muted, fontSize: 14 }}>Tidak ada peringatan di bulan ini.</Text>
            )}
          </View>

          <Text style={[styles.eventFooter, { color: theme.muted, borderTopColor: theme.border }]}>
            Catatan: tanggal peringatan dapat berbeda sesuai penetapan resmi.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBarWrap: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'serif',
  },
  topBarSpacer: {
    width: 38,
    height: 38,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    gap: 16,
    paddingTop: 8,
  },

  // ─── TODAY CARD ───
  todayCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  todayTitle: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'serif',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gregorianSub: {
    fontSize: 13,
    marginTop: 8,
    marginBottom: 16,
  },
  hijriMain: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'serif',
  },

  // ─── CALENDAR GRID CARD ───
  calendarCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  calendarNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navCenter: {
    alignItems: 'center',
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'serif',
  },
  yearLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
  },
  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cellBox: {
    width: '14.28%', // 100% / 7 kolom
    height: 48,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 8,
  },
  cellCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellText: {
    fontSize: 16,
    fontFamily: 'serif',
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },

  // ─── EVENT LIST CARD ───
  eventCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  eventSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'serif',
    marginBottom: 16,
  },
  eventList: {
    gap: 12,
    marginBottom: 20,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  eventRowNumber: {
    fontSize: 16,
    fontFamily: 'serif',
    width: 24,
  },
  eventRowName: {
    fontSize: 14,
  },
  eventFooter: {
    fontSize: 11,
    borderTopWidth: 1,
    paddingTop: 12,
  },
});
