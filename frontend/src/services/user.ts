import { getBackendUrl } from '@/services/auth';
import { useToken } from '@/context/token-context';

// ============================================
// Types
// ============================================

export type UserProfile = {
  id?: string;
  name: string;
  lastname: string;
  email: string;
  age?: string;
  gender?: string;
  zone?: string;
  photo?: string;
  travelType?: string;
  languages?: string[];
  interests?: string[];
  birthDate?: string;
  preferredLanguage?: string;
};

export type UpdateProfileRequest = {
  photo?: string;
  name?: string;
  lastname?: string;
  gender?: string;
  birthDate?: string;
  travelType?: string;
  languages?: string[];
  interests?: string[];
};

// ============================================
// Profile Functions
// ============================================

export async function getMyProfile(accessToken: string): Promise<UserProfile> {
  const url = `${getBackendUrl()}/api/v1/users/profile/me`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'error_fetch_profile_failed');
  }

  return response.json();
}

export async function getProfileById(accessToken: string, id: string | number): Promise<UserProfile> {
  const url = `${getBackendUrl()}/api/v1/users/profile/${id}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    if (response.status === 404) throw new Error('user_not_found');
    throw new Error('unable_load_profile');
  }

  return response.json();
}

export async function fetchMyPicture(accessToken: string): Promise<string | null> {
  const url = `${getBackendUrl()}/api/v1/users/profile/me/picture`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const blob = await response.blob();
    if (blob.size === 0) return null;

    // Convert blob to base64 for React Native Image
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    return null;
  }
}

export async function updateMyProfile(
    accessToken: string,
    data: UpdateProfileRequest
): Promise<UserProfile> {
  const url = `${getBackendUrl()}/api/v1/users/update/me`;

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'error_update_profile_failed');
  }

  return response.json();
}

export async function updateProfilePicture(
    accessToken: string,
    photo: { uri: string; type: string; name: string }
): Promise<void> {
  const url = `${getBackendUrl()}/api/v1/users/update/me/picture`;

  const formData = new FormData();
  formData.append('photo', photo as unknown as Blob);

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'error_update_photo_failed');
  }
}

export async function deleteMyAccount(accessToken: string): Promise<void> {
  const url = `${getBackendUrl()}/api/v1/users/delete/me`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'error_delete_account_failed');
  }
}

export async function updatePreferredLanguage(
    accessToken: string,
    preferredLanguage: string
): Promise<void> {
  const url = `${getBackendUrl()}/api/v1/users/me/language`;

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ preferredLanguage }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'error_save_language_preferences');
  }
}

// ============================================
// Hooks (usando el TokenContext)
// ============================================

export function useProfile() {
  const { getAccessToken } = useToken();

  const fetchProfile = async () => {
    const token = getAccessToken();
    if (!token) throw new Error('error_no_access_token');
    return getMyProfile(token);
  };

  const fetchProfileById = async (id: string | number) => {
    const token = getAccessToken();
    if (!token) throw new Error('error_no_access_token');
    return getProfileById(token, id);
  };

  const fetchPicture = async () => {
    const token = getAccessToken();
    if (!token) throw new Error('error_no_access_token');
    return fetchMyPicture(token);
  };

  const updateProfile = async (data: UpdateProfileRequest) => {
    const token = getAccessToken();
    if (!token) throw new Error('error_no_access_token');
    return updateMyProfile(token, data);
  };

  const updatePicture = async (photo: { uri: string; type: string; name: string }) => {
    const token = getAccessToken();
    if (!token) throw new Error('error_no_access_token');
    return updateProfilePicture(token, photo);
  };

  const deleteAccount = async () => {
    const token = getAccessToken();
    if (!token) throw new Error('error_no_access_token');
    return deleteMyAccount(token);
  };

  const updateLanguage = async (preferredLanguage: string) => {
    const token = getAccessToken();
    if (!token) throw new Error('error_no_access_token');
    return updatePreferredLanguage(token, preferredLanguage);
  };

  return { fetchProfile,  fetchProfileById, fetchPicture, updateProfile, updatePicture, deleteAccount, updateLanguage };
}
