import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Alert, Modal, Platform, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

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
import { useAppTheme } from '@/hooks/use-app-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  buildSignupRequest,
  validateSignupForm,
  type SignupFormState,
} from '@/models/auth';
import { signupUser } from '@/services/auth';
import { formatBirthDate } from '@/utils/date';

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

function MultiSelectField({
  label,
  placeholder,
  values,
  options,
  onChange,
}: {
  label: string;
  placeholder: string;
  values: string[];
  options: PickerOption[];
  onChange: (values: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [tempSelected, setTempSelected] = useState<string[]>(values);
  const { t } = useTranslation();
  const { surface, border, text: textColor, tint, tintText } = useAppTheme();

  const selectedOptions = options.filter((opt) => values.includes(opt.value));
  const displayLabel = selectedOptions.length > 0
    ? selectedOptions.map((opt) => opt.label).join(', ')
    : placeholder;

  const toggleOption = (optValue: string) => {
    if (tempSelected.includes(optValue)) {
      setTempSelected(tempSelected.filter((v) => v !== optValue));
    } else {
      setTempSelected([...tempSelected, optValue]);
    }
  };

  const openModal = () => {
    setTempSelected(values);
    setOpen(true);
  };

  return (
    <View style={styles.pickerGroup}>
      <ThemedText type="defaultSemiBold" style={styles.fieldLabel}>
        {label}
      </ThemedText>
      <Pressable
        onPress={openModal}
        style={({ pressed }) => [
          styles.pickerTrigger,
          { backgroundColor: surface, borderColor: border },
          pressed && styles.pressedField
        ]}
      >
        <ThemedText style={[styles.pickerValue, { color: textColor }, values.length === 0 && styles.placeholderValue]}>
          {displayLabel}
        </ThemedText>
        <ThemedText style={[styles.pickerChevron, { color: textColor }]}>▾</ThemedText>
      </Pressable>

      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setOpen(false)} />
        <View style={[styles.modalShell, { backgroundColor: surface, borderColor: border, borderWidth: 1 }]}>
          <ThemedText type="defaultSemiBold" style={[styles.modalTitle, { color: textColor }]}>
            {label}
          </ThemedText>

          {options.map((option) => {
            const selected = tempSelected.includes(option.value);

            return (
              <Pressable
                key={option.value}
                onPress={() => toggleOption(option.value)}
                style={({ pressed }) => [
                  styles.optionRow,
                  { borderColor: border, backgroundColor: selected ? tint + '15' : 'transparent' },
                  selected && styles.optionRowSelected,
                  pressed && styles.optionPressed,
                ]}
              >
                <ThemedText style={[styles.optionText, { color: textColor }]}>{option.label}</ThemedText>
                {selected ? <ThemedText style={[styles.optionCheck, { color: tint }]}>✓</ThemedText> : null}
              </Pressable>
            );
          })}

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
            <Pressable
              onPress={() => setOpen(false)}
              style={({ pressed }) => [
                {
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: border,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: pressed ? 0.7 : 1,
                }
              ]}
            >
              <ThemedText type="buttonMedium" style={{ color: textColor }}>
                {t('cancel')}
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={() => {
                onChange(tempSelected);
                setOpen(false);
              }}
              style={({ pressed }) => [
                {
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: tint,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: pressed ? 0.7 : 1,
                }
              ]}
            >
              <ThemedText type="buttonMedium" style={{ color: tintText }}>
                {t('done')}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function BirthDateField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const selectedDate = fromIsoDate(value) ?? new Date(2013, 11, 31);
  const { t } = useTranslation();
  const { surface, border, text: textColor, tint } = useAppTheme();
  const colorScheme = useColorScheme();

  return (
    <View style={styles.pickerGroup}>
      <ThemedText type="defaultSemiBold" style={styles.fieldLabel}>
        {t('birth_date')}
      </ThemedText>
      <Pressable
        onPress={() => setOpen((current) => !current)}
        style={({ pressed }) => [styles.pickerTrigger, { backgroundColor: surface, borderColor: border }, pressed && styles.pressedField]}
      >
        <ThemedText style={[styles.pickerValue, !value && styles.placeholderValue]}>
          {value ? formatBirthDate(value) : t('select_birth_date')}
        </ThemedText>
        <ThemedText style={styles.pickerChevron}>📅</ThemedText>
      </Pressable>

      {open ? (
        <View style={[styles.inlinePicker, { backgroundColor: surface, borderColor: border }]}>
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'spinner'}
            maximumDate={new Date(2013, 11, 31)}
            textColor={textColor}
            themeVariant={colorScheme}
            accentColor={tint}
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
  const { t } = useTranslation();

  const [values, setValues] = useState<SignupFormState>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    lastname: '',
    gender: '',
    birthDate: '',
    interests: [],
    travelType: '',
    languages: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { surface, border, text: textColor } = useAppTheme();

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
      Alert.alert(t('account_created'), t('check_email_verify'));
      router.replace('/login');
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'error_could_not_create_account';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    router.dismissAll();
    router.replace('/');
  };

  return (
    <AppScreen scrollable contentStyle={styles.wrapper}>
      <View style={styles.backButtonWrapper}>
        <Pressable
          onPress={goBack}
          style={({ pressed }) => [
            styles.backButton,
            { backgroundColor: surface, borderColor: border },
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </Pressable>
      </View>
      <AuthCard kicker={t('registration')} title={t('create_account')} body={t('fill_in_details_register')}>
        <AuthInput label={t('email')} value={values.email} onChangeText={(value) => update('email', value)} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
        <View style={{ position: 'relative' }}>
          <AuthInput
            label={t('password')}
            value={values.password}
            onChangeText={(value) => update('password', value)}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoComplete="password"
          />
          <View style={{ position: 'relative' }}>
            <AuthInput
              label={t('confirm_password')}
              value={values.confirmPassword}
              onChangeText={(value) => update('confirmPassword', value)}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password"
            />
          </View>

          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: 12,
              top: 42,
              zIndex: 1,
            }}
          >
            <Ionicons
              name={showPassword ? 'eye' : 'eye-off'}
              size={22}
              color="gray"
            />
          </Pressable>
        </View>
        <AuthInput label={t('name')} value={values.name} onChangeText={(value) => update('name', value)} autoCapitalize="words" />
        <AuthInput label={t('lastname')} value={values.lastname} onChangeText={(value) => update('lastname', value)} autoCapitalize="words" />
        <ChoiceGroup
          label={t('gender')}
          options={GENDER_OPTIONS.map((value) => ({
            label: t(`gender_${value.toLowerCase()}`, { defaultValue: GENDER_LABELS[value] ?? value }),
            value,
          }))}
          value={values.gender}
          onChange={(value) => update('gender', value)}
        />
        <BirthDateField value={values.birthDate} onChange={(value) => update('birthDate', value)} />
        <MultiChoiceGroup
          label={t('interests_optional')}
          options={INTEREST_OPTIONS.map((value) => ({
            label: t(`interest_${value.toLowerCase()}`, { defaultValue: INTEREST_LABELS[value] ?? value }),
            value,
          }))}
          value={values.interests}
          onChange={(value) => update('interests', value as typeof values.interests)}
        />
        <ChoiceGroup
          label={t('travel_type_optional')}
          options={TRAVEL_TYPE_OPTIONS.map((value) => ({
            label: t(`travel_type_${value.toLowerCase()}`, { defaultValue: TRAVEL_TYPE_LABELS[value] ?? value }),
            value,
          }))}
          value={values.travelType}
          onChange={(value) => update('travelType', value as typeof values.travelType)}
        />
        <MultiSelectField
          label={t('languages')}
          placeholder={t('select_language_placeholder')}
          values={values.languages}
          options={LANGUAGE_OPTIONS.map((value) => ({
            label: t(`lang_${value.toLowerCase()}`, { defaultValue: value }),
            value,
          }))}
          onChange={(val) => update('languages', val)}
        />
        <AuthButton label={loading ? t('registering') : t('create_account')} onPress={handleSignup} disabled={loading} />
        {error ? <ThemedText style={styles.error}>{t(error)}</ThemedText> : null}
      </AuthCard>
    </AppScreen>
  );
}

