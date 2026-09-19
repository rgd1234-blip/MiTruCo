import { ThemeConfig, ThemePreset } from '../types';

export const THEME_PRESETS: Record<ThemePreset, { name: string; light: ThemeConfig; dark: ThemeConfig }> = {
  'royal-ivory-coral': {
    name: 'Royal Ivory & Coral',
    light: {
      preset: 'royal-ivory-coral',
      isDark: false,
      accentColor: '#D97736', // Coral
      secondaryAccent: '#E28C52', // Soft Coral
      bgBase: '#FAF8F5', // Warm Ivory
      surfaceBase: '#F3EDE2', // Muted Sand
      textBase: '#1F1B16',
      textMuted: '#6B6358',
      borderBase: '#EAE0D0', // Deep Sand
    },
    dark: {
      preset: 'royal-ivory-coral',
      isDark: true,
      accentColor: '#E28C52',
      secondaryAccent: '#D97736',
      bgBase: '#121417',
      surfaceBase: '#1A1E24',
      textBase: '#F7F4EF',
      textMuted: '#A09C94',
      borderBase: '#2C323B',
    },
  },
  'mystic-plum-slate': {
    name: 'Mystic Plum & Slate',
    light: {
      preset: 'mystic-plum-slate',
      isDark: false,
      accentColor: '#7E7495', // Lavender
      secondaryAccent: '#C47B89', // Dusty Rose
      bgBase: '#FAF7F9',
      surfaceBase: '#F2ECF3',
      textBase: '#1A1520',
      textMuted: '#665C6D',
      borderBase: '#E3D9E5',
    },
    dark: {
      preset: 'mystic-plum-slate',
      isDark: true,
      accentColor: '#9C90B5',
      secondaryAccent: '#C47B89',
      bgBase: '#0F1318', // Ocean Slate
      surfaceBase: '#1E1A24', // Muted Plum
      textBase: '#F4EFF7',
      textMuted: '#9B92A4',
      borderBase: '#2E2738',
    },
  },
  'sage-meadow': {
    name: 'Sage Meadow',
    light: {
      preset: 'sage-meadow',
      isDark: false,
      accentColor: '#5E7A68', // Sage
      secondaryAccent: '#8BA695',
      bgBase: '#F8FAF8',
      surfaceBase: '#EDF2EE',
      textBase: '#15201A',
      textMuted: '#526359',
      borderBase: '#D8E2DA',
    },
    dark: {
      preset: 'sage-meadow',
      isDark: true,
      accentColor: '#7E9F8A',
      secondaryAccent: '#5E7A68',
      bgBase: '#101713',
      surfaceBase: '#18241D',
      textBase: '#EEF5F0',
      textMuted: '#8E9E94',
      borderBase: '#26382D',
    },
  },
  'desert-amber': {
    name: 'Desert Amber',
    light: {
      preset: 'desert-amber',
      isDark: false,
      accentColor: '#C87D32',
      secondaryAccent: '#D97736',
      bgBase: '#FAF8F4',
      surfaceBase: '#F5EFE6',
      textBase: '#221911',
      textMuted: '#6E5F52',
      borderBase: '#E8DCCF',
    },
    dark: {
      preset: 'desert-amber',
      isDark: true,
      accentColor: '#E0984E',
      secondaryAccent: '#C87D32',
      bgBase: '#14110E',
      surfaceBase: '#211B15',
      textBase: '#FAF4ED',
      textMuted: '#9E9083',
      borderBase: '#362C22',
    },
  },
};
