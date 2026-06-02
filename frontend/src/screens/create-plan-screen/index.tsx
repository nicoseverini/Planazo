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

import { styles } from './styles';

const CATEGORY_OPTIONS = [
    'Gastronomia',
    'Cultura',
    'Naturaleza',
    'Playa',
    'Aventura',
    'Deporte',
    'Fiesta',
    'Shopping',
    'Historia',
    'Montañas',
    'Otro',
] as const;

const INTEREST_BY_CATEGORY: Record<string, string> = {
    Gastronomia:      'FOOD',
    Cultura:   'CULTURE',
    Naturaleza:    'NATURE',
    Playa:     'BEACH',
    Aventura: 'ADVENTURE',
    Deporte: 'SPORTS',
    Fiesta: 'NIGHTLIFE',
    Shopping:  'SHOPPING',
    Historia:   'HISTORY',
    Montañas: 'MOUNTAINS',
    Otro:     'OTHER',
};

const DEFAULT_INTEREST = 'ADVENTURE';
const DEFAULT_TRAVEL_TYPE = 'FRIENDS';
const DEFAULT_DURATION_MINUTES = 60;

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

    return `${normalizedDate}T${normalizedTime}`;
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
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [internalDate, setInternalDate] = useState(new Date());
    const mapRef = useRef<MapView>(null);
    const [isSearchingLoc, setIsSearchingLoc] = useState(false);
    const [location, setLocation] = useState('');
    const [isFetchingAddress, setIsFetchingAddress] = useState(false);
    const [pinLocation, setPinLocation] = useState<{latitude: number, longitude: number} | null>(null);
    const [minAge, setMinAge] = useState('18');
    const [maxParticipants, setMaxParticipants] = useState('10');
    const [selectedCategories, setSelectedCategories] = useState<Array<(typeof CATEGORY_OPTIONS)[number]>>(['Aventura']);
    const [budget, setBudget] = useState('');
    const [images, setImages] = useState<string[]>([]);

    const handleAddImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permission.status !== 'granted') {
            Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galeria para elegir imagenes.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
            base64: true,
        });

        if (result.canceled || !result.assets?.length) {
            return;
        }

        const asset = result.assets[0];
        if (!asset.base64) {
            setError('No se pudo leer la imagen seleccionada.');
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
            setError('El titulo es requerido');
            return false;
        }
        if (!date.trim()) {
            setError('La fecha es requerida');
            return false;
        }
        if (!time.trim()) {
            setError('La hora es requerida');
            return false;
        }
        if (!location.trim()) {
            setError('La ubicacion es requerida');
            return false;
        }
        if (selectedCategories.length === 0) {
            setError('Selecciona al menos una categoria');
            return false;
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
        if (!location.trim()) return;
        setIsSearchingLoc(true);
        try {
            const geocoded = await Location.geocodeAsync(location);
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
                Alert.alert('No encontrada', 'Intenta ser más específico (ej: agregar ciudad).');
            }
        } catch (e) {
            console.log(e);
            Alert.alert('Error', 'Hubo un problema buscando la dirección.');
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
                const addr = geocoded[0];

                let formattedAddress = '';

                if (addr.street) {
                    formattedAddress += addr.street;
                    if (addr.streetNumber) {
                        formattedAddress += ` ${addr.streetNumber}`;
                    }
                } else if (addr.name) {
                    formattedAddress += addr.name;
                }

                const cityPart = addr.city || addr.subregion;
                if (cityPart) {
                    formattedAddress += formattedAddress ? `, ${cityPart}` : cityPart;
                }

                setLocation(formattedAddress.trim());
            }
        } catch (error) {
            console.error("Error obteniendo la dirección:", error);
        } finally {
            setIsFetchingAddress(false);
        }
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        // En Android, el picker se cierra solo tras elegir. En iOS queda abierto si es modo "spinner".
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }

        if (event.type === 'set' && selectedDate) {
            setInternalDate(selectedDate);
            const day = selectedDate.getDate().toString().padStart(2, '0');
            const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
            const year = selectedDate.getFullYear();
            setDate(`${day}/${month}/${year}`);
        } else if (event.type === 'dismissed') {
            setShowDatePicker(false);
        }
    };

    const handleTimeChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowTimePicker(false);
        }

        if (event.type === 'set' && selectedDate) {
            setInternalDate(selectedDate);
            const hours = selectedDate.getHours().toString().padStart(2, '0');
            const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
            setTime(`${hours}:${minutes}`);
        } else if (event.type === 'dismissed') {
            setShowTimePicker(false);
        }
    };

    const handleCreate = async () => {
        if (!validateForm()) return;

        const dateTime = buildDateTime(date, time);
        if (!dateTime) {
            setError('La fecha o la hora no tienen un formato valido.');
            return;
        }

        const parsedMinAge = Number.parseInt(minAge, 10);
        const parsedMaxSubscribers = Number.parseInt(maxParticipants, 10);

        setSaving(true);
        setError(null);

        try {

            const geocodedLocation = await Location.geocodeAsync(location.trim());

            if (!geocodedLocation || geocodedLocation.length === 0) {
                setError('No pudimos encontrar la ubicación en el mapa. Intenta agregar la ciudad (ej: Obelisco, Buenos Aires).');
                setSaving(false);
                return;
            }

            const { latitude, longitude } = geocodedLocation[0];

            const mappedInterests = selectedCategories
                .map((cat) => INTEREST_BY_CATEGORY[cat])
                .filter(Boolean);

            const payload: PlanCreateRequest = {
                title: title.trim(),
                description: description.trim(),
                dateTime,
                latitude: pinLocation.latitude,
                longitude: pinLocation?.longitude,
                durationMinutes: DEFAULT_DURATION_MINUTES,
                visibility: isPublic ? 'PUBLIC' : 'PRIVATE',
                maxSubscribers: Number.isNaN(parsedMaxSubscribers) ? 10 : parsedMaxSubscribers,
                minAge: Number.isNaN(parsedMinAge) ? undefined : parsedMinAge,
                interests: mappedInterests.length > 0 ? mappedInterests : [DEFAULT_INTEREST],
                travelType: DEFAULT_TRAVEL_TYPE,
                location: location.trim(),
                images: images.length > 0 ? images : undefined,
            };

            await create(payload);
            Alert.alert('Exito', 'Plan creado correctamente', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch (err) {
            console.error('[CreatePlanScreen] Error creating plan:', err);
            setError('No se pudo crear el plan. Intenta de nuevo.');
        } finally {
            setSaving(false);
        }
    };

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
                <ThemedText type="title">Crear Plan</ThemedText>
            </View>

            {/* Titulo y visibilidad */}
            <View style={styles.titleRow}>
                <View style={styles.titleInput}>
                    <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>
                        Titulo
                    </ThemedText>
                    <TextInput
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Nombre del plan"
                        placeholderTextColor={mutedText}
                        style={[
                            styles.input,
                            { backgroundColor: surface, borderColor: border, color: text },
                        ]}
                    />
                </View>
                <View style={styles.visibilityToggle}>
                    <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>
                        Visibilidad
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
                                Privado
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
                                Publico
                            </ThemedText>
                        </Pressable>
                    </View>
                </View>
            </View>

            {/* Fecha y hora */}
            <View style={styles.row}>
                {/* Input de Fecha */}
                <View style={styles.halfInput}>
                    <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>
                        Fecha
                    </ThemedText>
                    <View style={[styles.input, { backgroundColor: surface, borderColor: border, flexDirection: 'row', alignItems: 'center', padding: 0, overflow: 'hidden' }]}>
                        <TextInput
                            value={date}
                            onChangeText={setDate}
                            placeholder="DD/MM/YYYY"
                            placeholderTextColor={mutedText}
                            style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 12, color: text }}
                        />
                        <Pressable
                            onPress={() => setShowDatePicker(!showDatePicker)}
                            style={{ padding: 12, backgroundColor: background }}
                        >
                            <Ionicons name="calendar-outline" size={20} color={tint} />
                        </Pressable>
                    </View>
                </View>

                {/* Input de Hora */}
                <View style={styles.halfInput}>
                    <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>
                        Hora
                    </ThemedText>
                    <View style={[styles.input, { backgroundColor: surface, borderColor: border, flexDirection: 'row', alignItems: 'center', padding: 0, overflow: 'hidden' }]}>
                        <TextInput
                            value={time}
                            onChangeText={setTime}
                            placeholder="HH:MM"
                            placeholderTextColor={mutedText}
                            style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 12, color: text }}
                        />
                        <Pressable
                            onPress={() => setShowTimePicker(!showTimePicker)}
                            style={{ padding: 12, backgroundColor: background }}
                        >
                            <Ionicons name="time-outline" size={20} color={tint} />
                        </Pressable>
                    </View>
                </View>
            </View>

            {/* Renderizado de los Selectores Nativos */}
            {showDatePicker && (
                <DateTimePicker
                    value={internalDate}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                />
            )}

            {showTimePicker && (
                <DateTimePicker
                    value={internalDate}
                    mode="time"
                    display="default"
                    is24Hour={true}
                    onChange={handleTimeChange}
                />
            )}

            {/* Edad minima */}
            <View style={styles.inputGroup}>
                <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>
                    Limite de edad
                </ThemedText>
                <TextInput
                    value={minAge}
                    onChangeText={setMinAge}
                    placeholder="18"
                    placeholderTextColor={mutedText}
                    keyboardType="numeric"
                    style={[
                        styles.input,
                        { backgroundColor: surface, borderColor: border, color: text },
                    ]}
                />
            </View>

            {/* Ubicación híbrida: Texto + Mapa */}
            <View style={styles.inputGroup}>
                <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>
                    Zona / Dirección
                </ThemedText>

                {/* Input de texto con botón de búsqueda */}
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                    <TextInput
                        value={location}
                        onChangeText={setLocation}
                        placeholder="Ej: FIUBA, Buenos Aires"
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
                    También puedes tocar el mapa o arrastrar el pin para ser más preciso.
                </ThemedText>

                {/* El mapa interactivo */}
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

            {/* Imagenes */}
            <View style={styles.inputGroup}>
                <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>
                    Imagenes
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

            {/* Descripcion */}
            <View style={styles.inputGroup}>
                <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>
                    Descripcion
                </ThemedText>
                <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Describe tu plan..."
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
                        Categoria
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
                            Max participantes
                        </ThemedText>
                        <TextInput
                            value={maxParticipants}
                            onChangeText={setMaxParticipants}
                            placeholder="10"
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
                            Presupuesto (opcional)
                        </ThemedText>
                        <TextInput
                            value={budget}
                            onChangeText={setBudget}
                            placeholder="$0"
                            placeholderTextColor={mutedText}
                            keyboardType="numeric"
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
                        CREAR PLAN
                    </ThemedText>
                )}
            </Pressable>
        </AppScreen>
    );
}
