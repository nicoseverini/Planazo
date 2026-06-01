import { useRouter } from 'expo-router';
import { Image, Pressable, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { AppScreen } from '@/components/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';

import { styles } from './styles';

export default function LandingScreen() {
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
              ? require('../../../assets/images/icon.png')
              : require('../../../assets/images/icon_white.png')
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
          onPress={() => router.push('/(auth)/login')}
          style={({ pressed }) => [
            styles.buttonPrimary,
            { backgroundColor: tint },
            pressed && styles.pressed,
          ]}
        >
          <ThemedText type="buttonLarge" lightColor={tintText} darkColor={tintText} style={styles.buttonPrimaryText}>Iniciar sesión</ThemedText>
        </Pressable>

        <Pressable
          onPress={() => router.push('/(auth)/register')}
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

