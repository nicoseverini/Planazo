import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AuthButton, AuthCard, AuthInput } from '@/components/auth';
import { ThemedText } from '@/components/ThemedText';
import { AppScreen } from '@/components/ui';
import { useToken } from '@/context/token-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { validateLoginForm } from '@/models/auth';
import { loginUser } from '@/services/auth';
import i18n from '@/config/i18n';

import { styles } from './styles';

const LOGIN_ERROR_MESSAGES: Record<string, string> = {
  AUTH_FAILURE: 'auth_failure',
  AUTH_SERVER_ERROR: 'auth_server_error',
  NETWORK_ERROR: 'network_error',
};

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useTranslation();
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
          const preferredLanguage = response.user?.preferredLanguage || 'en';
          await i18n.changeLanguage(preferredLanguage);

          setTokenData({
            state: 'LOGGED_IN',
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
          });
          Alert.alert(t('welcome'), t('login_success'));
          router.replace('/home');
        } catch (requestError: any) {
          if (requestError instanceof TypeError && requestError.message === 'Network request failed') {
            setError(t(LOGIN_ERROR_MESSAGES.NETWORK_ERROR));
            return;
          }

      const errorKey = requestError instanceof Error ? requestError.message : '';

      const friendlyMessage = LOGIN_ERROR_MESSAGES[errorKey] ? t(LOGIN_ERROR_MESSAGES[errorKey]) : t('something_went_wrong');

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
        <AuthCard kicker={t('sign_in')} title={t('sign_in')} body={t('enter_credentials_desc')}>
          <AuthInput label={t('email')} value={email} onChangeText={(v) => { setEmail(v); setError(null); }} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
          <View style={{ position: 'relative' }}>
            <AuthInput label={t('password')} value={password} onChangeText={(v) => { setPassword(v); setError(null); }} secureTextEntry={!showPassword} autoCapitalize="none" autoComplete="password"/>
            <Pressable onPress={() => setShowPassword(!showPassword)} style={{position: 'absolute', right: 12, top: 42, zIndex: 1,}}>
              <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color="gray"/>
            </Pressable>
          </View>
          <AuthButton label={loading ? t('signing_in') : t('sign_in')} onPress={handleLogin} disabled={loading} />
          <Pressable onPress={() => router.push('/forgot-password')} style={styles.forgotPasswordLink}>
            <ThemedText lightColor="#000000" darkColor="#ffffff" style={styles.forgotPasswordText}>
              {t('forgot_password')}
            </ThemedText>
          </Pressable>
          <Pressable onPress={() => router.push('/resend-verification')} style={styles.forgotPasswordLink}>
            <ThemedText lightColor="#000000" darkColor="#ffffff" style={styles.forgotPasswordText}>
              {t('resend_verification_email')}
            </ThemedText>
          </Pressable>

          {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
        </AuthCard>
      </View>
      <View style={styles.footer}>
        <ThemedText>{t('dont_have_account')}</ThemedText>
        <Pressable onPress={() => router.push('/register')}>
          <ThemedText style={styles.link}>{t('sign_up')}</ThemedText>
        </Pressable>
      </View>
    </AppScreen>
  );
}
