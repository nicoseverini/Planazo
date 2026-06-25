import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  ImageBackground,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
  Dimensions,
} from 'react-native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/ThemedText';
import { AppScreen } from '@/components/ui';
import { PlanCard } from '@/components/PlanCard';
import { TouristPlaceCard } from '@/components/TouristPlaceCard';
import { useToken, decodeJwt } from '@/context/token-context';
import { useProfile, UserProfile } from '@/services/user';
import { PlanSummary, usePlans } from '@/services/plan';
import { useTouristPlaces, TouristPlaceSummary } from '@/services/tourist-place';
import { useAppTheme } from '@/hooks/use-app-theme';
import { formatInterest } from '@/utils/interests';
import i18n from '@/config/i18n';

import { styles } from './styles';

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  lastname: '',
  email: '',
  interests: [],
};

const DEFAULT_COORDS = {
  latitude: -34.6037, // Buenos Aires Center / FIUBA fallback
  longitude: -58.3816,
};

const FALLBACK_IMAGES: Record<string, string> = {
  FOOD: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600',
  CULTURE: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=600',
  NATURE: 'https://images.unsplash.com/photo-1472214222541-d510753a8707?q=80&w=600',
  BEACH: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600',
  ADVENTURE: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600',
  SPORTS: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=600',
  NIGHTLIFE: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600',
  SHOPPING: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600',
  HISTORY: 'https://images.unsplash.com/photo-1448697138198-9fa6d09c44d6?q=80&w=600',
  MOUNTAINS: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600',
  OTHER: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=600',
};

