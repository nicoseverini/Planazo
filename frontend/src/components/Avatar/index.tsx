import { Image, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { useAppTheme } from '@/hooks/use-app-theme';

type AvatarProps = {
    name?: string | null;
    photo?: string | null;
    size?: number;
};

/** Accepts data URIs, http(s) and file URLs; anything else falls back to an initial. */
function normalizePhotoValue(value?: string | null) {
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

function resolveInitial(name?: string | null) {
    const normalized = name?.trim();
    return normalized ? normalized.charAt(0).toUpperCase() : '?';
}

export function Avatar({ name, photo, size = 44 }: AvatarProps) {
    const { tint, tintText, surface, border } = useAppTheme();
    const resolvedPhoto = normalizePhotoValue(photo);
    const dimensions = { width: size, height: size, borderRadius: size / 2 };

    if (resolvedPhoto) {
        return (
            <Image
                source={{ uri: resolvedPhoto }}
                style={[dimensions, { borderWidth: 1, borderColor: border, backgroundColor: surface }]}
            />
        );
    }

    return (
        <View
            style={[
                dimensions,
                { backgroundColor: tint, alignItems: 'center', justifyContent: 'center' },
            ]}
        >
            <ThemedText
                lightColor={tintText}
                darkColor={tintText}
                style={{
                    fontSize: size * 0.4,
                    // lineHeight must match fontSize: ThemedText `type` styles bake a
                    // fixed lineHeight that would be shorter than the scaled glyph and
                    // clip the initial vertically.
                    lineHeight: size * 0.4,
                    fontWeight: '600',
                    textAlign: 'center',
                }}
            >
                {resolveInitial(name)}
            </ThemedText>
        </View>
    );
}
