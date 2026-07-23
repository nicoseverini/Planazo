import { INTEREST_OPTIONS } from '@/utils/interests';

export const CATEGORY_OPTIONS = INTEREST_OPTIONS.map(({ label }) => label);

export const INTEREST_BY_CATEGORY: Record<string, string> = Object.fromEntries(
    INTEREST_OPTIONS.map(({ label, value }) => [label, value])
);
