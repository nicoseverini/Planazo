import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { AppScreen } from '@/components/ui';
import { useThemeColor } from '@/hooks/use-theme-color';

import { styles } from './styles';

export default function EditProfileScreen() {
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

