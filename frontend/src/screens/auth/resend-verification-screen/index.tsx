import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { AuthButton, AuthCard, AuthInput } from '@/components/auth';
import { ThemedText } from '@/components/ThemedText';
import { AppScreen } from '@/components/ui';
import { useThemeColor } from '@/hooks/use-theme-color';
import { resendVerificationEmail } from '@/services/auth';

import { styles } from '../forgot-password-screen/styles';

export default function ResendVerificationScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textColor = useThemeColor({}, 'text');

  const handleResend = async () => {
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Enter a valid email');
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
            kicker="Verification"
            title="Check your inbox"
            body="If an account exists for this email and it hasn't been verified yet, a new verification link has been sent."
          >
            <AuthButton label="Back to sign in" onPress={() => router.back()} />
          </AuthCard>
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen centered scrollable>
      <View style={styles.shell}>
        <View style={styles.backButtonWrapper}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </Pressable>
        </View>
        <AuthCard
          kicker="Verification"
          title="Resend verification email"
          body="Enter your email address and we'll send you a new verification link."
        >
          <AuthInput
            label="Email"
            value={email}
            onChangeText={(v) => { setEmail(v); setError(null); }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <AuthButton
            label={loading ? 'Sending...' : 'Send verification email'}
            onPress={handleResend}
            disabled={loading}
          />
          {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
        </AuthCard>
      </View>
    </AppScreen>
  );
}
