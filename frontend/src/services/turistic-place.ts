import { getBackendUrl } from './auth';
import { useToken } from '@/context/token-context';
import { useCallback, useState } from 'react';
import { Interest, INTEREST_OPTIONS, INTEREST_LABEL } from '@/utils/interests';

export type { Interest };
export { INTEREST_OPTIONS, INTEREST_LABEL };

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
    if (response.status === 404) {
        throw Object.assign(new Error('Tourist place not found.'), { status: 404 });
    }
    if (!response.ok) {
        throw new Error((await response.text()) || 'Unable to load tourist place information.');
    }
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
    const [loadingCount, setLoadingCount] = useState(0);
    const loading = loadingCount > 0;
    const [error, setError] = useState<string | null>(null);

    const fetchAll = useCallback(async () => {
        setLoadingCount((c) => c + 1);
        setError(null);
        try {
            return await getAllTuristicPlaces();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        } finally {
            setLoadingCount((c) => c - 1);
        }
    }, []);

    const fetchById = useCallback(async (id: number) => {
        setLoadingCount((c) => c + 1);
        setError(null);
        try {
            return await getTuristicPlaceById(id);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        } finally {
            setLoadingCount((c) => c - 1);
        }
    }, []);

    const fetchMine = useCallback(async () => {
        const token = getAccessToken();
        if (!token) throw new Error('No access token');
        setLoadingCount((c) => c + 1);
        setError(null);
        try {
            return await getMyTuristicPlaces(token);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        } finally {
            setLoadingCount((c) => c - 1);
        }
    }, [getAccessToken]);

    const create = useCallback(async (data: TuristicPlaceCreateRequest) => {
        const token = getAccessToken();
        if (!token) throw new Error('No access token');
        setLoadingCount((c) => c + 1);
        setError(null);
        try {
            return await createTuristicPlace(data, token);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        } finally {
            setLoadingCount((c) => c - 1);
        }
    }, [getAccessToken]);

    const update = useCallback(async (id: number, data: TuristicPlaceUpdateRequest) => {
        const token = getAccessToken();
        if (!token) throw new Error('No access token');
        setLoadingCount((c) => c + 1);
        setError(null);
        try {
            return await updateTuristicPlace(id, data, token);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        } finally {
            setLoadingCount((c) => c - 1);
        }
    }, [getAccessToken]);

    const remove = useCallback(async (id: number) => {
        const token = getAccessToken();
        if (!token) throw new Error('No access token');
        setLoadingCount((c) => c + 1);
        setError(null);
        try {
            await deleteTuristicPlace(id, token);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        } finally {
            setLoadingCount((c) => c - 1);
        }
    }, [getAccessToken]);

    return { loading, error, fetchAll, fetchById, fetchMine, create, update, remove };
}
