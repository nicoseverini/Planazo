import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/ThemedText';
import { TimeField } from '@/components/TimeField';
import { useAppTheme } from '@/hooks/use-app-theme';
import { parseClockTime } from '@/utils/date';
import { dayRowError, WEEKDAY_LABEL_KEY, type DaySchedule } from '@/utils/schedule';

import { styles } from './styles';

// Sensible defaults so opening a day never starts from an empty, error-prone state.
const DEFAULT_OPEN = () => parseClockTime('09:00');
const DEFAULT_CLOSE = () => parseClockTime('18:00');

type Props = {
    /** Full 7-day schedule (Monday → Sunday). */
    value: DaySchedule[];
    onChange: (next: DaySchedule[]) => void;
};

/**
 * Weekly opening-hours editor: one row per day with an Open/Closed toggle and, when open, two
 * reused {@link TimeField} pickers. Closed days are dimmed; open days are highlighted so the
 * user reads the week at a glance.
 */
export function WeeklyScheduleField({ value, onChange }: Props) {
    const { t } = useTranslation();
    const { tint, tintText, surface, border, mutedText, text } = useAppTheme();

    const updateDay = (index: number, patch: Partial<DaySchedule>) => {
        onChange(value.map((row, i) => (i === index ? { ...row, ...patch } : row)));
    };

    const toggleDay = (index: number) => {
        const row = value[index];
        if (row.open) {
            updateDay(index, { open: false });
            return;
        }
        // Re-opening keeps previously picked times; a first open seeds defaults.
        updateDay(index, {
            open: true,
            openTime: row.openTime ?? DEFAULT_OPEN(),
            closeTime: row.closeTime ?? DEFAULT_CLOSE(),
        });
    };

    return (
        <View style={styles.container}>
            {value.map((row, index) => {
                const errorKey = dayRowError(row);
                return (
                    <View
                        key={row.day}
                        style={[
                            styles.row,
                            { backgroundColor: surface, borderColor: row.open ? tint : border },
                        ]}
                    >
                        <View style={styles.rowHeader}>
                            <ThemedText
                                style={[styles.dayName, { color: row.open ? text : mutedText }]}
                            >
                                {t(WEEKDAY_LABEL_KEY[row.day])}
                            </ThemedText>
                            <Pressable
                                onPress={() => toggleDay(index)}
                                accessibilityRole="switch"
                                accessibilityState={{ checked: row.open }}
                                style={({ pressed }) => [
                                    styles.toggle,
                                    {
                                        backgroundColor: row.open ? tint : 'transparent',
                                        borderColor: row.open ? tint : border,
                                    },
                                    pressed && styles.pressed,
                                ]}
                            >
                                <Ionicons
                                    name={row.open ? 'checkmark-circle' : 'close-circle-outline'}
                                    size={16}
                                    color={row.open ? tintText : mutedText}
                                />
                                <ThemedText
                                    style={[styles.toggleLabel, { color: row.open ? tintText : mutedText }]}
                                >
                                    {row.open ? t('open') : t('closed')}
                                </ThemedText>
                            </Pressable>
                        </View>

                        {row.open ? (
                            <View style={styles.times}>
                                <TimeField
                                    label={t('opening_time')}
                                    value={row.openTime}
                                    onChange={(date) => updateDay(index, { openTime: date })}
                                />
                                <TimeField
                                    label={t('closing_time')}
                                    value={row.closeTime}
                                    onChange={(date) => updateDay(index, { closeTime: date })}
                                />
                            </View>
                        ) : (
                            <ThemedText type="body" style={[styles.closedText, { color: mutedText }]}>
                                {t('closed')}
                            </ThemedText>
                        )}

                        {errorKey ? (
                            <ThemedText style={styles.rowError}>{t(errorKey)}</ThemedText>
                        ) : null}
                    </View>
                );
            })}
        </View>
    );
}
