import { getBackendUrl } from './auth';
import { useToken } from '@/context/token-context';
import { apiFetch } from '@/utils/api';
import { useCallback, useState } from 'react';

export type PlanVisibility = 'PUBLIC' | 'PRIVATE';

export type PlanSummary = {
    id: number;
    title: string;
    startDateTime: string;
    location: string;
    country?: string;
    city?: string;
    address?: string;
    latitude: number;
    longitude: number;
    interests: string[];
    visibility: PlanVisibility;
    subscriberCount: number;
    maxSubscribers: number;
    minAge: number | null;
    creatorName: string;
    creatorId: number;
    images: string[];
    accepted: null | boolean;
    budget: number;
    timezone: string;
};

export type PlanDetail = {
    id: number;
    title: string;
    description: string;
    startDateTime: string;
    endDateTime: string;
    durationMinutes: number;
    visibility: PlanVisibility;
    maxSubscribers: number;
    minAge: number | null;
    maxAge: number | null;
    interests: string[];
    location: string;
    country?: string;
    city?: string;
    address?: string;
    latitude: number;
    longitude: number;
    images: string[];
    creatorId: number;
    creatorName: string;
    subscriberCount: number;
    isFull: boolean;
    budget: number;
    timezone: string;
};

export type PendingSubscriber = {
    id: number;
    name: string;
    lastname: string;
};

export type PlanCreateRequest = {
    title: string;
    description: string;
    startDateTime: string;
    endDateTime: string;
    visibility: PlanVisibility;
    maxSubscribers: number;
    minAge?: number;
    maxAge?: number;
    interests: string[];
    country: string;
    city: string;
    address: string;
    latitude: number;
    longitude: number;
    images?: string[];
    budget?: number;
    timezone: string;
};

export type PlanUpdateRequest = Partial<PlanCreateRequest>;

// ============================================
// API Functions
// ============================================

const JSON_HEADERS = { Accept: 'application/json', 'Content-Type': 'application/json' };
const authHeaders = (token: string) => ({ ...JSON_HEADERS, Authorization: `Bearer ${token}` });

// Get all public plans
export async function getPublicPlans(): Promise<PlanSummary[]> {
    const url = `${getBackendUrl()}/api/v1/plans`;
    return apiFetch<PlanSummary[]>(url, { headers: JSON_HEADERS });
}

// Get plan by ID
export async function getPlanById(id: number, accessToken: string): Promise<PlanDetail> {
    const url = `${getBackendUrl()}/api/v1/plans/${id}`;
    return apiFetch<PlanDetail>(url, { headers: authHeaders(accessToken) });
}

// Get my created plans
export async function getMyCreatedPlans(accessToken: string): Promise<PlanSummary[]> {
    const url = `${getBackendUrl()}/api/v1/plans/me/created`;
    return apiFetch<PlanSummary[]>(url, { headers: authHeaders(accessToken) });
}

// Get plans I joined (subscribed)
export async function getMyJoinedPlans(accessToken: string): Promise<PlanSummary[]> {
    const url = `${getBackendUrl()}/api/v1/plans/me/joined-all`;
    return apiFetch<PlanSummary[]>(url, { headers: authHeaders(accessToken) });
}

export async function getMyJoinedPlansButNotMine(accessToken: string): Promise<PlanSummary[]> {
    const url = `${getBackendUrl()}/api/v1/plans/me/joined-not-mine`;
    return apiFetch<PlanSummary[]>(url, { headers: authHeaders(accessToken) });
}

export async function getPendingSubscribers(planId: number, accessToken: string): Promise<PendingSubscriber[]> {
    const url = `${getBackendUrl()}/api/v1/plans/${planId}/pending-subscribers`;
    return apiFetch<PendingSubscriber[]>(url, { headers: authHeaders(accessToken) });
}

// Create a new plan
export async function createPlan(data: PlanCreateRequest, accessToken: string): Promise<PlanDetail> {
    const url = `${getBackendUrl()}/api/v1/plans`;
    console.log('[PlanService] Creating plan:', url);

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Could not create the plan. Please try again.');
    }

    return response.json();
}

