import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/components/ThemedText';
import { useAppTheme } from '@/hooks/use-app-theme';

export type VisibilityBadgeProps = {
  type: 'PUBLIC' | 'PRIVATE';
};

export function VisibilityBadge({ type }: VisibilityBadgeProps) {
  const { t } = useTranslation();
  const { tint, accent } = useAppTheme();
  
  const isPublic = type === 'PUBLIC';
  const borderColor = isPublic ? tint : accent;
  
  return (
    <View style={[styles.badge, { borderColor }]}>
      <View style={[styles.dot, { backgroundColor: borderColor }]} />
      <ThemedText type="label" style={styles.text}>
        {isPublic ? t('public') : t('private')}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: 'rgba(13, 17, 23, 0.85)',
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    color: '#E5E7EB',
    fontWeight: '700',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
