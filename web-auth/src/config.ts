export function getBackendUrl(): string {
  const viteUrl = import.meta.env.VITE_BACKEND_URL?.trim();

  if (viteUrl) {
    let normalizedUrl = viteUrl;

    if (!/^https?:\/\//.test(normalizedUrl)) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    return normalizedUrl.replace(/\/$/, '');
  }

  return 'http://localhost:8080';
}