// Update a plan
export async function updatePlan(
    id: number,
    data: PlanUpdateRequest,
    accessToken: string
): Promise<PlanDetail> {
    const url = `${getBackendUrl()}/api/v1/plans/${id}`;
    console.log('[PlanService] Updating plan:', url);

    const response = await fetch(url, {
        method: 'PATCH',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Could not update the plan. Please try again.');
    }

    return response.json();
}

// Delete a plan (soft delete)
export async function deletePlan(id: number, accessToken: string): Promise<void> {
    const url = `${getBackendUrl()}/api/v1/plans/${id}`;
    console.log('[PlanService] Deleting plan:', url);

    const response = await fetch(url, {
        method: 'DELETE',
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete plan: ${errorText}`);
    }
}

export async function acceptSubscriber(planId: number, userId: number, accessToken: string): Promise<void> {
    const url = `${getBackendUrl()}/api/v1/plans/${planId}/accept/${userId}`;
    console.log('[PlanService] Accepting subscriber:', url);

    const response = await fetch(url, {
        method: 'PATCH',
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        if (response.status === 403) throw new Error('You are not allowed to manage this request.');
        if (response.status === 404) throw new Error('This subscription request no longer exists.');
        if (response.status === 409) throw new Error('This plan has already reached its participant limit.');
        if (response.status === 410) {
            const errorText = await response.text();
            throw new Error(errorText || 'This plan has already ended.');
        }
        throw new Error('Something went wrong. Please try again.');
    }
}

export async function rejectSubscriber(planId: number, userId: number, accessToken: string): Promise<void> {
    const url = `${getBackendUrl()}/api/v1/plans/${planId}/reject/${userId}`;
    console.log('[PlanService] Rejecting subscriber:', url);

    const response = await fetch(url, {
        method: 'PATCH',
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        if (response.status === 403) throw new Error('You are not allowed to manage this request.');
        if (response.status === 404) throw new Error('This subscription request no longer exists.');
        if (response.status === 410) {
            const errorText = await response.text();
            throw new Error(errorText || 'This plan has already ended.');
        }
        throw new Error('Something went wrong. Please try again.');
    }
}
// Subscribe to a plan
export async function subscribeToPlan(planId: number, accessToken: string): Promise<void> {
    const url = `${getBackendUrl()}/api/v1/plans/${planId}/subscribe`;
    console.log('[PlanService] Subscribing to plan:', url);

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        if (response.status === 410) {
            const errorText = await response.text();
            throw new Error(errorText || 'This plan has already ended.');
        }
        if (response.status === 422) {
            const errorText = await response.text();
            throw new Error(errorText || "You don't meet this plan's age requirements.");
        }
        if (response.status === 409) {
            const errorText = await response.text();
            throw new Error(errorText || 'Already subscribed or plan is full.');
        }
        if (response.status === 404) {
            const errorText = await response.text();
            throw new Error(errorText || 'Plan not found.');
        }
        if (response.status === 403) {
            throw new Error('You are not allowed to join this plan.');
        }
        const errorText = await response.text();
        throw new Error(errorText || 'Something went wrong. Please try again.');
    }
}

// Unsubscribe from a plan
export async function unsubscribeFromPlan(planId: number, accessToken: string): Promise<void> {
    const url = `${getBackendUrl()}/api/v1/plans/${planId}/unsubscribe`;
    console.log('[PlanService] Unsubscribing from plan:', url);

    const response = await fetch(url, {
        method: 'DELETE',
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        if (response.status === 410) {
            const errorText = await response.text();
            throw new Error(errorText || 'This plan has already ended.');
        }
        if (response.status === 409) {
            throw new Error('Not subscribed to this plan');
        }
        const errorText = await response.text();
        throw new Error(`Failed to unsubscribe: ${errorText}`);
    }
}

// Get nearby public plans
export async function getNearbyPlans(lat: number, lng: number, radius: number = 50): Promise<PlanSummary[]> {
    const url = `${getBackendUrl()}/api/v1/plans/nearby?lat=${lat}&lng=${lng}&radius=${radius}`;
    return apiFetch<PlanSummary[]>(url, { headers: JSON_HEADERS });
}

export type PlanFilters = {
    interests?: string[];
    dateFrom?: string;   // ISO string
    dateTo?: string;
    location?: string;
    lat?: number;
    lng?: number;
    radius?: number;
};

export async function getFilteredPlans(filters: PlanFilters): Promise<PlanSummary[]> {
    const params = new URLSearchParams();
    if (filters.interests && filters.interests.length > 0) {
        filters.interests.forEach((i) => params.append('interests', i));
    }
    if (filters.dateFrom)  params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo)    params.append('dateTo', filters.dateTo);
    if (filters.location)  params.append('location', filters.location);
    if (filters.lat !== undefined) params.append('lat', filters.lat.toString());
    if (filters.lng !== undefined) params.append('lng', filters.lng.toString());
    if (filters.radius !== undefined) params.append('radius', filters.radius.toString());

    const url = `${getBackendUrl()}/api/v1/plans/filter?${params.toString()}`;
    return apiFetch<PlanSummary[]>(url, { headers: { Accept: 'application/json' } });
}

// ============================================
// Hooks (using TokenContext)
// ============================================


export function usePlans() {
    const { getAccessToken } = useToken();
    const [loadingCount, setLoadingCount] = useState(0);
    const loading = loadingCount > 0;
    const [error, setError] = useState<string | null>(null);

    const fetchPublicPlans = useCallback(async () => {
        setLoadingCount(c => c + 1);
        setError(null);
        try {
            return await getPublicPlans();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        } finally {
            setLoadingCount(c => c - 1);
        }
    }, []);
    const fetchMyCreatedPlans = useCallback(async () => {
        const token = getAccessToken();
        if (!token) throw new Error('No access token');
        setLoadingCount(c => c + 1);
        setError(null);
        try {
            return await getMyCreatedPlans(token);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        } finally {
            setLoadingCount(c => c - 1);
        }
    }, [getAccessToken]);

    const fetchMyJoinedPlansButNotMine = useCallback(async () => {
        const token = getAccessToken();
        if (!token) throw new Error('No access token');
        setLoadingCount(c => c + 1);
        setError(null);
        try {
            return await getMyJoinedPlansButNotMine(token);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        } finally {
            setLoadingCount(c => c - 1);
        }
    }, [getAccessToken]);

        const fetchMyJoinedPlans = useCallback(async () => {
        const token = getAccessToken();
        if (!token) throw new Error('No access token');
        setLoadingCount(c => c + 1);
        setError(null);
        try {
            return await getMyJoinedPlans(token);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        } finally {
            setLoadingCount(c => c - 1);
        }
    }, [getAccessToken]);

    const fetchPlanDetail = useCallback(async (id: number) => {
        const token = getAccessToken();
        if (!token) throw new Error('No access token');
        setLoadingCount(c => c + 1);
        setError(null);
        try {
            return await getPlanById(id, token);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        } finally {
            setLoadingCount(c => c - 1);
        }
    }, [getAccessToken]);

    const fetchPendingSubscribers = useCallback(async (planId: number) => {
        const token = getAccessToken();
        if (!token) throw new Error('No access token');
        setLoadingCount(c => c + 1);
        setError(null);
        try {
            return await getPendingSubscribers(planId, token);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        } finally {
            setLoadingCount(c => c - 1);
        }
    }, [getAccessToken]);

    const fetchNearbyPlans = useCallback(async (lat: number, lng: number, radius?: number) => {
        const token = getAccessToken();
        if (!token) throw new Error('No access token');
        setLoadingCount(c => c + 1);
        setError(null);
        try {
            return await getNearbyPlans(lat, lng, radius);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'failed to fetch nearby plans');
            throw err;
        } finally {
            setLoadingCount(c => c - 1);
        }
    }, [getAccessToken]);

    const fetchFilteredPlans = useCallback(async (filters: PlanFilters) => {
        setLoadingCount(c => c + 1);
        setError(null);
        try {
            return await getFilteredPlans(filters);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        } finally {
            setLoadingCount(c => c - 1);
        }
    }, []);

    const subscribe = useCallback(async (planId: number) => {
        const token = getAccessToken();
        if (!token) throw new Error('No access token');
        setLoadingCount(c => c + 1);
        setError(null);
        try {
            await subscribeToPlan(planId, token);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        } finally {
            setLoadingCount(c => c - 1);
        }
    }, [getAccessToken]);

    const unsubscribe = useCallback(async (planId: number) => {
        const token = getAccessToken();
        if (!token) throw new Error('No access token');
        setLoadingCount(c => c + 1);
        setError(null);
        try {
            await unsubscribeFromPlan(planId, token);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        } finally {
            setLoadingCount(c => c - 1);
        }
    }, [getAccessToken]);

    const create = useCallback(async (data: PlanCreateRequest) => {
        const token = getAccessToken();
        if (!token) throw new Error('No access token');
        setLoadingCount(c => c + 1);
        setError(null);
        try {
            return await createPlan(data, token);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        } finally {
            setLoadingCount(c => c - 1);
        }
    }, [getAccessToken]);

    const update = useCallback(async (id: number, data: PlanUpdateRequest) => {
        const token = getAccessToken();
        if (!token) throw new Error('No access token');
        setLoadingCount(c => c + 1);
        setError(null);
        try {            return await updatePlan(id, data, token);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        } finally {
            setLoadingCount(c => c - 1);
        }
    }, [getAccessToken]);

    const remove = useCallback(async (id: number) => {
        const token = getAccessToken();
        if (!token) throw new Error('No access token');
        setLoadingCount(c => c + 1);
        setError(null);
        try {
            await deletePlan(id, token);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        } finally {
            setLoadingCount(c => c - 1);
        }
    }, [getAccessToken]);

    const accept = useCallback(async (planId: number, userId: number) => {
        const token = getAccessToken();
        if (!token) throw new Error('No access token');
        setLoadingCount(c => c + 1);
        setError(null);
        try {
            await acceptSubscriber(planId, userId, token);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        } finally {
            setLoadingCount(c => c - 1);
        }
    }, [getAccessToken]);

    const reject = useCallback(async (planId: number, userId: number) => {
        const token = getAccessToken();
        if (!token) throw new Error('No access token');
        setLoadingCount(c => c + 1);
        setError(null);
        try {
            await rejectSubscriber(planId, userId, token);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        } finally {
            setLoadingCount(c => c - 1);
        }
    }, [getAccessToken]);

    return {
        loading,
        error,
        fetchPublicPlans,
        fetchMyCreatedPlans,
        fetchMyJoinedPlans,
        fetchMyJoinedPlansButNotMine,
        fetchPlanDetail,
        fetchPendingSubscribers,
        fetchNearbyPlans,
        fetchFilteredPlans,
        subscribe,
        unsubscribe,
        create,
        update,
        remove,
        accept,
        reject,
    };
}
