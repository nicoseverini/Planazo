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
  console.log('[UserService] Fetching profile:', url);

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
    throw new Error(message || `Failed to fetch profile: ${response.status}`);
  }

  return response.json();
}

export async function getProfileById(accessToken: string, id: string | number): Promise<UserProfile> {
  const url = `${getBackendUrl()}/api/v1/users/profile/${id}`;
  console.log('[UserService] Fetching profile by id:', url);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    if (response.status === 404) throw new Error('User not found.');
    throw new Error('Unable to load this profile.');
  }

  return response.json();
}

export async function fetchMyPicture(accessToken: string): Promise<string | null> {
  const url = `${getBackendUrl()}/api/v1/users/profile/me/picture`;
  console.log('[UserService] Fetching picture:', url);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.log('[UserService] No profile picture found');
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
    console.log('[UserService] Error fetching picture:', error);
    return null;
  }
}

export async function updateMyProfile(
    accessToken: string,
    data: UpdateProfileRequest
): Promise<UserProfile> {
  const url = `${getBackendUrl()}/api/v1/users/update/me`;
  console.log('[UserService] Updating profile:', url);

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
    throw new Error(`Failed to update profile: ${errorText}`);
  }

  return response.json();
}

export async function updateProfilePicture(
    accessToken: string,
    photo: { uri: string; type: string; name: string }
): Promise<void> {
  const url = `${getBackendUrl()}/api/v1/users/update/me/picture`;
  console.log('[UserService] Updating profile picture:', url);

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
    throw new Error(`Failed to update picture: ${errorText}`);
  }
}

export async function deleteMyAccount(accessToken: string): Promise<void> {
  const url = `${getBackendUrl()}/api/v1/users/delete/me`;
  console.log('[UserService] Deleting account:', url);

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete account: ${errorText}`);
  }
}

// ============================================
// Hooks (usando el TokenContext)
// ============================================

export function useProfile() {
  const { getAccessToken } = useToken();

  const fetchProfile = async () => {
    const token = getAccessToken();
    if (!token) throw new Error('No access token');
    return getMyProfile(token);
  };

  const fetchProfileById = async (id: string | number) => {
    const token = getAccessToken();
    if (!token) throw new Error('No access token');
    return getProfileById(token, id);
  };

  const fetchPicture = async () => {
    const token = getAccessToken();
    if (!token) throw new Error('No access token');
    return fetchMyPicture(token);
  };

  const updateProfile = async (data: UpdateProfileRequest) => {
    const token = getAccessToken();
    if (!token) throw new Error('No access token');
    return updateMyProfile(token, data);
  };

  const updatePicture = async (photo: { uri: string; type: string; name: string }) => {
    const token = getAccessToken();
    if (!token) throw new Error('No access token');
    return updateProfilePicture(token, photo);
  };

  const deleteAccount = async () => {
    const token = getAccessToken();
    if (!token) throw new Error('No access token');
    return deleteMyAccount(token);
  };

  return { fetchProfile, fetchProfileById, fetchPicture, updateProfile, updatePicture, deleteAccount };
}
