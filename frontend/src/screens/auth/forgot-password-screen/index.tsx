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
      setError('El email es obligatorio');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Ingresá un email válido');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await forgotPassword({ email: email.trim() });

      Alert.alert('Email enviado', 'Revisa tu correo para recuperar tu contraseña.');
      setSuccess(true);

      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'No se pudo enviar el email';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AppScreen centered scrollable>
        <View style={styles.shell}>
          <AuthCard kicker="Recuperación" title="Email enviado" body="Revisa tu correo electrónico para obtener las instrucciones de recuperación.">
            <AuthButton label="Volver al login" onPress={() => router.back()} />
          </AuthCard>
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen centered scrollable>
      <View style={styles.shell}>
        <AuthCard
          kicker="Recuperación"
          title="Recuperar contraseña"
          body="Ingresá tu email y te enviaremos un enlace para recuperar tu contraseña."
        >
          <AuthInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
          <AuthButton label={loading ? 'Enviando...' : 'Enviar enlace'} onPress={handleSendRecoveryEmail} disabled={loading} />
          {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
        </AuthCard>
      </View>
    </AppScreen>
  );
}

