export function getBackendUrl(): string {
  const viteUrl = import.meta.env.VITE_BACKEND_URL?.trim();
  if (viteUrl) {
    return viteUrl.replace(/\/$/, '');
  }
  return 'http://localhost:8080';
}
