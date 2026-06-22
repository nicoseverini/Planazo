import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    ScrollView,
    TextInput,
    View,
    Platform,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import MapView , {Marker} from "react-native-maps";

import { ThemedText } from '@/components/ThemedText';
import { AppScreen } from '@/components/ui';
import { useThemeColor } from '@/hooks/use-theme-color';
import { PlanCreateRequest, usePlans } from '@/services/plan';
import { validateAgeFields, parseAge } from '@/utils/age-restriction';
import { getDeviceTimezone } from '@/utils/date';

import { styles } from './styles';

const CATEGORY_OPTIONS = [
    'Food',
    'Culture',
    'Nature',
    'Beach',
    'Adventure',
    'Nightlife',
    'Shopping',
    'History',
    'Mountains',
    'Sports',
    'Other',
] as const;

const INTEREST_BY_CATEGORY: Record<string, string> = {
    Food:      'FOOD',
    Culture:   'CULTURE',
    Nature:    'NATURE',
    Beach:     'BEACH',
    Adventure: 'ADVENTURE',
    Nightlife: 'NIGHTLIFE',
    Shopping:  'SHOPPING',
    History:   'HISTORY',
    Mountains: 'MOUNTAINS',
    Sports:    'SPORTS',
    Other:     'OTHER',
};

