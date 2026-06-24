import { UserProfile } from '@/services/user';

export const DEFAULT_PROFILE: UserProfile = {
    name: '',
    lastname: '',
    email: '',
    gender: '',
    birthDate: '',
    interests: [],
    travelType: '',
    languages: [],
    photo: '',
};

export function formatList(values: string[] | undefined, labelMap?: Record<string, string>) {
    if (!values || values.length === 0) return 'Not set';
    return values.map((value) => labelMap?.[value] ?? value).join(', ');
}

export function formatValue(value?: string, labelMap?: Record<string, string>) {
    if (!value) return 'Not set';
    return labelMap?.[value] ?? value;
}

export function normalizeProfile(profile: UserProfile | null): UserProfile {
    return {
        ...DEFAULT_PROFILE,
        ...profile,
        interests: profile?.interests ?? [],
        languages: profile?.languages ?? [],
    };
}

/** Accepts data URIs, http(s) and file URLs; anything else returns null. */
export function normalizePhotoValue(value?: string | null) {
    const trimmed = value?.trim();
    if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return null;
    const lower = trimmed.toLowerCase();
    const isValid =
        lower.startsWith('data:image/') ||
        lower.startsWith('http://') ||
        lower.startsWith('https://') ||
        lower.startsWith('file://');
    return isValid ? trimmed : null;
}

export function resolveInitial(name?: string | null, fallback?: string | null) {
    const normalizedName = name?.trim();
    if (normalizedName) return normalizedName.charAt(0).toUpperCase();
    const normalizedFallback = fallback?.trim();
    if (normalizedFallback && normalizedFallback.length === 1) {
        return normalizedFallback.toUpperCase();
    }
    return '?';
}
