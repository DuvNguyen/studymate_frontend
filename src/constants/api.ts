/**
 * Centralized API configuration to prevent hardcoding local URLs.
 * Always prefers process.env.NEXT_PUBLIC_API_URL.
 */

const getApiBase = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;

  if (envUrl) {
    return envUrl.replace(/\/+$/, '');
  }

  // Local development fallback
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3001/api/v1';
  }

  // Production-safe fallback to avoid invalid relative-empty URLs.
  // Works when frontend has rewrite/proxy for /api/v1.
  return '/api/v1';
};

export const API_BASE = getApiBase();
export const API_V1 = `${API_BASE}`; // Since it's usually /api/v1 in the env var
