const INTEREST_LABELS: Record<string, string> = {
    FOOD: 'Food 🍔',
    CULTURE: 'Culture 🏛️',
    NATURE: 'Nature 🌳',
    BEACH: 'Beach 🏖️',
    ADVENTURE: 'Adventure 🧗',
    SPORTS: 'Sports ⚽',
    NIGHTLIFE: 'Nightlife 🍹',
    SHOPPING: 'Shopping 🛍️',
    HISTORY: 'History 📜',
    MOUNTAINS: 'Mountains 🏔️',
    OTHER: 'Other ✨',
};

/**
 * Converts a backend interest constant to a user-friendly label.
 * Known labels use an explicit mapping (e.g. FOOD → Food).
 * Everything else is title-cased with underscores replaced by spaces,
 * so future values like BOARD_GAMES → "Board Games" work automatically.
 */
export function formatInterest(interest: string): string {
    if (INTEREST_LABELS[interest]) return INTEREST_LABELS[interest];
    return interest
        .toLowerCase()
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
}
