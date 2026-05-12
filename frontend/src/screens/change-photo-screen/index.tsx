import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView } from 'react-native';

import { AuthButton, AuthCard, AuthInput } from '@/components/auth';
import { ThemedText } from '@/components/ThemedText';
import { AppScreen } from '@/components/ui';

import { styles } from './styles';

// TODO: reemplazar con el token real obtenido al iniciar sesión
const PLACEHOLDER_ACCESS_TOKEN = '';

export default function ChangePhotoScreen() {
  const router = useRouter();
  const [photoUrl, setPhotoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    const trimmed = photoUrl.trim();

    if (!trimmed) {
      setError('Ingresá una URL de imagen');
      return;
    }

    if (!/^https?:\/\/.+/.test(trimmed)) {
      setError('La URL debe comenzar con http:// o https://');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const { updateProfile } = await import('@/services/user');
      await updateProfile(PLACEHOLDER_ACCESS_TOKEN, { photo: trimmed });
      Alert.alert('¡Listo!', 'Tu foto de perfil fue actualizada.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppScreen>
      <ScrollView
        contentContainerStyle={styles.wrapper}
        keyboardShouldPersistTaps="handled"
      >
        <AuthCard
          kicker="Perfil"
          title="Cambiar foto"
          body="Ingresá la URL de tu nueva foto de perfil."
        >
          <AuthInput
            label="URL de la imagen"
            placeholder="https://ejemplo.com/mi-foto.jpg"
            value={photoUrl}
            onChangeText={(text) => {
              setPhotoUrl(text);
              if (error) setError(null);
            }}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />

          {error ? (
            <ThemedText type="body" style={styles.error}>
              {error}
            </ThemedText>
          ) : null}

          <AuthButton
            label={loading ? 'Guardando...' : 'Guardar foto'}
            onPress={handleSave}
            disabled={loading}
          />

          <AuthButton
            label="Volver"
            onPress={() => router.back()}
            disabled={loading}
          />
        </AuthCard>
      </ScrollView>
    </AppScreen>
  );
}

