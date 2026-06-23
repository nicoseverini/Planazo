import { TuristicPlaceSummary } from '@/services/turistic-place';
import { matchesCategories } from './category-filter';
import { haversineKm } from './distance';
import { normalizeSearch } from './search';
import { LatLng } from './plan-filters';

export type PlaceClientFilters = {
    /** Selected category values. Empty array means "Any". */
    categories: string[];
    location: string;
    radius: number | null;
};

export const EMPTY_PLACE_FILTERS: PlaceClientFilters = {
    categories: [],
    location: '',
    radius: null,
};

export function hasActivePlaceFilters(f: PlaceClientFilters): boolean {
    return f.categories.length > 0 || !!f.location.trim() || f.radius !== null;
}

/** Shared client-side tourist-place filtering. Single source of truth for the feed and the My Places tab. */
export function filterPlaces(
    places: TuristicPlaceSummary[],
    f: PlaceClientFilters,
    userLocation: LatLng | null,
): TuristicPlaceSummary[] {
    return places.filter((place) => {
        if (!matchesCategories(place.interests ?? [], f.categories)) return false;

        if (f.location.trim()) {
            const q = normalizeSearch(f.location);
            const loc = [place.address, place.city, place.country, place.location].filter(Boolean).join(' ');
            if (!normalizeSearch(loc).includes(q)) return false;
        }

        if (f.radius !== null && userLocation) {
            if (!place.latitude || !place.longitude) return false;
            if (haversineKm(userLocation.lat, userLocation.lng, place.latitude, place.longitude) > f.radius) return false;
        }

        return true;
    });
}
