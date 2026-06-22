import { INTEREST_OPTIONS as _INTEREST_OPTIONS, INTEREST_LABEL } from '@/utils/interests';

export const GENDER_OPTIONS = ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'] as const;

export const INTEREST_OPTIONS = _INTEREST_OPTIONS.map(({ value }) => value);

export const INTEREST_LABELS: Record<string, string> = INTEREST_LABEL;

export const TRAVEL_TYPE_OPTIONS = ['SOLO', 'COUPLE', 'FRIENDS'] as const;
export const LANGUAGE_OPTIONS = ['Spanish', 'English'] as const;

export const TRAVEL_TYPE_LABELS: Record<string, string> = {
  SOLO: 'Solo',
  COUPLE: 'Couple',
  FRIENDS: 'Friends',
};

export const GENDER_LABELS: Record<string, string> = {
  MALE: 'Male',
  FEMALE: 'Female',
  OTHER: 'Other',
  PREFER_NOT_TO_SAY: 'Prefer not to say',
};
