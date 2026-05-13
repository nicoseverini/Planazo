import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/use-theme-color';

import { styles } from './styles';

type NavItem = {
    icon: keyof typeof Ionicons.glyphMap;
    iconFocused: keyof typeof Ionicons.glyphMap;
    label: string;
    route: string;
};

const NAV_ITEMS: NavItem[] = [
    {
        icon: 'map-outline',
        iconFocused: 'map',
        label: 'Inicio',
        route: '/home',
    },
    {
        icon: 'search-outline',
        iconFocused: 'search',
        label: 'Buscar',
        route: '/search',
    },
    {
        icon: 'add-circle-outline',
        iconFocused: 'add-circle',
        label: 'Crear',
        route: '/create',
    },
    {
        icon: 'person-outline',
        iconFocused: 'person',
        label: 'Perfil',
        route: '/profile',
    },
];

type NavItemButtonProps = {
    item: NavItem;
    isActive: boolean;
    tint: string;
    mutedText: string;
    onPress: () => void;
};

function NavItemButton({ item, isActive, tint, mutedText, onPress }: NavItemButtonProps) {
    const isCreateButton = item.route === '/create';

    if (isCreateButton) {
        return (
            <Pressable
                onPress={onPress}
                style={({ pressed }) => [
                    styles.navItem,
                    pressed && styles.pressed,
                ]}
            >
                <View style={[styles.createButton, { backgroundColor: tint }]}>
                    <Ionicons
                        name="add"
                        size={24}
                        color="#ffffff"
                    />
                </View>
            </Pressable>
        );
    }

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.navItem,
                pressed && styles.pressed,
            ]}
        >
            <Ionicons
                name={isActive ? item.iconFocused : item.icon}
                size={24}
                color={isActive ? tint : mutedText}
            />
            <ThemedText
                type="label"
                style={[
                    styles.navLabel,
                    { color: isActive ? tint : mutedText },
                ]}
            >
                {item.label}
            </ThemedText>
        </Pressable>
    );
}

export function BottomNavBar() {
    const router = useRouter();
    const pathname = usePathname();

    const surface = useThemeColor({}, 'surface');
    const border = useThemeColor({}, 'border');
    const tint = useThemeColor({}, 'tint');
    const mutedText = useThemeColor({}, 'mutedText');

    const handleNavigation = (route: string) => {
        router.push(route as any);
    };

    return (
        <View style={[styles.container, { backgroundColor: surface, borderTopColor: border }]}>
            {NAV_ITEMS.map((item) => (
                <NavItemButton
                    key={item.route}
                    item={item}
                    isActive={pathname === item.route || pathname.startsWith(item.route + '/')}
                    tint={tint}
                    mutedText={mutedText}
                    onPress={() => handleNavigation(item.route)}
                />
            ))}
        </View>
    );
}