const buildDateTime = (dateValue: string, timeValue: string): string | null => {
    const dateText = dateValue.trim();
    const timeText = timeValue.trim();
    if (!dateText || !timeText) return null;

    let day = '';
    let month = '';
    let year = '';

    if (dateText.includes('/')) {
        const parts = dateText.split('/');
        if (parts.length !== 3) return null;
        [day, month, year] = parts;
    } else if (dateText.includes('-')) {
        const parts = dateText.split('-');
        if (parts.length !== 3) return null;
        [year, month, day] = parts;
    } else {
        return null;
    }

    const timeParts = timeText.split(':');
    if (timeParts.length < 2) return null;
    const [hour, minute] = timeParts;

    const normalizedDate = `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    const normalizedTime = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;

    // Append the device's UTC offset so the backend validates against the correct instant.
    // getTimezoneOffset() returns minutes behind UTC (negative for UTC+), so we negate it.
    const offsetMin = -new Date().getTimezoneOffset();
    const sign = offsetMin >= 0 ? '+' : '-';
    const absMin = Math.abs(offsetMin);
    const offsetStr = `${sign}${Math.floor(absMin / 60).toString().padStart(2, '0')}:${(absMin % 60).toString().padStart(2, '0')}`;

    return `${normalizedDate}T${normalizedTime}:00${offsetStr}`;
};

const addOneHour = (timeValue: string): string => {
    const parts = timeValue.split(':');
    if (parts.length < 2) return '';
    const hours = (Number.parseInt(parts[0], 10) + 1) % 24;
    return `${hours.toString().padStart(2, '0')}:${parts[1]}`;
};

export default function CreatePlanScreen() {
    const router = useRouter();
    const { create } = usePlans();

    const tint = useThemeColor({}, 'tint');
    const tintText = useThemeColor({}, 'tintText');
    const surface = useThemeColor({}, 'surface');
    const border = useThemeColor({}, 'border');
    const mutedText = useThemeColor({}, 'mutedText');
    const text = useThemeColor({}, 'text');
    const background = useThemeColor({}, 'background');

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(true);

    // Start date/time
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [internalStartDate, setInternalStartDate] = useState(new Date());

    // End date/time
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
    const [pinLocation, setPinLocation] = useState<{latitude: number, longitude: number} | null>(null);
    const [minAge, setMinAge] = useState('');
    const [maxAge, setMaxAge] = useState('');
    const [maxParticipants, setMaxParticipants] = useState('');
    const [budget, setBudget] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<Array<(typeof CATEGORY_OPTIONS)[number]>>([]);
    const [images, setImages] = useState<string[]>([]);

    const handleAddImage = async () => {
        if (Platform.OS !== 'ios') {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (permission.status !== 'granted') {
                Alert.alert('Permission required', 'We need access to your gallery to choose images.');
                return;
            }
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
            base64: true,
        });

        if (result.canceled || !result.assets?.length) {
            return;
        }

        const asset = result.assets[0];
            if (!asset.base64) {
            setError('Could not read selected image.');
            return;
        }

        const mimeType = asset.mimeType ?? 'image/jpeg';
        const dataUrl = `data:${mimeType};base64,${asset.base64}`;
        setImages([...images, dataUrl]);
    };

    const handleRemoveImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const validateForm = (): boolean => {
        if (!title.trim()) {
            setError('Title is required');
            return false;
        }
        if (!startDate.trim() || !startTime.trim()) {
            setError('Start date and time are required');
            return false;
        }
        const startDt = buildDateTime(startDate, startTime);
        if (startDt && new Date(startDt) <= new Date()) {
            setError('Start date and time must be set in the future.');
            return false;
        }
        if (!endDate.trim() || !endTime.trim()) {
            setError('End date and time are required');
            return false;
        }
        if (!country.trim()) {
            setError('Country is required.');
            return false;
        }
        if (!city.trim()) {
            setError('City is required.');
            return false;
        }
        if (!address.trim()) {
            setError('Address is required.');
            return false;
        }
        if (selectedCategories.length === 0) {
            setError('Select at least one category');
            return false;
        }
        const ageError = validateAgeFields(minAge, maxAge);
        if (ageError) { setError(ageError); return false; }
        const trimmedMax = maxParticipants.trim();
        const parsedMax = Number.parseInt(trimmedMax, 10);
        if (!trimmedMax || Number.isNaN(parsedMax) || parsedMax <= 0 || parsedMax > 99_999) {
            setError('Max participants must be between 1 and 99,999.');
            return false;
        }
        const trimmedBudget = budget.trim();
        if (trimmedBudget) {
            const parsedBudget = Number(trimmedBudget);
            if (!Number.isFinite(parsedBudget)) {
                setError('Budget must be a valid number.');
                return false;
            }
            if (parsedBudget < 0) {
                setError('Budget must be greater than or equal to 0.');
                return false;
            }
            if (parsedBudget > 9_999_999) {
                setError('Budget cannot exceed 9,999,999.');
                return false;
            }
        }
        return true;
    };

    const toggleCategory = (cat: (typeof CATEGORY_OPTIONS)[number]) => {
        if (selectedCategories.includes(cat)) {
            setSelectedCategories(selectedCategories.filter((entry) => entry !== cat));
            return;
        }
        setSelectedCategories([...selectedCategories, cat]);
    };

    const handleSearchAddress = async () => {
        const query = [address.trim(), city.trim(), country.trim()].filter(Boolean).join(', ');
        if (!query) return;
        setIsSearchingLoc(true);
        try {
            const geocoded = await Location.geocodeAsync(query);
            if (geocoded.length > 0) {
                const { latitude, longitude } = geocoded[0];
                const newCoords = { latitude, longitude };
                setPinLocation(newCoords);
                mapRef.current?.animateToRegion({
                    latitude,
                    longitude,
                    latitudeDelta: 0.02,
                    longitudeDelta: 0.02,
                }, 1000);
            } else {
                Alert.alert('Not found', 'Try being more specific or check the address.');
            }
        } catch (e) {
            console.log(e);
            Alert.alert('Error', 'There was a problem searching the address.');
        } finally {
            setIsSearchingLoc(false);
        }
    };

    const handleMapInteract = async (coordinate: {latitude: number, longitude: number}) => {
        setPinLocation(coordinate);
        setIsFetchingAddress(true);

        try {
            const geocoded = await Location.reverseGeocodeAsync(coordinate);

            if (geocoded && geocoded.length > 0) {
                const result = geocoded[0];

                if (result.country) setCountry(result.country);

                const cityPart = result.city || result.subregion || '';
                setCity(cityPart);

                let streetAddress = '';
                if (result.street) {
                    streetAddress = result.street;
                    if (result.streetNumber) streetAddress += ` ${result.streetNumber}`;
                } else if (result.name) {
                    streetAddress = result.name;
                }
                setAddress(streetAddress.trim());
            }
        } catch (error) {
            console.error("Error fetching address:", error);
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
            // Auto-copy start date to end date
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
            // Auto-set end time to 1 hour later
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

    const handleCreate = async () => {
        if (!validateForm()) return;

        const startDateTime = buildDateTime(startDate, startTime);
        const endDateTime = buildDateTime(endDate, endTime);

        if (!startDateTime) {
            setError('Start date or time has an invalid format.');
            return;
        }
        if (!endDateTime) {
            setError('End date or time has an invalid format.');
            return;
        }

        const parsedMaxSubscribers = Number.parseInt(maxParticipants, 10);

        setSaving(true);
        setError(null);

        try {
            let finalLat = pinLocation?.latitude;
            let finalLng = pinLocation?.longitude;

            if (!finalLat || !finalLng) {
                const query = [address.trim(), city.trim(), country.trim()].filter(Boolean).join(', ');
                const geocodedLocation = await Location.geocodeAsync(query);
                if (!geocodedLocation || geocodedLocation.length === 0) {
                    setError('We could not find the location on the map. Try being more specific (e.g., add city and country).');
                    setSaving(false);
                    return;
                }
                finalLat = geocodedLocation[0].latitude;
                finalLng = geocodedLocation[0].longitude;
            }

            const mappedInterests = selectedCategories
                .map((cat) => INTEREST_BY_CATEGORY[cat])
                .filter(Boolean);

            const parsedBudget = budget.trim() ? Number(budget.trim()) : 0;

            const payload: PlanCreateRequest = {
                title: title.trim(),
                description: description.trim(),
                startDateTime,
                endDateTime,
                latitude: finalLat,
                longitude: finalLng,
                visibility: isPublic ? 'PUBLIC' : 'PRIVATE',
                maxSubscribers: parsedMaxSubscribers,
                minAge: parseAge(minAge),
                maxAge: parseAge(maxAge),
                interests: mappedInterests,
                country: country.trim(),
                city: city.trim(),
                address: address.trim(),
                images: images.length > 0 ? images : undefined,
                budget: parsedBudget,
                timezone: getDeviceTimezone(),
            };

            await create(payload);
            Alert.alert('Success', 'Plan created successfully', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Could not create the plan. Please try again.';
            setError(msg);
        } finally {
            setSaving(false);
        }
    };

    const dateTimeInputStyle = [styles.input, { backgroundColor: surface, borderColor: border, flexDirection: 'row' as const, alignItems: 'center' as const, padding: 0, overflow: 'hidden' as const }];

    return (
        <AppScreen scrollable>
            {/* Header */}
            <View style={styles.header}>
                <Pressable
                    onPress={() => router.back()}
                    style={({ pressed }) => [
                        styles.headerButton,
                        { backgroundColor: surface, borderColor: border },
                        pressed && styles.pressed,
                    ]}
                >
                    <Ionicons name="arrow-back" size={24} color={text} />
                </Pressable>
                <ThemedText type="title">Create Plan</ThemedText>
            </View>

            {/* Titulo y visibilidad */}
            <View style={styles.titleRow}>
                <View style={styles.titleInput}>
                    <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>
                        Title
                    </ThemedText>
                    <TextInput
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Plan name"
                        placeholderTextColor={mutedText}
                        style={[
                            styles.input,
                            { backgroundColor: surface, borderColor: border, color: text },
                        ]}
                    />
                </View>
                <View style={styles.visibilityToggle}>
                    <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>
                        Visibility
                    </ThemedText>
                    <View style={[styles.toggleContainer, { backgroundColor: surface, borderColor: border }]}>
                        <Pressable
                            onPress={() => setIsPublic(false)}
                            style={[
                                styles.toggleOption,
                                !isPublic && { backgroundColor: tint },
                            ]}
                        >
                            <ThemedText
                                type="label"
                                style={{ color: !isPublic ? tintText : mutedText, fontSize: 11 }}
                            >
                                Private
                            </ThemedText>
                        </Pressable>
                        <Pressable
                            onPress={() => setIsPublic(true)}
                            style={[
                                styles.toggleOption,
                                isPublic && { backgroundColor: tint },
                            ]}
                        >
                            <ThemedText
                                type="label"
                                style={{ color: isPublic ? tintText : mutedText, fontSize: 11 }}
                            >
                                Public
                            </ThemedText>
                        </Pressable>
                    </View>
                </View>
            </View>

            {/* Start date/time */}
            <View style={styles.row}>
                <View style={styles.halfInput}>
                    <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>
                        Start Date
                    </ThemedText>
                    <Pressable
                        onPress={() => setShowStartDatePicker(!showStartDatePicker)}
                        style={({ pressed }) => [
                            styles.input,
                            { backgroundColor: surface, borderColor: border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
                            pressed && styles.pressed
                        ]}
                    >
                        <ThemedText style={[{ color: text, fontSize: 16 }, !startDate && { color: mutedText }]}>
                            {startDate || 'DD/MM/YYYY'}
                        </ThemedText>
                        <Ionicons name="calendar-outline" size={20} color={tint} />
                    </Pressable>
                    {showStartDatePicker && (
                        <View style={[styles.inlinePicker, { borderColor: border }]}>
                            <DateTimePicker
                                value={internalStartDate}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'inline' : 'spinner'}
                                minimumDate={new Date()}
                                onChange={handleStartDateChange}
                            />
                        </View>
                    )}
                </View>
                <View style={styles.halfInput}>
                    <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>
                        Start Time
                    </ThemedText>
                    <Pressable
                        onPress={() => setShowStartTimePicker(!showStartTimePicker)}
                        style={({ pressed }) => [
                            styles.input,
                            { backgroundColor: surface, borderColor: border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
                            pressed && styles.pressed
                        ]}
                    >
                        <ThemedText style={[{ color: text, fontSize: 16 }, !startTime && { color: mutedText }]}>
                            {startTime || 'HH:MM'}
                        </ThemedText>
                        <Ionicons name="time-outline" size={20} color={tint} />
                    </Pressable>
                    {showStartTimePicker && (
                        <View style={[styles.inlinePicker, { borderColor: border }]}>
                            <DateTimePicker
                                value={internalStartDate}
                                mode="time"
                                display={Platform.OS === 'ios' ? 'inline' : 'spinner'}
                                is24Hour={true}
                                onChange={handleStartTimeChange}
                            />
                        </View>
                    )}
                </View>
            </View>

            {/* End date/time */}
            <View style={styles.row}>
                <View style={styles.halfInput}>
                    <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>
                        End Date
                    </ThemedText>
                    <Pressable
                        onPress={() => setShowEndDatePicker(!showEndDatePicker)}
                        style={({ pressed }) => [
                            styles.input,
                            { backgroundColor: surface, borderColor: border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
                            pressed && styles.pressed
                        ]}
                    >
                        <ThemedText style={[{ color: text, fontSize: 16 }, !endDate && { color: mutedText }]}>
                            {endDate || 'DD/MM/YYYY'}
                        </ThemedText>
                        <Ionicons name="calendar-outline" size={20} color={tint} />
                    </Pressable>
                    {showEndDatePicker && (
                        <View style={[styles.inlinePicker, { borderColor: border }]}>
                            <DateTimePicker
                                value={internalEndDate}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'inline' : 'spinner'}
                                minimumDate={new Date()}
                                onChange={handleEndDateChange}
                            />
                        </View>
                    )}
                </View>
                <View style={styles.halfInput}>
                    <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>
                        End Time
                    </ThemedText>
                    <Pressable
                        onPress={() => setShowEndTimePicker(!showEndTimePicker)}
                        style={({ pressed }) => [
                            styles.input,
                            { backgroundColor: surface, borderColor: border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
                            pressed && styles.pressed
                        ]}
                    >
                        <ThemedText style={[{ color: text, fontSize: 16 }, !endTime && { color: mutedText }]}>
                            {endTime || 'HH:MM'}
                        </ThemedText>
                        <Ionicons name="time-outline" size={20} color={tint} />
                    </Pressable>
                    {showEndTimePicker && (
                        <View style={[styles.inlinePicker, { borderColor: border }]}>
                            <DateTimePicker
                                value={internalEndDate}
                                mode="time"
                                display={Platform.OS === 'ios' ? 'inline' : 'spinner'}
                                is24Hour={true}
                                onChange={handleEndTimeChange}
                            />
                        </View>
                    )}
                </View>
            </View>

            {/* Restricciones de edad */}
            <View style={styles.row}>
                <View style={styles.halfInput}>
                    <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>
                        Min Age
                    </ThemedText>
                    <TextInput
                        value={minAge}
                        onChangeText={setMinAge}
                        placeholder="0"
                        placeholderTextColor={mutedText}
                        keyboardType="numeric"
                        style={[styles.input, { backgroundColor: surface, borderColor: border, color: text }]}
                    />
                </View>
                <View style={styles.halfInput}>
                    <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>
                        Max Age
                    </ThemedText>
                    <TextInput
                        value={maxAge}
                        onChangeText={setMaxAge}
                        placeholder="0 = no limit"
                        placeholderTextColor={mutedText}
                        keyboardType="numeric"
                        style={[styles.input, { backgroundColor: surface, borderColor: border, color: text }]}
                    />
                </View>
            </View>

            {/* Location: Country / City / Address + Map */}
            <View style={styles.inputGroup}>
                <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>
                    Country
                </ThemedText>
                <TextInput
                    value={country}
                    onChangeText={setCountry}
                    placeholder="e.g. Argentina"
                    placeholderTextColor={mutedText}
                    style={[
                        styles.input,
                        { marginTop: 0, marginBottom: 12, backgroundColor: surface, borderColor: border, color: text },
                    ]}
                />

                <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>
                    City
                </ThemedText>
                <TextInput
                    value={city}
                    onChangeText={setCity}
                    placeholder="e.g. Buenos Aires"
                    placeholderTextColor={mutedText}
                    style={[
                        styles.input,
                        { marginTop: 0, marginBottom: 12, backgroundColor: surface, borderColor: border, color: text },
                    ]}
                />

                <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>
                    Address
                </ThemedText>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                    <TextInput
                        value={address}
                        onChangeText={setAddress}
                        placeholder="e.g. Av. Paseo Colón 850"
                        placeholderTextColor={mutedText}
                        style={[
                            styles.input,
                            { flex: 1, marginTop: 0, backgroundColor: surface, borderColor: border, color: text },
                        ]}
                    />
                    <Pressable
                        onPress={handleSearchAddress}
                        disabled={isSearchingLoc}
                        style={{
                            backgroundColor: tint,
                            paddingHorizontal: 16,
                            justifyContent: 'center',
                            borderRadius: 8,
                            opacity: isSearchingLoc ? 0.7 : 1,
                        }}
                    >
                        {isSearchingLoc ? (
                            <ActivityIndicator size="small" color={tintText} />
                        ) : (
                            <Ionicons name="search" size={20} color={tintText} />
                        )}
                    </Pressable>
                </View>

                <ThemedText type="label" style={{ color: mutedText, marginBottom: 8, fontSize: 12 }}>
                    Tap the map or drag the pin to auto-fill location fields.
                </ThemedText>

                <View style={{ height: 200, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: border }}>
                    <MapView
                        style={{ flex: 1 }}
                        ref={mapRef}
                        initialRegion={{
                            latitude: -34.6037,
                            longitude: -58.3816,
                            latitudeDelta: 0.05,
                            longitudeDelta: 0.05,
                        }}
                        onPress={(e) => handleMapInteract(e.nativeEvent.coordinate)}
                    >
                        {pinLocation && (
                            <Marker
                                draggable
                                coordinate={pinLocation}
                                onDragEnd={(e) => handleMapInteract(e.nativeEvent.coordinate)}
                                pinColor={tint}
                            />
                        )}
                    </MapView>
                </View>
            </View>

            {/* Images */}
            <View style={styles.inputGroup}>
                <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>
                    Images
                </ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.imagesRow}>
                        {images.map((img, index) => (
                            <View key={index} style={styles.imagePreviewContainer}>
                                <Image source={{ uri: img }} style={styles.imagePreview} />
                                <Pressable
                                    onPress={() => handleRemoveImage(index)}
                                    style={[styles.removeImageButton, { backgroundColor: '#ef4444' }]}
                                >
                                    <Ionicons name="close" size={14} color="#fff" />
                                </Pressable>
                            </View>
                        ))}
                        <Pressable
                            onPress={handleAddImage}
                            style={[styles.addImageButton, { backgroundColor: surface, borderColor: border }]}
                        >
                            <Ionicons name="add" size={32} color={mutedText} />
                        </Pressable>
                    </View>
                </ScrollView>
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
                <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>
                    Description
                </ThemedText>
                <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Describe this plan..."
                    placeholderTextColor={mutedText}
                    multiline
                    numberOfLines={4}
                    style={[
                        styles.textArea,
                        { backgroundColor: surface, borderColor: border, color: text },
                    ]}
                />
            </View>

            {/* Info adicional */}
            <View style={[styles.infoSection, { backgroundColor: surface, borderColor: border }]}>
                <ThemedText type="subtitle" style={{ marginBottom: 12 }}>INFO</ThemedText>

                <View style={styles.infoInputGroup}>
                    <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>
                        Category
                    </ThemedText>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.categoryRow}>
                            {CATEGORY_OPTIONS.map((cat) => (
                                <Pressable
                                    key={cat}
                                    onPress={() => toggleCategory(cat)}
                                    style={[
                                        styles.categoryChip,
                                        { borderColor: border },
                                        selectedCategories.includes(cat) && { backgroundColor: tint, borderColor: tint },
                                    ]}
                                >
                                    <ThemedText
                                        type="label"
                                        style={{ color: selectedCategories.includes(cat) ? tintText : text }}
                                    >
                                        {cat}
                                    </ThemedText>
                                </Pressable>
                            ))}
                        </View>
                    </ScrollView>
                </View>

                <View style={styles.row}>
                    <View style={styles.halfInput}>
                        <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>
                            Max participants
                        </ThemedText>
                        <TextInput
                            value={maxParticipants}
                            onChangeText={setMaxParticipants}
                            placeholder="e.g. 10"
                            placeholderTextColor={mutedText}
                            keyboardType="numeric"
                            style={[
                                styles.input,
                                { backgroundColor: background, borderColor: border, color: text },
                            ]}
                        />
                    </View>
                    <View style={styles.halfInput}>
                        <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>
                            Budget (optional)
                        </ThemedText>
                        <TextInput
                            value={budget}
                            onChangeText={setBudget}
                            placeholder="e.g. 500"
                            placeholderTextColor={mutedText}
                            keyboardType="decimal-pad"
                            style={[
                                styles.input,
                                { backgroundColor: background, borderColor: border, color: text },
                            ]}
                        />
                    </View>
                </View>
            </View>

            {/* Error */}
            {error && (
                <View style={styles.errorContainer}>
                    <ThemedText type="body" style={{ color: '#ef4444' }}>{error}</ThemedText>
                </View>
            )}

            {/* Boton crear */}
            <Pressable
                onPress={handleCreate}
                disabled={saving}
                style={({ pressed }) => [
                    styles.createButton,
                    { backgroundColor: tint },
                    pressed && styles.pressed,
                    saving && styles.disabled,
                ]}
            >
                {saving ? (
                    <ActivityIndicator size="small" color={tintText} />
                ) : (
                    <ThemedText type="body" style={{ color: tintText, fontWeight: '600' }}>
                        CREATE PLAN
                    </ThemedText>
                )}
            </Pressable>
        </AppScreen>
    );
}
