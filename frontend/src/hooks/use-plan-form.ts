import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRef, useState } from 'react';
import { Alert } from 'react-native';
import type { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import type MapView from 'react-native-maps';
import { useTranslation } from 'react-i18next';

import { validateAgeFields } from '@/utils/age-restriction';
import { addOneHour, buildDateTimeWithTimezone, getDeviceTimezone } from '@/utils/date';
import { ensureMediaLibraryPermission } from '@/utils/media-permissions';

export function usePlanForm() {
    const { t } = useTranslation();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(true);

    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [internalStartDate, setInternalStartDate] = useState(new Date());

    const [endDate, setEndDate] = useState('');
    const [endTime, setEndTime] = useState('');
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);
    const [internalEndDate, setInternalEndDate] = useState(new Date());

    const mapRef = useRef<MapView>(null);
    const [isSearchingLoc, setIsSearchingLoc] = useState(false);
    const [country, setCountry] = useState('');
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
        const query = [address.trim(), city.trim(), country.trim()].filter(Boolean).join(', ');
        if (!query) return;
        setIsSearchingLoc(true);
        try {
            const geocoded = await Location.geocodeAsync(query);
            if (geocoded.length > 0) {
                const { latitude, longitude } = geocoded[0];
                setPinLocation({ latitude, longitude });
                mapRef.current?.animateToRegion({ latitude, longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 }, 1000);
            } else {
                Alert.alert(t('not_found'), t('specific_location_hint'));
            }
        } catch {
            Alert.alert(t('error'), t('error_search_address'));
        } finally {
            setIsSearchingLoc(false);
        }
    };

    const handleMapInteract = async (coordinate: { latitude: number; longitude: number }) => {
        setPinLocation(coordinate);
        setIsFetchingAddress(true);
        try {
            const geocoded = await Location.reverseGeocodeAsync(coordinate);
            if (geocoded?.length > 0) {
                const result = geocoded[0];
                if (result.country) setCountry(result.country);
                setCity(result.city || result.subregion || '');
                let streetAddress = '';
                if (result.street) {
                    streetAddress = result.street;
                    if (result.streetNumber) streetAddress += ` ${result.streetNumber}`;
                } else if (result.name) {
                    streetAddress = result.name;
                }
                setAddress(streetAddress.trim());
            }
        } catch (err) {
            console.error('Error fetching address:', err);
        } finally {
            setIsFetchingAddress(false);
        }
    };

    const handleStartDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        if (event.type === 'set' && selectedDate) {
            setInternalStartDate(selectedDate);
            const day = selectedDate.getDate().toString().padStart(2, '0');
            const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
            const year = selectedDate.getFullYear();
            const formatted = `${day}/${month}/${year}`;
            setStartDate(formatted);
            setEndDate(formatted);
            setInternalEndDate(selectedDate);
            setShowStartDatePicker(false);
        } else if (event.type === 'dismissed') {
            setShowStartDatePicker(false);
        }
    };

    const handleStartTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        if (event.type === 'set' && selectedDate) {
            setInternalStartDate(selectedDate);
            const hours = selectedDate.getHours().toString().padStart(2, '0');
            const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
            const formatted = `${hours}:${minutes}`;
            setStartTime(formatted);
            setEndTime(addOneHour(formatted));
            setShowStartTimePicker(false);
        } else if (event.type === 'dismissed') {
            setShowStartTimePicker(false);
        }
    };

    const handleEndDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        if (event.type === 'set' && selectedDate) {
            setInternalEndDate(selectedDate);
            const day = selectedDate.getDate().toString().padStart(2, '0');
            const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
            const year = selectedDate.getFullYear();
            setEndDate(`${day}/${month}/${year}`);
            setShowEndDatePicker(false);
        } else if (event.type === 'dismissed') {
            setShowEndDatePicker(false);
        }
    };

    const handleEndTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        if (event.type === 'set' && selectedDate) {
            setInternalEndDate(selectedDate);
            const hours = selectedDate.getHours().toString().padStart(2, '0');
            const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
            setEndTime(`${hours}:${minutes}`);
            setShowEndTimePicker(false);
        } else if (event.type === 'dismissed') {
            setShowEndTimePicker(false);
        }
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
        showStartDatePicker, setShowStartDatePicker,
        showStartTimePicker, setShowStartTimePicker,
        internalStartDate, setInternalStartDate,
        endDate, setEndDate,
        endTime, setEndTime,
        showEndDatePicker, setShowEndDatePicker,
        showEndTimePicker, setShowEndTimePicker,
        internalEndDate, setInternalEndDate,
        isSearchingLoc,
        country, setCountry,
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
        handleStartDateChange,
        handleStartTimeChange,
        handleEndDateChange,
        handleEndTimeChange,
        validateForm,
    };
}

export type PlanFormValues = ReturnType<typeof usePlanForm>;
