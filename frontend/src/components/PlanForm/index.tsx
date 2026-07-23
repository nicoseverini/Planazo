import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    TextInput,
    View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useTranslation } from 'react-i18next';

import { DateField } from '@/components/DateField';
import { ThemedText } from '@/components/ThemedText';
import { TimeField } from '@/components/TimeField';
import { AppScreen } from '@/components/ui';
import { CATEGORY_OPTIONS } from '@/constants/plan-form';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { PlanFormValues } from '@/hooks/use-plan-form';
import { parseClockTime, parseFormDate } from '@/utils/date';
import { formatInterest } from '@/utils/interests';

import { styles } from './styles';

type PlanFormProps = PlanFormValues & {
    screenTitle: string;
    submitLabel: string;
    onSubmit: () => void;
    onBack: () => void;
    descriptionPlaceholderKey?: string;
};

export function PlanForm({
    screenTitle,
    submitLabel,
    onSubmit,
    onBack,
    descriptionPlaceholderKey,
    saving,
    error,
    title, setTitle,
    description, setDescription,
    isPublic, setIsPublic,
    startDate, setStartDate, startTime, setStartTime,
    endDate, setEndDate, endTime, setEndTime,
    isSearchingLoc,
    country, setCountry,
    state, setState,
    city, setCity,
    address, setAddress,
    pinLocation,
    minAge, setMinAge,
    maxAge, setMaxAge,
    maxParticipants, setMaxParticipants,
    budget, setBudget,
    selectedCategories,
    images,
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
}: PlanFormProps) {
    const router = useRouter();
    const { t } = useTranslation();
    const { tint, tintText, surface, border, mutedText, text, background } = useAppTheme();
    // Stable "today" reference so the date pickers don't re-init on every render.
    const today = useMemo(() => new Date(), []);
    const startDateValue = useMemo(() => parseFormDate(startDate), [startDate]);
    const endDateValue = useMemo(() => parseFormDate(endDate), [endDate]);
    const startTimeValue = useMemo(() => parseClockTime(startTime), [startTime]);
    const endTimeValue = useMemo(() => parseClockTime(endTime), [endTime]);

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
                <ThemedText type="title">{screenTitle}</ThemedText>
            </View>

            {/* Title + Visibility toggle */}
            <View style={styles.titleRow}>
                <View style={styles.titleInput}>
                    <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>{t('label_title')} *</ThemedText>
                    <TextInput
                        value={title}
                        onChangeText={setTitle}
                        placeholder={t('plan_name_placeholder')}
                        placeholderTextColor={mutedText}
                        style={[styles.input, { backgroundColor: surface, borderColor: border, color: text }]}
                    />
                </View>
                <View style={styles.visibilityToggle}>
                    <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>{t('label_visibility')}</ThemedText>
                    <View style={[styles.toggleContainer, { backgroundColor: surface, borderColor: border }]}>
                        <Pressable
                            onPress={() => setIsPublic(false)}
                            style={[styles.toggleOption, !isPublic && { backgroundColor: tint }]}
                        >
                            <ThemedText type="label" style={{ color: !isPublic ? tintText : mutedText, fontSize: 11 }}>
                                {t('label_private')}
                            </ThemedText>
                        </Pressable>
                        <Pressable
                            onPress={() => setIsPublic(true)}
                            style={[styles.toggleOption, isPublic && { backgroundColor: tint }]}
                        >
                            <ThemedText type="label" style={{ color: isPublic ? tintText : mutedText, fontSize: 11 }}>
                                {t('label_public')}
                            </ThemedText>
                        </Pressable>
                    </View>
                </View>
            </View>

            {/* Start date */}
            <View style={styles.inputGroup}>
                <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>{t('label_start_date')} *</ThemedText>
                <DateField
                    value={startDateValue}
                    onChange={applyStartDate}
                    onClear={() => setStartDate('')}
                    minimumDate={today}
                />
            </View>

            {/* Start time */}
            <View style={styles.inputGroup}>
                <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>{t('label_start_time')} *</ThemedText>
                <TimeField
                    value={startTimeValue}
                    onChange={applyStartTime}
                    onClear={() => setStartTime('')}
                />
            </View>

            {/* End date */}
            <View style={styles.inputGroup}>
                <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>{t('label_end_date')} *</ThemedText>
                <DateField
                    value={endDateValue}
                    onChange={applyEndDate}
                    onClear={() => setEndDate('')}
                    minimumDate={startDateValue ?? today}
                />
            </View>

            {/* End time */}
            <View style={styles.inputGroup}>
                <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>{t('label_end_time')} *</ThemedText>
                <TimeField
                    value={endTimeValue}
                    onChange={applyEndTime}
                    onClear={() => setEndTime('')}
                />
            </View>

            {/* Age restrictions */}
            <View style={styles.row}>
                <View style={styles.halfInput}>
                    <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>{t('label_min_age')}</ThemedText>
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
                    <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>{t('label_max_age')}</ThemedText>
                    <TextInput
                        value={maxAge}
                        onChangeText={setMaxAge}
                        placeholder={t('zero_no_limit')}
                        placeholderTextColor={mutedText}
                        keyboardType="numeric"
                        style={[styles.input, { backgroundColor: surface, borderColor: border, color: text }]}
                    />
                </View>
            </View>

            {/* Categories */}
            <View style={styles.inputGroup}>
                <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>{t('label_category')} *</ThemedText>
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
                                    {formatInterest(cat)}
                                </ThemedText>
                            </Pressable>
                        ))}
                    </View>
                </ScrollView>
            </View>

            {/* Max Participants + Budget */}
            <View style={styles.row}>
                <View style={styles.halfInput}>
                    <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>{t('label_max_participants')} *</ThemedText>
                    <TextInput
                        value={maxParticipants}
                        onChangeText={setMaxParticipants}
                        placeholder="e.g. 10"
                        placeholderTextColor={mutedText}
                        keyboardType="numeric"
                        style={[styles.input, { backgroundColor: background, borderColor: border, color: text }]}
                    />
                </View>
                <View style={styles.halfInput}>
                    <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>{t('label_budget_optional')}</ThemedText>
                    <TextInput
                        value={budget}
                        onChangeText={setBudget}
                        placeholder="e.g. 500"
                        placeholderTextColor={mutedText}
                        keyboardType="decimal-pad"
                        style={[styles.input, { backgroundColor: background, borderColor: border, color: text }]}
                    />
                </View>
            </View>

            {/* Location: Country / City / Address + Map */}
            <View style={styles.inputGroup}>
                <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>{t('label_country')} *</ThemedText>
                <TextInput
                    value={country}
                    onChangeText={setCountry}
                    placeholder="e.g. Argentina"
                    placeholderTextColor={mutedText}
                    style={[styles.input, { marginTop: 0, marginBottom: 12, backgroundColor: surface, borderColor: border, color: text }]}
                />
                <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>{t('label_state')} *</ThemedText>
                <TextInput
                    value={state}
                    onChangeText={setState}
                    placeholder="e.g. Buenos Aires"
                    placeholderTextColor={mutedText}
                    style={[styles.input, { marginTop: 0, marginBottom: 12, backgroundColor: surface, borderColor: border, color: text }]}
                />
                <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>{t('label_city')} *</ThemedText>
                <TextInput
                    value={city}
                    onChangeText={setCity}
                    placeholder="e.g. Buenos Aires"
                    placeholderTextColor={mutedText}
                    style={[styles.input, { marginTop: 0, marginBottom: 12, backgroundColor: surface, borderColor: border, color: text }]}
                />
                <ThemedText type="label" style={{ color: mutedText, marginBottom: 4 }}>{t('label_address')} *</ThemedText>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                    <TextInput
                        value={address}
                        onChangeText={setAddress}
                        placeholder="e.g. Av. Paseo Colón 850"
                        placeholderTextColor={mutedText}
                        style={[styles.input, { flex: 1, marginTop: 0, backgroundColor: surface, borderColor: border, color: text }]}
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
                        initialRegion={{
                            latitude: -34.6037,
                            longitude: -58.3816,
                            latitudeDelta: 0.05,
                            longitudeDelta: 0.05,
                        }}
                        onPress={(e: any) => handleMapInteract(e.nativeEvent.coordinate)}
                    >
                        {pinLocation && (
                            <Marker
                                draggable
                                coordinate={pinLocation}
                                onDragEnd={(e: any) => handleMapInteract(e.nativeEvent.coordinate)}
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
                    placeholder={t(descriptionPlaceholderKey ?? 'describe_plan_placeholder')}
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

            {/* Submit button */}
            <Pressable
                onPress={onSubmit}
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
