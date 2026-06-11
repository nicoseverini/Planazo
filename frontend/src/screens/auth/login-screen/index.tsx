import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { AuthButton, AuthCard, AuthInput } from '@/components/auth';
import { ThemedText } from '@/components/ThemedText';
import { AppScreen } from '@/components/ui';
import { useToken, decodeJwt } from '@/context/token-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { validateLoginForm } from '@/models/auth';
import { loginUser } from '@/services/auth';

import { styles } from './styles';

const LOGIN_ERROR_MESSAGES: Record<string, string> = {
  AUTH_INVALID_CREDENTIALS: 'Invalid credentials: email or password wrong.',
  AUTH_ACCOUNT_NOT_VERIFIED: 'Your account hasn\'t been verified, please check your emails.',
  AUTH_SERVER_ERROR: 'Server error. Please try again later.',
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
};

export default function LoginScreen() {
  const router = useRouter();
  const { setTokenData } = useToken();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

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
          Alert.alert('¡Welcome!', 'Session started successfully.');
          router.replace('/home');
        } catch (requestError: any) {
          if (requestError instanceof TypeError && requestError.message === 'Network request failed') {
            setError(LOGIN_ERROR_MESSAGES.NETWORK_ERROR);
            return;
          }

          const errorKey = requestError instanceof Error ? requestError.message : '';

          const friendlyMessage = LOGIN_ERROR_MESSAGES[errorKey] || 'Something went wrong, please try again later.';

          setError(friendlyMessage);
        } finally {
          setLoading(false);
        }
  };

  const textColor = useThemeColor({}, 'text');

  const goBack = () => {
    router.dismissAll();
    router.replace('/');
  };

  return (
    <AppScreen centered scrollable>
      <View style={styles.shell}>
        <View style={styles.backButtonWrapper}>
          <Pressable onPress={goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </Pressable>
        </View>
        <AuthCard kicker="Sign in" title="Sign in" body="Enter your verified email and password to continue.">
          <AuthInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
          <View style={{ position: 'relative' }}>
            <AuthInput label="Password" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} autoCapitalize="none" autoComplete="password"/>
            <Pressable onPress={() => setShowPassword(!showPassword)} style={{position: 'absolute', right: 12, top: 42, zIndex: 1,}}>
              <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color="gray"/>
            </Pressable>
          </View>
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
