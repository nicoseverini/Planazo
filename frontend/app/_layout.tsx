import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '@/config/i18n';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { TokenProvider } from '@/context/token-context';


export default function RootLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;
  const colors = Colors[colorScheme];

  return (
    <ThemeProvider
      value={{
        ...theme,
        colors: {
          ...theme.colors,
          background: colors.background,
          card: colors.surface,
          text: colors.text,
          border: colors.border,
          primary: colors.tint,
          notification: colors.tint,
        },
      }}
    >
      <TokenProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'none',
            contentStyle: {
              backgroundColor: colors.background,
            },
          }}
        />
      </TokenProvider>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}