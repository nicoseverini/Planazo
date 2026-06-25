import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { ThemedText } from '@/components/ThemedText';
import { useAppTheme } from '@/hooks/use-app-theme';

type MemberRowProps = {
    id: number;
    name: string;
    lastname?: string | null;
    photo?: string | null;
    /** Optional caption under the name (e.g. "Organizer"). */
    subtitle?: string;
    /** Navigates to the member's profile when the row is tapped. */
    onPress?: (id: number) => void;
    /** Actions rendered on the right side (e.g. accept / reject buttons). */
    rightSlot?: React.ReactNode;
};

export function MemberRow({ id, name, lastname, photo, subtitle, onPress, rightSlot }: MemberRowProps) {
    const { surface, border, mutedText } = useAppTheme();
    const fullName = `${name ?? ''} ${lastname ?? ''}`.trim() || 'User';

    return (
        <View
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                padding: 12,
                borderWidth: 1,
                borderColor: border,
                borderRadius: 16,
                backgroundColor: surface,
            }}
        >
            <Pressable
                onPress={onPress ? () => onPress(id) : undefined}
                disabled={!onPress}
                style={({ pressed }) => [
                    { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
                    pressed && onPress ? { opacity: 0.6 } : null,
                ]}
            >
                <Avatar name={name} photo={photo} size={44} />
                <View style={{ flex: 1, gap: 2 }}>
                    <ThemedText type="body" style={{ fontWeight: '600' }} numberOfLines={1}>
                        {fullName}
                    </ThemedText>
                    {subtitle ? (
                        <ThemedText type="label" style={{ color: mutedText }} numberOfLines={1}>
                            {subtitle}
                        </ThemedText>
                    ) : null}
                </View>
                {onPress ? <Ionicons name="chevron-forward" size={18} color={mutedText} /> : null}
            </Pressable>
            {rightSlot ? <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>{rightSlot}</View> : null}
        </View>
    );
}
