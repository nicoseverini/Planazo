import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Image, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { useAppTheme } from '@/hooks/use-app-theme';

const RING_WIDTH = 3;

type AvatarProps = {
    name?: string | null;
    photo?: string | null;
    size?: number;
    /** Draws a bordered ring around the avatar. */
    ring?: boolean;
    /** Shows a camera badge hinting the avatar can be changed. */
    editable?: boolean;
    /** Shows a spinner overlay and blocks interaction while the photo updates. */
    loading?: boolean;
    /** Makes the avatar tappable. */
    onPress?: () => void;
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

/**
 * Single source of truth for user avatars. Renders the profile photo or, as a
 * fallback, the uppercase initial of the name. The optional `ring`, `editable`,
 * `loading` and `onPress` props turn it into the editable profile avatar; without
 * them it stays a plain, non-interactive avatar (e.g. lists).
 */
export function Avatar({
    name,
    photo,
    size = 44,
    ring = false,
    editable = false,
    loading = false,
    onPress,
}: AvatarProps) {
    const { tint, tintText, surface, border } = useAppTheme();
    const resolvedPhoto = normalizePhotoValue(photo);

    const interactive = ring || editable || loading || !!onPress;
    // Leave room for the ring so the photo/initial never overflow the border.
    const contentSize = ring ? size - RING_WIDTH * 2 : size;
    const contentDimensions = {
        width: contentSize,
        height: contentSize,
        borderRadius: contentSize / 2,
    };

    const content = resolvedPhoto ? (
        <Image
            source={{ uri: resolvedPhoto }}
            style={[contentDimensions, { borderWidth: 1, borderColor: border, backgroundColor: surface }]}
        />
    ) : (
        <View style={[contentDimensions, styles.center, { backgroundColor: tint }]}>
            <ThemedText
                lightColor={tintText}
                darkColor={tintText}
                style={{
                    fontSize: contentSize * 0.4,
                    // lineHeight must match fontSize: ThemedText `type` styles bake a fixed
                    // lineHeight that would be shorter than the scaled glyph and clip the initial.
                    lineHeight: contentSize * 0.4,
                    fontWeight: '600',
                    textAlign: 'center',
                }}
            >
                {resolveInitial(name)}
            </ThemedText>
        </View>
    );

    // Backward-compatible plain avatar (no ring / editing / press).
    if (!interactive) {
        return content;
    }

    const badgeSize = Math.round(size * 0.32);
    const wrapperStyle = [
        styles.center,
        { width: size, height: size },
        ring && {
            borderRadius: size / 2,
            borderWidth: RING_WIDTH,
            borderColor: border,
            backgroundColor: surface,
        },
    ];

    const body = (
        <>
            {content}
            {editable && !loading && (
                <View
                    style={[
                        styles.cameraBadge,
                        { width: badgeSize, height: badgeSize, borderRadius: badgeSize / 2, backgroundColor: tint },
                    ]}
                >
                    <Ionicons name="camera" size={Math.round(badgeSize * 0.44)} color={tintText} />
                </View>
            )}
            {loading && (
                <View style={[StyleSheet.absoluteFill, styles.center, styles.loadingOverlay, { borderRadius: size / 2 }]}>
                    <ActivityIndicator size="small" color={tintText} />
                </View>
            )}
        </>
    );

    if (onPress) {
        return (
            <Pressable
                onPress={onPress}
                disabled={loading}
                style={({ pressed }) => [wrapperStyle, pressed && !loading && styles.pressed]}
            >
                {body}
            </Pressable>
        );
    }
    return <View style={wrapperStyle}>{body}</View>;
}

const styles = StyleSheet.create({
    center: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    pressed: {
        opacity: 0.7,
    },
    cameraBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingOverlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.35)',
    },
});
