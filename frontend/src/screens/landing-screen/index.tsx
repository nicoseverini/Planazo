import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Image, Modal, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { AppScreen } from '@/components/ui';
import { useAppThemeContext } from '@/context/ThemeContext';
import { useAppTheme } from '@/hooks/use-app-theme';

import { styles } from './styles';

export default function LandingScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();

  const { theme, toggleTheme } = useAppThemeContext();
  const { background, surface, tint, tintText, border: borderColor, text } = useAppTheme();

  const [langModalVisible, setLangModalVisible] = useState(false);

  return (
    <AppScreen centered style={{ backgroundColor: background }} safeAreaEdges={['left', 'right', 'bottom']}>
      {/* Discreet Top-Header Quick Actions */}
      {/* Dynamic Theme Toggle Button (Top-Left) */}
      <Pressable
        onPress={toggleTheme}
        style={({ pressed }) => [
          styles.iconButtonLeft,
          { backgroundColor: surface, borderColor: borderColor, top: Math.max(insets.top, 12) },
          pressed && styles.pressed,
        ]}
      >
        <Ionicons
          name={theme === 'dark' ? 'sunny-outline' : 'moon-outline'}
          size={20}
          color={text}
        />
      </Pressable>

      {/* Language Picker Selector Button (Top-Right) */}
      <Pressable
        onPress={() => setLangModalVisible(true)}
        style={({ pressed }) => [
          styles.iconButtonRight,
          { backgroundColor: surface, borderColor: borderColor, top: Math.max(insets.top, 12) },
          pressed && styles.pressed,
        ]}
      >
        <Ionicons name="globe-outline" size={20} color={text} />
      </Pressable>

      <View style={styles.center}>
        <Image
          source={
            theme === 'dark'
              ? require('../../../assets/images/icon.png')
              : require('../../../assets/images/icon_white.png')
          }
          style={styles.logo}
          resizeMode="contain"
        />

        <ThemedText type="heading" style={styles.titleContainer}>{t('welcome')}</ThemedText>
        <ThemedText type="body" style={styles.subtitle}>
          {t('welcome_subtitle')}
        </ThemedText>
      </View>

      <View style={styles.bottom}>
        <Pressable
          onPress={() => router.push('/(auth)/login')}
          style={({ pressed }) => [
            styles.buttonPrimary,
            { backgroundColor: tint },
            pressed && styles.pressed,
          ]}
        >
          <ThemedText type="buttonLarge" lightColor={tintText} darkColor={tintText} style={styles.buttonPrimaryText}>{t('sign_in')}</ThemedText>
        </Pressable>

        <Pressable
          onPress={() => router.push('/(auth)/register')}
          style={({ pressed }) => [
            styles.buttonSecondary,
            { backgroundColor: surface, borderColor },
            pressed && styles.pressed,
          ]}
        >
          <ThemedText type="buttonMedium" style={styles.buttonSecondaryText}>{t('register')}</ThemedText>
        </Pressable>
      </View>

      {/* Language Picker Modal */}
      <Modal
        visible={langModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLangModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setLangModalVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: surface, borderColor: borderColor }]}>
            <ThemedText type="subtitle" style={styles.modalTitle}>
              {t('select_language') || 'Select Language'}
            </ThemedText>

            <Pressable
              onPress={() => {
                i18n.changeLanguage('en');
                setLangModalVisible(false);
              }}
              style={({ pressed }) => [
                styles.langOption,
                i18n.language === 'en' && { backgroundColor: tint + '15' },
                pressed && styles.pressed,
              ]}
            >
              <ThemedText style={styles.langEmoji}>🇬🇧</ThemedText>
              <ThemedText type="body" style={styles.langLabel}>
                {t('english')}
              </ThemedText>
              {i18n.language === 'en' && (
                <Ionicons name="checkmark" size={20} color={tint} />
              )}
            </Pressable>

            <Pressable
              onPress={() => {
                i18n.changeLanguage('es');
                setLangModalVisible(false);
              }}
              style={({ pressed }) => [
                styles.langOption,
                i18n.language === 'es' && { backgroundColor: tint + '15' },
                pressed && styles.pressed,
              ]}
            >
              <ThemedText style={styles.langEmoji}>🇦🇷</ThemedText>
              <ThemedText type="body" style={styles.langLabel}>
                {t('spanish')}
              </ThemedText>
              {i18n.language === 'es' && (
                <Ionicons name="checkmark" size={20} color={tint} />
              )}
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </AppScreen>
  );
}
