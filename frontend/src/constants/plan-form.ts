export const CATEGORY_OPTIONS = [
    'Food',
    'Culture',
    'Nature',
    'Beach',
    'Adventure',
    'Nightlife',
    'Shopping',
    'History',
    'Mountains',
    'Sports',
    'Other',
] as const;

export const INTEREST_BY_CATEGORY: Record<string, string> = {
    Food:      'FOOD',
    Culture:   'CULTURE',
    Nature:    'NATURE',
    Beach:     'BEACH',
    Adventure: 'ADVENTURE',
    Nightlife: 'NIGHTLIFE',
    Shopping:  'SHOPPING',
    History:   'HISTORY',
    Mountains: 'MOUNTAINS',
    Sports:    'SPORTS',
    Other:     'OTHER',
};
