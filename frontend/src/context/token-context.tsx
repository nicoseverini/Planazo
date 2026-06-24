import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type TokenContextData =
    | { state: 'LOADING' }
    | { state: 'LOGGED_OUT' }
    | {
    state: 'LOGGED_IN';
    accessToken: string;
    refreshToken: string | null;
};

type TokenContextValue = {
    tokenData: TokenContextData;
    setTokenData: React.Dispatch<React.SetStateAction<TokenContextData>>;
    logout: () => Promise<void>;
    getAccessToken: () => string | null;
};

const TOKEN_STORAGE_KEY = '@token_data';
const MEMORY_STORAGE = new Map<string, string>();
let storageAvailable: boolean | null = null;

async function canUseAsyncStorage() {
    if (storageAvailable !== null) {
        return storageAvailable;
    }
    try {
        await AsyncStorage.getItem('__storage_test__');
        storageAvailable = true;
    } catch {
        storageAvailable = false;
    }
    return storageAvailable;
}

async function getItemSafe(key: string) {
    if (await canUseAsyncStorage()) {
        return AsyncStorage.getItem(key);
    }
    return MEMORY_STORAGE.get(key) ?? null;
}

async function setItemSafe(key: string, value: string) {
    if (await canUseAsyncStorage()) {
        await AsyncStorage.setItem(key, value);
        return;
    }
    MEMORY_STORAGE.set(key, value);
}

async function removeItemSafe(key: string) {
    if (await canUseAsyncStorage()) {
        await AsyncStorage.removeItem(key);
        return;
    }
    MEMORY_STORAGE.delete(key);
}

const TokenContext = createContext<TokenContextValue | null>(null);

export function TokenProvider({ children }: React.PropsWithChildren) {
    const [tokenData, setTokenData] = useState<TokenContextData>({ state: 'LOADING' });

    // Load stored token on mount
    useEffect(() => {
        loadStoredToken();
    }, []);

    const loadStoredToken = async () => {
        try {
            const stored = await getItemSafe(TOKEN_STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                setTokenData({
                    state: 'LOGGED_IN',
                    accessToken: parsed.accessToken,
                    refreshToken: parsed.refreshToken,
                });
            } else {
                setTokenData({ state: 'LOGGED_OUT' });
            }
        } catch {
            setTokenData({ state: 'LOGGED_OUT' });
        }
    };

    // Persist token when it changes
    useEffect(() => {
        if (tokenData.state === 'LOGGED_IN') {
            void setItemSafe(TOKEN_STORAGE_KEY, JSON.stringify({
                accessToken: tokenData.accessToken,
                refreshToken: tokenData.refreshToken,
            }));
        }
    }, [tokenData]);

    const logout = useCallback(async () => {
        await removeItemSafe(TOKEN_STORAGE_KEY);
        setTokenData({ state: 'LOGGED_OUT' });
    }, []);

    const getAccessToken = useCallback(() => {
        if (tokenData.state === 'LOGGED_IN') {
            return tokenData.accessToken;
        }
        return null;
    }, [tokenData]);

    return (
        <TokenContext.Provider value={{ tokenData, setTokenData, logout, getAccessToken }}>
            {children}
        </TokenContext.Provider>
    );
}

export function useToken() {
    const context = useContext(TokenContext);
    if (context === null) {
        throw new Error('useToken must be used within a TokenProvider');
    }
    return context;
}

// Helper to decode JWT and extract role
export function decodeJwt(token: string): { role: string; id?: number; sub?: string; exp?: number } {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('[TokenContext] Error decoding JWT:', error);
        return { role: 'USER' };
    }
}
