import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    Pressable,
    RefreshControl,
    View,
} from 'react-native';

import { Avatar } from '@/components/Avatar';
import { ReviewSection } from '@/components/ReviewSection';
import { StarRating } from '@/components/StarRating';
import { ThemedText } from '@/components/ThemedText';
import { AppScreen } from '@/components/ui';
import { decodeJwt, useToken } from '@/context/token-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { UpdateProfileRequest, UserProfile, useProfile } from '@/services/user';

import { AccountActions } from '@/components/AccountActions';
import { ProfileEditForm } from '@/components/ProfileEditForm';
import { ProfileInfoCards } from '@/components/ProfileInfoCards';
import { ensureMediaLibraryPermission } from '@/utils/media-permissions';
import { normalizePhotoValue, normalizeProfile } from '@/utils/profile';
import { useTranslation } from 'react-i18next';

import { styles } from './styles';

export default function UserProfileScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { id } = useLocalSearchParams<{ id?: string }>();
    const { tokenData, logout } = useToken();
    const { fetchProfile, fetchProfileById, updateProfile, deleteAccount } = useProfile();
    const { tint, tintText, surface, border, mutedText } = useAppTheme();

    const [user, setUser] = useState<UserProfile | null>(null);
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState<UserProfile | null>(null);
    const [saving, setSaving] = useState(false);
    const [updatingPhoto, setUpdatingPhoto] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [deletingAccount, setDeletingAccount] = useState(false);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'reviews'>('profile');
    const [averageRating, setAverageRating] = useState(0);
    const [reviewCount, setReviewCount] = useState(0);

    // Ownership detection: compare the viewed profile id with the authenticated user id.
    const currentUserId =
        tokenData.state === 'LOGGED_IN' ? decodeJwt(tokenData.accessToken).id : undefined;
    const routeId = id ? Number(id) : undefined;
    const targetId = routeId ?? currentUserId;
    const isOwnProfile = currentUserId != null && targetId === currentUserId;

    const displayUser = useMemo(() => normalizeProfile(user), [user]);

    const handleStatsUpdated = useCallback((average: number, count: number) => {
        setAverageRating(average);
        setReviewCount(count);
    }, []);

    const loadProfile = useCallback(async () => {
        if (tokenData.state === 'LOADING') return;
        if (tokenData.state === 'LOGGED_OUT') {
            setLoading(false);
            return;
        }
        if (targetId == null) {
            setError('User not found.');
            setLoading(false);
            return;
        }
        try {
            setError(null);
            const data = isOwnProfile ? await fetchProfile() : await fetchProfileById(targetId);
            const normalized = normalizeProfile(data);
            setUser(normalized);
            setFormData(normalized);
            setPhotoUrl(normalizePhotoValue(normalized.photo));
        } catch (err) {
            setError(
                isOwnProfile
                    ? 'Unable to load profile information.'
                    : err instanceof Error
                        ? err.message
                        : 'Unable to load this profile.'
            );
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tokenData.state, isOwnProfile, targetId]);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await loadProfile();
        } finally {
            setRefreshing(false);
        }
    }, [loadProfile]);

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
            const payload: UpdateProfileRequest = {
                name: formData.name,
                lastname: formData.lastname,
                gender: formData.gender,
                birthDate: formData.birthDate,
                photo: formData.photo,
                travelType: formData.travelType || undefined,
                languages: formData.languages ?? [],
                interests: formData.interests ?? [],
            };
            const updatedProfile = await updateProfile(payload);
            const merged = normalizeProfile({ ...displayUser, ...formData, ...updatedProfile });
            setUser(merged);
            setFormData(merged);
            setPhotoUrl(normalizePhotoValue(merged.photo));
            setEditing(false);
        } catch (err) {
            console.error('[UserProfileScreen] Error saving profile:', err);
            setError('Unable to update your profile. Please try again.');
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

    // The profile picture is changed only by tapping the avatar: check gallery
    // permission, pick an image, and persist it through the existing update flow.
    async function handleChangePhoto() {
        if (updatingPhoto) return;

        const granted = await ensureMediaLibraryPermission();
        if (!granted) {
            Alert.alert(
                t('photo_access_title'),
                t('photo_access_desc')
            );
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
            Alert.alert(t('error'), t('error_load_image_failed'));
            return;
        }

        const dataUrl = `data:${asset.mimeType ?? 'image/jpeg'};base64,${asset.base64}`;
        setUpdatingPhoto(true);
        try {
            await updateProfile({ photo: dataUrl });
            setPhotoUrl(dataUrl);
            setUser((prev) => (prev ? { ...prev, photo: dataUrl } : prev));
            setFormData((prev) => (prev ? { ...prev, photo: dataUrl } : prev));
        } catch (err) {
            console.error('[UserProfileScreen] Error updating profile picture:', err);
            Alert.alert(t('error'), t('error_update_photo_failed'));
        } finally {
            setUpdatingPhoto(false);
        }
    }

    function handleLogout() {
        Alert.alert(t('logout'), t('logout_confirm'), [
            { text: t('cancel'), style: 'cancel' },
            {
                text: t('logout'),
                style: 'destructive',
                onPress: async () => {
                    setLoggingOut(true);
                    try {
                        await logout();
                        // Clear the stack so the iOS back gesture cannot reach authenticated screens.
                        if (router.canGoBack()) router.dismissAll();
                        router.replace('/');
                    } catch (err) {
                        console.error('[UserProfileScreen] Error logging out:', err);
                        setLoggingOut(false);
                        Alert.alert(t('error'), t('error_logout_failed'));
                    }
                },
            },
        ]);
    }

    function handleDeleteAccount() {
        Alert.alert(
            t('delete_account'),
            t('delete_account_confirm'),
            [
                { text: t('cancel'), style: 'cancel' },
                {
                    text: t('delete'),
                    style: 'destructive',
                    onPress: async () => {
                        setError(null);
                        setDeletingAccount(true);
                        try {
                            await deleteAccount();
                            await logout();
                            if (router.canGoBack()) router.dismissAll();
                            router.replace('/');
                        } catch (err) {
                            console.error('[UserProfileScreen] Error deleting account:', err);
                            setError('Unable to delete your account. Please try again.');
                            setDeletingAccount(false);
                        }
                    },
                },
            ]
        );
    }

    // Loading / transitional states
    if (loggingOut || deletingAccount || loading || tokenData.state === 'LOADING') {
        const loadingText = deletingAccount
            ? 'Deleting account...'
            : loggingOut
                ? 'Logging out...'
                : 'Loading...';
        return (
            <AppScreen>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={tint} />
                    <ThemedText type="body" style={{ color: mutedText }}>
                        {loadingText}
                    </ThemedText>
                </View>
            </AppScreen>
        );
    }

    // Not authenticated (a token is required to view any profile)
    if (tokenData.state === 'LOGGED_OUT') {
        return (
            <AppScreen>
                <View style={styles.loadingContainer}>
                    <Ionicons name="person-outline" size={48} color={mutedText} />
                    <ThemedText type="body" style={{ color: mutedText }}>
                        Sign in to view your profile
                    </ThemedText>
                    <Pressable
                        onPress={() => router.replace('/')}
                        style={[styles.primaryButton, { backgroundColor: tint, marginTop: 12 }]}
                    >
                        <ThemedText type="body" style={{ color: tintText, fontWeight: '600' }}>
                            Sign in
                        </ThemedText>
                    </Pressable>
                </View>
            </AppScreen>
        );
    }

    if (error && !user) {
        return (
            <AppScreen>
                <View style={styles.loadingContainer}>
                    <Ionicons name="person-circle-outline" size={48} color={mutedText} />
                    <ThemedText type="body" style={{ color: mutedText }}>
                        {error}
                    </ThemedText>
                    {router.canGoBack() && (
                        <Pressable onPress={() => router.back()} style={[styles.backButton, { backgroundColor: tint }]}>
                            <ThemedText type="body" style={{ color: tintText }}>Back</ThemedText>
                        </Pressable>
                    )}
                </View>
            </AppScreen>
        );
    }

    const fullName = `${displayUser.name || 'User'} ${displayUser.lastname || ''}`.trim();

    return (
        <AppScreen
            scrollable
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={tint} />
            }
        >
            <Modal
                visible={isViewerOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setIsViewerOpen(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setIsViewerOpen(false)}>
                    <Pressable style={styles.modalCloseButton} onPress={() => setIsViewerOpen(false)}>
                        <Ionicons name="close" size={32} color="#fff" />
                    </Pressable>
                    {photoUrl ? (
                        <Image source={{ uri: photoUrl }} style={styles.fullImage} resizeMode="contain" />
                    ) : null}
                </Pressable>
            </Modal>

            {router.canGoBack() && (
                <View style={styles.headerBar}>
                    <Pressable
                        onPress={() => router.back()}
                        style={({ pressed }) => [
                            styles.headerButton,
                            { backgroundColor: surface, borderColor: border },
                            pressed && styles.pressed,
                        ]}
                    >
                        <Ionicons name="arrow-back" size={24} color={mutedText} />
                    </Pressable>
                    <ThemedText type="subtitle">{t('profile')}</ThemedText>
                </View>
            )}

            {/* Header: avatar + name (+ email for the authenticated user) */}
            <View style={styles.header}>
                <Avatar
                    name={displayUser.name}
                    photo={photoUrl}
                    size={100}
                    ring
                    editable={editing}
                    loading={updatingPhoto}
                    onPress={() => {
                        // Photo editing is only available on the Edit Profile screen (editing
                        // mode); otherwise tapping the avatar just opens the full-screen viewer.
                        if (editing) handleChangePhoto();
                        else if (photoUrl) setIsViewerOpen(true);
                    }}
                />

                <ThemedText type="title" style={styles.userName}>
                    {fullName}
                </ThemedText>
                {!isOwnProfile && (
                    <View style={styles.ratingRow}>
                        <ThemedText type="body" style={{ fontWeight: '600' }}>
                            {averageRating.toFixed(1)}
                        </ThemedText>
                        <StarRating rating={averageRating} />
                        <ThemedText type="body" style={{ color: mutedText }}>
                            ({reviewCount} reviews)
                        </ThemedText>
                    </View>
                )}
                {isOwnProfile && displayUser.email ? (
                    <>
                        <ThemedText type="body" style={{ color: mutedText }}>
                            {displayUser.email}
                        </ThemedText>
                        <View style={styles.ratingRow}>
                            <ThemedText type="body" style={{ fontWeight: '600' }}>
                                {averageRating.toFixed(1)}
                            </ThemedText>
                            <StarRating rating={averageRating} />
                            <ThemedText type="body" style={{ color: mutedText }}>
                                ({reviewCount} reviews)
                            </ThemedText>
                        </View>
                    </>
                ) : null}
            </View>

            {editing ? (
                <ProfileEditForm
                    formData={formData}
                    onChange={onChange}
                    onToggleArrayValue={toggleArrayValue}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    saving={saving}
                    error={error}
                />
            ) : (
                <>
                    <View style={[styles.tabContainer, { borderColor: border }]}>
                        <Pressable
                            onPress={() => setActiveTab('profile')}
                            style={[
                                styles.tab,
                                activeTab === 'profile' && { borderBottomColor: tint, borderBottomWidth: 2 },
                            ]}
                        >
                            <ThemedText
                                type="body"
                                style={[styles.tabText, { color: activeTab === 'profile' ? tint : mutedText }]}
                            >
                                {t('profile')}
                            </ThemedText>
                        </Pressable>
                        <Pressable
                            onPress={() => setActiveTab('reviews')}
                            style={[
                                styles.tab,
                                activeTab === 'reviews' && { borderBottomColor: tint, borderBottomWidth: 2 },
                            ]}
                        >
                            <ThemedText
                                type="body"
                                style={[styles.tabText, { color: activeTab === 'reviews' ? tint : mutedText }]}
                            >
                                {t('tab_reviews')}
                            </ThemedText>
                        </Pressable>
                    </View>

                    <View style={{ display: activeTab === 'reviews' ? 'flex' : 'none' }}>
                        {targetId != null && (
                            <ReviewSection
                                targetType="USER"
                                targetId={targetId}
                                onStatsUpdated={handleStatsUpdated}
                            />
                        )}
                    </View>

                    {activeTab === 'profile' && (
                        <>
                            <ProfileInfoCards user={displayUser} />

                            {error && (
                                <View style={[styles.errorContainer, { marginTop: 16 }]}>
                                    <ThemedText type="body" style={{ color: '#ef4444' }}>
                                        {error}
                                    </ThemedText>
                                </View>
                            )}

                            {isOwnProfile && (
                                <AccountActions
                                    onEditProfile={() => setEditing(true)}
                                    onSettings={() => router.push('/configurations')}
                                    onLogout={handleLogout}
                                    onDeleteAccount={handleDeleteAccount}
                                />
                            )}
                        </>
                    )}
                </>
            )}
        </AppScreen>
    );
}
