import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    ScrollView,
    Platform,
    TextInput,
    View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { ThemedText } from '@/components/ThemedText';
import { AppScreen } from '@/components/ui';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
    Interest,
    INTEREST_OPTIONS,
    TuristicPlaceCreateRequest,
} from '@/services/turistic-place';
import { validateAgeFields, parseAge } from '@/utils/age-restriction';

import { styles } from './styles';

export type TuristicPlaceFormValues = {
    name: string;
    cost: string;
    minAge: string;
    maxAge: string;
    interest: Interest;
    location: string;
    latitude: string;
    longitude: string;
    images: string[];
    description: string;
};

export const DEFAULT_FORM_VALUES: TuristicPlaceFormValues = {
    name: '',
    cost: '',
    minAge: '',
    maxAge: '',
    interest: 'ADVENTURE',
    location: '',
    latitude: '-34.6037',
    longitude: '-58.3816',
    images: [],
    description: '',
};

type Props = {
    screenTitle: string;
    submitLabel: string;
    initialValues: TuristicPlaceFormValues;
    onSubmit: (data: TuristicPlaceCreateRequest) => Promise<void>;
    onBack: () => void;
};

export default function TuristicPlaceFormScreen({
    screenTitle,
    submitLabel,
    initialValues,
    onSubmit,
    onBack,
}: Props) {
    const mapRef = useRef<MapView>(null);

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
    const [interest, setInterest] = useState<Interest>(initialValues.interest);
    const [location, setLocation] = useState(initialValues.location);
    const [latitude, setLatitude] = useState(initialValues.latitude);
    const [longitude, setLongitude] = useState(initialValues.longitude);
    const [images, setImages] = useState<string[]>(initialValues.images);
    const [description, setDescription] = useState(initialValues.description);

    const pinLocation =
        latitude && longitude
            ? { latitude: parseFloat(latitude), longitude: parseFloat(longitude) }
            : null;

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
        if (result.canceled || !result.assets?.length) return;
        const asset = result.assets[0];
        if (!asset.base64) {
            setError('Could not read selected image.');
            return;
        }
        const mimeType = asset.mimeType ?? 'image/jpeg';
        setImages([...images, `data:${mimeType};base64,${asset.base64}`]);
    };

    const handleRemoveImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleSearchAddress = async () => {
        if (!location.trim()) return;
        setIsSearchingLoc(true);
        try {
            const geocoded = await Location.geocodeAsync(location);
            if (geocoded.length > 0) {
                const { latitude: lat, longitude: lng } = geocoded[0];
                setLatitude(lat.toString());
                setLongitude(lng.toString());
                mapRef.current?.animateToRegion(
                    { latitude: lat, longitude: lng, latitudeDelta: 0.02, longitudeDelta: 0.02 },
                    1000
                );
            } else {
                Alert.alert('Not found', 'Try being more specific (e.g., add city).');
            }
        } catch {
            Alert.alert('Error', 'There was a problem searching the address.');
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
                let formatted = '';
                if (addr.street) {
                    formatted += addr.street;
                    if (addr.streetNumber) formatted += ` ${addr.streetNumber}`;
                } else if (addr.name) {
                    formatted += addr.name;
                }
                const city = addr.city || addr.subregion;
                if (city) formatted += formatted ? `, ${city}` : city;
                if (formatted.trim()) setLocation(formatted.trim());
            }
        } catch {
            // ignore reverse geocoding errors
        }
    };

    const validateForm = (): boolean => {
        if (!name.trim()) {
            setError('Name is required');
            return false;
        }
        if (!cost.trim() || isNaN(parseFloat(cost))) {
            setError('A valid cost is required');
            return false;
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

            const payload: TuristicPlaceCreateRequest = {
                name: name.trim(),
                cost: parseFloat(cost),
                interest,
                minAge: parseAge(minAge),
                maxAge: parseAge(maxAge),
                location: location.trim() || undefined,
                latitude: parsedLat && !isNaN(parsedLat) ? parsedLat : undefined,
                longitude: parsedLng && !isNaN(parsedLng) ? parsedLng : undefined,
                images: images.length > 0 ? images : undefined,
                description: description.trim() || undefined,
            };
            await onSubmit(payload);
        } catch {
            setError('Could not save. Please try again.');
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
                <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>Name *</ThemedText>
                <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Place name"
                    placeholderTextColor={mutedText}
                    style={[styles.input, { backgroundColor: surface, borderColor: border, color: text }]}
                />
            </View>

            {/* Cost + Age */}
            <View style={styles.row}>
                <View style={styles.halfInput}>
                    <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>Cost ($) *</ThemedText>
                    <TextInput
                        value={cost}
                        onChangeText={setCost}
                        placeholder="0"
                        placeholderTextColor={mutedText}
                        keyboardType="decimal-pad"
                        style={[styles.input, { backgroundColor: surface, borderColor: border, color: text }]}
                    />
                </View>
                <View style={styles.halfInput}>
                    <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>Min Age</ThemedText>
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
                    <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>Max Age</ThemedText>
                    <TextInput
                        value={maxAge}
                        onChangeText={setMaxAge}
                        placeholder="99"
                        placeholderTextColor={mutedText}
                        keyboardType="numeric"
                        style={[styles.input, { backgroundColor: surface, borderColor: border, color: text }]}
                    />
                </View>
            </View>

            {/* Interest */}
            <View style={styles.inputGroup}>
                <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>Category *</ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.categoryRow}>
                        {INTEREST_OPTIONS.map((opt) => (
                            <Pressable
                                key={opt.value}
                                onPress={() => setInterest(opt.value)}
                                style={[
                                    styles.categoryChip,
                                    { borderColor: border },
                                    interest === opt.value && { backgroundColor: tint, borderColor: tint },
                                ]}
                            >
                                <ThemedText
                                    type="label"
                                    style={{ color: interest === opt.value ? tintText : text }}
                                >
                                    {opt.label}
                                </ThemedText>
                            </Pressable>
                        ))}
                    </View>
                </ScrollView>
            </View>

            {/* Location + Map */}
            <View style={styles.inputGroup}>
                <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>Location</ThemedText>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                    <TextInput
                        value={location}
                        onChangeText={setLocation}
                        placeholder="e.g. Obelisco, Buenos Aires"
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
                    Tap the map or drag the pin to set coordinates.
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
                <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>Description</ThemedText>
                <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Describe this place..."
                    placeholderTextColor={mutedText}
                    multiline
                    numberOfLines={4}
                    style={[styles.textArea, { backgroundColor: surface, borderColor: border, color: text }]}
                />
            </View>

            {/* Images */}
            <View style={styles.inputGroup}>
                <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>Images</ThemedText>
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
        </AppScreen>
    );
}
