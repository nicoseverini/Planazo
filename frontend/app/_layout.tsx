import React from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '@/config/i18n';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { TokenProvider } from '@/context/token-context';
import { ThemeProvider, useAppThemeContext } from '@/context/ThemeContext';
import { ToastProvider } from '@/components/Toast';

function AppRootContent() {
  const { theme } = useAppThemeContext();
  const colors = Colors[theme];
  const navigationTheme = theme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <NavigationThemeProvider
      value={{
        ...navigationTheme,
        colors: {
          ...navigationTheme.colors,
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
        <ToastProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'none',
            contentStyle: {
              backgroundColor: colors.background,
            },
          }}
        />
        </ToastProvider>
      </TokenProvider>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppRootContent />
    </ThemeProvider>
  );
}