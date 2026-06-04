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
        icon: 'home-outline',
        iconFocused: 'home',
        label: 'Home',
        route: '/home',
    },
    {
        icon: 'map-outline',
        iconFocused: 'map',
        label: 'Map',
        route: '/map',
    },
    {
        icon: 'calendar-outline',
        iconFocused: 'calendar',
        label: 'Plans',
        route: '/search-plans',
    },
    {
        icon: 'bookmark-outline',
        iconFocused: 'bookmark',
        label: 'My Plans',
        route: '/my-plans',
    },
    {
        icon: 'location-outline',
        iconFocused: 'location',
        label: 'Places',
        route: '/turistic-places',
    },
    {
        icon: 'person-outline',
        iconFocused: 'person',
        label: 'User',
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
                size={22}
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
        if (pathname === route || pathname.startsWith(route + '/')) {
            return;
        }

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
