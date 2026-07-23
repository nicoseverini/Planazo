import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/ThemedText';
import { ACTIVITY_TYPES } from '@/config/activity-types';
import { useThemeColor } from '@/hooks/use-theme-color';

import { styles } from './styles';

type NavItem = {
    icon: keyof typeof Ionicons.glyphMap;
    iconFocused: keyof typeof Ionicons.glyphMap;
    translationKey: string;
    route: string;
};

const NAV_ITEMS: NavItem[] = [
    {
        icon: 'home-outline',
        iconFocused: 'home',
        translationKey: 'home',
        route: '/home',
    },
    {
        icon: 'map-outline',
        iconFocused: 'map',
        translationKey: 'map',
        route: '/map',
    },
    {
        icon: 'compass-outline',
        iconFocused: 'compass',
        translationKey: 'activities',
        route: '/activities',
    },
    {
        icon: 'bookmark-outline',
        iconFocused: 'bookmark',
        translationKey: 'my_activities',
        route: '/my-plans',
    },
    {
        icon: 'person-outline',
        iconFocused: 'person',
        translationKey: 'profile',
        route: '/profile',
    },
];

const ACTIVITIES_CHILD_ROUTES: string[] = ACTIVITY_TYPES.flatMap(
    (a) => a.childRoutes ?? []
);

function isNavItemActive(item: NavItem, pathname: string): boolean {
    if (pathname === item.route || pathname.startsWith(item.route + '/')) return true;
    if (item.route === '/activities') {
        return ACTIVITIES_CHILD_ROUTES.some(
            (r) => pathname === r || pathname.startsWith(r + '/')
        );
    }
    if (item.route === '/profile') {
        return pathname === '/configurations' || pathname.startsWith('/configurations/');
    }
    return false;
}

type NavItemButtonProps = {
    item: NavItem;
    isActive: boolean;
    tint: string;
    mutedText: string;
    onPress: () => void;
};

function NavItemButton({ item, isActive, tint, mutedText, onPress }: NavItemButtonProps) {
    const { t } = useTranslation();
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
                {t(item.translationKey)}
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
                    isActive={isNavItemActive(item, pathname)}
                    tint={tint}
                    mutedText={mutedText}
                    onPress={() => handleNavigation(item.route)}
                />
            ))}
        </View>
    );
}
