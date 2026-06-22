import { Pressable, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useAppTheme } from '@/hooks/use-app-theme';
import { INTEREST_OPTIONS } from '@/utils/interests';

type Props = {
    /** Currently selected category values. Empty array means "Any" (no filter). */
    selected: string[];
    /** Called with the new selection whenever the user taps a chip. */
    onChange: (selected: string[]) => void;
};

/**
 * Shared category multi-selector with an "Any" option.
 *
 * Selection semantics:
 * - "Any" chip is active when selected is empty.
 * - Tapping "Any" clears all specific selections.
 * - Tapping a specific category toggles it; "Any" is implicitly deselected.
 * - "Any" never coexists with specific categories.
 */
export function CategoryFilterSelector({ selected, onChange }: Props) {
    const { border, tint, text, tintText } = useAppTheme();

    const chipStyle = (active: boolean) => ({
        paddingHorizontal: 14 as const,
        paddingVertical: 8 as const,
        borderRadius: 20 as const,
        backgroundColor: active ? tint : ('transparent' as const),
        borderWidth: 1 as const,
        borderColor: active ? tint : border,
    });

    const handlePress = (value: string | null) => {
        if (value === null) {
            onChange([]);
            return;
        }
        const next = selected.includes(value)
            ? selected.filter((x) => x !== value)
            : [...selected, value];
        onChange(next);
    };

    const isAny = selected.length === 0;

    return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <Pressable onPress={() => handlePress(null)} style={chipStyle(isAny)}>
                <ThemedText type="label" style={{ color: isAny ? tintText : text }}>
                    Any
                </ThemedText>
            </Pressable>
            {INTEREST_OPTIONS.map(({ value, label }) => {
                const active = selected.includes(value);
                return (
                    <Pressable key={value} onPress={() => handlePress(value)} style={chipStyle(active)}>
                        <ThemedText type="label" style={{ color: active ? tintText : text }}>
                            {label}
                        </ThemedText>
                    </Pressable>
                );
            })}
        </View>
    );
}
