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

// Auth types
export type AuthTokenResponse = {
  accessToken: string;
  refreshToken: string | null;
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
    if (response.status === 401) {
      throw new Error('Check your email to activate your account');
    }
    const errorText = await response.text();
    throw new Error(`Login failed: ${errorText}`);
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
    const errorText = await response.text();
    throw new Error(`Signup failed: ${errorText}`);
  }

  return response.json();
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