// Converts ISO 2-letter country code to Unicode Flag Emoji
function getFlagEmoji(countryCode: string) {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

const CARD_WIDTH = Dimensions.get('window').width * 0.88;



export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { tokenData, getAccessToken } = useToken();
  const { fetchProfile } = useProfile();
  const { fetchFilteredPlans, fetchPublicPlans, fetchMyJoinedPlans } = usePlans();
  const { fetchAll: fetchAllTouristPlaces } = useTouristPlaces();

  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [locationPermission, setLocationPermission] = useState<Location.PermissionStatus | null>(null);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [userCountry, setUserCountry] = useState<string | null>(null);
  const [userCountryCode, setUserCountryCode] = useState<string | null>(null);
  const [plans, setPlans] = useState<PlanSummary[]>([]);
  const [fomoPlans, setFomoPlans] = useState<PlanSummary[]>([]);
  const [touristPlaces, setTouristPlaces] = useState<TouristPlaceSummary[]>([]);
  const [secondaryPlans, setSecondaryPlans] = useState<PlanSummary[]>([]);
  const [joinedIds, setJoinedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [myUserId, setMyUserId] = useState<number | null>(null);

  // Business logic fallback labels
  const [listLabelKey, setListLabelKey] = useState('recommended_plans');
  const [businessCase, setBusinessCase] = useState('CASE_4');

  const { tint, tintText, surface, border, mutedText, text: textColor } = useAppTheme();

  // Decode user ID on mount or token change
  useEffect(() => {
    if (tokenData.state === 'LOGGED_IN') {
      const token = getAccessToken();
      if (token) {
        try {
          const decoded = decodeJwt(token);
          if (decoded && decoded.id) {
            setMyUserId(Number(decoded.id));
          }
        } catch (e) {
          console.error('[HomeScreen] Error decoding jwt', e);
        }
      }
    }
  }, [tokenData, getAccessToken]);

  // Main load function managing the 4 business cases
  const loadData = useCallback(
    async (
      currentPermStatus: Location.PermissionStatus | null,
      currentCoords: { latitude: number; longitude: number } | null
    ) => {
      if (tokenData.state !== 'LOGGED_IN') {
        setLoading(false);
        return;
      }

      try {
        // 1. Fetch profile to get name and interests
        let userProfile = DEFAULT_PROFILE;
        try {
          userProfile = await fetchProfile();
          setProfile(userProfile);
          if (userProfile.preferredLanguage) {
            await i18n.changeLanguage(userProfile.preferredLanguage);
          }
        } catch (err) {
          console.error('[HomeScreen] Error loading profile:', err);
        }

        // 2. Fetch my joined plans to mark subscribed state
        let joinedSet = new Set<number>();
        try {
          const joinedPlans = await fetchMyJoinedPlans();
          joinedSet = new Set(joinedPlans.map((p) => p.id));
          setJoinedIds(joinedSet);
        } catch (err) {
          console.error('[HomeScreen] Error fetching joined plans:', err);
        }

        const interests = userProfile.interests || [];
        let fetchedPlans: PlanSummary[] = [];
        let fetchedSecondary: PlanSummary[] = [];
        let labelKey = 'recommended_plans';
        let activeCase = 'CASE_4';

        // Decode current user ID
        let currentUserId = myUserId;
        if (!currentUserId) {
          const token = getAccessToken();
          if (token) {
            const decoded = decodeJwt(token);
            currentUserId = decoded?.id ? Number(decoded.id) : null;
          }
        }

        // Fetch general public list first to populate secondary list/grid and FOMO
        let allPublicList: PlanSummary[] = [];
        try {
          allPublicList = await fetchPublicPlans();
        } catch (err) {
          console.error('[HomeScreen] Error fetching public list:', err);
        }

        // Fetch tourist places only if location is granted
        if (currentPermStatus === 'granted' && currentCoords) {
          try {
            const allPlaces = await fetchAllTouristPlaces();
            const sortedByDistance = [...allPlaces].sort((a, b) => {
              if (a.latitude == null || a.longitude == null) return 1;
              if (b.latitude == null || b.longitude == null) return -1;
              const distA =
                Math.pow(a.latitude - currentCoords.latitude, 2) +
                Math.pow(a.longitude - currentCoords.longitude, 2);
              const distB =
                Math.pow(b.latitude - currentCoords.latitude, 2) +
                Math.pow(b.longitude - currentCoords.longitude, 2);
              return distA - distB;
            });
            setTouristPlaces(sortedByDistance.slice(0, 5));
          } catch (err) {
            console.error('[HomeScreen] Error fetching tourist places:', err);
          }
        } else {
          setTouristPlaces([]);
        }

        // Evaluate location state and interest configuration
        if (currentPermStatus === 'granted' && currentCoords) {
          if (interests.length > 0) {
            // Case 1: Permission GRANTED + Interests Configured
            try {
              fetchedPlans = await fetchFilteredPlans({
                lat: currentCoords.latitude,
                lng: currentCoords.longitude,
                radius: 50,
                interests: interests,
              });
              activeCase = 'CASE_1';
              labelKey = 'recommended_near_you';
            } catch (err) {
              console.error('[HomeScreen] Case 1 fetch error:', err);
            }
          }

          // Fallback to Case 2 if Case 1 has no results, or if user has no interests configured
          if (fetchedPlans.length === 0) {
            // Case 2: Permission GRANTED + NO Interests
            try {
              fetchedPlans = await fetchFilteredPlans({
                lat: currentCoords.latitude,
                lng: currentCoords.longitude,
                radius: 50,
              });
              activeCase = 'CASE_2';
              labelKey = 'popular_near_you';
            } catch (err) {
              console.error('[HomeScreen] Case 2 fetch error:', err);
            }
          }
        } else {
          // Permission DENIED (or unavailable)
          if (interests.length > 0) {
            // Case 3: Permission DENIED + Interests Configured
            // Fetch plans matching interests, using default fallback coordinates (FIUBA/BA Center)
            try {
              fetchedPlans = await fetchFilteredPlans({
                lat: DEFAULT_COORDS.latitude,
                lng: DEFAULT_COORDS.longitude,
                radius: 50,
                interests: interests,
              });

              // Local fallback inside Case 3 if API returns empty
              if (fetchedPlans.length === 0) {
                fetchedPlans = allPublicList.filter((p) =>
                  p.interests?.some((i) => interests.includes(i))
                );
              }
              activeCase = 'CASE_3';
              labelKey = 'matching_your_interests';
            } catch (err) {
              console.error('[HomeScreen] Case 3 fetch error:', err);
            }
          }

          // Fallback to Case 4 if Case 3 has no results, or if user has no interests configured
          if (fetchedPlans.length === 0) {
            // Case 4: Permission DENIED + NO Interests (Critical Case)
            // Shuffle public list and select featured plans
            fetchedPlans = [...allPublicList].sort(() => 0.5 - Math.random()).slice(0, 6);
            activeCase = 'CASE_4';
            labelKey = 'trending_plans';
          }
        }

        // Setup FOMO plans (Happening in the future, sorted by date ascending)
        let fomoList: PlanSummary[] = [];
        if (currentPermStatus === 'granted' && currentCoords) {
          const now = new Date();
          fomoList = allPublicList
            .filter((p) => {
              if (!p.startDateTime) return false;
              const startDate = new Date(p.startDateTime);
              if (startDate <= now) return false; // Must be in the future
              if (joinedSet.has(p.id)) return false; // Not already joined
              if (currentUserId !== null && p.creatorId === currentUserId) return false; // Not created by me

              // Proximity check
              if (p.latitude != null && p.longitude != null) {
                const distanceSq =
                  Math.pow(p.latitude - currentCoords.latitude, 2) +
                  Math.pow(p.longitude - currentCoords.longitude, 2);
                return distanceSq < 0.25; // within ~50km
              }
              return false;
            })
            .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime())
            .slice(0, 6);
        }

        // Setup secondary lists (Grid)
        fetchedSecondary = allPublicList.filter(
          (p) => !fetchedPlans.some((f) => f.id === p.id)
        );

        // Filter out plans where the user is creator or already subscribed
        const filterPlans = (list: PlanSummary[]) =>
          list.filter((p) => {
            if (joinedSet.has(p.id)) return false;
            if (currentUserId !== null && p.creatorId === currentUserId) return false;
            return true;
          });

        setPlans(filterPlans(fetchedPlans));
        setFomoPlans(fomoList);
        setSecondaryPlans(filterPlans(fetchedSecondary).slice(0, 8));
        setListLabelKey(labelKey);
        setBusinessCase(activeCase);
      } catch (err) {
        console.error('[HomeScreen] General load error:', err);
      } finally {
        setLoading(false);
      }
    },
    [
      tokenData.state,
      fetchProfile,
      fetchMyJoinedPlans,
      fetchFilteredPlans,
      fetchPublicPlans,
      fetchAllTouristPlaces,
      getAccessToken,
      myUserId,
    ]
  );

  // Initialize and check permissions
  const checkLocationPermissionAndLoad = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setLocationPermission(status);

      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        const currentCoords = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
        setCoords(currentCoords);

        // Reverse geocode to find user country name and code
        try {
          const geocodes = await Location.reverseGeocodeAsync(currentCoords);
          if (geocodes && geocodes.length > 0) {
            setUserCountry(geocodes[0].country?.toUpperCase() || null);
            setUserCountryCode(geocodes[0].isoCountryCode || null);
          }
        } catch (e) {
          console.error('[HomeScreen] Error reverse geocoding:', e);
        }

        await loadData(status, currentCoords);
      } else {
        await loadData(status, null);
      }
    } catch (err) {
      console.error('[HomeScreen] Error checking location permission:', err);
      await loadData(null, null);
    }
  };

  useEffect(() => {
    if (tokenData.state === 'LOGGED_IN') {
      checkLocationPermissionAndLoad();
    } else {
      setLoading(false);
    }
  }, [tokenData.state]);

  const requestLocationPermission = async () => {
    try {
      const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status);
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        const currentCoords = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
        setCoords(currentCoords);

        // Fetch user country
        try {
          const geocodes = await Location.reverseGeocodeAsync(currentCoords);
          if (geocodes && geocodes.length > 0) {
            setUserCountry(geocodes[0].country?.toUpperCase() || null);
            setUserCountryCode(geocodes[0].isoCountryCode || null);
          }
        } catch (e) {
          console.error('[HomeScreen] Error reverse geocoding:', e);
        }

        setLoading(true);
        await loadData(status, currentCoords);
      } else {
        if (!canAskAgain) {
          Alert.alert(
            'Location Disabled',
            'You have permanently denied location access. Please enable it in your device settings to find plans near you.'
          );
        } else {
          Alert.alert('Permission Denied', "We couldn't access your location, showing general fallback recommendations.");
        }
      }
    } catch (err) {
      console.error('[HomeScreen] Error requesting location permission:', err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setLocationPermission(status);
      let currentCoords = null;
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        currentCoords = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
        setCoords(currentCoords);

        // Fetch user country
        try {
          const geocodes = await Location.reverseGeocodeAsync(currentCoords);
          if (geocodes && geocodes.length > 0) {
            setUserCountry(geocodes[0].country?.toUpperCase() || null);
            setUserCountryCode(geocodes[0].isoCountryCode || null);
          }
        } catch (e) {
          console.error('[HomeScreen] Error reverse geocoding:', e);
        }
      } else {
        setUserCountry(null);
        setUserCountryCode(null);
      }
      await loadData(status, currentCoords);
    } catch (e) {
      console.error('[HomeScreen] Error during refresh:', e);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <AppScreen centered>
        <ActivityIndicator size="large" color={tint} />
        <ThemedText type="body" style={{ color: mutedText, marginTop: 12 }}>
          {t('loading_recommendations')}
        </ThemedText>
      </AppScreen>
    );
  }

  // Not logged in fallback screen
  if (tokenData.state !== 'LOGGED_IN') {
    return (
      <AppScreen centered>
        <Ionicons name="compass-outline" size={64} color={tint} />
        <ThemedText type="heading" style={{ marginTop: 16, textAlign: 'center' }}>
          {t('welcome_title')}
        </ThemedText>
        <ThemedText type="body" style={{ color: mutedText, textAlign: 'center', marginHorizontal: 32, marginTop: 8 }}>
          {t('welcome_desc')}
        </ThemedText>
        <Pressable
          onPress={() => router.replace('/')}
          style={[styles.primaryButton, { backgroundColor: tint, marginTop: 24 }]}
        >
          <ThemedText type="body" style={{ color: tintText, fontWeight: '600' }}>
            {t('sign_in')}
          </ThemedText>
        </Pressable>
      </AppScreen>
    );
  }

  const userInterests = profile.interests || [];

  return (
    <AppScreen
      scrollable
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={tint} />
      }
      contentStyle={{ paddingHorizontal: 0 }}
    >
      {/* Standard Screen Header */}
      <View style={[styles.header, { marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
        <ThemedText type="heading" style={[styles.welcomeText, { flex: 1, marginRight: 16 }]} numberOfLines={1}>
          {t('hello_user', { name: profile.name || t('traveler') })}
        </ThemedText>
        <Image 
          source={require('../../../assets/images/icon.png')} 
          style={{ width: 48, height: 48, borderRadius: 12, borderWidth: 1, borderColor: border }} 
          resizeMode="cover"
        />
      </View>

      {/* Introductory Welcome (Location) */}
      <View style={[styles.header, { paddingTop: 0, marginTop: 0 }]}>
        <View style={styles.headerLeft}>
          <ThemedText
            type="label"
            style={{ color: tint, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}
          >
            {userCountry
              ? t('welcome_country', { country: userCountry, flag: userCountryCode ? getFlagEmoji(userCountryCode) : '📍' })
              : t('welcome_world')}
          </ThemedText>
        </View>
      </View>

      {/* Selected Interest Category Pills */}
      {userInterests.length > 0 && (
        <View style={styles.interestsSection}>
          <ThemedText type="label" style={[styles.sectionLabel, { color: mutedText }]}>
            {t('your_chosen_interests')}
          </ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContainer}>
            {userInterests.map((interest) => (
              <View key={interest} style={[styles.chip, { backgroundColor: surface, borderColor: border }]}>
                <ThemedText type="label" style={[styles.chipText, { color: textColor }]}>
                  {formatInterest(interest)}
                </ThemedText>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Subtle Location Permission Fallback Banner */}
      {(businessCase === 'CASE_3' || businessCase === 'CASE_4') && (
        <View style={[styles.locationBanner, { backgroundColor: surface, borderColor: '#FF9500' }]}>
          <View style={styles.bannerIconContainer}>
            <Ionicons name="location-outline" size={22} color="#FF9500" />
          </View>
          <View style={styles.bannerTextContainer}>
            <ThemedText type="defaultSemiBold" style={{ fontSize: 14 }}>
              {t('enable_location_proximity')}
            </ThemedText>
            <ThemedText type="body" style={{ color: mutedText, fontSize: 12, marginTop: 2 }}>
              {t('enable_location_desc')}
            </ThemedText>
            <Pressable
              onPress={requestLocationPermission}
              style={({ pressed }) => [
                styles.activateButton,
                { backgroundColor: tint },
                pressed && styles.pressed,
              ]}
            >
              <ThemedText type="label" style={{ color: tintText, fontWeight: '700', fontSize: 11 }}>
                {t('enable_proximity')}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      )}

      {/* Case 1 or 2 location active indicator (Non-blocking pill header) */}

      {/* Horizontal Airbnb Slider for Featured Plans */}
      <View style={styles.sectionHeader}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          {t(listLabelKey)}
        </ThemedText>
      </View>

      {plans.length > 0 ? (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={plans}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.carouselContainer}
          snapToInterval={CARD_WIDTH + 16}
          decelerationRate="fast"
          renderItem={({ item }) => (
            <View style={{ width: CARD_WIDTH, marginRight: 16 }}>
              <PlanCard
                plan={item}
                onPress={(id) => router.push(`/plan/${id}` as any)}
              />
            </View>
          )}
        />
      ) : (
        <View style={[styles.emptyContainer, { backgroundColor: surface, borderColor: border, marginBottom: 24 }]}>
          <Ionicons name="calendar-outline" size={40} color={mutedText} />
          <ThemedText type="defaultSemiBold">{t('no_plans_found')}</ThemedText>
          <ThemedText type="body" style={{ color: mutedText, textAlign: 'center', fontSize: 13 }}>
            {t('first_to_create')}
          </ThemedText>
          <Pressable
            onPress={() => router.push('/create-plan' as any)}
            style={[styles.createPlanButton, { borderColor: tint, marginTop: 8 }]}
          >
            <ThemedText type="label" style={{ color: tint, fontWeight: '600' }}>
              {t('create_a_plan')}
            </ThemedText>
          </Pressable>
        </View>
      )}

      {/* FOMO Section - Plans starting soon */}
      {fomoPlans.length > 0 && (
        <View style={{ marginBottom: 24 }}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="flash" size={18} color="#FF3B30" />
              <ThemedText type="subtitle" style={[styles.sectionTitle, { color: textColor }]}>
                {t('starting_soon')}
              </ThemedText>
            </View>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={fomoPlans}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.carouselContainer}
            snapToInterval={CARD_WIDTH + 16}
            decelerationRate="fast"
            renderItem={({ item }) => (
              <View style={{ width: CARD_WIDTH, marginRight: 16 }}>
                <PlanCard
                  plan={item}
                  onPress={(id) => router.push(`/plan/${id}` as any)}
                />
              </View>
            )}
          />
        </View>
      )}

      {/* Famous Tourist Places Horizontal Slider */}
      {touristPlaces.length > 0 && (
        <View style={{ marginBottom: 24 }}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {t('famous_places_nearby')}
            </ThemedText>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={touristPlaces}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.carouselContainer}
            snapToInterval={CARD_WIDTH + 16}
            decelerationRate="fast"
            renderItem={({ item }) => (
              <View style={{ width: CARD_WIDTH, marginRight: 16 }}>
                <TouristPlaceCard 
                  place={item} 
                  onPress={(id) => router.push(`/tourist-place/${id}` as any)} 
                />
              </View>
            )}
          />
        </View>
      )}

      {/* Secondary list of plans */}
      {secondaryPlans.length > 0 && (
        <View style={{ marginBottom: 24 }}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {t('discover_more_adventures')}
            </ThemedText>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={secondaryPlans}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.carouselContainer}
            snapToInterval={CARD_WIDTH + 16}
            decelerationRate="fast"
            renderItem={({ item }) => (
              <View style={{ width: CARD_WIDTH, marginRight: 16 }}>
                <PlanCard
                  plan={item}
                  onPress={(id) => router.push(`/plan/${id}` as any)}
                />
              </View>
            )}
          />
        </View>
      )}

    </AppScreen>
  );
}
