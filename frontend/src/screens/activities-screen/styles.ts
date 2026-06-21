import { StyleSheet } from 'react-native';

import { Layout } from '@/constants/theme';

export const styles = StyleSheet.create({
  header: {
    gap: 6,
    marginBottom: 24,
  },
  headerSubtitle: {
    marginTop: 2,
  },
  grid: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: Layout.cardRadius,
    borderWidth: 1,
    gap: 16,
  },
  cardPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardContent: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 18,
  },
  cardDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  chevron: {
    flexShrink: 0,
  },
});
