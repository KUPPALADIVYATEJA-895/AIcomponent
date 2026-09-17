import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppTheme } from '../types';

interface ThemeInfo {
  id: AppTheme;
  name: string;
  subtitle: string;
  badge: string;
  bgHex: string;
  accentHex: string;
  secondaryHex: string;
}

export const THEME_CONFIGS: Record<AppTheme, ThemeInfo> = {
  'industrial-studio': {
    id: 'industrial-studio',
    name: 'The Industrial Studio',
    subtitle: 'Muted Warm Slate & Burnt Copper',
    badge: 'HARDWARE BENCH',
    bgHex: '#2B303A',
    accentHex: '#E28743', // Structural muted copper orange
    secondaryHex: '#EAD7C3', // Warm birch sand
  },
  'graphite-emerald': {
    id: 'graphite-emerald',
    name: 'Graphite & Emerald Telemetry',
    subtitle: 'Matte Charcoal Steel & Operational Emerald',
    badge: 'TELEMETRY CONSOLE',
    bgHex: '#161A1D',
    accentHex: '#10B981', // Operational Emerald
    secondaryHex: '#E5E7EB', // Crisp silver
  },
  'tactical-hazard': {
    id: 'tactical-hazard',
    name: 'Tactical Hazard (Black & Safety Yellow)',
    subtitle: 'Pitch Black, Safety Yellow & Crisp White',
    badge: 'HAZARD SPECS',
    bgHex: '#0A0A0B',
    accentHex: '#FACC15', // High-voltage safety yellow
    secondaryHex: '#FFFFFF', // Crisp titanium white
  },
  'pixel-monochrome-light': {
    id: 'pixel-monochrome-light',
    name: 'Crisp Pixel B&W Light',
    subtitle: 'Stark Paper White, Jet Black & Pixel Dither Grid',
    badge: 'PIXEL TELEMETRY',
    bgHex: '#FAFAFA',
    accentHex: '#000000', // Crisp Jet Black
    secondaryHex: '#18181B', // Pure Onyx
  },
  'monochrome-amber': {
    id: 'monochrome-amber',
    name: 'Monochrome Aerospace',
    subtitle: 'Dark Gunmetal, Warm Amber & Parchment',
    badge: 'FLIGHT LOG',
    bgHex: '#1A1C23',
    accentHex: '#F59E0B', // Warm Amber
    secondaryHex: '#F3F4F6', // Parchment White
  },
};

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  isIndustrial: boolean;
  isHazard: boolean;
  isEmerald: boolean;
  isMonochrome: boolean;
  isPixelLight: boolean;
  themeConfig: ThemeInfo;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'aura_spacecraft_theme_v4';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to 'pixel-monochrome-light'
  const [theme, setThemeState] = useState<AppTheme>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (
        stored === 'pixel-monochrome-light' ||
        stored === 'industrial-studio' ||
        stored === 'graphite-emerald' ||
        stored === 'tactical-hazard' ||
        stored === 'monochrome-amber'
      ) {
        return stored;
      }
    } catch {
      // ignore
    }
    return 'pixel-monochrome-light';
  });

  const setTheme = (nextTheme: AppTheme) => {
    setThemeState(nextTheme);
    try {
      localStorage.setItem(STORAGE_KEY, nextTheme);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'pixel-monochrome-light') {
      document.body.style.backgroundColor = '#FAFAFA';
      document.body.style.color = '#09090B';
    } else if (theme === 'tactical-hazard') {
      document.body.style.backgroundColor = '#0A0A0B';
      document.body.style.color = '#FFFFFF';
    } else if (theme === 'graphite-emerald') {
      document.body.style.backgroundColor = '#161A1D';
      document.body.style.color = '#E5E7EB';
    } else if (theme === 'monochrome-amber') {
      document.body.style.backgroundColor = '#1A1C23';
      document.body.style.color = '#F3F4F6';
    } else {
      document.body.style.backgroundColor = '#2B303A';
      document.body.style.color = '#EAD7C3';
    }
  }, [theme]);

  const value: ThemeContextType = {
    theme,
    setTheme,
    isIndustrial: theme === 'industrial-studio',
    isHazard: theme === 'tactical-hazard',
    isEmerald: theme === 'graphite-emerald',
    isMonochrome: theme === 'monochrome-amber',
    isPixelLight: theme === 'pixel-monochrome-light',
    themeConfig: THEME_CONFIGS[theme] || THEME_CONFIGS['pixel-monochrome-light'],
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
