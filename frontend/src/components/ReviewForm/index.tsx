import { StarRating } from '@/components/StarRating';
import { ThemedText } from '@/components/ThemedText';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    TextInput,
    View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

export interface ReviewFormProps {
    onSubmit: (rating: number, comment: string) => Promise<void>;
    submitting: boolean;
    initialRating?: number;
    initialComment?: string;
    onCancel?: () => void;
}

export function ReviewForm({
    onSubmit,
    submitting,
    initialRating,
    initialComment,
    onCancel,
}: ReviewFormProps) {
    const { surface, border, mutedText, text, tint, tintText } = useAppTheme();
    const { t } = useTranslation();
    const [rating, setRating] = useState<number>(initialRating ?? 0);
    const [comment, setComment] = useState<string>(initialComment ?? '');
    const [validationError, setValidationError] = useState<string | null>(null);

    const isEditing = initialRating !== undefined;

    const handleSubmit = async () => {
        if (rating === 0) {
            setValidationError(t('select_star_rating'));
            return;
        }
        if (!comment.trim()) {
            setValidationError(t('write_comment'));
            return;
        }
        setValidationError(null);
        try {
            await onSubmit(rating, comment);
            if (!isEditing) {
                setRating(0);
                setComment('');
            }
        } catch (err) {
            setValidationError(err instanceof Error ? err.message : t('submit_review_failed'));
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: surface, borderColor: border }]}>
            <ThemedText type="subtitle" style={styles.title}>
                {isEditing ? t('edit_your_review') : t('leave_review')}
            </ThemedText>

            <View style={styles.ratingRow}>
                <ThemedText type="body" style={{ color: text, marginRight: 12 }}>
                    {t('your_rating')}
                </ThemedText>
                <StarRating rating={rating} onChange={setRating} size={28} />
            </View>

            <TextInput
                style={[
                    styles.input,
                    {
                        backgroundColor: surface,
                        borderColor: border,
                        color: text,
                    },
                ]}
                value={comment}
                onChangeText={(val) => {
                    setComment(val);
                    if (validationError) setValidationError(null);
                }}
                placeholder={t('share_experience')}
                placeholderTextColor={mutedText}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                editable={!submitting}
            />

            {validationError && (
                <ThemedText type="body" style={styles.errorText}>
                    {validationError}
                </ThemedText>
            )}

            <View style={onCancel ? styles.buttonRow : undefined}>
                <Pressable
                    onPress={handleSubmit}
                    disabled={submitting}
                    style={({ pressed }) => [
                        styles.submitButton,
                        { backgroundColor: tint, flex: onCancel ? 1 : undefined },
                        (pressed || submitting) && styles.disabled,
                    ]}
                >
                    {submitting ? (
                        <ActivityIndicator size="small" color={tintText} />
                    ) : (
                        <ThemedText type="body" style={[styles.submitButtonText, { color: tintText }]}>
                            {isEditing ? t('update_review') : t('submit_review')}
                        </ThemedText>
                    )}
                </Pressable>

                {onCancel && (
                    <Pressable
                        onPress={onCancel}
                        disabled={submitting}
                        style={({ pressed }) => [
                            styles.cancelButton,
                            { borderColor: border, flex: 1 },
                            pressed && styles.disabled,
                        ]}
                    >
                        <ThemedText type="body" style={[styles.cancelButtonText, { color: text }]}>
                            {t('cancel')}
                        </ThemedText>
                    </Pressable>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 20,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        minHeight: 80,
        fontSize: 14,
        marginBottom: 12,
    },
    errorText: {
        color: '#ef4444',
        fontSize: 13,
        marginBottom: 12,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
    },
    submitButton: {
        height: 44,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitButtonText: {
        fontWeight: '600',
        fontSize: 14,
    },
    cancelButton: {
        height: 44,
        borderRadius: 8,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButtonText: {
        fontWeight: '600',
        fontSize: 14,
    },
    disabled: {
        opacity: 0.7,
    },
});
