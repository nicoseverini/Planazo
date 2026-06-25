import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, View } from 'react-native';

import { AppScreen } from '@/components/ui';
import { useThemeColor } from '@/hooks/use-theme-color';
import { TouristPlaceDetail, useTouristPlaces } from '@/services/tourist-place';
import TouristPlaceFormScreen, { TouristPlaceFormValues } from '@/screens/tourist-place-form-screen';

function toFormValues(place: TouristPlaceDetail): TouristPlaceFormValues {
    return {
        name: place.name,
        cost: place.cost != null ? place.cost.toString() : '',
        minAge: place.minAge?.toString() ?? '',
        maxAge: place.maxAge?.toString() ?? '',
        interests: place.interests ?? [],
        country: place.country ?? '',
        city: place.city ?? '',
        address: place.address ?? place.location ?? '',
        latitude: place.latitude?.toString() ?? '-34.6037',
        longitude: place.longitude?.toString() ?? '-58.3816',
        images: place.images,
        description: place.description ?? '',
    };
}

export default function EditTouristPlaceScreen() {
    const { t } = useTranslation();
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { fetchById, update } = useTouristPlaces();
    const tint = useThemeColor({}, 'tint');

    const [initialValues, setInitialValues] = useState<TouristPlaceFormValues | null>(null);

    useEffect(() => {
        const placeId = parseInt(id ?? '', 10);
        if (isNaN(placeId)) return;
        fetchById(placeId)
            .then((place) => setInitialValues(toFormValues(place)))
            .catch(() => {
                Alert.alert(t('error'), t('error_load_place'));
                router.back();
            });
    }, [id, t]);

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
        <TouristPlaceFormScreen
            screenTitle={t('edit_place')}
            submitLabel={t('save_changes').toUpperCase()}
            initialValues={initialValues}
            onBack={() => router.back()}
            onSubmit={async (data) => {
                await update(placeId, data);
                Alert.alert(t('success'), t('place_updated_success'), [
                    { text: 'OK', onPress: () => router.back() },
                ]);
            }}
        />
    );
}
