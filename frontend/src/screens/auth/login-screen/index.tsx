import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { AuthButton, AuthCard, AuthInput } from '@/components/auth';
import { ThemedText } from '@/components/ThemedText';
import { AppScreen } from '@/components/ui';
import { validateLoginForm } from '@/models/auth';
import { loginUser } from '@/services/auth';

import { styles } from './styles';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    const validationError = validateLoginForm({ email, password });
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await loginUser({ email: email.trim(), password });
      Alert.alert('Sesión iniciada', 'Tus credenciales fueron aceptadas.');
      router.replace('/home');
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'No se pudo iniciar sesión';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppScreen centered scrollable>
      <View style={styles.shell}>
        <AuthCard kicker="Acceso" title="Iniciar sesión" body="Ingresá con tu correo y contraseña para continuar.">
          <AuthInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
          <AuthInput label="Contraseña" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" autoComplete="password" />
          <AuthButton label={loading ? 'Ingresando...' : 'Entrar'} onPress={handleLogin} disabled={loading} />
          <Pressable onPress={() => router.push('/forgot-password')} style={styles.forgotPasswordLink}>
            <ThemedText lightColor="#000000" darkColor="#ffffff" style={styles.forgotPasswordText}>
              Me olvidé la contraseña
            </ThemedText>
          </Pressable>

          {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
        </AuthCard>
      </View>
    </AppScreen>
  );
}

