const INTEREST_LABELS: Record<string, string> = {
    // If we want to change the label for a specific interest,
    // we can add it here without affecting the formatting of other interests.
    // Add more explicit mappings here as needed.
    // For example, if we want to change the label for FOOD from "Food" to "Food",
    // we can do it here: 
    // FOOD: 'Food',
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
