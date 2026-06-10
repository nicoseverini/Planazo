import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { AuthButton, AuthCard, AuthInput } from '@/components/auth';
import { ThemedText } from '@/components/ThemedText';
import { AppScreen } from '@/components/ui';
import { useToken, decodeJwt } from '@/context/token-context';
import { validateLoginForm } from '@/models/auth';
import { loginUser } from '@/services/auth';

import { styles } from './styles';

const LOGIN_ERROR_MESSAGES: Record<string, string> = {
  AUTH_INVALID_CREDENTIALS: 'El correo electrónico o la contraseña son incorrectos.',
  AUTH_ACCOUNT_NOT_VERIFIED: 'Tu cuenta aún no ha sido verificada. Por favor, revisa tu correo electrónico.',
  AUTH_SERVER_ERROR: 'Hubo un problema en el servidor. Inténtalo de nuevo más tarde.',
  NETWORK_ERROR: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
};

export default function LoginScreen() {
  const router = useRouter();
  const { setTokenData } = useToken();
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
          const response = await loginUser({ email: email.trim(), password });
          const { role } = decodeJwt(response.accessToken);
          setTokenData({
            state: 'LOGGED_IN',
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            role,
          });
          Alert.alert('¡Bienvenido!', 'Sesión iniciada correctamente.');
          router.replace('/home');
        } catch (requestError: any) {
          if (requestError instanceof TypeError && requestError.message === 'Network request failed') {
            setError(LOGIN_ERROR_MESSAGES.NETWORK_ERROR);
            return;
          }

          const errorKey = requestError instanceof Error ? requestError.message : '';

          const friendlyMessage = LOGIN_ERROR_MESSAGES[errorKey] || 'Ocurrió un error inesperado al iniciar sesión.';

          setError(friendlyMessage);
        } finally {
          setLoading(false);
        }
  };

  return (
    <AppScreen centered scrollable>
      <View style={styles.shell}>
        <AuthCard kicker="Sign in" title="Sign in" body="Enter your verified email and password to continue.">
          <AuthInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
          <AuthInput label="Password" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" autoComplete="password" />
          <AuthButton label={loading ? 'Signing in...' : 'Sign in'} onPress={handleLogin} disabled={loading} />
          <Pressable onPress={() => router.push('/forgot-password')} style={styles.forgotPasswordLink}>
            <ThemedText lightColor="#000000" darkColor="#ffffff" style={styles.forgotPasswordText}>
              Forgot password
            </ThemedText>
          </Pressable>

          {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
        </AuthCard>
      </View>
      <View style={styles.footer}>
        <ThemedText>Don't have an account?</ThemedText>
        <Pressable onPress={() => router.push('/register')}>
          <ThemedText style={styles.link}>Sign up</ThemedText>
        </Pressable>
      </View>
    </AppScreen>
  );
}
