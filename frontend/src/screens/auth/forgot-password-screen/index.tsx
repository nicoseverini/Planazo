import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';

import { AuthButton, AuthCard, AuthInput } from '@/components/auth';
import { ThemedText } from '@/components/ThemedText';
import { AppScreen } from '@/components/ui';
import { forgotPassword } from '@/services/auth';

import { styles } from './styles';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSendRecoveryEmail = async () => {
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
      await forgotPassword({ email: email.trim() });

      Alert.alert('Email sent', 'Check your email to recover your password.');
      setSuccess(true);

      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Could not send the email';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AppScreen centered scrollable>
        <View style={styles.shell}>
          <AuthCard kicker="Recovery" title="Email sent" body="Check your email for recovery instructions.">
            <AuthButton label="Back to login" onPress={() => router.back()} />
          </AuthCard>
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen centered scrollable>
      <View style={styles.shell}>
        <AuthCard
          kicker="Recovery"
          title="Recover password"
          body="Enter your email and we will send you a link to recover your password."
        >
          <AuthInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
          <AuthButton label={loading ? 'Sending...' : 'Send link'} onPress={handleSendRecoveryEmail} disabled={loading} />
          {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
        </AuthCard>
      </View>
    </AppScreen>
  );
}

