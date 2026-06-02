import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
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
        return 'Not set';
    }
    return values.map((value) => labelMap?.[value] ?? value).join(', ');
}

function formatValue(value?: string, labelMap?: Record<string, string>) {
    if (!value) {
        return 'Not set';
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

function normalizePhotoValue(value?: string | null) {
    const trimmed = value?.trim();
    if (!trimmed || trimmed === 'null' || trimmed === 'undefined') {
        return null;
    }
    const lower = trimmed.toLowerCase();
    const isDataUri = lower.startsWith('data:image/');
    const isHttp = lower.startsWith('http://') || lower.startsWith('https://');
    const isFile = lower.startsWith('file://');
    return isDataUri || isHttp || isFile ? trimmed : null;
}

function resolveInitial(name?: string, fallback?: string) {
    const normalizedName = name?.trim();
    if (normalizedName) {
        return normalizedName.charAt(0).toUpperCase();
    }
    const normalizedFallback = fallback?.trim();
    if (normalizedFallback && normalizedFallback.length === 1) {
        return normalizedFallback.toUpperCase();
    }
    return '?';
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
    const { fetchProfile, updateProfile, deleteAccount } = useProfile();

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
    const [deletingAccount, setDeletingAccount] = useState(false);

    const displayUser = useMemo(() => normalizeProfile(user), [user]);

    const loadProfile = useCallback(async () => {
        if (tokenData.state !== 'LOGGED_IN') {
            setLoading(false);
            return;
        }

        try {
            const profileData = await fetchProfile();
            const normalized = normalizeProfile(profileData);
            setUser(normalized);
            setFormData(normalized);
            setPhotoUrl(normalizePhotoValue(normalized.photo));
        } catch (err) {
            console.error('[ProfileScreen] Error loading profile:', err);
            setError('Error loading profile');
        } finally {
            setLoading(false);
        }
    }, [tokenData.state, fetchProfile]);

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
            const resolvedPhoto = normalizePhotoValue(merged.photo);
            setPhotoUrl(resolvedPhoto);
            setEditing(false);
        } catch (err) {
            console.error('[ProfileScreen] Error saving profile:', err);
            setError('Error saving changes');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData(displayUser);
        setPhotoUrl(normalizePhotoValue(displayUser.photo));
        setEditing(false);
        setError(null);
    };

    async function handleChangePhoto() {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permission.status !== 'granted') {
            Alert.alert('Permission required', 'We need access to your gallery to choose a photo.');
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
            setError('Could not read selected image.');
            return;
        }

        const mimeType = asset.mimeType ?? 'image/jpeg';
        const dataUrl = `data:${mimeType};base64,${asset.base64}`;
        setPhotoUrl(dataUrl);
        if (formData) {
            setFormData({ ...formData, photo: dataUrl });
        }
        setEditing(true);
    }

    function handleClearPhoto() {
        setPhotoUrl(null);
        if (formData) {
            setFormData({ ...formData, photo: '' });
        }
    }

    async function handleLogout() {
            Alert.alert(
            'Log out',
            'Are you sure you want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Log out',
                    style: 'destructive',
                    onPress: async () => {
                        setLoggingOut(true);
                        await logout();
                        router.replace('/');
                    },
                },
            ]
        );
    }

    async function handleDeleteAccount() {
            Alert.alert(
            'Delete account',
            'Are you sure? This action is irreversible and will delete all your data.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setDeletingAccount(true);
                        try {
                            await deleteAccount();
                            await logout();
                            router.replace('/');
                        } catch (err) {
                            console.error('[ProfileScreen] Error deleting account:', err);
                            setError('Could not delete account. Please try again.');
                            setDeletingAccount(false);
                        }
                    },
                },
            ]
        );
    }

    // Loading state
    if (loggingOut || deletingAccount || loading || tokenData.state === 'LOADING') {
        return (
            <AppScreen>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={tint} />
                    <ThemedText type="body" style={{ color: mutedText, marginTop: 12 }}>
                        Logging out...
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
                        Sign in to view your profile
                    </ThemedText>
                    <Pressable
                        onPress={() => router.replace('/')}
                        style={[styles.primaryButton, { backgroundColor: tint, marginTop: 24 }]}
                    >
                            <ThemedText type="body" style={{ color: tintText, fontWeight: '600' }}>
                            Sign in
                        </ThemedText>
                    </Pressable>
                </View>
            </AppScreen>
        );
    }

    const fullName = `${displayUser.name || 'User'} ${displayUser.lastname || ''}`.trim();
    const avatarInitial = resolveInitial(displayUser.name, displayUser.photo);

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
                        <View style={[styles.avatarPlaceholder, { backgroundColor: tint }]}
                            >
                            <ThemedText
                                type="heading"
                                lightColor={tintText}
                                darkColor={tintText}
                                style={styles.avatarInitial}
                            >
                                {avatarInitial}
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
                                    <ThemedText type="label" style={{ color: mutedText }}>Gender</ThemedText>
                                    <ThemedText type="body">{formatValue(displayUser.gender, GENDER_LABELS)}</ThemedText>
                                </View>
                            </View>
                        )}
                        {displayUser.birthDate && (
                            <View style={[styles.infoCard, { backgroundColor: surface, borderColor: border }]}>
                                <Ionicons name="calendar-outline" size={20} color={mutedText} />
                                <View style={styles.infoContent}>
                                    <ThemedText type="label" style={{ color: mutedText }}>Birth date</ThemedText>
                                    <ThemedText type="body">{displayUser.birthDate}</ThemedText>
                                </View>
                            </View>
                        )}
                        {displayUser.zone && (
                            <View style={[styles.infoCard, { backgroundColor: surface, borderColor: border }]}>
                                <Ionicons name="location-outline" size={20} color={mutedText} />
                                <View style={styles.infoContent}>
                                    <ThemedText type="label" style={{ color: mutedText }}>Location</ThemedText>
                                    <ThemedText type="body">{displayUser.zone}</ThemedText>
                                </View>
                            </View>
                        )}
                        <View style={[styles.infoCard, { backgroundColor: surface, borderColor: border }]}>
                            <Ionicons name="heart-outline" size={20} color={mutedText} />
                            <View style={styles.infoContent}>
                                <ThemedText type="label" style={{ color: mutedText }}>Interests</ThemedText>
                                <ThemedText type="body">{formatList(displayUser.interests, INTEREST_LABELS)}</ThemedText>
                            </View>
                        </View>
                        <View style={[styles.infoCard, { backgroundColor: surface, borderColor: border }]}>
                            <Ionicons name="language-outline" size={20} color={mutedText} />
                            <View style={styles.infoContent}>
                                <ThemedText type="label" style={{ color: mutedText }}>Languages</ThemedText>
                                <ThemedText type="body">{formatList(displayUser.languages)}</ThemedText>
                            </View>
                        </View>
                        <View style={[styles.infoCard, { backgroundColor: surface, borderColor: border }]}>
                            <Ionicons name="airplane-outline" size={20} color={mutedText} />
                            <View style={styles.infoContent}>
                                <ThemedText type="label" style={{ color: mutedText }}>Travel type</ThemedText>
                                <ThemedText type="body">{formatValue(displayUser.travelType, TRAVEL_TYPE_LABELS)}</ThemedText>
                            </View>
                        </View>
                        <View style={[styles.infoCard, { backgroundColor: surface, borderColor: border }]}>
                            <Ionicons name="cash-outline" size={20} color={mutedText} />
                            <View style={styles.infoContent}>
                                <ThemedText type="label" style={{ color: mutedText }}>Budget</ThemedText>
                                <ThemedText type="body">
                                    {displayUser.budget !== undefined ? `$${displayUser.budget}` : 'Not set'}
                                </ThemedText>
                            </View>
                        </View>
                    </View>

                    {/* Menu de opciones */}
                    <View style={styles.menuSection}>
                        <ThemedText type="label" style={[styles.sectionTitle, { color: mutedText }]}>
                            Account
                        </ThemedText>
                        <View style={styles.menuGroup}>
                            <MenuItem
                                icon="person-outline"
                                label="Edit profile"
                                onPress={() => setEditing(true)}
                            />
                        </View>
                    </View>

                    <View style={styles.menuSection}>
                        <View style={styles.menuGroup}>
                            <MenuItem
                                icon="log-out-outline"
                                label="Log out"
                                onPress={handleLogout}
                                danger
                            />
                            <MenuItem
                                icon="trash-outline"
                                label="Delete account"
                                onPress={handleDeleteAccount}
                                danger
                            />
                        </View>
                    </View>
                </>
            ) : (
                /* Modo edicion */
                <View style={styles.editForm}>
                    <ThemedText type="subtitle" style={styles.editTitle}>
                        Edit information
                    </ThemedText>

                    <View style={styles.inputGroup}>
                        <ThemedText type="label" style={{ color: mutedText }}>Name</ThemedText>
                        <TextInput
                            style={[styles.input, { backgroundColor: surface, borderColor: border, color: text }]}
                            value={formData?.name || ''}
                            onChangeText={(value) => onChange('name', value.replace(/[0-9]/g, ''))}
                            placeholder="Your name"
                            placeholderTextColor={mutedText}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <ThemedText type="label" style={{ color: mutedText }}>Last name</ThemedText>
                        <TextInput
                            style={[styles.input, { backgroundColor: surface, borderColor: border, color: text }]}
                            value={formData?.lastname || ''}
                            onChangeText={(value) => onChange('lastname', value.replace(/[0-9]/g, ''))}
                            placeholder="Your last name"
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
                            Email cannot be changed
                        </ThemedText>
                    </View>

                    <View style={styles.inputGroup}>
                        <ThemedText type="label" style={{ color: mutedText }}>Photo</ThemedText>
                        <View style={styles.photoRow}>
                            <TextInput
                                style={[
                                    styles.input,
                                    styles.photoInput,
                                    { backgroundColor: surface, borderColor: border, color: text },
                                ]}
                                value={formData?.photo || ''}
                                onChangeText={(value) => onChange('photo', value)}
                                placeholder="https://..."
                                placeholderTextColor={mutedText}
                                autoCapitalize="none"
                            />
                            <Pressable
                                onPress={handleChangePhoto}
                                style={[styles.photoButton, { borderColor: border }]}
                            >
                                    <ThemedText type="label" style={{ color: text }}>
                                    Select
                                </ThemedText>
                            </Pressable>
                            <Pressable
                                onPress={handleClearPhoto}
                                style={[styles.photoButton, { borderColor: border }]}
                            >
                                    <ThemedText type="label" style={{ color: text }}>
                                    Clear
                                </ThemedText>
                            </Pressable>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <ThemedText type="label" style={{ color: mutedText }}>Gender</ThemedText>
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
                        <ThemedText type="label" style={{ color: mutedText }}>Interests</ThemedText>
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
                        <ThemedText type="label" style={{ color: mutedText }}>Languages</ThemedText>
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
                        <ThemedText type="label" style={{ color: mutedText }}>Travel type</ThemedText>
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
                        <ThemedText type="label" style={{ color: mutedText }}>Budget</ThemedText>
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
                                        Save changes
                                </ThemedText>
                            )}
                        </Pressable>
                        <Pressable
                            onPress={handleCancel}
                            disabled={saving}
                            style={[styles.secondaryButton, { borderColor: border }]}
                        >
                            <ThemedText type="body" style={{ color: text }}>
                                Cancel
                            </ThemedText>
                        </Pressable>
                    </View>
                </View>
            )}
        </AppScreen>
    );
}
