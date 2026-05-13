import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Pressable,
    TextInput,
    View,
} from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { AppScreen } from '@/components/ui';
import {
    GENDER_LABELS,
    GENDER_OPTIONS,
    INTEREST_LABELS,
    INTEREST_OPTIONS,
    LANGUAGE_OPTIONS,
    TRAVEL_TYPE_LABELS,
    TRAVEL_TYPE_OPTIONS,
} from '@/constants/profile-options';
import { useToken } from '@/context/token-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
    UserProfile,
    UpdateProfileRequest,
    useProfile
} from '@/services/user';

import { styles } from './styles';

const DEFAULT_PROFILE: UserProfile = {
    name: '',
    lastname: '',
    email: '',
    gender: '',
    birthDate: '',
    interests: [],
    budget: undefined,
    travelType: '',
    languages: [],
    photo: '',
};

function formatList(values: string[] | undefined, labelMap?: Record<string, string>) {
    if (!values || values.length === 0) {
        return 'Sin definir';
    }
    return values.map((value) => labelMap?.[value] ?? value).join(', ');
}

function formatValue(value?: string, labelMap?: Record<string, string>) {
    if (!value) {
        return 'Sin definir';
    }
    return labelMap?.[value] ?? value;
}

function normalizeProfile(profile: UserProfile | null) {
    return {
        ...DEFAULT_PROFILE,
        ...profile,
        interests: profile?.interests ?? [],
        languages: profile?.languages ?? [],
    };
}

type MenuItemProps = {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress: () => void;
    danger?: boolean;
};

function MenuItem({ icon, label, onPress, danger = false }: MenuItemProps) {
    const surface = useThemeColor({}, 'surface');
    const border = useThemeColor({}, 'border');
    const mutedText = useThemeColor({}, 'mutedText');

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.menuItem,
                { backgroundColor: surface, borderColor: border },
                pressed && styles.pressed,
            ]}
        >
            <View style={styles.menuItemLeft}>
                <Ionicons
                    name={icon}
                    size={22}
                    color={danger ? '#ef4444' : mutedText}
                />
                <ThemedText
                    type="body"
                    style={[styles.menuItemLabel, danger && { color: '#ef4444' }]}
                >
                    {label}
                </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={mutedText} />
        </Pressable>
    );
}

