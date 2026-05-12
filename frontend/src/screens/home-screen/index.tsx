import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { AppScreen } from '@/components/ui';
import { useThemeColor } from '@/hooks/use-theme-color';

import { styles } from './styles';

export default function HomeScreen() {
  const router = useRouter();
  const tint = useThemeColor({}, 'tint');
  const tintText = useThemeColor({}, 'tintText');

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

