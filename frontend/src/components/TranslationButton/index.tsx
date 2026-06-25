import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useTranslationService } from '@/services/translate';
import { isSpanishText } from '@/utils/language';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

export interface TranslationButtonProps {
    originalText: string;
    targetLanguage?: string;
    onTranslationRowReceived: (translatedText: string | null) => void;
}

export function TranslationButton({
    originalText,
    targetLanguage,
    onTranslationRowReceived,
}: TranslationButtonProps) {
    const { tint, mutedText } = useAppTheme();
    const { t, i18n } = useTranslation();
    const { translate: apiTranslate } = useTranslationService();

    const [translatedText, setTranslatedText] = useState<string | null>(null);
    const [showingTranslation, setShowingTranslation] = useState(false);
    const [translating, setTranslating] = useState(false);
    const [translationError, setTranslationError] = useState(false);

    // Reset translation state if originalText changes
    useEffect(() => {
        setTranslatedText(null);
        setShowingTranslation(false);
        setTranslationError(false);
    }, [originalText]);

    const rawAppLang = i18n.language || 'en';
    const activeAppLang = rawAppLang.split('-')[0].toLowerCase();

    // The Rule: If active language is Spanish (es) and the original text is in another language (not Spanish), show button.
    // OR if active language is English (en) and the original text is in Spanish, show button.
    const shouldShow =
        (activeAppLang === 'es' && !isSpanishText(originalText)) ||
        (activeAppLang === 'en' && isSpanishText(originalText));

    if (!shouldShow) {
        return null;
    }

    const handleTranslateToggle = async () => {
        if (showingTranslation) {
            setShowingTranslation(false);
            onTranslationRowReceived(null);
            return;
        }

        if (translatedText) {
            setShowingTranslation(true);
            onTranslationRowReceived(translatedText);
            return;
        }

        setTranslating(true);
        setTranslationError(false);
        try {
            const target = targetLanguage || activeAppLang;
            const response = await apiTranslate(originalText, target);
            setTranslatedText(response.translatedText);
            setShowingTranslation(true);
            onTranslationRowReceived(response.translatedText);
        } catch {
            setTranslationError(true);
        } finally {
            setTranslating(false);
        }
    };

    return (
        <View style={styles.translateRow}>
            {translating ? (
                <View style={styles.translateButton}>
                    <ActivityIndicator size="small" color={tint} />
                    <ThemedText type="label" style={[styles.translateText, { color: mutedText }]}>
                        {t('translating')}
                    </ThemedText>
                </View>
            ) : translationError ? (
                <ThemedText type="label" style={[styles.translateText, { color: '#ef4444' }]}>
                    {t('translation_error')}
                </ThemedText>
            ) : (
                <Pressable onPress={handleTranslateToggle} style={styles.translateButton}>
                    <Ionicons
                        name={showingTranslation ? 'eye-outline' : 'language-outline'}
                        size={16}
                        color={tint}
                    />
                    <ThemedText type="label" style={[styles.translateText, { color: tint }]}>
                        {showingTranslation ? t('show_original') : t('translate_review')}
                    </ThemedText>
                </Pressable>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    translateRow: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    translateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    translateText: {
        fontSize: 13,
        fontWeight: '600',
    },
});
