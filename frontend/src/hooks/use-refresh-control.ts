import { useCallback, useState } from 'react';

export function useRefreshControl(loadFn: () => Promise<void>) {
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadFn();
        setRefreshing(false);
    }, [loadFn]);

    return { refreshing, onRefresh };
}
