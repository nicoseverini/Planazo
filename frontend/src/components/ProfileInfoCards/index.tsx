import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { useAppTheme } from '@/hooks/use-app-theme';
import { UserProfile } from '@/services/user';
import { styles } from '@/screens/user-profile-screen/styles';
import { formatBirthDate } from '@/utils/date';

import { useTranslation } from 'react-i18next';
import { formatInterest } from '@/utils/interests';

type InfoCardProps = {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string;
};

function InfoCard({ icon, label, value }: InfoCardProps) {
    const { surface, border, mutedText } = useAppTheme();
    return (
        <View style={[styles.infoCard, { backgroundColor: surface, borderColor: border }]}>
            <Ionicons name={icon} size={20} color={mutedText} />
            <View style={styles.infoContent}>
                <ThemedText type="label" style={{ color: mutedText }}>{label}</ThemedText>
                <ThemedText type="body">{value}</ThemedText>
            </View>
        </View>
    );
}

/** Read-only grid with the public profile information shared by own and other profiles. */
export function ProfileInfoCards({ user }: { user: UserProfile }) {
    const { t } = useTranslation();

    const genderValue = user.gender
        ? t(`gender_${user.gender.toLowerCase()}`, { defaultValue: user.gender })
        : t('not_set');

    const interestsValue = user.interests && user.interests.length > 0
        ? user.interests.map(interest => formatInterest(interest)).join(', ')
        : t('not_set');

    const languagesValue = user.languages && user.languages.length > 0
        ? user.languages.map(lang => t(`lang_${lang.toLowerCase()}`, { defaultValue: lang })).join(', ')
        : t('not_set');

    const travelTypeValue = user.travelType
        ? t(`travel_type_${user.travelType.toLowerCase()}`, { defaultValue: user.travelType })
        : t('not_set');

    return (
        <View style={styles.infoGrid}>
            {user.gender ? (
                <InfoCard icon="person-outline" label={t('gender')} value={genderValue} />
            ) : null}
            {user.birthDate ? (
                <InfoCard icon="calendar-outline" label={t('birth_date')} value={formatBirthDate(user.birthDate)} />
            ) : null}
            {user.zone ? (
                <InfoCard icon="location-outline" label={t('location')} value={user.zone} />
            ) : null}
            <InfoCard
                icon="heart-outline"
                label={t('interests')}
                value={interestsValue}
            />
            <InfoCard icon="language-outline" label={t('languages')} value={languagesValue} />
            <InfoCard
                icon="airplane-outline"
                label={t('travel_type')}
                value={travelTypeValue}
            />
        </View>
    );
}