export default function ProfileScreen() {
    const router = useRouter();
    const { tokenData, logout } = useToken();
    const { fetchProfile, fetchPicture, updateProfile } = useProfile();

    const tint = useThemeColor({}, 'tint');
    const tintText = useThemeColor({}, 'tintText');
    const surface = useThemeColor({}, 'surface');
    const border = useThemeColor({}, 'border');
    const mutedText = useThemeColor({}, 'mutedText');
    const text = useThemeColor({}, 'text');
    const background = useThemeColor({}, 'background');

    const [user, setUser] = useState<UserProfile | null>(null);
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState<UserProfile | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loggingOut, setLoggingOut] = useState(false);

    const displayUser = useMemo(() => normalizeProfile(user), [user]);

    const loadProfile = useCallback(async () => {
        if (tokenData.state !== 'LOGGED_IN') {
            setLoading(false);
            return;
        }

        try {
            const [profileData, pictureData] = await Promise.all([
                fetchProfile(),
                fetchPicture(),
            ]);
            const normalized = normalizeProfile(profileData);
            setUser(normalized);
            setFormData(normalized);
            setPhotoUrl(pictureData ?? normalized.photo ?? null);
        } catch (err) {
            console.error('[ProfileScreen] Error loading profile:', err);
            setError('Error al cargar el perfil');
        } finally {
            setLoading(false);
        }
    }, [tokenData.state, fetchProfile, fetchPicture]);

    useEffect(() => {
        if (tokenData.state === 'LOGGED_IN') {
            loadProfile();
        } else if (tokenData.state === 'LOGGED_OUT') {
            setLoading(false);
        }
    }, [tokenData.state, loadProfile]);

    const onChange = (field: keyof UserProfile, value: string | string[] | number | undefined) => {
        if (!formData) return;
        setFormData({ ...formData, [field]: value });
    };

    const toggleArrayValue = (field: 'interests' | 'languages', value: string) => {
        if (!formData) return;
        const current = formData[field] ?? [];
        const next = current.includes(value)
            ? current.filter((item) => item !== value)
            : [...current, value];
        setFormData({ ...formData, [field]: next });
    };

    const handleSave = async () => {
        if (!formData) return;

        setSaving(true);
        setError(null);

        try {
            const budgetValue = formData.budget ?? undefined;
            const payload: UpdateProfileRequest = {
                name: formData.name,
                lastname: formData.lastname,
                gender: formData.gender,
                birthDate: formData.birthDate,
                photo: formData.photo,
                budget: budgetValue,
                travelType: formData.travelType || undefined,
                languages: formData.languages ?? [],
                interests: formData.interests ?? [],
            };

            const updatedProfile = await updateProfile(payload);
            const merged = normalizeProfile({
                ...displayUser,
                ...formData,
                ...updatedProfile,
            });
            setUser(merged);
            setFormData(merged);
            if (merged.photo) {
                setPhotoUrl(merged.photo);
            }
            setEditing(false);
        } catch (err) {
            console.error('[ProfileScreen] Error saving profile:', err);
            setError('Error al guardar los cambios');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData(displayUser);
        setEditing(false);
        setError(null);
    };

    function handleChangePhoto() {
        setEditing(true);
    }

    async function handleLogout() {
        setLoggingOut(true);
        await logout();
        router.replace('/');
    }

    // Loading state
    if (loggingOut || loading || tokenData.state === 'LOADING') {
        return (
            <AppScreen>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={tint} />
                    <ThemedText type="body" style={{ color: mutedText, marginTop: 12 }}>
                        Cerrando sesión...
                    </ThemedText>
                </View>
            </AppScreen>
        );
    }

    // Not authenticated
    if (tokenData.state === 'LOGGED_OUT') {
        return (
            <AppScreen>
                <View style={styles.loadingContainer}>
                    <Ionicons name="person-outline" size={48} color={mutedText} />
                    <ThemedText type="body" style={{ color: mutedText, marginTop: 12 }}>
                        Inicia sesion para ver tu perfil
                    </ThemedText>
                    <Pressable
                        onPress={() => router.replace('/')}
                        style={[styles.primaryButton, { backgroundColor: tint, marginTop: 24 }]}
                    >
                        <ThemedText type="body" style={{ color: tintText, fontWeight: '600' }}>
                            Iniciar sesion
                        </ThemedText>
                    </Pressable>
                </View>
            </AppScreen>
        );
    }

    const fullName = `${displayUser.name || 'Usuario'} ${displayUser.lastname || ''}`.trim();

    return (
        <AppScreen scrollable>
            {/* Header con avatar */}
            <View style={styles.header}>
                <Pressable
                    onPress={handleChangePhoto}
                    style={({ pressed }) => [
                        styles.avatarContainer,
                        { backgroundColor: surface, borderColor: border },
                        pressed && styles.pressed,
                    ]}
                >
                    {photoUrl ? (
                        <Image source={{ uri: photoUrl }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatarPlaceholder, { backgroundColor: tint }]}>
                            <ThemedText
                                type="heading"
                                lightColor={tintText}
                                darkColor={tintText}
                                style={styles.avatarInitial}
                            >
                                {displayUser.name?.charAt(0).toUpperCase() || '?'}
                            </ThemedText>
                        </View>
                    )}
                    <View style={[styles.cameraIcon, { backgroundColor: tint }]}>
                        <Ionicons name="camera" size={14} color={tintText} />
                    </View>
                </Pressable>

                <ThemedText type="title" style={styles.userName}>
                    {fullName}
                </ThemedText>
                <ThemedText type="body" style={{ color: mutedText }}>
                    {displayUser.email}
                </ThemedText>
                {tokenData.state === 'LOGGED_IN' && tokenData.role && (
                    <View style={[styles.roleBadge, { backgroundColor: tint }]}>
                        <ThemedText type="label" style={{ color: tintText, fontSize: 11 }}>
                            {tokenData.role}
                        </ThemedText>
                    </View>
                )}
            </View>

            {/* Contenido: Visualizacion o Edicion */}
            {!editing ? (
                <>
                    {/* Info cards */}
                    <View style={styles.infoGrid}>
                        {displayUser.gender && (
                            <View style={[styles.infoCard, { backgroundColor: surface, borderColor: border }]}>
                                <Ionicons name="person-outline" size={20} color={mutedText} />
                                <View style={styles.infoContent}>
                                    <ThemedText type="label" style={{ color: mutedText }}>Genero</ThemedText>
                                    <ThemedText type="body">{formatValue(displayUser.gender, GENDER_LABELS)}</ThemedText>
                                </View>
                            </View>
                        )}
                        {displayUser.birthDate && (
                            <View style={[styles.infoCard, { backgroundColor: surface, borderColor: border }]}>
                                <Ionicons name="calendar-outline" size={20} color={mutedText} />
                                <View style={styles.infoContent}>
                                    <ThemedText type="label" style={{ color: mutedText }}>Fecha de nacimiento</ThemedText>
                                    <ThemedText type="body">{displayUser.birthDate}</ThemedText>
                                </View>
                            </View>
                        )}
                        {displayUser.zone && (
                            <View style={[styles.infoCard, { backgroundColor: surface, borderColor: border }]}>
                                <Ionicons name="location-outline" size={20} color={mutedText} />
                                <View style={styles.infoContent}>
                                    <ThemedText type="label" style={{ color: mutedText }}>Ubicacion</ThemedText>
                                    <ThemedText type="body">{displayUser.zone}</ThemedText>
                                </View>
                            </View>
                        )}
                        <View style={[styles.infoCard, { backgroundColor: surface, borderColor: border }]}>
                            <Ionicons name="heart-outline" size={20} color={mutedText} />
                            <View style={styles.infoContent}>
                                <ThemedText type="label" style={{ color: mutedText }}>Intereses</ThemedText>
                                <ThemedText type="body">{formatList(displayUser.interests, INTEREST_LABELS)}</ThemedText>
                            </View>
                        </View>
                        <View style={[styles.infoCard, { backgroundColor: surface, borderColor: border }]}>
                            <Ionicons name="language-outline" size={20} color={mutedText} />
                            <View style={styles.infoContent}>
                                <ThemedText type="label" style={{ color: mutedText }}>Idiomas</ThemedText>
                                <ThemedText type="body">{formatList(displayUser.languages)}</ThemedText>
                            </View>
                        </View>
                        <View style={[styles.infoCard, { backgroundColor: surface, borderColor: border }]}>
                            <Ionicons name="airplane-outline" size={20} color={mutedText} />
                            <View style={styles.infoContent}>
                                <ThemedText type="label" style={{ color: mutedText }}>Tipo de viaje</ThemedText>
                                <ThemedText type="body">{formatValue(displayUser.travelType, TRAVEL_TYPE_LABELS)}</ThemedText>
                            </View>
                        </View>
                        <View style={[styles.infoCard, { backgroundColor: surface, borderColor: border }]}>
                            <Ionicons name="cash-outline" size={20} color={mutedText} />
                            <View style={styles.infoContent}>
                                <ThemedText type="label" style={{ color: mutedText }}>Presupuesto</ThemedText>
                                <ThemedText type="body">
                                    {displayUser.budget !== undefined ? `$${displayUser.budget}` : 'Sin definir'}
                                </ThemedText>
                            </View>
                        </View>
                    </View>

                    {/* Menu de opciones */}
                    <View style={styles.menuSection}>
                        <ThemedText type="label" style={[styles.sectionTitle, { color: mutedText }]}>
                            Cuenta
                        </ThemedText>
                        <View style={styles.menuGroup}>
                            <MenuItem
                                icon="person-outline"
                                label="Editar perfil"
                                onPress={() => setEditing(true)}
                            />
                        </View>
                    </View>

                    <View style={styles.menuSection}>
                        <View style={styles.menuGroup}>
                            <MenuItem
                                icon="log-out-outline"
                                label="Cerrar sesion"
                                onPress={handleLogout}
                                danger
                            />
                        </View>
                    </View>
                </>
            ) : (
                /* Modo edicion */
                <View style={styles.editForm}>
                    <ThemedText type="subtitle" style={styles.editTitle}>
                        Editar informacion
                    </ThemedText>

                    <View style={styles.inputGroup}>
                        <ThemedText type="label" style={{ color: mutedText }}>Nombre</ThemedText>
                        <TextInput
                            style={[styles.input, { backgroundColor: surface, borderColor: border, color: text }]}
                            value={formData?.name || ''}
                            onChangeText={(value) => onChange('name', value.replace(/[0-9]/g, ''))}
                            placeholder="Tu nombre"
                            placeholderTextColor={mutedText}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <ThemedText type="label" style={{ color: mutedText }}>Apellido</ThemedText>
                        <TextInput
                            style={[styles.input, { backgroundColor: surface, borderColor: border, color: text }]}
                            value={formData?.lastname || ''}
                            onChangeText={(value) => onChange('lastname', value.replace(/[0-9]/g, ''))}
                            placeholder="Tu apellido"
                            placeholderTextColor={mutedText}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <ThemedText type="label" style={{ color: mutedText }}>Email</ThemedText>
                        <TextInput
                            style={[styles.input, styles.disabledInput, { backgroundColor: background, borderColor: border, color: mutedText }]}
                            value={formData?.email || ''}
                            editable={false}
                        />
                        <ThemedText type="label" style={{ color: mutedText, fontSize: 11, marginTop: 4 }}>
                            El email no se puede cambiar
                        </ThemedText>
                    </View>

                    <View style={styles.inputGroup}>
                        <ThemedText type="label" style={{ color: mutedText }}>Foto (URL)</ThemedText>
                        <TextInput
                            style={[styles.input, { backgroundColor: surface, borderColor: border, color: text }]}
                            value={formData?.photo || ''}
                            onChangeText={(value) => onChange('photo', value)}
                            placeholder="https://..."
                            placeholderTextColor={mutedText}
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <ThemedText type="label" style={{ color: mutedText }}>Genero</ThemedText>
                        <View style={[styles.selectContainer, { backgroundColor: surface, borderColor: border }]}>
                            {GENDER_OPTIONS.map((option) => (
                                <Pressable
                                    key={option}
                                    onPress={() => onChange('gender', option)}
                                    style={[
                                        styles.selectOption,
                                        formData?.gender === option && { backgroundColor: tint },
                                    ]}
                                >
                                    <ThemedText
                                        type="label"
                                        style={{
                                            color: formData?.gender === option ? tintText : text,
                                            fontSize: 12,
                                        }}
                                    >
                                        {GENDER_LABELS[option] ?? option}
                                    </ThemedText>
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <ThemedText type="label" style={{ color: mutedText }}>Intereses</ThemedText>
                        <View style={[styles.selectContainer, { backgroundColor: surface, borderColor: border }]}>
                            {INTEREST_OPTIONS.map((option) => {
                                const selected = formData?.interests?.includes(option);
                                return (
                                    <Pressable
                                        key={option}
                                        onPress={() => toggleArrayValue('interests', option)}
                                        style={[
                                            styles.selectOption,
                                            selected && { backgroundColor: tint },
                                        ]}
                                    >
                                        <ThemedText
                                            type="label"
                                            style={{
                                                color: selected ? tintText : text,
                                                fontSize: 12,
                                            }}
                                        >
                                            {INTEREST_LABELS[option] ?? option}
                                        </ThemedText>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <ThemedText type="label" style={{ color: mutedText }}>Idiomas</ThemedText>
                        <View style={[styles.selectContainer, { backgroundColor: surface, borderColor: border }]}>
                            {LANGUAGE_OPTIONS.map((option) => {
                                const selected = formData?.languages?.includes(option);
                                return (
                                    <Pressable
                                        key={option}
                                        onPress={() => toggleArrayValue('languages', option)}
                                        style={[
                                            styles.selectOption,
                                            selected && { backgroundColor: tint },
                                        ]}
                                    >
                                        <ThemedText
                                            type="label"
                                            style={{
                                                color: selected ? tintText : text,
                                                fontSize: 12,
                                            }}
                                        >
                                            {option}
                                        </ThemedText>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <ThemedText type="label" style={{ color: mutedText }}>Tipo de viaje</ThemedText>
                        <View style={[styles.selectContainer, { backgroundColor: surface, borderColor: border }]}>
                            {TRAVEL_TYPE_OPTIONS.map((option) => (
                                <Pressable
                                    key={option}
                                    onPress={() => onChange('travelType', option)}
                                    style={[
                                        styles.selectOption,
                                        formData?.travelType === option && { backgroundColor: tint },
                                    ]}
                                >
                                    <ThemedText
                                        type="label"
                                        style={{
                                            color: formData?.travelType === option ? tintText : text,
                                            fontSize: 12,
                                        }}
                                    >
                                        {TRAVEL_TYPE_LABELS[option] ?? option}
                                    </ThemedText>
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <ThemedText type="label" style={{ color: mutedText }}>Presupuesto</ThemedText>
                        <TextInput
                            style={[styles.input, { backgroundColor: surface, borderColor: border, color: text }]}
                            value={formData?.budget !== undefined ? String(formData.budget) : ''}
                            onChangeText={(value) => {
                                const trimmed = value.replace(/[^0-9]/g, '');
                                onChange('budget', trimmed ? Number(trimmed) : undefined);
                            }}
                            placeholder="0"
                            placeholderTextColor={mutedText}
                            keyboardType="numeric"
                        />
                    </View>

                    {error && (
                        <View style={styles.errorContainer}>
                            <ThemedText type="body" style={{ color: '#ef4444' }}>
                                {error}
                            </ThemedText>
                        </View>
                    )}

                    <View style={styles.formActions}>
                        <Pressable
                            onPress={handleSave}
                            disabled={saving}
                            style={[styles.primaryButton, { backgroundColor: tint, opacity: saving ? 0.6 : 1 }]}
                        >
                            {saving ? (
                                <ActivityIndicator size="small" color={tintText} />
                            ) : (
                                <ThemedText type="body" style={{ color: tintText, fontWeight: '600' }}>
                                    Guardar cambios
                                </ThemedText>
                            )}
                        </Pressable>
                        <Pressable
                            onPress={handleCancel}
                            disabled={saving}
                            style={[styles.secondaryButton, { borderColor: border }]}
                        >
                            <ThemedText type="body" style={{ color: text }}>
                                Cancelar
                            </ThemedText>
                        </Pressable>
                    </View>
                </View>
            )}
        </AppScreen>
    );
}
