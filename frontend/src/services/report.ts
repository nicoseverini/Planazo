import { getBackendUrl } from './auth';
import { apiFetch } from '@/utils/api';
import { useToken } from '@/context/token-context';

export type ReportReason = 'INAPPROPRIATE_CONTENT' | 'FALSE_DATA' | 'SPAM' | 'HARASSMENT' | 'COPYRIGHT_INFRINGEMENT' | 'OTHER';

export type CreateReportRequest = {
  reason: ReportReason;
  description?: string;
  planId?: number;
  touristPlaceId?: number;
  reportedUserId?: number;
};

export type ReportResponse = {
  id: number;
  reason: ReportReason;
  description: string | null;
  reporterId: number;
  reporterName: string | null;
  reportedUserId: number | null;
  reportedUserName: string | null;
  planId: number | null;
  planTitle: string | null;
  touristPlaceId: number | null;
  touristPlaceName: string | null;
  createdAt: string;
  resolved: boolean;
};

export const createReport = async (request: CreateReportRequest, accessToken: string): Promise<ReportResponse> => {
  const backendUrl = getBackendUrl();
  const response = await apiFetch(`${backendUrl}/api/v1/reports`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(request),
  });
  return response as ReportResponse;
};
