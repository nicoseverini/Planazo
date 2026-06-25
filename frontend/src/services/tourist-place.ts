import { getBackendUrl } from './auth';
import { useToken } from '@/context/token-context';
import { useCallback, useState } from 'react';
import { Interest, INTEREST_OPTIONS, INTEREST_LABEL } from '@/utils/interests';

export type { Interest };
export { INTEREST_OPTIONS, INTEREST_LABEL };

export type TouristPlaceSummary = {
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

export type TouristPlaceDetail = TouristPlaceSummary & {
    description: string | null;
};

export type TouristPlaceCreateRequest = {
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

export type TouristPlaceUpdateRequest = Partial<TouristPlaceCreateRequest>;

// ============================================
// API Functions
// ============================================

export async function getAllTouristPlaces(): Promise<TouristPlaceSummary[]> {
    const url = `${getBackendUrl()}/api/v1/tourist-places`;
    const response = await fetch(url, {
        headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
}

export async function getTouristPlaceById(id: number): Promise<TouristPlaceDetail> {
    const url = `${getBackendUrl()}/api/v1/tourist-places/${id}`;
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

export async function getMyTouristPlaces(accessToken: string): Promise<TouristPlaceSummary[]> {
    const url = `${getBackendUrl()}/api/v1/tourist-places/me`;
    const response = await fetch(url, {
        headers: { Accept: 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
}

export async function createTouristPlace(
    data: TouristPlaceCreateRequest,
    accessToken: string
): Promise<TouristPlaceDetail> {
    const url = `${getBackendUrl()}/api/v1/tourist-places`;
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

export async function updateTouristPlace(
    id: number,
    data: TouristPlaceUpdateRequest,
    accessToken: string
): Promise<TouristPlaceDetail> {
    const url = `${getBackendUrl()}/api/v1/tourist-places/${id}`;
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

export async function deleteTouristPlace(id: number, accessToken: string): Promise<void> {
    const url = `${getBackendUrl()}/api/v1/tourist-places/${id}`;
    const response = await fetch(url, {
        method: 'DELETE',
        headers: { Accept: 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) throw new Error(await response.text());
}

// ============================================
// Hook
// ============================================

export function useTouristPlaces() {
    const { getAccessToken } = useToken();
    const [loadingCount, setLoadingCount] = useState(0);
    const loading = loadingCount > 0;
    const [error, setError] = useState<string | null>(null);

    const fetchAll = useCallback(async () => {
        setLoadingCount((c) => c + 1);
        setError(null);
        try {
            return await getAllTouristPlaces();
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
            return await getTouristPlaceById(id);
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
            return await getMyTouristPlaces(token);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        } finally {
            setLoadingCount((c) => c - 1);
        }
    }, [getAccessToken]);

    const create = useCallback(async (data: TouristPlaceCreateRequest) => {
        const token = getAccessToken();
        if (!token) throw new Error('No access token');
        setLoadingCount((c) => c + 1);
        setError(null);
        try {
            return await createTouristPlace(data, token);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        } finally {
            setLoadingCount((c) => c - 1);
        }
    }, [getAccessToken]);

    const update = useCallback(async (id: number, data: TouristPlaceUpdateRequest) => {
        const token = getAccessToken();
        if (!token) throw new Error('No access token');
        setLoadingCount((c) => c + 1);
        setError(null);
        try {
            return await updateTouristPlace(id, data, token);
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
            await deleteTouristPlace(id, token);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        } finally {
            setLoadingCount((c) => c - 1);
        }
    }, [getAccessToken]);

    return { loading, error, fetchAll, fetchById, fetchMine, create, update, remove };
}
