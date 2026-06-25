import { getBackendUrl } from './auth';
import { useToken } from '@/context/token-context';
import { useCallback, useState } from 'react';

export type TranslationRequest = {
  text: string;
  targetLanguage: string;
};

export type TranslationResponse = {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
};

export async function translateText(
  data: TranslationRequest,
  accessToken: string
): Promise<TranslationResponse> {
  const url = `${getBackendUrl()}/api/v1/translate`;
  console.log('[TranslateService] Translating:', url);

  const langCode = data.targetLanguage.split('-')[0].toLowerCase();
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      text: data.text,
      targetLanguage: langCode,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Translation failed.');
  }

  return response.json();
}

export function useTranslationService() {
  const { getAccessToken } = useToken();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translate = useCallback(
    async (text: string, targetLanguage: string) => {
      const token = getAccessToken();
      if (!token) throw new Error('No access token');
      setLoading(true);
      setError(null);
      try {
        return await translateText({ text, targetLanguage }, token);
      } catch (err: any) {
        setError(err.message || 'Translation failed');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAccessToken]
  );

  return { translate, loading, error };
}
