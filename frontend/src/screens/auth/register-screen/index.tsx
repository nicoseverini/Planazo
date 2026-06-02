import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Alert, Modal, Platform, Pressable, View } from 'react-native';

import { AuthButton, AuthCard, AuthInput, ChoiceGroup, MultiChoiceGroup } from '@/components/auth';
import { ThemedText } from '@/components/ThemedText';
import { AppScreen } from '@/components/ui';
import {
  GENDER_LABELS,
  GENDER_OPTIONS,
  INTEREST_LABELS,
  INTEREST_OPTIONS,
  LANGUAGE_OPTIONS,
  TRAVEL_TYPE_LABELS,
  TRAVEL_TYPE_OPTIONS,
} from '@/constants/profile-options';
import {
  buildSignupRequest,
  validateSignupForm,
  type SignupFormState,
} from '@/models/auth';
import { signupUser } from '@/services/auth';

import { styles } from './styles';

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function fromIsoDate(value: string) {
  if (!value) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

type PickerOption = {
  label: string;
  value: string;
};

function SelectField({
  label,
  placeholder,
  value,
  options,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  options: PickerOption[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.pickerGroup}>
      <ThemedText type="defaultSemiBold" style={styles.fieldLabel}>
        {label}
      </ThemedText>
      <Pressable onPress={() => setOpen(true)} style={({ pressed }) => [styles.pickerTrigger, pressed && styles.pressedField]}>
        <ThemedText style={[styles.pickerValue, !value && styles.placeholderValue]}>
          {value || placeholder}
        </ThemedText>
        <ThemedText style={styles.pickerChevron}>▾</ThemedText>
      </Pressable>

      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setOpen(false)} />
        <View style={styles.modalShell}>
          <ThemedText type="defaultSemiBold" style={styles.modalTitle}>
            {label}
          </ThemedText>

          {options.map((option) => {
            const selected = option.value === value;

            return (
              <Pressable
                key={option.value}
                onPress={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                style={({ pressed }) => [
                  styles.optionRow,
                  selected && styles.optionRowSelected,
                  pressed && styles.optionPressed,
                ]}
              >
                <ThemedText style={styles.optionText}>{option.label}</ThemedText>
                {selected ? <ThemedText style={styles.optionCheck}>✓</ThemedText> : null}
              </Pressable>
            );
          })}

          <Pressable onPress={() => setOpen(false)} style={styles.modalCancelButton}>
            <ThemedText style={styles.modalCancelText}>Cancel</ThemedText>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

function BirthDateField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const selectedDate = fromIsoDate(value) ?? new Date();

  return (
    <View style={styles.pickerGroup}>
      <ThemedText type="defaultSemiBold" style={styles.fieldLabel}>
        Fecha de nacimiento
      </ThemedText>
      <Pressable
        onPress={() => setOpen((current) => !current)}
        style={({ pressed }) => [styles.pickerTrigger, pressed && styles.pressedField]}
      >
        <ThemedText style={[styles.pickerValue, !value && styles.placeholderValue]}>
          {value || 'Elegí una fecha'}
        </ThemedText>
        <ThemedText style={styles.pickerChevron}>📅</ThemedText>
      </Pressable>

      {open ? (
        <View style={styles.inlinePicker}>
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'spinner'}
            maximumDate={new Date()}
            onChange={(_, nextDate) => {
              if (nextDate) {
                onChange(toIsoDate(nextDate));
                setOpen(false);
              }
            }}
          />
        </View>
      ) : null}
    </View>
  );
}

function CheckboxField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <Pressable onPress={() => onChange(!value)} style={styles.checkboxRow}>
      <View style={[styles.checkboxBox, value && styles.checkboxBoxChecked]}>
        {value ? <ThemedText style={styles.checkboxMark}>✓</ThemedText> : null}
      </View>
      <ThemedText style={styles.checkboxLabel}>{label}</ThemedText>
    </Pressable>
  );
}

export default function RegisterScreen() {
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
    language: '',
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
      const response = await signupUser(buildSignupRequest(values));
      Alert.alert('Account created', response.message || 'Check your email to verify your account.');
      router.replace('/login');
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Could not create account';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppScreen scrollable contentStyle={styles.wrapper}>
      <AuthCard kicker="Registration" title="Create account" body="Fill in the details to create your account and start a new session.">
        <AuthInput label="Email" value={values.email} onChangeText={(value) => update('email', value)} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
        <AuthInput label="Password" value={values.password} onChangeText={(value) => update('password', value)} secureTextEntry autoCapitalize="none" autoComplete="password" />
        <AuthInput label="Nombre" value={values.name} onChangeText={(value) => update('name', value)} autoCapitalize="words" />
        <AuthInput label="Apellido" value={values.lastname} onChangeText={(value) => update('lastname', value)} autoCapitalize="words" />
        <ChoiceGroup
          label="Género"
          options={GENDER_OPTIONS.map((value) => ({
            label: GENDER_LABELS[value] ?? value,
            value,
          }))}
          value={values.gender}
          onChange={(value) => update('gender', value)}
        />
        <BirthDateField value={values.birthDate} onChange={(value) => update('birthDate', value)} />
        <MultiChoiceGroup
          label="Intereses (opcional)"
          options={INTEREST_OPTIONS.map((value) => ({
            label: INTEREST_LABELS[value] ?? value,
            value,
          }))}
          value={values.interests}
          onChange={(value) => update('interests', value as typeof values.interests)}
        />
        <AuthInput label="Budget (optional)" value={values.budget} onChangeText={(value) => update('budget', value)} keyboardType="numeric" />
        <ChoiceGroup
          label="Tipo de viaje (opcional)"
          options={TRAVEL_TYPE_OPTIONS.map((value) => ({
            label: TRAVEL_TYPE_LABELS[value] ?? value,
            value,
          }))}
          value={values.travelType}
          onChange={(value) => update('travelType', value as typeof values.travelType)}
        />
        <SelectField
          label="Idioma"
          placeholder="Seleccioná un idioma"
          value={values.language}
          options={LANGUAGE_OPTIONS.map((value) => ({ label: value, value }))}
          onChange={(value) => update('language', value)}
        />
        <AuthButton label={loading ? 'Registering...' : 'Create account'} onPress={handleSignup} disabled={loading} />
        {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
      </AuthCard>
    </AppScreen>
  );
}

