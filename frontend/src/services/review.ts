import { getBackendUrl } from './auth';
import { useToken } from '@/context/token-context';
import { useCallback, useState } from 'react';

export type ReviewTarget = 'VENUE' | 'USER';

export type ReviewAuthor = {
    id: number;
    name: string;
    lastname: string;
    photo: string | null;
};

export type ReviewResponse = {
    id: number;
    rating: number;
    comment: string;
    targetType: ReviewTarget;
    targetId: number;
    createdAt: string; // ISO string
    author: ReviewAuthor;
};

export type ReviewStats = {
    averageRating: number;
    reviewCount: number;
};

export type ReviewCreateRequest = {
    rating: number;
    comment: string;
};

// ============================================
// API Functions
// ============================================

export async function getReviewsByTarget(
    targetType: ReviewTarget,
    targetId: number
): Promise<ReviewResponse[]> {
    const url = `${getBackendUrl()}/api/v1/reviews/${targetType}/${targetId}`;
    const response = await fetch(url, {
        headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
}

export async function getReviewStatsByTarget(
    targetType: ReviewTarget,
    targetId: number
): Promise<ReviewStats> {
    const url = `${getBackendUrl()}/api/v1/reviews/${targetType}/${targetId}/stats`;
    const response = await fetch(url, {
        headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
}

export async function createReviewForTarget(
    targetType: ReviewTarget,
    targetId: number,
    data: ReviewCreateRequest,
    accessToken: string
): Promise<ReviewResponse> {
    const url = `${getBackendUrl()}/api/v1/reviews/${targetType}/${targetId}`;
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
        throw new Error((await response.text()) || 'Unable to submit review.');
    }
    return response.json();
}

// ============================================
// Hook
// ============================================

export function useReviews() {
    const { getAccessToken } = useToken();
    const [loadingCount, setLoadingCount] = useState(0);
    const loading = loadingCount > 0;
    const [error, setError] = useState<string | null>(null);

    const fetchReviews = useCallback(async (targetType: ReviewTarget, targetId: number) => {
        setLoadingCount((c) => c + 1);
        setError(null);
        try {
            return await getReviewsByTarget(targetType, targetId);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        } finally {
            setLoadingCount((c) => c - 1);
        }
    }, []);

    const fetchStats = useCallback(async (targetType: ReviewTarget, targetId: number) => {
        setLoadingCount((c) => c + 1);
        setError(null);
        try {
            return await getReviewStatsByTarget(targetType, targetId);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        } finally {
            setLoadingCount((c) => c - 1);
        }
    }, []);

    const create = useCallback(
        async (targetType: ReviewTarget, targetId: number, data: ReviewCreateRequest) => {
            const token = getAccessToken();
            if (!token) throw new Error('You must be logged in to leave a review.');
            setLoadingCount((c) => c + 1);
            setError(null);
            try {
                return await createReviewForTarget(targetType, targetId, data, token);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
                throw err;
            } finally {
                setLoadingCount((c) => c - 1);
            }
        },
        [getAccessToken]
    );

    return { loading, error, fetchReviews, fetchStats, create };
}
