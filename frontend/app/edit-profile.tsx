import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppScreen } from '@/components/ui/app-screen';
import { Layout } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function EditProfile() {
  const router = useRouter();
  const tint = useThemeColor({}, 'tint');
  const tintText = useThemeColor({}, 'tintText');
  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'border');

  return (
    <AppScreen centered>
      <View style={styles.center}>
        <ThemedText type="heading">Editar perfil</ThemedText>
        <ThemedText type="body" style={styles.subtitle}>
          ¿Qué querés modificar?
        </ThemedText>
      </View>

      <View style={styles.bottom}>
        <Pressable
          onPress={() => router.push('/change-photo')}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: tint },
            pressed && styles.pressed,
          ]}
        >
          <ThemedText type="buttonLarge" lightColor={tintText} darkColor={tintText} style={styles.buttonText}>
            Cambiar foto de perfil
          </ThemedText>
        </Pressable>

        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.buttonSecondary,
            { borderColor: border, backgroundColor: surface },
            pressed && styles.pressed,
          ]}
        >
          <ThemedText type="buttonMedium" style={styles.buttonText}>
            Volver
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
  buttonSecondary: {
    paddingVertical: 14,
    borderRadius: Layout.buttonRadius,
    borderWidth: StyleSheet.hairlineWidth,
  },
  buttonText: {
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
});
