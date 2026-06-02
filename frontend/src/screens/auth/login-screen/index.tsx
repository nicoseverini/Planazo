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
      Alert.alert('Signed in', 'Your credentials were accepted.');
      router.replace('/home');
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Unable to sign in';
      setError(message);
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
    </AppScreen>
  );
}
