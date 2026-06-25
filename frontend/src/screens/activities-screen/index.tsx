import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/ThemedText';
import { AppScreen } from '@/components/ui';
import { ACTIVITY_TYPES } from '@/config/activity-types';
import { useThemeColor } from '@/hooks/use-theme-color';

import { styles } from './styles';

export default function ActivitiesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const tint = useThemeColor({}, 'tint');
  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'border');
  const mutedText = useThemeColor({}, 'mutedText');

  const handlePress = (route: string) => {
    try {
      router.push(route as any);
    } catch {
      Alert.alert(t('error'), t('something_went_wrong'));
    }
  };

  return (
    <AppScreen scrollable>
      <View style={styles.header}>
        <ThemedText type="title">{t('activities')}</ThemedText>
        <ThemedText type="body" style={[styles.headerSubtitle, { color: mutedText }]}>
          {t('activities_desc')}
        </ThemedText>
      </View>

      <View style={styles.grid}>
        {ACTIVITY_TYPES.map((activity) => (
          <Pressable
            key={activity.id}
            onPress={() => handlePress(activity.route)}
            style={({ pressed }) => [
              styles.card,
              { backgroundColor: surface, borderColor: border },
              pressed && styles.cardPressed,
            ]}
          >
            <View style={[styles.iconContainer, { backgroundColor: tint + '20' }]}>
              <Ionicons name={activity.icon} size={32} color={tint} />
            </View>
            <View style={styles.cardContent}>
              <ThemedText type="subtitle" style={styles.cardTitle}>
                {t(`${activity.title}`)}
              </ThemedText>
              <ThemedText type="body" style={[styles.cardDescription, { color: mutedText }]}>
                {t(`${activity.description}`)}
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={mutedText} style={styles.chevron} />
          </Pressable>
        ))}
      </View>
    </AppScreen>
  );
}
