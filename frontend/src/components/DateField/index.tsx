import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, {
    DateTimePickerAndroid,
    type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import React, { useMemo, useRef, useState } from 'react';
import { Platform, Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/ThemedText';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatLocalizedDate } from '@/utils/date';

import { styles } from './styles';

/** Clamps a date into the `[min, max]` range so the calendar never opens out of bounds. */
function clampDate(date: Date, min?: Date, max?: Date): Date {
    if (min && date.getTime() < min.getTime()) return min;
    if (max && date.getTime() > max.getTime()) return max;
    return date;
}

export type DateFieldProps = {
    /** Currently selected date, or `null` when none has been picked yet. */
    value: Date | null;
    /** Called with the newly picked date. */
    onChange: (date: Date) => void;
    /** When provided, a clear button is shown while there is a value. */
    onClear?: () => void;
    /** Optional field label rendered above the trigger. */
    label?: string;
    /** Text shown when there is no value. Defaults to the localized "select date". */
    placeholder?: string;
    /** Earliest selectable date. */
    minimumDate?: Date;
    /** Latest selectable date. */
    maximumDate?: Date;
    /**
     * Where the calendar opens when there is no value yet. Defaults to today.
     * It is always clamped to `[minimumDate, maximumDate]`.
     */
    initialDate?: Date;
    /** Disables opening the calendar. */
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
 * Reusable, theme-aware date selector used across the whole app. It encapsulates
 * opening/closing the calendar, platform differences (inline on iOS, native
 * dialog on Android), the visual theme and the localized display, so no screen
 * reimplements this logic. Dates are always exchanged as `Date` objects; display
 * is centralized through {@link formatLocalizedDate}.
 */
export function DateField({
    value,
    onChange,
    onClear,
    label,
    placeholder,
    minimumDate,
    maximumDate,
    initialDate,
    disabled = false,
    error,
    containerStyle,
    triggerStyle,
    testID,
}: DateFieldProps) {
    const { t, i18n } = useTranslation();
    const { surface, border, text, mutedText, tint } = useAppTheme();
    const colorScheme = useColorScheme();
    const [open, setOpen] = useState(false);
    // Frozen value the iOS spinner opens with for the current session. It must
    // stay stable while the spinner is open, so it is NOT updated on every scroll.
    const [sessionValue, setSessionValue] = useState<Date | null>(null);
    // Latest scrolled value, tracked without re-rendering; committed on "Done".
    // Updating React state on every onChange makes the iOS spinner fight the
    // user's gesture and lock onto a single value, so we use a ref instead.
    const selectedRef = useRef<Date | null>(null);

    const displayValue = value ? formatLocalizedDate(value, i18n.language) : (placeholder ?? t('select_date'));
    // With no value selected the picker opens on today (clamped to the allowed
    // range), never on the Unix epoch or an arbitrary boundary date.
    const pickerValue = useMemo(
        () => value ?? clampDate(initialDate ?? new Date(), minimumDate, maximumDate),
        [value, initialDate, minimumDate, maximumDate],
    );

    const handleTriggerPress = () => {
        if (disabled) return;
        if (Platform.OS === 'android') {
            // Android must open the picker imperatively. Rendering the component
            // and letting it stay mounted across re-renders makes the native
            // dialog re-open and crash intermittently; this avoids that entirely.
            DateTimePickerAndroid.open({
                value: pickerValue,
                mode: 'date',
                minimumDate,
                maximumDate,
                onChange: (event, date) => {
                    if (event.type === 'set' && date) onChange(date);
                },
            });
            return;
        }
        // iOS: toggle the inline spinner. The graphical "inline" calendar crashes
        // inside ScrollView/Modal contexts, so we use the stable wheel spinner and
        // commit the value explicitly.
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
                accessibilityLabel={label ?? placeholder ?? t('select_date')}
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
                    <Ionicons name="calendar-outline" size={20} color={tint} />
                )}
            </Pressable>

            {Platform.OS === 'ios' && open ? (
                <View style={[styles.inlinePicker, { backgroundColor: surface, borderColor: border }]}>
                    <DateTimePicker
                        value={sessionValue ?? pickerValue}
                        mode="date"
                        display="spinner"
                        minimumDate={minimumDate}
                        maximumDate={maximumDate}
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
