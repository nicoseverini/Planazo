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
  name: string;
  lastname: string;
  gender: string;
  birthDate: string;
  interests: InterestValue[];
  budget: string;
  travelType: TravelTypeValue | '';
  language: string;
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
};

export const interestOptions = interestValues;
export const travelTypeOptions = travelTypeValues;

export function validateLoginForm(values: LoginRequest) {
  if (!values.email.trim()) {
    return 'Email is required';
  }

  if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) {
    return 'Enter a valid email';
  }

  if (!values.password) {
    return 'Password is required';
  }

  return null;
}

export function validateSignupForm(values: SignupFormState) {
  if (!values.email.trim()) {
    return 'Email is required';
  }

  if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) {
    return 'Please enter a valid email';
  }

  if (values.password.length < 8) {
    return 'Password must be at least 8 characters';
  }

  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(values.password)) {
    return 'Password must include uppercase, lowercase and number';
  }

  if (!values.name.trim()) {
    return 'Name is required';
  }

  if (!values.lastname.trim()) {
    return 'Last name is required';
  }

  if (!values.gender.trim()) {
    return 'Gender is required';
  }

  if (!values.birthDate.trim()) {
    return 'Birth date is required';
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
  };
}
