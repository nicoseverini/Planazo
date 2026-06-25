import { useColorScheme as useNativeColorScheme } from 'react-native';
import { useAppThemeContext } from '@/context/ThemeContext';

export function useColorScheme(): 'light' | 'dark' {
  try {
    const { theme } = useAppThemeContext();
    return theme;
  } catch {
    // Fallback to system scheme if context is not yet available
    return useNativeColorScheme() ?? 'light';
  }
}
