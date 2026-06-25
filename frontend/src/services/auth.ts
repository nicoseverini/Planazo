import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Get backend URL based on environment
export function getBackendUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_BACKEND_URL || Constants.expoConfig?.extra?.backendUrl;
  if (envUrl) {
    // Ensure URL has a protocol!
    if (!/^https?:\/\//.test(envUrl)) {
      return `https://${envUrl}`;
    }
    return envUrl;
  }

  // Default URLs based on platform (for development)
  if (__DEV__) {
    // Android emulator uses 10.0.2.2 to access host machine
    // iOS simulator uses localhost
    // Physical devices need the actual IP address
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:8080';
    }
    return 'http://localhost:8080';
  }

  // Production URL - should be configured via environment
  return 'https://api.example.com';
}

import { UserProfile } from './user';

// Auth types
export type AuthTokenResponse = {
  accessToken: string;
  refreshToken: string | null;
  user?: UserProfile;
};

export type SignupResponse = {
  status: string;
  message: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type SignupRequest = {
  name: string;
  lastname: string;
  email: string;
  password: string;
  gender?: string;
  birthDate?: string;
};

export type ForgotPasswordRequest = {
  email: string;
};

export type ResendVerificationRequest = {
  email: string;
};

// Basic auth functions (low-level)
export async function loginUser(req: LoginRequest): Promise<AuthTokenResponse> {
  const url = `${getBackendUrl()}/api/v1/auth/token`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
  });

  if (!response.ok) {
    const statusCode = Number(response.status);
    const errorText = await response.text();
    const cleanError = errorText.toUpperCase();

    if (
      statusCode === 401 || statusCode === 403 ||
      cleanError.includes('UNAUTHORIZED') || cleanError.includes('CREDENTIALS') ||
      cleanError.includes('FORBIDDEN') || cleanError.includes('VERIFIED')
    ) {
      throw new Error('AUTH_FAILURE');
    }

    throw new Error('AUTH_SERVER_ERROR');
  }

  return response.json();
}

export async function signupUser(req: SignupRequest): Promise<SignupResponse> {
    const url = `${getBackendUrl()}/api/v1/auth/signup`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(req),
    });

    if (!response.ok) {
        if (response.status === 409) {
            throw new Error('This email is already registered. Try logging in.');
        }
        if (response.status === 400) {
            const errorText = await response.text();
            throw new Error(errorText || 'Please check your information and try again.');
        }
        throw new Error('Could not create account. Please try again later.');
    }

    return response.json();
}

export async function resendVerificationEmail(req: ResendVerificationRequest): Promise<void> {
  const url = `${getBackendUrl()}/api/v1/auth/resend-verification`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
  });

  if (!response.ok) {
    throw new Error('Failed to resend verification email');
  }
}

export async function forgotPassword(req: ForgotPasswordRequest): Promise<void> {
  const url = `${getBackendUrl()}/api/v1/auth/forgot-password`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Forgot password failed: ${errorText}`);
  }
}
