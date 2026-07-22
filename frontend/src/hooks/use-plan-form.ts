import * as ImagePicker from 'expo-image-picker';
import { useRef, useState } from 'react';
import { Alert } from 'react-native';
import type MapView from 'react-native-maps';
import { useTranslation } from 'react-i18next';

import { useGeocoding } from '@/services/geocoding';
import { validateAgeFields } from '@/utils/age-restriction';
import { addOneHour, buildDateTimeWithTimezone, formatTime24, getDeviceTimezone, toISODate } from '@/utils/date';
import { ensureMediaLibraryPermission } from '@/utils/media-permissions';

export function usePlanForm() {
    const { t } = useTranslation();
    const { geocode, reverse } = useGeocoding();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(true);

    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('');

    const [endDate, setEndDate] = useState('');
    const [endTime, setEndTime] = useState('');

    const mapRef = useRef<MapView>(null);
    const [isSearchingLoc, setIsSearchingLoc] = useState(false);
    const [country, setCountry] = useState('');
    const [state, setState] = useState('');
    const [city, setCity] = useState('');
    const [address, setAddress] = useState('');
    const [isFetchingAddress, setIsFetchingAddress] = useState(false);
    const [pinLocation, setPinLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [minAge, setMinAge] = useState('');
    const [maxAge, setMaxAge] = useState('');
    const [maxParticipants, setMaxParticipants] = useState('');
    const [budget, setBudget] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [images, setImages] = useState<string[]>([]);

    const handleAddImage = async () => {
        const granted = await ensureMediaLibraryPermission();
        if (!granted) {
            Alert.alert(t('permission_required'), t('gallery_permission_desc_images'));
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
            base64: true,
        });
        if (result.canceled || !result.assets?.length) return;
        const asset = result.assets[0];
        if (!asset.base64) {
            setError(t('error_read_image'));
            return;
        }
        const mimeType = asset.mimeType ?? 'image/jpeg';
        setImages((prev) => [...prev, `data:${mimeType};base64,${asset.base64}`]);
    };

    const handleRemoveImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const toggleCategory = (cat: string) => {
        setSelectedCategories((prev) =>
            prev.includes(cat) ? prev.filter((entry) => entry !== cat) : [...prev, cat]
        );
    };

    const handleSearchAddress = async () => {
        const query = [address.trim(), city.trim(), state.trim(), country.trim()].filter(Boolean).join(', ');
        if (!query) return;
        setIsSearchingLoc(true);
        try {
            const { latitude, longitude } = await geocode(query);
            setPinLocation({ latitude, longitude });
            mapRef.current?.animateToRegion({ latitude, longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 }, 1000);
            if (!state.trim() && city.trim()) setState(city.trim());
        } catch (err) {
            Alert.alert(t('not_found'), err instanceof Error ? err.message : t('error_search_address'));
        } finally {
            setIsSearchingLoc(false);
        }
    };

    const handleMapInteract = async (coordinate: { latitude: number; longitude: number }) => {
        setPinLocation(coordinate);
        setIsFetchingAddress(true);
        try {
            const result = await reverse(coordinate);
            if (result.country) setCountry(result.country);
            const resolvedCity = result.city || '';
            setCity(resolvedCity);
            setState(result.state || resolvedCity);
            let streetAddress = '';
            if (result.street) {
                streetAddress = result.street;
                if (result.streetNumber) streetAddress += ` ${result.streetNumber}`;
            } else if (result.displayName) {
                streetAddress = result.displayName;
            }
            setAddress(streetAddress.trim());
        } catch (err) {
            Alert.alert(t('error'), err instanceof Error ? err.message : t('error_search_address'));
        } finally {
            setIsFetchingAddress(false);
        }
    };

    // Start and end date/time are kept purely as strings; the final datetime is
    // assembled from them via buildDateTimeWithTimezone. Picking a start date
    // cascades to the end date (a plan starts and ends the same day by default).
    const applyStartDate = (picked: Date) => {
        const iso = toISODate(picked);
        setStartDate(iso);
        setEndDate(iso);
    };

    const applyEndDate = (picked: Date) => {
        setEndDate(toISODate(picked));
    };

    // Picking a start time defaults the end time to one hour later.
    const applyStartTime = (picked: Date) => {
        const formatted = formatTime24(picked);
        setStartTime(formatted);
        setEndTime(addOneHour(formatted));
    };

    const applyEndTime = (picked: Date) => {
        setEndTime(formatTime24(picked));
    };

    const validateForm = ({ requireFutureStart = false } = {}): boolean => {
        if (!title.trim()) { setError(t('error_title_required')); return false; }
        if (!startDate.trim() || !startTime.trim()) { setError(t('error_start_date_time_required')); return false; }
        if (requireFutureStart) {
            const startDt = buildDateTimeWithTimezone(startDate, startTime, getDeviceTimezone());
            if (startDt && new Date(startDt) <= new Date()) {
                setError(t('error_start_future'));
                return false;
            }
        }
        if (!endDate.trim() || !endTime.trim()) { setError(t('error_end_date_time_required')); return false; }
        if (!country.trim()) { setError(t('error_country_required')); return false; }
        if (!city.trim()) { setError(t('error_city_required')); return false; }
        if (!address.trim()) { setError(t('error_address_required')); return false; }
        if (selectedCategories.length === 0) { setError(t('error_select_category')); return false; }
        const ageError = validateAgeFields(minAge, maxAge);
        if (ageError) { setError(ageError); return false; }
        const trimmedMax = maxParticipants.trim();
        const parsedMax = Number.parseInt(trimmedMax, 10);
        if (!trimmedMax || Number.isNaN(parsedMax) || parsedMax <= 0 || parsedMax > 99_999) {
            setError(t('error_max_participants_range'));
            return false;
        }
        const trimmedBudget = budget.trim();
        if (trimmedBudget) {
            const parsedBudget = Number(trimmedBudget);
            if (!Number.isFinite(parsedBudget)) { setError(t('error_budget_invalid')); return false; }
            if (parsedBudget < 0) { setError(t('error_budget_negative')); return false; }
            if (parsedBudget > 9_999_999) { setError(t('error_budget_limit')); return false; }
        }
        return true;
    };

    return {
        saving, setSaving,
        error, setError,
        title, setTitle,
        description, setDescription,
        isPublic, setIsPublic,
        startDate, setStartDate,
        startTime, setStartTime,
        endDate, setEndDate,
        endTime, setEndTime,
        isSearchingLoc,
        country, setCountry,
        state, setState,
        city, setCity,
        address, setAddress,
        isFetchingAddress,
        pinLocation, setPinLocation,
        minAge, setMinAge,
        maxAge, setMaxAge,
        maxParticipants, setMaxParticipants,
        budget, setBudget,
        selectedCategories, setSelectedCategories,
        images, setImages,
        mapRef,
        handleAddImage,
        handleRemoveImage,
        toggleCategory,
        handleSearchAddress,
        handleMapInteract,
        applyStartDate,
        applyStartTime,
        applyEndDate,
        applyEndTime,
        validateForm,
    };
}

export type PlanFormValues = ReturnType<typeof usePlanForm>;
