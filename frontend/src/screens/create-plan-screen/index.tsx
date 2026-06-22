import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

import { PlanForm } from '@/components/PlanForm';
import { INTEREST_BY_CATEGORY } from '@/constants/plan-form';
import { usePlanForm } from '@/hooks/use-plan-form';
import { PlanCreateRequest, usePlans } from '@/services/plan';
import { parseAge } from '@/utils/age-restriction';
import { buildDateTimeWithTimezone, getDeviceTimezone } from '@/utils/date';

export default function CreatePlanScreen() {
    const router = useRouter();
    const { create } = usePlans();
    const form = usePlanForm();

    const handleCreate = async () => {
        if (!form.validateForm({ requireFutureStart: true })) return;

        const timezone = getDeviceTimezone();
        const startDateTime = buildDateTimeWithTimezone(form.startDate, form.startTime, timezone);
        const endDateTime = buildDateTimeWithTimezone(form.endDate, form.endTime, timezone);

        if (!startDateTime) { form.setError('Start date or time has an invalid format.'); return; }
        if (!endDateTime) { form.setError('End date or time has an invalid format.'); return; }

        const parsedMaxSubscribers = Number.parseInt(form.maxParticipants, 10);

        form.setSaving(true);
        form.setError(null);

        try {
            let finalLat = form.pinLocation?.latitude;
            let finalLng = form.pinLocation?.longitude;

            if (!finalLat || !finalLng) {
                const query = [form.address.trim(), form.city.trim(), form.country.trim()].filter(Boolean).join(', ');
                const geocodedLocation = await Location.geocodeAsync(query);
                if (!geocodedLocation || geocodedLocation.length === 0) {
                    form.setError('We could not find the location on the map. Try being more specific (e.g., add city and country).');
                    form.setSaving(false);
                    return;
                }
                finalLat = geocodedLocation[0].latitude;
                finalLng = geocodedLocation[0].longitude;
            }

            const mappedInterests = form.selectedCategories.map((cat) => INTEREST_BY_CATEGORY[cat]).filter(Boolean);
            const parsedBudget = form.budget.trim() ? Number(form.budget.trim()) : 0;

            const payload: PlanCreateRequest = {
                title: form.title.trim(),
                description: form.description.trim(),
                startDateTime,
                endDateTime,
                latitude: finalLat!,
                longitude: finalLng!,
                visibility: form.isPublic ? 'PUBLIC' : 'PRIVATE',
                maxSubscribers: parsedMaxSubscribers,
                minAge: parseAge(form.minAge),
                maxAge: parseAge(form.maxAge),
                interests: mappedInterests,
                country: form.country.trim(),
                city: form.city.trim(),
                address: form.address.trim(),
                images: form.images.length > 0 ? form.images : undefined,
                budget: parsedBudget,
                timezone,
            };

            await create(payload);
            Alert.alert('Success', 'Plan created successfully', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch (err) {
            form.setError(err instanceof Error ? err.message : 'Could not create the plan. Please try again.');
        } finally {
            form.setSaving(false);
        }
    };

    return (
        <PlanForm
            {...form}
            screenTitle="Create Plan"
            submitLabel="CREATE PLAN"
            onSubmit={handleCreate}
        />
    );
}
