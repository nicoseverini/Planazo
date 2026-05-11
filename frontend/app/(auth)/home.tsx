import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppScreen } from '@/components/ui/app-screen';
import { Layout } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function Home() {
  const router = useRouter();
  const tint = useThemeColor({}, 'tint');
  const tintText = useThemeColor({}, 'tintText');
  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'border');

  return (
    <AppScreen centered>
      <View style={styles.center}>
        <ThemedText type="heading">¡Bienvenido!</ThemedText>
        <ThemedText type="body" style={styles.subtitle}>
          Estás dentro de la app.
        </ThemedText>
      </View>

      <View style={styles.bottom}>
        <Pressable
          onPress={() => router.push('/edit-profile')}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: tint },
            pressed && styles.pressed,
          ]}
        >
          <ThemedText type="buttonLarge" lightColor={tintText} darkColor={tintText} style={styles.buttonText}>
            Editar perfil
          </ThemedText>
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
    gap: 12,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.6,
  },
  bottom: {
    paddingBottom: 100,
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    borderRadius: Layout.buttonRadius,
  },
  buttonText: {
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
});
