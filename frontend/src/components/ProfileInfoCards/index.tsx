import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import {
    GENDER_LABELS,
    INTEREST_LABELS,
    TRAVEL_TYPE_LABELS,
} from '@/constants/profile-options';
import { useAppTheme } from '@/hooks/use-app-theme';
import { UserProfile } from '@/services/user';
import { styles } from '@/screens/user-profile-screen/styles';
import { formatList, formatValue } from '@/utils/profile';

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
    return (
        <View style={styles.infoGrid}>
            {user.gender ? (
                <InfoCard icon="person-outline" label="Gender" value={formatValue(user.gender, GENDER_LABELS)} />
            ) : null}
            {user.birthDate ? (
                <InfoCard icon="calendar-outline" label="Birth date" value={user.birthDate} />
            ) : null}
            {user.zone ? (
                <InfoCard icon="location-outline" label="Location" value={user.zone} />
            ) : null}
            <InfoCard
                icon="heart-outline"
                label="Interests"
                value={formatList(user.interests, INTEREST_LABELS)}
            />
            <InfoCard icon="language-outline" label="Languages" value={formatList(user.languages)} />
            <InfoCard
                icon="airplane-outline"
                label="Travel type"
                value={formatValue(user.travelType, TRAVEL_TYPE_LABELS)}
            />
        </View>
    );
}
