import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    ScrollView,
    TextInput,
    View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/ThemedText';
import { AppScreen } from '@/components/ui';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
    Interest,
    INTEREST_OPTIONS,
    TouristPlaceCreateRequest,
} from '@/services/tourist-place';
import { validateAgeFields, parseAge } from '@/utils/age-restriction';
import { formatInterest } from '@/utils/interests';
import { ensureMediaLibraryPermission } from '@/utils/media-permissions';

import { styles } from './styles';

export type TouristPlaceFormValues = {
    name: string;
    cost: string;
    minAge: string;
    maxAge: string;
    interests: Interest[];
    country: string;
    city: string;
    address: string;
    latitude: string;
    longitude: string;
    images: string[];
    description: string;
};

export const DEFAULT_FORM_VALUES: TouristPlaceFormValues = {
    name: '',
    cost: '',
    minAge: '',
    maxAge: '',
    interests: [],
    country: '',
    city: '',
    address: '',
    latitude: '',
    longitude: '',
    images: [],
    description: '',
};

type Props = {
    screenTitle: string;
    submitLabel: string;
    initialValues: TouristPlaceFormValues;
    onSubmit: (data: TouristPlaceCreateRequest) => Promise<void>;
    onBack: () => void;
};

export default function TouristPlaceFormScreen({
    screenTitle,
    submitLabel,
    initialValues,
    onSubmit,
    onBack,
}: Props) {
    const mapRef = useRef<MapView>(null);
    const { t } = useTranslation();

    const tint = useThemeColor({}, 'tint');
    const tintText = useThemeColor({}, 'tintText');
    const surface = useThemeColor({}, 'surface');
    const border = useThemeColor({}, 'border');
    const mutedText = useThemeColor({}, 'mutedText');
    const text = useThemeColor({}, 'text');

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSearchingLoc, setIsSearchingLoc] = useState(false);

    const [name, setName] = useState(initialValues.name);
    const [cost, setCost] = useState(initialValues.cost);
    const [minAge, setMinAge] = useState(initialValues.minAge);
    const [maxAge, setMaxAge] = useState(initialValues.maxAge);
    const [interests, setInterests] = useState<Interest[]>(initialValues.interests);
    const [country, setCountry] = useState(initialValues.country);
    const [city, setCity] = useState(initialValues.city);
    const [address, setAddress] = useState(initialValues.address);
    const [latitude, setLatitude] = useState(initialValues.latitude);
    const [longitude, setLongitude] = useState(initialValues.longitude);
    const [images, setImages] = useState<string[]>(initialValues.images);
    const [description, setDescription] = useState(initialValues.description);

    const pinLocation =
        latitude && longitude
            ? { latitude: parseFloat(latitude), longitude: parseFloat(longitude) }
            : null;

    const toggleInterest = (value: Interest) => {
        setInterests(prev =>
            prev.includes(value) ? prev.filter(i => i !== value) : [...prev, value]
        );
    };

    const handleAddImage = async () => {
        const granted = await ensureMediaLibraryPermission();
        if (!granted) {
            Alert.alert(t('permission_required'), t('gallery_permission_desc'));
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
        setImages(prev => [...prev, `data:${mimeType};base64,${asset.base64}`]);
    };

    const handleRemoveImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSearchAddress = async () => {
        const searchTerm = [address, city, country].filter(Boolean).join(', ').trim();
        if (!searchTerm) return;
        setIsSearchingLoc(true);
        try {
            const geocoded = await Location.geocodeAsync(searchTerm);
            if (geocoded.length > 0) {
                const { latitude: lat, longitude: lng } = geocoded[0];
                setLatitude(lat.toString());
                setLongitude(lng.toString());
                mapRef.current?.animateToRegion(
                    { latitude: lat, longitude: lng, latitudeDelta: 0.02, longitudeDelta: 0.02 },
                    1000
                );
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
        setLatitude(coordinate.latitude.toString());
        setLongitude(coordinate.longitude.toString());
        try {
            const geocoded = await Location.reverseGeocodeAsync(coordinate);
            if (geocoded?.length) {
                const addr = geocoded[0];
                if (addr.country) setCountry(addr.country);
                const resolvedCity = addr.city || addr.subregion;
                if (resolvedCity) setCity(resolvedCity);
                let resolvedAddress = '';
                if (addr.street) {
                    resolvedAddress = addr.street;
                    if (addr.streetNumber) resolvedAddress += ` ${addr.streetNumber}`;
                } else if (addr.name) {
                    resolvedAddress = addr.name;
                }
                if (resolvedAddress.trim()) setAddress(resolvedAddress.trim());
            }
        } catch {
            // ignore reverse geocoding errors
        }
    };

    const validateForm = (): boolean => {
        if (!name.trim()) {
            setError(t('error_name_required'));
            return false;
        }
        if (interests.length === 0) {
            setError(t('error_select_category'));
            return false;
        }
        if (!country.trim()) {
            setError(t('error_country_required'));
            return false;
        }
        if (!city.trim()) {
            setError(t('error_city_required'));
            return false;
        }
        if (!address.trim()) {
            setError(t('error_address_required'));
            return false;
        }
        const costTrimmed = cost.trim();
        if (costTrimmed) {
            const parsedCost = parseFloat(costTrimmed);
            if (isNaN(parsedCost) || parsedCost < 0) {
                setError(t('error_cost_invalid'));
                return false;
            }
        }
        const ageError = validateAgeFields(minAge, maxAge);
        if (ageError) { setError(ageError); return false; }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        setSaving(true);
        setError(null);
        try {
            const parsedLat = latitude.trim() ? parseFloat(latitude) : undefined;
            const parsedLng = longitude.trim() ? parseFloat(longitude) : undefined;
            const costTrimmed = cost.trim();

            const payload: TouristPlaceCreateRequest = {
                name: name.trim(),
                cost: costTrimmed ? parseFloat(costTrimmed) : 0,
                interests,
                minAge: parseAge(minAge),
                maxAge: parseAge(maxAge),
                country: country.trim(),
                city: city.trim(),
                address: address.trim(),
                latitude: parsedLat && !isNaN(parsedLat) ? parsedLat : undefined,
                longitude: parsedLng && !isNaN(parsedLng) ? parsedLng : undefined,
                images: images.length > 0 ? images : undefined,
                description: description.trim() || undefined,
            };
            await onSubmit(payload);
        } catch {
            setError(t('error_update_place'));
        } finally {
            setSaving(false);
        }
    };

    const initialRegion = {
        latitude: pinLocation?.latitude ?? -34.6037,
        longitude: pinLocation?.longitude ?? -58.3816,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    };

    return (
        <AppScreen scrollable>
            {/* Header */}
            <View style={styles.header}>
                <Pressable
                    onPress={onBack}
                    style={({ pressed }) => [
                        styles.headerButton,
                        { backgroundColor: surface, borderColor: border },
                        pressed && styles.pressed,
                    ]}
                >
                    <Ionicons name="arrow-back" size={24} color={text} />
                </Pressable>
                <ThemedText type="title">{screenTitle}</ThemedText>
            </View>

            {/* Name */}
            <View style={styles.inputGroup}>
                <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>{t('label_title')} *</ThemedText>
                <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder={t('place_name_placeholder')}
                    placeholderTextColor={mutedText}
                    style={[styles.input, { backgroundColor: surface, borderColor: border, color: text }]}
                />
            </View>

            {/* Cost + Age */}
            <View style={styles.row}>
                <View style={styles.halfInput}>
                    <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>{t('label_cost')}</ThemedText>
                    <TextInput
                        value={cost}
                        onChangeText={setCost}
                        placeholder={t('leave_empty_free')}
                        placeholderTextColor={mutedText}
                        keyboardType="decimal-pad"
                        style={[styles.input, { backgroundColor: surface, borderColor: border, color: text }]}
                    />
                </View>
                <View style={styles.halfInput}>
                    <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>{t('label_min_age')}</ThemedText>
                    <TextInput
                        value={minAge}
                        onChangeText={setMinAge}
                        placeholder={t('label_none')}
                        placeholderTextColor={mutedText}
                        keyboardType="numeric"
                        style={[styles.input, { backgroundColor: surface, borderColor: border, color: text }]}
                    />
                </View>
                <View style={styles.halfInput}>
                    <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>{t('label_max_age')}</ThemedText>
                    <TextInput
                        value={maxAge}
                        onChangeText={setMaxAge}
                        placeholder={t('label_none')}
                        placeholderTextColor={mutedText}
                        keyboardType="numeric"
                        style={[styles.input, { backgroundColor: surface, borderColor: border, color: text }]}
                    />
                </View>
            </View>

            {/* Categories (multi-select) */}
            <View style={styles.inputGroup}>
                <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>{t('label_categories')} *</ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.categoryRow}>
                        {INTEREST_OPTIONS.map((opt) => {
                            const selected = interests.includes(opt.value);
                            return (
                                <Pressable
                                    key={opt.value}
                                    onPress={() => toggleInterest(opt.value)}
                                    style={[
                                        styles.categoryChip,
                                        { borderColor: border },
                                        selected && { backgroundColor: tint, borderColor: tint },
                                    ]}
                                >
                                    <ThemedText
                                        type="label"
                                        style={{ color: selected ? tintText : text }}
                                    >
                                        {formatInterest(opt.value)}
                                    </ThemedText>
                                </Pressable>
                            );
                        })}
                    </View>
                </ScrollView>
            </View>

            {/* Country */}
            <View style={styles.inputGroup}>
                <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>{t('label_country')} *</ThemedText>
                <TextInput
                    value={country}
                    onChangeText={setCountry}
                    placeholder="e.g. Argentina"
                    placeholderTextColor={mutedText}
                    style={[styles.input, { backgroundColor: surface, borderColor: border, color: text }]}
                />
            </View>

            {/* City */}
            <View style={styles.inputGroup}>
                <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>{t('label_city')} *</ThemedText>
                <TextInput
                    value={city}
                    onChangeText={setCity}
                    placeholder="e.g. Buenos Aires"
                    placeholderTextColor={mutedText}
                    style={[styles.input, { backgroundColor: surface, borderColor: border, color: text }]}
                />
            </View>

            {/* Address + Map */}
            <View style={styles.inputGroup}>
                <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>{t('label_address')} *</ThemedText>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                    <TextInput
                        value={address}
                        onChangeText={setAddress}
                        placeholder="e.g. Av. Corrientes 1234"
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
                    {t('map_instruction')}
                </ThemedText>
                <View style={{ height: 200, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: border }}>
                    <MapView
                        style={{ flex: 1 }}
                        ref={mapRef}
                        initialRegion={initialRegion}
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

            {/* Description */}
            <View style={styles.inputGroup}>
                <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>{t('label_description')}</ThemedText>
                <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder={t('describe_place_placeholder')}
                    placeholderTextColor={mutedText}
                    multiline
                    numberOfLines={4}
                    style={[styles.textArea, { backgroundColor: surface, borderColor: border, color: text }]}
                />
            </View>

            {/* Images */}
            <View style={styles.inputGroup}>
                <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>{t('label_images')}</ThemedText>
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

            {/* Error */}
            {error && (
                <View style={styles.errorContainer}>
                    <ThemedText type="body" style={{ color: '#ef4444' }}>{error}</ThemedText>
                </View>
            )}

            {/* Submit */}
            <Pressable
                onPress={handleSubmit}
                disabled={saving}
                style={({ pressed }) => [
                    styles.submitButton,
                    { backgroundColor: tint },
                    pressed && styles.pressed,
                    saving && styles.disabled,
                ]}
            >
                {saving ? (
                    <ActivityIndicator size="small" color={tintText} />
                ) : (
                    <ThemedText type="body" style={{ color: tintText, fontWeight: '600' }}>
                        {submitLabel}
                    </ThemedText>
                )}
            </Pressable>

            {/* Cancel */}
            <Pressable
                onPress={onBack}
                disabled={saving}
                style={({ pressed }) => [
                    styles.cancelButton,
                    { borderColor: border },
                    pressed && styles.pressed,
                    saving && styles.disabled,
                ]}
            >
                <ThemedText type="body" style={{ color: text, fontWeight: '600' }}>
                    {t('cancel')}
                </ThemedText>
            </Pressable>
        </AppScreen>
    );
}
