import { getBackendUrl } from './auth';
import { useToken } from '@/context/token-context';
import { useCallback, useState } from 'react';

export type Interest =
    | 'FOOD' | 'CULTURE' | 'NATURE' | 'BEACH' | 'ADVENTURE'
    | 'NIGHTLIFE' | 'SPORTS' | 'SHOPPING' | 'HISTORY' | 'MOUNTAINS' | 'OTHER';

export const INTEREST_OPTIONS: { label: string; value: Interest }[] = [
    { label: 'Food', value: 'FOOD' },
    { label: 'Culture', value: 'CULTURE' },
    { label: 'Nature', value: 'NATURE' },
    { label: 'Beach', value: 'BEACH' },
    { label: 'Adventure', value: 'ADVENTURE' },
    { label: 'Nightlife', value: 'NIGHTLIFE' },
    { label: 'Sports', value: 'SPORTS' },
    { label: 'Shopping', value: 'SHOPPING' },
    { label: 'History', value: 'HISTORY' },
    { label: 'Mountains', value: 'MOUNTAINS' },
    { label: 'Other', value: 'OTHER' },
];

export const INTEREST_LABEL: Record<Interest, string> = Object.fromEntries(
    INTEREST_OPTIONS.map(({ value, label }) => [value, label])
) as Record<Interest, string>;

export type TuristicPlaceSummary = {
    id: number;
    name: string;
    cost: number | null;
    interests: Interest[];
    country: string | null;
    city: string | null;
    address: string | null;
    location: string | null;
    latitude: number | null;
    longitude: number | null;
    minAge: number | null;
    maxAge: number | null;
    images: string[];
    creatorId: number | null;
};

export type TuristicPlaceDetail = TuristicPlaceSummary & {
    description: string | null;
};

export type TuristicPlaceCreateRequest = {
    name: string;
    cost?: number;
    minAge?: number;
    maxAge?: number;
    interests: Interest[];
    country: string;
    city: string;
    address: string;
    latitude?: number;
    longitude?: number;
    images?: string[];
    description?: string;
};

export type TuristicPlaceUpdateRequest = Partial<TuristicPlaceCreateRequest>;

// ============================================
// API Functions
// ============================================

export async function getAllTuristicPlaces(): Promise<TuristicPlaceSummary[]> {
    const url = `${getBackendUrl()}/api/v1/turistic-places`;
    const response = await fetch(url, {
        headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
}

export async function getTuristicPlaceById(id: number): Promise<TuristicPlaceDetail> {
    const url = `${getBackendUrl()}/api/v1/turistic-places/${id}`;
    const response = await fetch(url, {
        headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
}

export async function getMyTuristicPlaces(accessToken: string): Promise<TuristicPlaceSummary[]> {
    const url = `${getBackendUrl()}/api/v1/turistic-places/me`;
    const response = await fetch(url, {
        headers: { Accept: 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
}

export async function createTuristicPlace(
    data: TuristicPlaceCreateRequest,
    accessToken: string
): Promise<TuristicPlaceDetail> {
    const url = `${getBackendUrl()}/api/v1/turistic-places`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
}

export async function updateTuristicPlace(
    id: number,
    data: TuristicPlaceUpdateRequest,
    accessToken: string
): Promise<TuristicPlaceDetail> {
    const url = `${getBackendUrl()}/api/v1/turistic-places/${id}`;
    const response = await fetch(url, {
        method: 'PATCH',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
}

export async function deleteTuristicPlace(id: number, accessToken: string): Promise<void> {
    const url = `${getBackendUrl()}/api/v1/turistic-places/${id}`;
    const response = await fetch(url, {
        method: 'DELETE',
        headers: { Accept: 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) throw new Error(await response.text());
}

// ============================================
// Hook
// ============================================

export function useTuristicPlaces() {
    const { getAccessToken } = useToken();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            return await getAllTuristicPlaces();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchById = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            return await getTuristicPlaceById(id);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchMine = useCallback(async () => {
        const token = getAccessToken();
        if (!token) throw new Error('No access token');
        setLoading(true);
        setError(null);
        try {
            return await getMyTuristicPlaces(token);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [getAccessToken]);

    const create = useCallback(async (data: TuristicPlaceCreateRequest) => {
        const token = getAccessToken();
        if (!token) throw new Error('No access token');
        setLoading(true);
        setError(null);
        try {
            return await createTuristicPlace(data, token);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [getAccessToken]);

    const update = useCallback(async (id: number, data: TuristicPlaceUpdateRequest) => {
        const token = getAccessToken();
        if (!token) throw new Error('No access token');
        setLoading(true);
        setError(null);
        try {
            return await updateTuristicPlace(id, data, token);
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
            await deleteTuristicPlace(id, token);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [getAccessToken]);

    return { loading, error, fetchAll, fetchById, fetchMine, create, update, remove };
}
