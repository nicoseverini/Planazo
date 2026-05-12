import { LoginRequest, SignupRequest } from '@/models/auth';

export type AuthTokenResponse = {
  accessToken: string;
  refreshToken?: string;
};

const DEFAULT_BACKEND_URL = 'http://localhost:8080';

export function getBackendUrl() {
  const configuredUrl = process.env.EXPO_PUBLIC_BACKEND_EXTERNAL_URL?.trim();
  if (configuredUrl) {
    console.log('[AUTH] Using configured backend URL:', configuredUrl);
    return configuredUrl.replace(/\/$/, '');
  }
  console.log('[AUTH] Using default backend URL:', DEFAULT_BACKEND_URL);
  return DEFAULT_BACKEND_URL;
}

export async function loginUser(payload: LoginRequest) {
  return postAuth<AuthTokenResponse>('/api/v1/auth/token', payload);
}

export async function signupUser(payload: SignupRequest) {
  return postAuth<AuthTokenResponse>('/api/v1/auth/signup', payload);
}


export async function forgotPassword(payload: { email: string }) {
  return postAuth<void>('/api/v1/auth/forgot-password', payload, false);
}


async function postAuth<TResponse>(
  endpoint: string,
  payload: LoginRequest | SignupRequest | { email: string },
  expectsJson = true,
): Promise<TResponse> {
  const url = `${getBackendUrl()}${endpoint}`;
  console.log('[AUTH] Attempting POST to:', url);
  console.log('[AUTH] Payload:', JSON.stringify(payload));

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('[AUTH] Response status:', response.status);

    if (!response.ok) {
      const message = await response.text();
      console.log('[AUTH] Error response:', message);
      throw new Error(message || `Request failed with status ${response.status}`);
    }

    if (!expectsJson) {
      console.log('[AUTH] Success with empty body');
      return undefined as TResponse;
    }

    const responseText = await response.text();
    if (!responseText.trim()) {
      console.log('[AUTH] Success with empty JSON body');
      return undefined as TResponse;
    }

    const data = JSON.parse(responseText) as TResponse;
    console.log('[AUTH] Success, got data:', !!data);
    return data;
  } catch (error) {
    console.error('[AUTH] Network error:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}
