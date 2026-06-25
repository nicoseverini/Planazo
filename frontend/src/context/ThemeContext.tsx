import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert, useColorScheme as useNativeColorScheme, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/theme';

export type ThemeMode = 'light' | 'dark' | 'system';

type ThemeContextType = {
  themeMode: ThemeMode;
  theme: 'light' | 'dark';
  colors: typeof Colors.light;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@planazo_theme_mode';
const MEMORY_STORAGE = new Map<string, string>();
let storageAvailable: boolean | null = null;

async function canUseAsyncStorage() {
  if (storageAvailable !== null) {
    return storageAvailable;
  }
  try {
    if (Platform.OS === 'web') {
      storageAvailable = false;
      return false;
    }
    await AsyncStorage.getItem('__storage_test__');
    storageAvailable = true;
  } catch {
    storageAvailable = false;
  }
  return storageAvailable;
}

async function getItemSafe(key: string): Promise<string | null> {
  if (await canUseAsyncStorage()) {
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      // fallback
    }
  }
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem(key);
  }
  return MEMORY_STORAGE.get(key) ?? null;
}

async function setItemSafe(key: string, value: string): Promise<void> {
  if (await canUseAsyncStorage()) {
    try {
      await AsyncStorage.setItem(key, value);
      return;
    } catch {
      // fallback
    }
  }
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(key, value);
    return;
  }
  MEMORY_STORAGE.set(key, value);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useNativeColorScheme() ?? 'light';
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    async function loadTheme() {
      try {
        const stored = await getItemSafe(THEME_STORAGE_KEY);
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          setThemeModeState(stored);
        }
      } catch (err) {
        Alert.alert('Error', 'Could not load your theme preferences.');
      }
    }
    loadTheme();
  }, []);

  const theme: 'light' | 'dark' = themeMode === 'system' ? systemColorScheme : themeMode;
  const colors = Colors[theme];

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      setThemeModeState(mode);
      await setItemSafe(THEME_STORAGE_KEY, mode);
    } catch (err) {
      Alert.alert('Error', 'Could not save your theme preferences.');
    }
  };

  const toggleTheme = async () => {
    const nextMode: ThemeMode = theme === 'light' ? 'dark' : 'light';
    await setThemeMode(nextMode);
  };

  return (
    <ThemeContext.Provider value={{ themeMode, theme, colors, setThemeMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppThemeContext must be used within a ThemeProvider');
  }
  return context;
}
