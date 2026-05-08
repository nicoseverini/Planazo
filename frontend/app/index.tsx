import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppScreen } from '@/components/ui/app-screen';
import { Layout } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function Landing() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const background = useThemeColor({}, 'background');
  const surface = useThemeColor({}, 'surface');
  const tint = useThemeColor({}, 'tint');
  const tintText = useThemeColor({}, 'tintText');
  const borderColor = useThemeColor({}, 'border');

  return (
    <AppScreen centered style={{ backgroundColor: background }}>
      <View style={styles.center}>
        <Image
          source={
            colorScheme === 'dark'
              ? require('../assets/images/icon.png')
              : require('../assets/images/icon_white.png')
          }
          style={styles.logo}
          resizeMode="contain"
        />

        <ThemedText type="heading" style={styles.titleContainer}>Bienvenido</ThemedText>
        <ThemedText type="body" style={styles.subtitle}>
          Iniciá sesión o creá una cuenta para continuar.
        </ThemedText>
      </View>

      <View style={styles.bottom}>
        <Pressable
          onPress={() => router.push("/(auth)/login")}
          style={({ pressed }) => [
            styles.buttonPrimary,
            { backgroundColor: tint },
            pressed && styles.pressed,
          ]}
        >
          <ThemedText type="buttonLarge" lightColor={tintText} darkColor={tintText} style={styles.buttonPrimaryText}>Iniciar sesión</ThemedText>
        </Pressable>

        <Pressable
          onPress={() => router.push("/(auth)/register")}
          style={({ pressed }) => [
            styles.buttonSecondary,
            { backgroundColor: surface, borderColor },
            pressed && styles.pressed,
          ]}
        >
          <ThemedText type="buttonMedium" style={styles.buttonSecondaryText}>Registrarme</ThemedText>
        </Pressable>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  logo: {
    width: 300,
    height: 300,
    marginBottom: 2,
  },

  titleContainer: {
    marginBottom: 8,
  },

  subtitle: {
    textAlign: 'center',
    maxWidth: 260,
  },

  bottom: {
    paddingBottom: 100,
    gap: 12,
  },

  buttonPrimary: {
    paddingVertical: 14,
    borderRadius: Layout.buttonRadius,
  },

  buttonSecondary: {
    paddingVertical: 14,
    borderRadius: Layout.buttonRadius,
    borderWidth: StyleSheet.hairlineWidth,
  },

  buttonPrimaryText: {
    textAlign: 'center',
  },

  buttonSecondaryText: {
    textAlign: 'center',
  },

  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
});