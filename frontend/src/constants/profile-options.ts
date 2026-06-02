export const GENDER_OPTIONS = ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'] as const;
export const INTEREST_OPTIONS = [
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
export const TRAVEL_TYPE_OPTIONS = ['SOLO', 'COUPLE', 'FRIENDS'] as const;
export const LANGUAGE_OPTIONS = ['Spanish', 'English'] as const;

export const INTEREST_LABELS: Record<string, string> = {
  FOOD: 'Food',
  CULTURE: 'Culture',
  NATURE: 'Nature',
  BEACH: 'Beach',
  ADVENTURE: 'Adventure',
  SPORTS: 'Sports',
  NIGHTLIFE: 'Nightlife',
  SHOPPING: 'Shopping',
  HISTORY: 'History',
  MOUNTAINS: 'Mountains',
};

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
