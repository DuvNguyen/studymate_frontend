'use client';

import { useUserContext } from '../contexts/UserContext';

export function useCurrentUser() {
  const { user, loading, error, refetchUser } = useUserContext();
  return { user, loading, error, refetchUser };
}