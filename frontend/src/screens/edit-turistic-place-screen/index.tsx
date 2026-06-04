import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';

import { AppScreen } from '@/components/ui';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
    TuristicPlaceDetail,
    useTuristicPlaces,
} from '@/services/turistic-place';
import TuristicPlaceFormScreen, { TuristicPlaceFormValues } from '@/screens/turistic-place-form-screen';

function toFormValues(place: TuristicPlaceDetail): TuristicPlaceFormValues {
    return {
        name: place.name,
        cost: place.cost.toString(),
        minAge: place.minAge?.toString() ?? '',
        maxAge: place.maxAge?.toString() ?? '',
        interest: place.interest,
        location: place.location ?? '',
        latitude: place.latitude?.toString() ?? '-34.6037',
        longitude: place.longitude?.toString() ?? '-58.3816',
        images: place.images,
        description: place.description ?? '',
    };
}

export default function EditTuristicPlaceScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { fetchById, update } = useTuristicPlaces();
    const tint = useThemeColor({}, 'tint');

    const [initialValues, setInitialValues] = useState<TuristicPlaceFormValues | null>(null);

    useEffect(() => {
        const placeId = parseInt(id ?? '', 10);
        if (isNaN(placeId)) return;
        fetchById(placeId)
            .then((place) => setInitialValues(toFormValues(place)))
            .catch(() => {
                Alert.alert('Error', 'Could not load the place.');
                router.back();
            });
    }, [id]);

    if (!initialValues) {
        return (
            <AppScreen>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color={tint} />
                </View>
            </AppScreen>
        );
    }

    const placeId = parseInt(id ?? '', 10);

    return (
        <TuristicPlaceFormScreen
            screenTitle="Edit Place"
            submitLabel="SAVE CHANGES"
            initialValues={initialValues}
            onBack={() => router.back()}
            onSubmit={async (data) => {
                await update(placeId, data);
                Alert.alert('Success', 'Place updated!', [
                    { text: 'OK', onPress: () => router.back() },
                ]);
            }}
        />
    );
}
