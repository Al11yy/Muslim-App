import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ComponentProps } from 'react';

type MenuIcon = ComponentProps<typeof MaterialCommunityIcons>['name'];

export type FeatureMenuItem = {
  id: string;
  title: string;
  icon: MenuIcon;
  route: `/${string}`;
  description?: string;
  section: 'quick' | 'extra';
};

export const HOME_QUICK_MENU: FeatureMenuItem[] = [
  { id: 'quran', title: 'Al-Quran', icon: 'book-open-page-variant', route: '/Quran', section: 'quick' },
  { id: 'doa', title: 'Doa Harian', icon: 'hands-pray', route: '/Doa_harian', section: 'quick' },
  { id: 'dzikir', title: 'Dzikir', icon: 'heart-outline', route: '/Dzikir', section: 'quick' },
  { id: 'hadits', title: 'Hadits', icon: 'script-text-outline', route: '/Hadits', section: 'quick' },
  { id: 'kiblat', title: 'Arah Kiblat', icon: 'compass-outline', route: '/Arah_kiblat', section: 'quick' },
  { id: 'asmaul', title: 'Asmaul Husna', icon: 'star-crescent', route: '/Asmaul_husna', section: 'quick' },
  { id: 'more', title: 'More', icon: 'dots-grid', route: '/More', section: 'quick' },
];

export const MORE_MENU_ITEMS: FeatureMenuItem[] = [
  { id: 'quran', title: 'Al-Quran', icon: 'book-open-page-variant', route: '/Quran', section: 'quick', description: 'Baca surat, juz, dan penanda bacaan terakhir.' },
  { id: 'doa', title: 'Doa Harian', icon: 'hands-pray', route: '/Doa_harian', section: 'quick', description: 'Kumpulan doa harian lengkap dengan terjemahan.' },
  { id: 'dzikir', title: 'Dzikir', icon: 'heart-outline', route: '/Dzikir', section: 'quick', description: 'Dzikir pagi, petang, dan dzikir umum.' },
  { id: 'hadits', title: 'Hadits', icon: 'script-text-outline', route: '/Hadits', section: 'quick', description: 'Koleksi hadits pilihan untuk pengingat harian.' },
  { id: 'kiblat', title: 'Arah Kiblat', icon: 'compass-outline', route: '/Arah_kiblat', section: 'quick', description: 'Temukan arah kiblat dari lokasi saat ini.' },
  { id: 'asmaul', title: 'Asmaul Husna', icon: 'star-crescent', route: '/Asmaul_husna', section: 'quick', description: '99 nama Allah dengan makna dan manfaat.' },
  { id: 'kalender', title: 'Kalender Hijriah', icon: 'calendar-month-outline', route: '/calender_islami', section: 'extra', description: 'Lihat tanggal hijriah dan momentum Islam.' },
  { id: 'donasi', title: 'Donasi', icon: 'hand-heart-outline', route: '/Donasi', section: 'extra', description: 'Salurkan infaq/sedekah dengan cepat.' },
  { id: 'zakat', title: 'Calculator Zakat', icon: 'calculator-variant-outline', route: '/calculator_zakat', section: 'extra', description: 'Hitung estimasi zakat mal secara otomatis.' },
  { id: 'tasbih', title: 'Tasbih Digital', icon: 'counter', route: '/tasbih_digital', section: 'extra', description: 'Hitung dzikir dengan counter digital.' },
  { id: 'checklist', title: 'Checklist Ibadah', icon: 'check-decagram-outline', route: '/checklist_ibadah', section: 'extra', description: 'Pantau konsistensi ibadah harianmu.' },
];
