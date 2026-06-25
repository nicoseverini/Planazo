import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { useAppTheme } from '@/hooks/use-app-theme';
import { styles } from '@/screens/user-profile-screen/styles';

type MenuItemProps = {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress: () => void;
    danger?: boolean;
};

function MenuItem({ icon, label, onPress, danger = false }: MenuItemProps) {
    const { surface, border, mutedText } = useAppTheme();
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.menuItem,
                { backgroundColor: surface, borderColor: border },
                pressed && styles.pressed,
            ]}
        >
            <View style={styles.menuItemLeft}>
                <Ionicons name={icon} size={22} color={danger ? '#ef4444' : mutedText} />
                <ThemedText type="body" style={[styles.menuItemLabel, danger && { color: '#ef4444' }]}>
                    {label}
                </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={mutedText} />
        </Pressable>
    );
}

type AccountActionsProps = {
    onEditProfile: () => void;
    onLogout: () => void;
    onDeleteAccount: () => void;
};

/** Account section (own profile only): edit profile, log out, delete account. */
export function AccountActions({ onEditProfile, onLogout, onDeleteAccount }: AccountActionsProps) {
    const { mutedText } = useAppTheme();
    return (
        <>
            <View style={styles.menuSection}>
                <ThemedText type="label" style={[styles.sectionTitle, { color: mutedText }]}>
                    Account
                </ThemedText>
                <View style={styles.menuGroup}>
                    <MenuItem icon="person-outline" label="Edit profile" onPress={onEditProfile} />
                </View>
            </View>

            <View style={styles.menuSection}>
                <View style={styles.menuGroup}>
                    <MenuItem icon="log-out-outline" label="Log out" onPress={onLogout} danger />
                    <MenuItem icon="trash-outline" label="Delete account" onPress={onDeleteAccount} danger />
                </View>
            </View>
        </>
    );
}
