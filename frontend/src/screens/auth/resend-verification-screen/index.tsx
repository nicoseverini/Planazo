import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AuthButton, AuthCard, AuthInput } from '@/components/auth';
import { ThemedText } from '@/components/ThemedText';
import { AppScreen } from '@/components/ui';
import { useAppTheme } from '@/hooks/use-app-theme';
import { resendVerificationEmail } from '@/services/auth';

import { styles } from '../forgot-password-screen/styles';

export default function ResendVerificationScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { surface, border, text: textColor } = useAppTheme();

  const handleResend = async () => {
    if (!email.trim()) {
      setError('error_email_required');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('error_invalid_email');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await resendVerificationEmail({ email: email.trim() });
    } catch {
      // Errors are swallowed to prevent user enumeration.
      // The success screen is always shown regardless of the outcome.
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <AppScreen centered scrollable>
        <View style={styles.shell}>
          <AuthCard
            kicker={t('verification_kicker')}
            title={t('check_inbox')}
            body={t('resend_success_body')}
          >
            <AuthButton label={t('back_to_sign_in')} onPress={() => router.back()} />
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
          kicker={t('verification_kicker')}
          title={t('resend_verification_email')}
          body={t('resend_verification_desc')}
        >
          <AuthInput
            label={t('email')}
            value={email}
            onChangeText={(v) => { setEmail(v); setError(null); }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <AuthButton
            label={loading ? t('sending') : t('send_verification_email_btn')}
            onPress={handleResend}
            disabled={loading}
          />
          {error ? <ThemedText style={styles.error}>{t(error)}</ThemedText> : null}
        </AuthCard>
      </View>
    </AppScreen>
  );
}
