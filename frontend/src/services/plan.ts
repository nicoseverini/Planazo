import { getBackendUrl } from './auth';
import { useToken } from '@/context/token-context';
import { useCallback, useState } from 'react';

export type PlanVisibility = 'PUBLIC' | 'PRIVATE';

export type PlanSummary = {
    id: number;
    title: string;
    dateTime: string;
    location: string;
    latitude: number;
    longitude: number;
    interest: string;
    travelType: string;
    visibility: PlanVisibility;
    subscribersCount: number;
    maxSubscribers: number;
    minAge: number | null;
    creatorName: string;
    creatorId: number;
    images: string[];
};

export type PlanDetail = {
    id: number;
    title: string;
    description: string;
    dateTime: string;
    durationMinutes: number;
    visibility: PlanVisibility;
    maxSubscribers: number;
    minAge: number | null;
    maxAge: number | null;
    interest: string;
    travelType: string;
    location: string;
    latitude: number;
    longitude: number;
    images: string[];
    creatorId: number;
    creatorName: string;
    subscribersCount: number;
    isFull: boolean;
};

export type PlanCreateRequest = {
    title: string;
    description: string;
    dateTime: string;
    durationMinutes: number;
    visibility: PlanVisibility;
    maxSubscribers: number;
    minAge?: number;
    maxAge?: number;
    interest: string;
    travelType: string;
    location: string;
    latitude: number;
    longitude: number;
    images?: string[];
};

export type PlanUpdateRequest = Partial<PlanCreateRequest>;

// ============================================
// API Functions
// ============================================

// Get all public plans
export async function getPublicPlans(): Promise<PlanSummary[]> {
    const url = `${getBackendUrl()}/api/v1/plans`;
    console.log('[PlanService] Fetching public plans:', url);

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch public plans: ${errorText}`);
    }

    return response.json();
}
// Get plan by ID
export async function getPlanById(id: number, accessToken: string): Promise<PlanDetail> {
    const url = `${getBackendUrl()}/api/v1/plans/${id}`;
    console.log('[PlanService] Fetching plan:', url);

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch plan: ${errorText}`);
    }

    return response.json();
}

// Get my created plans
export async function getMyCreatedPlans(accessToken: string): Promise<PlanSummary[]> {
    const url = `${getBackendUrl()}/api/v1/plans/me/created`;
    console.log('[PlanService] Fetching my created plans:', url);

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch created plans: ${errorText}`);
    }

    return response.json();
}

// Get plans I joined (subscribed)
export async function getMyJoinedPlans(accessToken: string): Promise<PlanSummary[]> {
    const url = `${getBackendUrl()}/api/v1/plans/me/joined`;
    console.log('[PlanService] Fetching joined plans:', url);

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch joined plans: ${errorText}`);
    }

    return response.json();
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
        throw new Error(`Failed to create plan: ${errorText}`);
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
        throw new Error(`Failed to update plan: ${errorText}`);
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
        if (response.status === 409) {
            throw new Error('Already subscribed or plan is full');
        }
        if (response.status === 403) {
            throw new Error('Plan is not public');
        }
        const errorText = await response.text();
        throw new Error(`Failed to subscribe: ${errorText}`);
    }
}

// Unsubscribe from a plan
export async function unsubscribeFromPlan(planId: number, accessToken: string): Promise<void> {
    const url = `${getBackendUrl()}/api/v1/plans/${planId}/subscribe`;
    console.log('[PlanService] Unsubscribing from plan:', url);

    const response = await fetch(url, {
        method: 'DELETE',
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
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
    console.log('[PlanService] Fetching nearby plans:', url);

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch nearby plans: ${errorText}`);
    }

    return response.json();
}

export type PlanFilters = {
    interest?: string;
    dateFrom?: string;   // ISO string
    dateTo?: string;
    location?: string;
};

export async function getFilteredPlans(filters: PlanFilters): Promise<PlanSummary[]> {
    const params = new URLSearchParams();
    if (filters.interest)  params.append('interest', filters.interest);
    if (filters.dateFrom)  params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo)    params.append('dateTo', filters.dateTo);
    if (filters.location)  params.append('location', filters.location);

    const url = `${getBackendUrl()}/api/v1/plans/filter?${params.toString()}`;
    const response = await fetch(url, {
        headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
}

// ============================================
// Hooks (using TokenContext)
// ============================================


export function usePlans() {
    const { getAccessToken } = useToken();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPublicPlans = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            return await getPublicPlans();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);
    const fetchMyCreatedPlans = useCallback(async () => {
        const token = getAccessToken();
        if (!token) throw new Error('No access token');
        setLoading(true);
        setError(null);
        try {
            return await getMyCreatedPlans(token);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [getAccessToken]);

    const fetchMyJoinedPlans = useCallback(async () => {
        const token = getAccessToken();
        if (!token) throw new Error('No access token');
        setLoading(true);
        setError(null);
        try {
            return await getMyJoinedPlans(token);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [getAccessToken]);

    const fetchPlanDetail = useCallback(async (id: number) => {
        const token = getAccessToken();
        if (!token) throw new Error('No access token');
        setLoading(true);
        setError(null);
        try {
            return await getPlanById(id, token);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [getAccessToken]);

    const fetchNearbyPlans = useCallback(async (lat: number, lng: number, radius?: number) => {
        const token = getAccessToken();
        if (!token) throw new Error('No access token');
        setLoading(true);
        setError(null);
        try {
            return await getNearbyPlans(lat, lng, radius);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'failed to fetch nearby plans');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [getAccessToken]);

    const fetchFilteredPlans = useCallback(async (filters: PlanFilters) => {
        setLoading(true);
        setError(null);
        try {
            return await getFilteredPlans(filters);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const subscribe = useCallback(async (planId: number) => {
        const token = getAccessToken();
        if (!token) throw new Error('No access token');
        setLoading(true);
        setError(null);
        try {
            await subscribeToPlan(planId, token);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [getAccessToken]);

    const unsubscribe = useCallback(async (planId: number) => {
        const token = getAccessToken();
        if (!token) throw new Error('No access token');
        setLoading(true);
        setError(null);
        try {
            await unsubscribeFromPlan(planId, token);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [getAccessToken]);

    const create = useCallback(async (data: PlanCreateRequest) => {
        const token = getAccessToken();
        if (!token) throw new Error('No access token');
        setLoading(true);
        setError(null);
        try {
            return await createPlan(data, token);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [getAccessToken]);

    const update = useCallback(async (id: number, data: PlanUpdateRequest) => {
        const token = getAccessToken();
        if (!token) throw new Error('No access token');
        setLoading(true);
        setError(null);
        try {            return await updatePlan(id, data, token);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [getAccessToken]);

    const remove = useCallback(async (id: number) => {
        const token = getAccessToken();
        if (!token) throw new Error('No access token');
        setLoading(true);
        setError(null);
        try {
            await deletePlan(id, token);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [getAccessToken]);

    return {
        loading,
        error,
        fetchPublicPlans,
        fetchMyCreatedPlans,
        fetchMyJoinedPlans,
        fetchPlanDetail,
        fetchNearbyPlans,
        fetchFilteredPlans,
        subscribe,
        unsubscribe,
        create,
        update,
        remove,
    };
}
