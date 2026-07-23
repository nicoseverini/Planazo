import React from 'react';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

import { PlanForm } from '@/components/PlanForm';
import { INTEREST_BY_CATEGORY } from '@/constants/plan-form';
import { usePlanForm } from '@/hooks/use-plan-form';
import { useGeocoding } from '@/services/geocoding';
import { PlanCreateRequest, usePlans } from '@/services/plan';
import { parseAge } from '@/utils/age-restriction';
import { buildDateTimeWithTimezone, getDeviceTimezone } from '@/utils/date';

export default function CreatePlanScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { create } = usePlans();
    const { geocode } = useGeocoding();
    const form = usePlanForm();

    const handleCreate = async () => {
        if (!form.validateForm({ requireFutureStart: true })) return;

        const timezone = getDeviceTimezone();
        const startDateTime = buildDateTimeWithTimezone(form.startDate, form.startTime, timezone);
        const endDateTime = buildDateTimeWithTimezone(form.endDate, form.endTime, timezone);

        if (!startDateTime) { form.setError(t('error_start_datetime_format')); return; }
        if (!endDateTime) { form.setError(t('error_end_datetime_format')); return; }

        const parsedMaxSubscribers = Number.parseInt(form.maxParticipants, 10);

        form.setSaving(true);
        form.setError(null);

        try {
            let finalLat = form.pinLocation?.latitude;
            let finalLng = form.pinLocation?.longitude;

            if (!finalLat || !finalLng) {
                const query = [form.address.trim(), form.city.trim(), form.state.trim(), form.country.trim()].filter(Boolean).join(', ');
                const geocoded = await geocode(query);
                finalLat = geocoded.latitude;
                finalLng = geocoded.longitude;
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
                state: form.state.trim(),
                city: form.city.trim(),
                address: form.address.trim(),
                images: form.images.length > 0 ? form.images : undefined,
                budget: parsedBudget,
                timezone,
            };

            await create(payload);
            Alert.alert(t('success'), t('plan_created_success'), [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch (err) {
            form.setError(err instanceof Error ? t(err.message) : t('error_create_plan'));
        } finally {
            form.setSaving(false);
        }
    };

    return (
        <PlanForm
            {...form}
            screenTitle={t('create_plan_title')}
            submitLabel={t('create_plan_title').toUpperCase()}
            onSubmit={handleCreate}
            onBack={() => router.back()}
        />
    );
}
