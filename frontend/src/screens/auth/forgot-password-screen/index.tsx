import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AuthButton, AuthCard, AuthInput } from '@/components/auth';
import { ThemedText } from '@/components/ThemedText';
import { AppScreen } from '@/components/ui';
import { useAppTheme } from '@/hooks/use-app-theme';
import { forgotPassword } from '@/services/auth';

import { styles } from './styles';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { surface, border, text: textColor } = useAppTheme();

  const handleSendRecoveryEmail = async () => {
    if (!email.trim()) {
      setError(t('error_email_required'));
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError(t('error_invalid_email'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await forgotPassword({ email: email.trim() });

      Alert.alert(t('email_sent'), t('email_sent_alert_desc'));
      setSuccess(true);

      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : t('error_send_email');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AppScreen centered scrollable>
        <View style={styles.shell}>
          <AuthCard kicker={t('recovery')} title={t('email_sent')} body={t('email_sent_body')}>
            <AuthButton label={t('back_to_login')} onPress={() => router.back()} />
          </AuthCard>
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen centered scrollable>
      <View style={styles.shell}>
        <View style={styles.backButtonWrapper}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: surface, borderColor: border },
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </Pressable>
        </View>
        <AuthCard
          kicker={t('recovery')}
          title={t('recover_password')}
          body={t('recover_password_desc')}
        >
          <AuthInput label={t('email')} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
          <AuthButton label={loading ? t('sending') : t('send_link')} onPress={handleSendRecoveryEmail} disabled={loading} />
          {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
        </AuthCard>
      </View>
    </AppScreen>
  );
}

