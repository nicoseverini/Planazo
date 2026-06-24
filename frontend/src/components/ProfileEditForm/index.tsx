import { ActivityIndicator, Pressable, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import {
    GENDER_LABELS,
    GENDER_OPTIONS,
    INTEREST_LABELS,
    INTEREST_OPTIONS,
    LANGUAGE_OPTIONS,
    TRAVEL_TYPE_LABELS,
    TRAVEL_TYPE_OPTIONS,
} from '@/constants/profile-options';
import { useAppTheme } from '@/hooks/use-app-theme';
import { UserProfile } from '@/services/user';
import { styles } from '@/screens/user-profile-screen/styles';

type ProfileEditFormProps = {
    formData: UserProfile | null;
    onChange: (field: keyof UserProfile, value: string | string[] | number | undefined) => void;
    onToggleArrayValue: (field: 'interests' | 'languages', value: string) => void;
    onChangePhoto: () => void;
    onClearPhoto: () => void;
    onSave: () => void;
    onCancel: () => void;
    saving: boolean;
    error: string | null;
};

export function ProfileEditForm({
    formData,
    onChange,
    onToggleArrayValue,
    onChangePhoto,
    onClearPhoto,
    onSave,
    onCancel,
    saving,
    error,
}: ProfileEditFormProps) {
    const { tint, tintText, surface, border, mutedText, text, background } = useAppTheme();

    return (
        <View style={styles.editForm}>
            <ThemedText type="subtitle" style={styles.editTitle}>
                Edit information
            </ThemedText>

            <View style={styles.inputGroup}>
                <ThemedText type="label" style={{ color: mutedText }}>Name</ThemedText>
                <TextInput
                    style={[styles.input, { backgroundColor: surface, borderColor: border, color: text }]}
                    value={formData?.name || ''}
                    onChangeText={(value) => onChange('name', value.replace(/[0-9]/g, ''))}
                    placeholder="Your name"
                    placeholderTextColor={mutedText}
                />
            </View>

            <View style={styles.inputGroup}>
                <ThemedText type="label" style={{ color: mutedText }}>Last name</ThemedText>
                <TextInput
                    style={[styles.input, { backgroundColor: surface, borderColor: border, color: text }]}
                    value={formData?.lastname || ''}
                    onChangeText={(value) => onChange('lastname', value.replace(/[0-9]/g, ''))}
                    placeholder="Your last name"
                    placeholderTextColor={mutedText}
                />
            </View>

            <View style={styles.inputGroup}>
                <ThemedText type="label" style={{ color: mutedText }}>Email</ThemedText>
                <TextInput
                    style={[styles.input, styles.disabledInput, { backgroundColor: background, borderColor: border, color: mutedText }]}
                    value={formData?.email || ''}
                    editable={false}
                />
                <ThemedText type="label" style={{ color: mutedText, fontSize: 11, marginTop: 4 }}>
                    Email cannot be changed
                </ThemedText>
            </View>

            <View style={styles.inputGroup}>
                <ThemedText type="label" style={{ color: mutedText }}>Photo</ThemedText>
                <View style={styles.photoRow}>
                    <TextInput
                        style={[styles.input, styles.photoInput, { backgroundColor: surface, borderColor: border, color: text }]}
                        value={formData?.photo || ''}
                        onChangeText={(value) => onChange('photo', value)}
                        placeholder="https://..."
                        placeholderTextColor={mutedText}
                        autoCapitalize="none"
                    />
                    <Pressable onPress={onChangePhoto} style={[styles.photoButton, { borderColor: border }]}>
                        <ThemedText type="label" style={{ color: text }}>Select</ThemedText>
                    </Pressable>
                    <Pressable onPress={onClearPhoto} style={[styles.photoButton, { borderColor: border }]}>
                        <ThemedText type="label" style={{ color: text }}>Clear</ThemedText>
                    </Pressable>
                </View>
            </View>

            <View style={styles.inputGroup}>
                <ThemedText type="label" style={{ color: mutedText }}>Gender</ThemedText>
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
                                {GENDER_LABELS[option] ?? option}
                            </ThemedText>
                        </Pressable>
                    ))}
                </View>
            </View>

            <View style={styles.inputGroup}>
                <ThemedText type="label" style={{ color: mutedText }}>Interests</ThemedText>
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
                                    {INTEREST_LABELS[option] ?? option}
                                </ThemedText>
                            </Pressable>
                        );
                    })}
                </View>
            </View>

            <View style={styles.inputGroup}>
                <ThemedText type="label" style={{ color: mutedText }}>Languages</ThemedText>
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
                                    {option}
                                </ThemedText>
                            </Pressable>
                        );
                    })}
                </View>
            </View>

            <View style={styles.inputGroup}>
                <ThemedText type="label" style={{ color: mutedText }}>Travel type</ThemedText>
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
                                {TRAVEL_TYPE_LABELS[option] ?? option}
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
                            Save changes
                        </ThemedText>
                    )}
                </Pressable>
                <Pressable
                    onPress={onCancel}
                    disabled={saving}
                    style={[styles.secondaryButton, { borderColor: border }]}
                >
                    <ThemedText type="body" style={{ color: text }}>
                        Cancel
                    </ThemedText>
                </Pressable>
            </View>
        </View>
    );
}
