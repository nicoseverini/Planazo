import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

import { useTuristicPlaces } from '@/services/turistic-place';
import TuristicPlaceFormScreen, { DEFAULT_FORM_VALUES } from '@/screens/turistic-place-form-screen';

export default function CreateTuristicPlaceScreen() {
    const router = useRouter();
    const { create } = useTuristicPlaces();

    return (
        <TuristicPlaceFormScreen
            screenTitle="Create Place"
            submitLabel="CREATE PLACE"
            initialValues={DEFAULT_FORM_VALUES}
            onBack={() => router.back()}
            onSubmit={async (data) => {
                await create(data);
                Alert.alert('Success', 'Turistic place created!', [
                    { text: 'OK', onPress: () => router.back() },
                ]);
            }}
        />
    );
}
