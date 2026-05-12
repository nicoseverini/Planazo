import { getBackendUrl } from '@/services/auth';

export type UpdateProfileRequest = {
  photo?: string;
  name?: string;
  lastname?: string;
  gender?: string;
  birthDate?: string;
  budget?: number;
  travelType?: string;
  languages?: string[];
  interests?: string[];
};

export type UpdateProfileResponse = {
  status: string;
  message: string;
};

export async function updateProfile(
  accessToken: string,
  payload: UpdateProfileRequest,
): Promise<UpdateProfileResponse> {
  const url = `${getBackendUrl()}/api/v1/users/update/me`;
  console.log('[USER] Attempting PATCH to:', url);

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<UpdateProfileResponse>;
}
