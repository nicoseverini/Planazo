import { PlanSummary, PlanVisibility } from '@/services/plan';
import { matchesCategories } from './category-filter';
import { haversineKm } from './distance';
import { normalizeSearch } from './search';

export type ParticipationStatus = 'PENDING' | 'ACCEPTED';

export type LatLng = { lat: number; lng: number };

export type PlanClientFilters = {
    /** Selected category values. Empty array means "Any". */
    categories: string[];
    location: string;
    dateFrom: Date | null;
    dateTo: Date | null;
    radius: number | null;
    visibility: PlanVisibility | null;
    status: ParticipationStatus | null;
};

export const EMPTY_PLAN_FILTERS: PlanClientFilters = {
    categories: [],
    location: '',
    dateFrom: null,
    dateTo: null,
    radius: null,
    visibility: null,
    status: null,
};

export function hasActivePlanFilters(f: PlanClientFilters): boolean {
    return (
        f.categories.length > 0 ||
        !!f.location.trim() ||
        f.dateFrom !== null ||
        f.dateTo !== null ||
        f.radius !== null ||
        f.visibility !== null ||
        f.status !== null
    );
}

/**
 * Derives the participation status of a joined plan from its `accepted` flag.
 * Public plans are joined without approval (`accepted === null`), so they have
 * no pending/accepted status of their own.
 */
export function planParticipationStatus(plan: PlanSummary): ParticipationStatus | null {
    if (plan.accepted === true) return 'ACCEPTED';
    if (plan.accepted === false) return 'PENDING';
    return null;
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

/** Shared client-side plan filtering. Single source of truth for the My Activities tabs. */
export function filterPlans(
    plans: PlanSummary[],
    f: PlanClientFilters,
    userLocation: LatLng | null,
): PlanSummary[] {
    return plans.filter((plan) => {
        if (!matchesCategories(plan.interests ?? [], f.categories)) return false;

        if (f.visibility && plan.visibility !== f.visibility) return false;

        if (f.status) {
            // Public joins (null) carry no approval flow, so treat them as accepted.
            const status = planParticipationStatus(plan) ?? 'ACCEPTED';
            if (status !== f.status) return false;
        }

        if (f.location.trim()) {
            const q = normalizeSearch(f.location);
            const loc = [plan.address, plan.city, plan.country, plan.location].filter(Boolean).join(' ');
            if (!normalizeSearch(loc).includes(q)) return false;
        }

        const start = new Date(plan.startDateTime);
        if (f.dateFrom && start < startOfDay(f.dateFrom)) return false;
        if (f.dateTo && start > endOfDay(f.dateTo)) return false;

        if (f.radius !== null && userLocation) {
            if (!plan.latitude || !plan.longitude) return false;
            if (haversineKm(userLocation.lat, userLocation.lng, plan.latitude, plan.longitude) > f.radius) return false;
        }

        return true;
    });
}
