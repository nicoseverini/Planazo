import React from 'react';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useTuristicPlaces } from '@/services/turistic-place';
import TuristicPlaceFormScreen, { DEFAULT_FORM_VALUES } from '@/screens/turistic-place-form-screen';

export default function CreateTuristicPlaceScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { create } = useTuristicPlaces();

    return (
        <TuristicPlaceFormScreen
            screenTitle={t('create_place_title')}
            submitLabel={t('create_place_title').toUpperCase()}
            initialValues={DEFAULT_FORM_VALUES}
            onBack={() => router.back()}
            onSubmit={async (data) => {
                await create(data);
                Alert.alert(t('success'), t('place_created_success'), [
                    { text: 'OK', onPress: () => router.back() },
                ]);
            }}
        />
    );
}
