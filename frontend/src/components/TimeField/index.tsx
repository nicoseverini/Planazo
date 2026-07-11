import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, {
    DateTimePickerAndroid,
    type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import React, { useRef, useState } from 'react';
import { Platform, Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/ThemedText';
import { styles } from '@/components/DateField/styles';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatTime24 } from '@/utils/date';

export type TimeFieldProps = {
    /** Currently selected time, or `null` when none has been picked yet. */
    value: Date | null;
    /** Called with the newly picked time. */
    onChange: (date: Date) => void;
    /** When provided, a clear button is shown while there is a value. */
    onClear?: () => void;
    /** Optional field label rendered above the trigger. */
    label?: string;
    /** Text shown when there is no value. Defaults to `HH:MM`. */
    placeholder?: string;
    /** Disables opening the picker. */
    disabled?: boolean;
    /** Error message rendered below the trigger. */
    error?: string | null;
    /** Overrides the container style. */
    containerStyle?: StyleProp<ViewStyle>;
    /** Overrides the trigger style. */
    triggerStyle?: StyleProp<ViewStyle>;
    testID?: string;
};

/**
 * Reusable, theme-aware time selector. Mirrors {@link DateField}: a stable wheel
 * spinner with Cancel/Done on iOS, and the native imperative dialog on Android,
 * so no screen reimplements this logic. Times are exchanged as `Date` objects and
 * displayed as a 24-hour `HH:MM` string.
 */
export function TimeField({
    value,
    onChange,
    onClear,
    label,
    placeholder,
    disabled = false,
    error,
    containerStyle,
    triggerStyle,
    testID,
}: TimeFieldProps) {
    const { t } = useTranslation();
    const { surface, border, text, mutedText, tint } = useAppTheme();
    const colorScheme = useColorScheme();
    const [open, setOpen] = useState(false);
    // Frozen value the iOS spinner opens with; stays stable while the spinner is
    // open (NOT updated on every scroll).
    const [sessionValue, setSessionValue] = useState<Date | null>(null);
    // Latest scrolled value, tracked without re-rendering; committed on "Done".
    // Updating React state on every onChange makes the iOS spinner fight the
    // user's gesture and lock onto a single value, so we use a ref instead.
    const selectedRef = useRef<Date | null>(null);

    const displayValue = value ? formatTime24(value) : (placeholder ?? 'HH:MM');
    const pickerValue = value ?? new Date();

    const handleTriggerPress = () => {
        if (disabled) return;
        if (Platform.OS === 'android') {
            DateTimePickerAndroid.open({
                value: pickerValue,
                mode: 'time',
                is24Hour: true,
                onChange: (event, date) => {
                    if (event.type === 'set' && date) onChange(date);
                },
            });
            return;
        }
        if (open) {
            setOpen(false);
            return;
        }
        selectedRef.current = pickerValue;
        setSessionValue(pickerValue);
        setOpen(true);
    };

    const confirmIosSelection = () => {
        onChange(selectedRef.current ?? pickerValue);
        setOpen(false);
    };

    return (
        <View style={[styles.container, containerStyle]}>
            {label ? (
                <ThemedText type="defaultSemiBold" style={styles.label}>
                    {label}
                </ThemedText>
            ) : null}

            <Pressable
                testID={testID}
                onPress={handleTriggerPress}
                disabled={disabled}
                accessibilityRole="button"
                accessibilityLabel={label ?? placeholder ?? t('select_time')}
                accessibilityState={{ disabled, expanded: open }}
                style={({ pressed }) => [
                    styles.trigger,
                    { backgroundColor: surface, borderColor: error ? '#ef4444' : border },
                    disabled && styles.disabled,
                    pressed && !disabled && styles.pressed,
                    triggerStyle,
                ]}
            >
                <ThemedText style={[styles.value, { color: value ? text : mutedText }]}>
                    {displayValue}
                </ThemedText>
                {onClear && value ? (
                    <Pressable
                        onPress={onClear}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel={t('clear')}
                    >
                        <Ionicons name="close-circle" size={20} color={mutedText} />
                    </Pressable>
                ) : (
                    <Ionicons name="time-outline" size={20} color={tint} />
                )}
            </Pressable>

            {Platform.OS === 'ios' && open ? (
                <View style={[styles.inlinePicker, { backgroundColor: surface, borderColor: border }]}>
                    <DateTimePicker
                        value={sessionValue ?? pickerValue}
                        mode="time"
                        display="spinner"
                        is24Hour={true}
                        textColor={text}
                        themeVariant={colorScheme}
                        accentColor={tint}
                        onChange={(_event: DateTimePickerEvent, date?: Date) => {
                            if (date) selectedRef.current = date;
                        }}
                    />
                    <View style={styles.pickerActions}>
                        <Pressable onPress={() => setOpen(false)} hitSlop={8} accessibilityRole="button">
                            <ThemedText style={[styles.pickerAction, { color: mutedText }]}>{t('cancel')}</ThemedText>
                        </Pressable>
                        <Pressable onPress={confirmIosSelection} hitSlop={8} accessibilityRole="button">
                            <ThemedText style={[styles.pickerAction, { color: tint }]}>{t('done')}</ThemedText>
                        </Pressable>
                    </View>
                </View>
            ) : null}

            {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
        </View>
    );
}
