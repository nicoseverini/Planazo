import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    ScrollView,
    TextInput,
    View,
} from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { AppScreen } from '@/components/ui';
import { useThemeColor } from '@/hooks/use-theme-color';
import { PlanCreateRequest, usePlans } from '@/services/plan';

import { styles } from './styles';

const CATEGORY_OPTIONS = [
    'Viajes',
    'Deportes',
    'Gastronomia',
    'Cultura',
    'Musica',
    'Naturaleza',
    'Social',
    'Otro',
];

const INTEREST_BY_CATEGORY: Record<string, string> = {
    Viajes: 'ADVENTURE',
    Deportes: 'ADVENTURE',
    Gastronomia: 'FOOD',
    Cultura: 'CULTURE',
    Musica: 'NIGHTLIFE',
    Naturaleza: 'NATURE',
    Social: 'NIGHTLIFE',
    Otro: 'HISTORY',
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
    const [location, setLocation] = useState('');
    const [minAge, setMinAge] = useState('18');
    const [maxParticipants, setMaxParticipants] = useState('10');
    const [category, setCategory] = useState('');
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
        return true;
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
            const payload: PlanCreateRequest = {
                title: title.trim(),
                description: description.trim(),
                dateTime,
                durationMinutes: DEFAULT_DURATION_MINUTES,
                visibility: isPublic ? 'PUBLIC' : 'PRIVATE',
                maxSubscribers: Number.isNaN(parsedMaxSubscribers) ? 10 : parsedMaxSubscribers,
                minAge: Number.isNaN(parsedMinAge) ? undefined : parsedMinAge,
                interest: INTEREST_BY_CATEGORY[category] ?? DEFAULT_INTEREST,
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

            {/* Rating preview (solo visual) */}
            <View style={styles.ratingPreview}>
                <ThemedText type="body">4.9</ThemedText>
                <View style={styles.starContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons key={star} name="star" size={16} color="#22c55e" />
                    ))}
                </View>
                <ThemedText type="body" style={{ color: mutedText }}>(2,351 reviews)</ThemedText>
            </View>

            {/* Fecha y hora */}
            <View style={styles.row}>
                <View style={styles.halfInput}>
                    <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>
                        Fecha
                    </ThemedText>
                    <TextInput
                        value={date}
                        onChangeText={setDate}
                        placeholder="DD/MM/YYYY"
                        placeholderTextColor={mutedText}
                        style={[
                            styles.input,
                            { backgroundColor: surface, borderColor: border, color: text },
                        ]}
                    />
                </View>
                <View style={styles.halfInput}>
                    <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>
                        Hora
                    </ThemedText>
                    <TextInput
                        value={time}
                        onChangeText={setTime}
                        placeholder="HH:MM"
                        placeholderTextColor={mutedText}
                        style={[
                            styles.input,
                            { backgroundColor: surface, borderColor: border, color: text },
                        ]}
                    />
                </View>
            </View>

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

            {/* Ubicacion */}
            <View style={styles.inputGroup}>
                <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>
                    Zona / Direccion
                </ThemedText>
                <TextInput
                    value={location}
                    onChangeText={setLocation}
                    placeholder="Ingresa la ubicacion"
                    placeholderTextColor={mutedText}
                    style={[
                        styles.input,
                        { backgroundColor: surface, borderColor: border, color: text },
                    ]}
                />
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
                                    onPress={() => setCategory(cat)}
                                    style={[
                                        styles.categoryChip,
                                        { borderColor: border },
                                        category === cat && { backgroundColor: tint, borderColor: tint },
                                    ]}
                                >
                                    <ThemedText
                                        type="label"
                                        style={{ color: category === cat ? tintText : text }}
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
