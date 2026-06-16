/**
 * Centralized API configuration to prevent hardcoding local URLs.
 * Env wins first, then one environment-aware fallback.
 */

const LOCAL_API_BASE = 'http://localhost:3001/api/v1';
const DEPLOYED_API_BASE = 'https://studymate-backend-hxc9.onrender.com/api/v1';

export const getApiBase = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;

  if (envUrl) {
    return envUrl.replace(/\/+$/, '');
  }

  return process.env.NODE_ENV === 'development'
    ? LOCAL_API_BASE
    : DEPLOYED_API_BASE;
};

export const API_BASE = getApiBase();
export const API_V1 = API_BASE;
