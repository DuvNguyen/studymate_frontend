'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSession } from '@clerk/nextjs';

export interface CurrentUser {
  id: number;
  email: string;
  role: string;
  roleId: number;
  status: string;
  kycStatus: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
  avatarUrl: string | null;
  clerkUserId: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  bio: string | null;
  createdAt: string;
}

interface UserContextType {
  user: CurrentUser | null;
  loading: boolean;
  error: string | null;
  refetchUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { session, isLoaded } = useSession();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    if (!isLoaded) return;
    if (!session) {
      setUser(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const token = await session.getToken();
      const timestamp = new Date().getTime();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me?t=${timestamp}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });

      if (!res.ok) {
        const json = await res.json();
        const message = json.message || 'Lỗi không xác định';
        const normalized = String(message).toLowerCase();
        const isRestricted =
          res.status === 401 &&
          (normalized.includes('khóa vĩnh viễn') ||
            normalized.includes('đình chỉ') ||
            normalized.includes('bị khóa'));

        if (isRestricted) {
          setUser(null);
          setError(message);
          if (window.location.pathname !== '/access-restricted') {
            window.location.href = '/access-restricted';
          }
          return;
        }

        throw new Error(message);
      }

      const json = await res.json();
      setUser(json.data);
      setError(null);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj.message);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, session]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <UserContext.Provider value={{ user, loading, error, refetchUser: fetchUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
}
