const interestValues = [
  'FOOD',
  'CULTURE',
  'NATURE',
  'BEACH',
  'ADVENTURE',
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
  name: string;
  lastname: string;
  gender: string;
  birthDate: string;
  interests: InterestValue[];
  budget: string;
  travelType: TravelTypeValue | '';
  language: string;
  receiveConfirmationEmail: boolean;
};

export type SignupRequest = {
  email: string;
  password: string;
  name: string;
  lastname: string;
  gender: string;
  birthDate: string;
  interests?: InterestValue[];
  budget?: number;
  travelType?: TravelTypeValue;
  languages?: string[];
  receiveConfirmationEmail: boolean;
};

export const interestOptions = interestValues;
export const travelTypeOptions = travelTypeValues;

export function validateLoginForm(values: LoginRequest) {
  if (!values.email.trim()) {
    return 'El email es obligatorio';
  }

  if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) {
    return 'Ingresá un email válido';
  }

  if (!values.password) {
    return 'La contraseña es obligatoria';
  }

  return null;
}

export function validateSignupForm(values: SignupFormState) {
  if (!values.email.trim()) {
    return 'El email es obligatorio';
  }

  if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) {
    return 'Ingresá un email válido';
  }

  if (values.password.length < 8) {
    return 'La contraseña debe tener al menos 8 caracteres';
  }

  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(values.password)) {
    return 'La contraseña debe incluir mayúscula, minúscula y número';
  }

  if (!values.name.trim()) {
    return 'El nombre es obligatorio';
  }

  if (!values.lastname.trim()) {
    return 'El apellido es obligatorio';
  }

  if (!values.gender.trim()) {
    return 'El género es obligatorio';
  }

  if (!values.birthDate.trim()) {
    return 'La fecha de nacimiento es obligatoria';
  }

  return null;
}

export function buildSignupRequest(values: SignupFormState): SignupRequest {
  const budget = values.budget.trim();
  const parsedBudget = budget.length > 0 && !Number.isNaN(Number(budget)) ? Number(budget) : undefined;

  return {
    email: values.email.trim(),
    password: values.password,
    name: values.name.trim(),
    lastname: values.lastname.trim(),
    gender: values.gender.trim(),
    birthDate: values.birthDate.trim(),
    interests: values.interests.length > 0 ? values.interests : undefined,
    budget: parsedBudget,
    travelType: values.travelType || undefined,
    languages: values.language ? [values.language] : undefined,
    receiveConfirmationEmail: values.receiveConfirmationEmail,
  };
}
