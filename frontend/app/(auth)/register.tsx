import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView } from 'react-native';

import { AuthButton, AuthCard, AuthInput, ChoiceGroup, MultiChoiceGroup } from '@/components/auth/auth-form';
import { authStyles } from '@/components/auth/auth-styles';
import { AppScreen } from '@/components/ui/app-screen';
import { ThemedText } from '@/components/themed-text';
import {
  buildSignupRequest,
  interestOptions,
  validateSignupForm,
  travelTypeOptions,
  type SignupFormState,
} from '@/models/auth';
import { signupUser } from '@/services/auth';

const genderOptions = [
  { label: 'Masculino', value: 'Masculino' },
  { label: 'Femenino', value: 'Femenino' },
  { label: 'Otro', value: 'Otro' },
];

export default function Register() {
  const router = useRouter();
  const [values, setValues] = useState<SignupFormState>({
    email: '',
    password: '',
    name: '',
    lastname: '',
    gender: '',
    birthDate: '',
    interests: [],
    budget: '',
    travelType: '',
    languages: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof SignupFormState>(key: K, value: SignupFormState[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handleSignup = async () => {
    const validationError = validateSignupForm(values);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await signupUser(buildSignupRequest(values));
      Alert.alert('Cuenta creada', 'Tu usuario fue registrado correctamente.');
      router.replace('/');
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'No se pudo crear la cuenta';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppScreen scrollable>
      <ScrollView contentContainerStyle={styles.wrapper} showsVerticalScrollIndicator={false}>
        <AuthCard kicker="Registro" title="Crear cuenta" body="Completá los datos para crear tu cuenta y generar una sesión nueva.">
          <AuthInput label="Email" value={values.email} onChangeText={(value) => update('email', value)} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
          <AuthInput label="Contraseña" value={values.password} onChangeText={(value) => update('password', value)} secureTextEntry autoCapitalize="none" autoComplete="password" />
          <AuthInput label="Nombre" value={values.name} onChangeText={(value) => update('name', value)} autoCapitalize="words" />
          <AuthInput label="Apellido" value={values.lastname} onChangeText={(value) => update('lastname', value)} autoCapitalize="words" />
          <ChoiceGroup label="Género" options={genderOptions} value={values.gender} onChange={(value) => update('gender', value)} />
          <AuthInput label="Fecha de nacimiento" value={values.birthDate} onChangeText={(value) => update('birthDate', value)} placeholder="YYYY-MM-DD" autoCapitalize="none" autoComplete="birthdate-full" />
          <MultiChoiceGroup
            label="Intereses (opcional)"
            options={interestOptions.map((value) => ({
              label: value === 'FOOD' ? 'Comida' : value === 'CULTURE' ? 'Cultura' : 'Naturaleza',
              value,
            }))}
            value={values.interests}
            onChange={(value) => update('interests', value as typeof values.interests)}
          />
          <AuthInput label="Presupuesto (opcional)" value={values.budget} onChangeText={(value) => update('budget', value)} keyboardType="numeric" />
          <ChoiceGroup
            label="Tipo de viaje (opcional)"
            options={travelTypeOptions.map((value) => ({
              label: value === 'SOLO' ? 'Solo' : value === 'PAREJA' ? 'Pareja' : 'Amigos',
              value,
            }))}
            value={values.travelType}
            onChange={(value) => update('travelType', value as typeof values.travelType)}
          />
          <AuthInput label="Idiomas (opcional)" value={values.languages} onChangeText={(value) => update('languages', value)} placeholder="Español, Inglés" autoCapitalize="words" />
          <AuthButton label={loading ? 'Registrando...' : 'Crear cuenta'} onPress={handleSignup} disabled={loading} />
          {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
        </AuthCard>
      </ScrollView>
    </AppScreen>
  );
}

const styles = authStyles;