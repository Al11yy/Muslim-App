import { useThemePreference } from '@/contexts/theme-preference';
import { useMemo } from 'react';

/**
 * Shared theme hook that provides all colors used across the app.
 * Eliminates duplicated useMemo theme blocks in every screen.
 */
export function useAppTheme() {
  const { resolvedTheme } = useThemePreference();
  const isDark = resolvedTheme === 'dark';

  const theme = useMemo(
    () =>
      isDark
        ? {
            // ─── Common ───
            bg: '#1A130B',
            text: '#F6ECDD',
            muted: '#CAB79C',
            surface: '#2A1F12',
            softSurface: '#332516',
            border: '#4A3825',
            gold: '#C68B2F',
            goldSoft: 'rgba(198,139,47,0.22)',

            // ─── Home ───
            card: '#2A1F12',
            cardSoft: '#312414',
            cardBorder: '#4A3825',
            prayerText: '#F5E3C7',
            bodyText: '#E6D5BD',

            // ─── Quran / Detail ───
            overlay: 'rgba(0,0,0,0.3)',

            // ─── Detail Surat ───
            activeBg: '#3A2814',
            activeBorder: '#6A4B25',
            detailGoldSoft: '#A96F30',

            // ─── Settings ───
            pageBg: '#14110D',
            cardBg: '#211A13',
            textPrimary: '#F2E7D7',
            textSecondary: '#BFA88C',
            accent: '#D8A24A',
            iconMuted: '#A38D70',
            rowDivider: '#352A20',
            switchTrackOn: '#6E532C',
            switchTrackOff: '#4E4032',
            switchThumbOn: '#D8A24A',
            switchThumbOff: '#E2D3BF',
            tabBg: '#2A2118',
            tabActiveBg: '#D8A24A',
            tabText: '#DCC8B0',
            actionBg: '#2B2117',
            actionText: '#F0DFC7',
            dangerBg: '#4B251F',
            dangerText: '#FFD5CE',
            statPillBg: '#2F2419',
          }
        : {
            // ─── Common ───
            bg: '#F7F1E8',
            text: '#1A1209',
            muted: '#8A7255',
            surface: '#FFFDF5',
            softSurface: 'rgba(255,255,255,0.7)',
            border: '#E5D3B8',
            gold: '#C68B2F',
            goldSoft: 'rgba(198,139,47,0.12)',

            // ─── Home ───
            card: '#FFFDF5',
            cardSoft: '#FFF9ED',
            cardBorder: '#EDDFC4',
            prayerText: '#6D4D2A',
            bodyText: '#5C3D1E',

            // ─── Quran / Detail ───
            overlay: 'rgba(0,0,0,0.08)',

            // ─── Detail Surat ───
            activeBg: '#FFF4DE',
            activeBorder: '#E3CDAA',
            detailGoldSoft: '#B77836',

            // ─── Settings ───
            pageBg: '#F7F1E8',
            cardBg: '#FFFDF5',
            textPrimary: '#1C1408',
            textSecondary: '#7E6446',
            accent: '#C68B2F',
            iconMuted: '#C6B29A',
            rowDivider: '#EFE3D0',
            switchTrackOn: '#DDBA82',
            switchTrackOff: '#DCCBB0',
            switchThumbOn: '#C68B2F',
            switchThumbOff: '#F5EFE4',
            tabBg: '#EFE3D0',
            tabActiveBg: '#C68B2F',
            tabText: '#7D664B',
            actionBg: '#F8EEDA',
            actionText: '#6F4D24',
            dangerBg: '#FDE6E2',
            dangerText: '#A33E31',
            statPillBg: '#F5E9D1',
          },
    [isDark]
  );

  return { ...theme, isDark, resolvedTheme };
}

export type AppTheme = ReturnType<typeof useAppTheme>;
