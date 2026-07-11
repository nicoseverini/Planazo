import { useCallback } from 'react';

import { getBackendUrl } from './auth';
import { useToken } from '@/context/token-context';
import { apiFetch } from '@/utils/api';

export type GeocodeResult = {
  latitude: number;
  longitude: number;
  displayName: string | null;
};

export type ReverseGeocodeResult = {
  country: string | null;
  countryCode: string | null;
  city: string | null;
  street: string | null;
  streetNumber: string | null;
  displayName: string | null;
};

function authHeaders(accessToken: string) {
  return {
    Accept: 'application/json',
    Authorization: `Bearer ${accessToken}`,
  };
}

/** Forward geocoding: free-form address text to coordinates. Throws on failure. */
export async function geocodeAddress(query: string, accessToken: string): Promise<GeocodeResult> {
  const url = `${getBackendUrl()}/api/v1/geocoding/search?query=${encodeURIComponent(query)}`;
  return apiFetch<GeocodeResult>(url, { headers: authHeaders(accessToken) });
}

/** Reverse geocoding: coordinates to a structured address. Throws on failure. */
export async function reverseGeocode(
  coords: { latitude: number; longitude: number },
  accessToken: string
): Promise<ReverseGeocodeResult> {
  const url = `${getBackendUrl()}/api/v1/geocoding/reverse?latitude=${coords.latitude}&longitude=${coords.longitude}`;
  return apiFetch<ReverseGeocodeResult>(url, { headers: authHeaders(accessToken) });
}

/**
 * Binds the geocoding calls to the current session token so callers don't have
 * to handle authentication themselves.
 */
export function useGeocoding() {
  const { getAccessToken } = useToken();

  const geocode = useCallback(
    (query: string) => {
      const token = getAccessToken();
      if (!token) throw new Error('No access token');
      return geocodeAddress(query, token);
    },
    [getAccessToken]
  );

  const reverse = useCallback(
    (coords: { latitude: number; longitude: number }) => {
      const token = getAccessToken();
      if (!token) throw new Error('No access token');
      return reverseGeocode(coords, token);
    },
    [getAccessToken]
  );

  return { geocode, reverse };
}
