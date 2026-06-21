import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { TuristicPlaceCard } from '@/components/TuristicPlaceCard';
import { AppScreen } from '@/components/ui';
import { useToken } from '@/context/token-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { TuristicPlaceSummary, useTuristicPlaces } from '@/services/turistic-place';

import { styles } from './styles';

type Tab = 'all' | 'mine';

export default function TuristicPlaceListScreen() {
    const router = useRouter();
    const { tokenData } = useToken();
    const { fetchAll, fetchMine } = useTuristicPlaces();

    const tint = useThemeColor({}, 'tint');
    const tintText = useThemeColor({}, 'tintText');
    const border = useThemeColor({}, 'border');
    const mutedText = useThemeColor({}, 'mutedText');

    const [tab, setTab] = useState<Tab>('all');
    const [allPlaces, setAllPlaces] = useState<TuristicPlaceSummary[]>([]);
    const [myPlaces, setMyPlaces] = useState<TuristicPlaceSummary[]>([]);
    const [loading, setLoading] = useState(true);

    const isLoggedIn = tokenData.state === 'LOGGED_IN';

    const loadPlaces = useCallback(async () => {
        setLoading(true);
        try {
            const [all, mine] = await Promise.all([
                fetchAll(),
                isLoggedIn ? fetchMine() : Promise.resolve([]),
            ]);
            setAllPlaces(all);
            setMyPlaces(mine);
        } catch {
            Alert.alert('Error', 'Could not load turistic places.');
        } finally {
            setLoading(false);
        }
    }, [fetchAll, fetchMine, isLoggedIn]);

    useFocusEffect(
        useCallback(() => {
            loadPlaces();
        }, [loadPlaces])
    );

    const places = tab === 'mine' ? myPlaces : allPlaces;

    return (
        <AppScreen scrollable>
            {/* Header */}
            <View style={styles.header}>
                <ThemedText type="title">Turistic Places</ThemedText>
                {isLoggedIn && (
                    <Pressable
                        onPress={() => router.push('/turistic-place/create')}
                        style={({ pressed }) => [
                            styles.createButton,
                            { backgroundColor: tint },
                            pressed && styles.pressed,
                        ]}
                    >
                        <Ionicons name="add" size={18} color={tintText} />
                        <ThemedText type="label" style={{ color: tintText }}>New</ThemedText>
                    </Pressable>
                )}
            </View>

            {/* Tabs (only for logged-in users) */}
            {isLoggedIn && (
                <View style={styles.tabRow}>
                    <Pressable
                        onPress={() => setTab('all')}
                        style={[
                            styles.tabButton,
                            { borderColor: border },
                            tab === 'all' && { backgroundColor: tint, borderColor: tint },
                        ]}
                    >
                        <ThemedText type="label" style={{ color: tab === 'all' ? tintText : mutedText }}>
                            All
                        </ThemedText>
                    </Pressable>
                    <Pressable
                        onPress={() => setTab('mine')}
                        style={[
                            styles.tabButton,
                            { borderColor: border },
                            tab === 'mine' && { backgroundColor: tint, borderColor: tint },
                        ]}
                    >
                        <ThemedText type="label" style={{ color: tab === 'mine' ? tintText : mutedText }}>
                            My Places
                        </ThemedText>
                    </Pressable>
                </View>
            )}

            {/* Content */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={tint} />
                </View>
            ) : places.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="location-outline" size={48} color={mutedText} />
                    <ThemedText type="body" style={{ color: mutedText }}>
                        {tab === 'mine' ? 'You have no places yet.' : 'No turistic places found.'}
                    </ThemedText>
                    {tab === 'mine' && isLoggedIn && (
                        <Pressable
                            onPress={() => router.push('/turistic-place/create')}
                            style={[styles.createButton, { backgroundColor: tint }]}
                        >
                            <Ionicons name="add" size={18} color={tintText} />
                            <ThemedText type="label" style={{ color: tintText }}>Create one</ThemedText>
                        </Pressable>
                    )}
                </View>
            ) : (
                places.map((place) => (
                    <TuristicPlaceCard
                        key={place.id}
                        place={place}
                        onPress={() => router.push(`/turistic-place/${place.id}`)}
                    />
                ))
            )}
        </AppScreen>
    );
}
