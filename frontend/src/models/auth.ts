const interestValues = [
  'FOOD',
  'CULTURE',
  'NATURE',
  'BEACH',
  'ADVENTURE',
  'SPORTS',
  'NIGHTLIFE',
  'SHOPPING',
  'HISTORY',
  'MOUNTAINS',
] as const;
const travelTypeValues = ['SOLO', 'COUPLE', 'FRIENDS'] as const;

export type InterestValue = (typeof interestValues)[number];
export type TravelTypeValue = (typeof travelTypeValues)[number];

export type LoginRequest = {
  email: string;
  password: string;
};

export type SignupFormState = {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  lastname: string;
  gender: string;
  birthDate: string;
  interests: InterestValue[];
  travelType: TravelTypeValue | '';
  languages: string[];
};

export type SignupRequest = {
  email: string;
  password: string;
  name: string;
  lastname: string;
  gender: string;
  birthDate: string;
  interests?: InterestValue[];
  travelType?: TravelTypeValue;
  languages?: string[];
};

export const interestOptions = interestValues;
export const travelTypeOptions = travelTypeValues;

export function validateLoginForm(values: LoginRequest) {
  if (!values.email.trim()) {
    return 'error_email_required';
  }

  if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) {
    return 'error_invalid_email';
  }

  if (!values.password) {
    return 'error_password_required';
  }

  return null;
}

export function validateSignupForm(values: SignupFormState) {
  if (!values.email.trim()) {
    return 'error_email_required';
  }

  if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) {
    return 'error_invalid_email';
  }

  if (values.password.length < 8) {
    return 'error_password_length';
  }

  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(values.password)) {
    return 'error_password_pattern';
  }

  if (values.password !== values.confirmPassword) {
    return 'error_passwords_dont_match';
  }

  if (!values.name.trim()) {
    return 'error_name_required';
  }

  if (!values.lastname.trim()) {
    return 'error_lastname_required';
  }

  if (!values.gender.trim()) {
    return 'error_gender_required';
  }

  if (!values.birthDate.trim()) {
    return 'error_birthdate_required';
  }

  if (!values.languages || values.languages.length === 0) {
    return 'error_language_required';
  }

  return null;
}

export function buildSignupRequest(values: SignupFormState): SignupRequest {
  return {
    email: values.email.trim(),
    password: values.password,
    name: values.name.trim(),
    lastname: values.lastname.trim(),
    gender: values.gender.trim(),
    birthDate: values.birthDate.trim(),
    interests: values.interests.length > 0 ? values.interests : undefined,
    travelType: values.travelType || undefined,
    languages: values.languages.length > 0 ? values.languages : undefined,
  };
}
