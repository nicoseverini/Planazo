import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert } from 'react-native';

import { PlanForm } from '@/components/PlanForm';
import { AppScreen } from '@/components/ui';
import { INTEREST_BY_CATEGORY } from '@/constants/plan-form';
import { useAppTheme } from '@/hooks/use-app-theme';
import { usePlanForm } from '@/hooks/use-plan-form';
import { useGeocoding } from '@/services/geocoding';
import { PlanUpdateRequest, usePlans } from '@/services/plan';
import { parseAge } from '@/utils/age-restriction';
import { buildDateTimeWithTimezone, getLocalPartsInTimezone } from '@/utils/date';

export default function EditPlanScreen() {
    const { t } = useTranslation();
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { fetchPlanDetail, update } = usePlans();
    const { geocode } = useGeocoding();
    const form = usePlanForm();
    const { tint } = useAppTheme();
    const [loadingData, setLoadingData] = useState(true);
    const [planTimezone, setPlanTimezone] = useState('UTC');

    useEffect(() => {
        const loadPlan = async () => {
            if (!id) return;
            try {
                const plan = await fetchPlanDetail(Number(id));

                form.setTitle(plan.title || '');
                form.setDescription(plan.description || '');
                form.setCountry(plan.country || '');
                form.setCity(plan.city || '');
                form.setAddress(plan.address || plan.location || '');
                form.setIsPublic(plan.visibility === 'PUBLIC');
                form.setMinAge(plan.minAge ? plan.minAge.toString() : '');
                form.setMaxAge(plan.maxAge ? plan.maxAge.toString() : '');
                form.setMaxParticipants(plan.maxSubscribers ? plan.maxSubscribers.toString() : '');
                form.setBudget(plan.budget ? plan.budget.toString() : '');
                if (plan.images) form.setImages(plan.images);

                const tz = plan.timezone || 'UTC';
                setPlanTimezone(tz);

                const categoriesFromInterests = Object.keys(INTEREST_BY_CATEGORY).filter(
                    (key) => plan.interests?.includes(INTEREST_BY_CATEGORY[key])
                );
                form.setSelectedCategories(categoriesFromInterests);

                if (plan.latitude && plan.longitude) {
                    const coords = { latitude: plan.latitude, longitude: plan.longitude };
                    form.setPinLocation(coords);
                    setTimeout(() => {
                        form.mapRef.current?.animateToRegion({ ...coords, latitudeDelta: 0.02, longitudeDelta: 0.02 }, 1000);
                    }, 500);
                }

                if (plan.startDateTime) {
                    const startDate = new Date(plan.startDateTime);
                    const { date: localDate, time: localTime } = getLocalPartsInTimezone(startDate, tz);
                    form.setStartDate(localDate);
                    form.setStartTime(localTime);
                }

                if (plan.endDateTime) {
                    const endDate = new Date(plan.endDateTime);
                    const { date: localDate, time: localTime } = getLocalPartsInTimezone(endDate, tz);
                    form.setEndDate(localDate);
                    form.setEndTime(localTime);
                }
            } catch {
                Alert.alert(t('error'), t('error_load_plan'));
                router.back();
            } finally {
                setLoadingData(false);
            }
        };
        loadPlan();
    }, [id, t]);

    const handleUpdate = async () => {
        if (!form.validateForm()) return;

        const startDateTime = buildDateTimeWithTimezone(form.startDate, form.startTime, planTimezone);
        const endDateTime = buildDateTimeWithTimezone(form.endDate, form.endTime, planTimezone);

        if (!startDateTime) { form.setError(t('error_start_datetime_format')); return; }
        if (!endDateTime) { form.setError(t('error_end_datetime_format')); return; }

        const parsedMaxSubscribers = Number.parseInt(form.maxParticipants, 10);

        form.setSaving(true);
        form.setError(null);

        try {
            let finalLat = form.pinLocation?.latitude;
            let finalLng = form.pinLocation?.longitude;

            if (!finalLat || !finalLng) {
                const query = [form.address.trim(), form.city.trim(), form.country.trim()].filter(Boolean).join(', ');
                const geocoded = await geocode(query);
                finalLat = geocoded.latitude;
                finalLng = geocoded.longitude;
            }

            const mappedInterests = form.selectedCategories.map((cat) => INTEREST_BY_CATEGORY[cat]).filter(Boolean);
            const parsedBudget = form.budget.trim() ? Number(form.budget.trim()) : 0;

            const payload: PlanUpdateRequest = {
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
                timezone: planTimezone,
            };

            await update(Number(id), payload);
            Alert.alert(t('success'), t('plan_updated_success'), [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch (err) {
            form.setError(err instanceof Error ? err.message : t('error_update_plan'));
        } finally {
            form.setSaving(false);
        }
    };

    if (loadingData) {
        return (
            <AppScreen centered>
                <ActivityIndicator size="large" color={tint} />
            </AppScreen>
        );
    }

    return (
        <PlanForm
            {...form}
            screenTitle={t('edit_plan')}
            submitLabel={t('save_changes').toUpperCase()}
            onSubmit={handleUpdate}
            onBack={() => router.back()}
            descriptionPlaceholder={t('describe_plan_placeholder')}
        />
    );
}
