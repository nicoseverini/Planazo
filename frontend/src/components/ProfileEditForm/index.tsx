import { ActivityIndicator, Pressable, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import {
    GENDER_OPTIONS,
    INTEREST_OPTIONS,
    LANGUAGE_OPTIONS,
    TRAVEL_TYPE_OPTIONS,
} from '@/constants/profile-options';
import { useAppTheme } from '@/hooks/use-app-theme';
import { UserProfile } from '@/services/user';
import { styles } from '@/screens/user-profile-screen/styles';
import { useTranslation } from 'react-i18next';
import { formatInterest } from '@/utils/interests';

function calculateAge(birthDateString?: string): string {
    if (!birthDateString) return '';
    const today = new Date();
    const birthDate = new Date(birthDateString);
    if (isNaN(birthDate.getTime())) return '';
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return String(age);
}

type ProfileEditFormProps = {
    formData: UserProfile | null;
    onChange: (field: keyof UserProfile, value: string | string[] | number | undefined) => void;
    onToggleArrayValue: (field: 'interests' | 'languages', value: string) => void;
    onSave: () => void;
    onCancel: () => void;
    saving: boolean;
    error: string | null;
};

export function ProfileEditForm({
    formData,
    onChange,
    onToggleArrayValue,
    onSave,
    onCancel,
    saving,
    error,
}: ProfileEditFormProps) {
    const { tint, tintText, surface, border, mutedText, text, background } = useAppTheme();
    const { t } = useTranslation();

    return (
        <View style={styles.editForm}>
            <ThemedText type="subtitle" style={styles.editTitle}>
                {t('edit_information')}
            </ThemedText>

            <View style={styles.inputGroup}>
                <ThemedText type="label" style={{ color: mutedText }}>{t('name')}</ThemedText>
                <TextInput
                    style={[styles.input, { backgroundColor: surface, borderColor: border, color: text }]}
                    value={formData?.name || ''}
                    onChangeText={(value) => onChange('name', value.replace(/[0-9]/g, ''))}
                    placeholder={t('your_name')}
                    placeholderTextColor={mutedText}
                />
            </View>

            <View style={styles.inputGroup}>
                <ThemedText type="label" style={{ color: mutedText }}>{t('lastname')}</ThemedText>
                <TextInput
                    style={[styles.input, { backgroundColor: surface, borderColor: border, color: text }]}
                    value={formData?.lastname || ''}
                    onChangeText={(value) => onChange('lastname', value.replace(/[0-9]/g, ''))}
                    placeholder={t('your_last_name')}
                    placeholderTextColor={mutedText}
                />
            </View>

            <View style={styles.inputGroup}>
                <ThemedText type="label" style={{ color: mutedText }}>{t('email')}</ThemedText>
                <TextInput
                    style={[styles.input, styles.disabledInput, { backgroundColor: background, borderColor: border, color: mutedText }]}
                    value={formData?.email || ''}
                    editable={false}
                />
                <ThemedText type="label" style={{ color: mutedText, fontSize: 11, marginTop: 4 }}>
                    {t('email_disabled_warning')}
                </ThemedText>
            </View>

            <View style={styles.inputGroup}>
                <ThemedText type="label" style={{ color: mutedText }}>{t('age')}</ThemedText>
                <TextInput
                    style={[styles.input, styles.disabledInput, { backgroundColor: background, borderColor: border, color: mutedText }]}
                    value={formData?.age ? String(formData.age) : (formData?.birthDate ? calculateAge(formData.birthDate) : '')}
                    editable={false}
                    placeholder={t('not_set')}
                    placeholderTextColor={mutedText}
                />
                <ThemedText type="label" style={{ color: mutedText, fontSize: 11, marginTop: 4 }}>
                    {t('age_disabled_warning')}
                </ThemedText>
            </View>

            <View style={styles.inputGroup}>
                <ThemedText type="label" style={{ color: mutedText }}>{t('gender')}</ThemedText>
                <View style={[styles.selectContainer, { backgroundColor: surface, borderColor: border }]}>
                    {GENDER_OPTIONS.map((option) => (
                        <Pressable
                            key={option}
                            onPress={() => onChange('gender', option)}
                            style={[styles.selectOption, formData?.gender === option && { backgroundColor: tint }]}
                        >
                            <ThemedText
                                type="label"
                                style={{ color: formData?.gender === option ? tintText : text, fontSize: 12 }}
                            >
                                {t(`gender_${option.toLowerCase()}`, { defaultValue: option })}
                            </ThemedText>
                        </Pressable>
                    ))}
                </View>
            </View>

            <View style={styles.inputGroup}>
                <ThemedText type="label" style={{ color: mutedText }}>{t('interests')}</ThemedText>
                <View style={[styles.selectContainer, { backgroundColor: surface, borderColor: border }]}>
                    {INTEREST_OPTIONS.map((option) => {
                        const selected = formData?.interests?.includes(option);
                        return (
                            <Pressable
                                key={option}
                                onPress={() => onToggleArrayValue('interests', option)}
                                style={[styles.selectOption, selected && { backgroundColor: tint }]}
                            >
                                <ThemedText type="label" style={{ color: selected ? tintText : text, fontSize: 12 }}>
                                    {formatInterest(option)}
                                </ThemedText>
                            </Pressable>
                        );
                    })}
                </View>
            </View>

            <View style={styles.inputGroup}>
                <ThemedText type="label" style={{ color: mutedText }}>{t('languages')}</ThemedText>
                <View style={[styles.selectContainer, { backgroundColor: surface, borderColor: border }]}>
                    {LANGUAGE_OPTIONS.map((option) => {
                        const selected = formData?.languages?.includes(option);
                        return (
                            <Pressable
                                key={option}
                                onPress={() => onToggleArrayValue('languages', option)}
                                style={[styles.selectOption, selected && { backgroundColor: tint }]}
                            >
                                <ThemedText type="label" style={{ color: selected ? tintText : text, fontSize: 12 }}>
                                    {t(`lang_${option.toLowerCase()}`, { defaultValue: option })}
                                </ThemedText>
                            </Pressable>
                        );
                    })}
                </View>
            </View>

            <View style={styles.inputGroup}>
                <ThemedText type="label" style={{ color: mutedText }}>{t('travel_type')}</ThemedText>
                <View style={[styles.selectContainer, { backgroundColor: surface, borderColor: border }]}>
                    {TRAVEL_TYPE_OPTIONS.map((option) => (
                        <Pressable
                            key={option}
                            onPress={() => onChange('travelType', option)}
                            style={[styles.selectOption, formData?.travelType === option && { backgroundColor: tint }]}
                        >
                            <ThemedText
                                type="label"
                                style={{ color: formData?.travelType === option ? tintText : text, fontSize: 12 }}
                            >
                                {t(`travel_type_${option.toLowerCase()}`, { defaultValue: option })}
                            </ThemedText>
                        </Pressable>
                    ))}
                </View>
            </View>

            {error && (
                <View style={styles.errorContainer}>
                    <ThemedText type="body" style={{ color: '#ef4444' }}>
                        {error}
                    </ThemedText>
                </View>
            )}

            <View style={styles.formActions}>
                <Pressable
                    onPress={onSave}
                    disabled={saving}
                    style={[styles.primaryButton, { backgroundColor: tint, opacity: saving ? 0.6 : 1 }]}
                >
                    {saving ? (
                        <ActivityIndicator size="small" color={tintText} />
                    ) : (
                        <ThemedText type="body" style={{ color: tintText, fontWeight: '600' }}>
                            {t('save_changes')}
                        </ThemedText>
                    )}
                </Pressable>
                <Pressable
                    onPress={onCancel}
                    disabled={saving}
                    style={[styles.secondaryButton, { borderColor: border }]}
                >
                    <ThemedText type="body" style={{ color: text }}>
                        {t('cancel')}
                    </ThemedText>
                </Pressable>
            </View>
        </View>
    );
}
