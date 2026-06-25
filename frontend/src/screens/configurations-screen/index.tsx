import React, { useState, useEffect } from 'react';
import { View, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/ThemedText';
import { AppScreen } from '@/components/ui';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useProfile } from '@/services/user';
import { useAppThemeContext } from '@/context/ThemeContext';

import { styles } from './styles';

export default function ConfigurationsScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { updateLanguage } = useProfile();
  const { tint, surface, border, mutedText, text } = useAppTheme();
  const { themeMode, setThemeMode } = useAppThemeContext();

  const [currentLang, setCurrentLang] = useState(i18n.language || 'en');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setCurrentLang(i18n.language);
  }, [i18n.language]);

  const handleLanguageChange = async (lang: string) => {
    if (lang === currentLang) return;

    setSaving(true);
    try {
      // 1. Change local React Native language
      await i18n.changeLanguage(lang);
      setCurrentLang(lang);

      // 2. Persist choice in backend
      await updateLanguage(lang);
    } catch (error) {
      console.error('[ConfigurationsScreen] Error updating language:', error);
      Alert.alert(t('translation_error'), t('error_save_language_preferences'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppScreen centered={false}>
      {/* Header Row */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            { backgroundColor: surface, borderColor: border },
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="arrow-back" size={24} color={text} />
        </Pressable>
        <ThemedText type="heading" style={styles.headerTitle}>
          {t('configurations')}
        </ThemedText>
      </View>

      {/* Language Section */}
      <View style={styles.section}>
        <ThemedText type="subtitle" style={[styles.sectionTitle, { color: mutedText }]}>
          {t('select_language')}
        </ThemedText>

        <View style={styles.optionsContainer}>
          {/* English Option */}
          <Pressable
            onPress={() => handleLanguageChange('en')}
            disabled={saving}
            style={({ pressed }) => [
              styles.optionItem,
              { backgroundColor: surface, borderColor: currentLang === 'en' ? tint : border },
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.optionLeft}>
              <ThemedText style={styles.flagEmoji}>🇬🇧</ThemedText>
              <ThemedText type="body" style={styles.optionLabel}>
                {t('english')}
              </ThemedText>
            </View>
            {currentLang === 'en' && (
              <Ionicons name="checkmark-circle" size={22} color={tint} />
            )}
          </Pressable>

          {/* Spanish Option */}
          <Pressable
            onPress={() => handleLanguageChange('es')}
            disabled={saving}
            style={({ pressed }) => [
              styles.optionItem,
              { backgroundColor: surface, borderColor: currentLang === 'es' ? tint : border },
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.optionLeft}>
              <ThemedText style={styles.flagEmoji}>🇦🇷</ThemedText>
              <ThemedText type="body" style={styles.optionLabel}>
                {t('spanish')}
              </ThemedText>
            </View>
            {currentLang === 'es' && (
              <Ionicons name="checkmark-circle" size={22} color={tint} />
            )}
          </Pressable>
        </View>
      </View>

      {/* Theme Section */}
      <View style={[styles.section, { marginTop: 24 }]}>
        <ThemedText type="subtitle" style={[styles.sectionTitle, { color: mutedText }]}>
          {t('theme')}
        </ThemedText>

        <View style={styles.optionsContainer}>
          {/* Light Theme */}
          <Pressable
            onPress={() => setThemeMode('light')}
            style={({ pressed }) => [
              styles.optionItem,
              { backgroundColor: surface, borderColor: themeMode === 'light' ? tint : border },
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.optionLeft}>
              <Ionicons name="sunny-outline" size={22} color={themeMode === 'light' ? tint : text} />
              <ThemedText type="body" style={styles.optionLabel}>
                {t('light_theme')}
              </ThemedText>
            </View>
            {themeMode === 'light' && (
              <Ionicons name="checkmark-circle" size={22} color={tint} />
            )}
          </Pressable>

          {/* Dark Theme */}
          <Pressable
            onPress={() => setThemeMode('dark')}
            style={({ pressed }) => [
              styles.optionItem,
              { backgroundColor: surface, borderColor: themeMode === 'dark' ? tint : border },
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.optionLeft}>
              <Ionicons name="moon-outline" size={22} color={themeMode === 'dark' ? tint : text} />
              <ThemedText type="body" style={styles.optionLabel}>
                {t('dark_theme')}
              </ThemedText>
            </View>
            {themeMode === 'dark' && (
              <Ionicons name="checkmark-circle" size={22} color={tint} />
            )}
          </Pressable>

          {/* System Theme */}
          <Pressable
            onPress={() => setThemeMode('system')}
            style={({ pressed }) => [
              styles.optionItem,
              { backgroundColor: surface, borderColor: themeMode === 'system' ? tint : border },
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.optionLeft}>
              <Ionicons name="settings-outline" size={22} color={themeMode === 'system' ? tint : text} />
              <ThemedText type="body" style={styles.optionLabel}>
                {t('system_theme')}
              </ThemedText>
            </View>
            {themeMode === 'system' && (
              <Ionicons name="checkmark-circle" size={22} color={tint} />
            )}
          </Pressable>
        </View>
      </View>

      {saving && (
        <View style={styles.savingContainer}>
          <ActivityIndicator size="small" color={tint} />
          <ThemedText type="label" style={{ color: mutedText, marginLeft: 8 }}>
            Saving preference...
          </ThemedText>
        </View>
      )}
    </AppScreen>
  );
}
