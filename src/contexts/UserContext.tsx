'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession, useClerk } from '@clerk/nextjs';

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
  const { signOut } = useClerk();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
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
        throw new Error(json.message || 'Lỗi không xác định');
      }

      const json = await res.json();
      setUser(json.data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      const errorMsg = err.message.toLocaleLowerCase();
      if (errorMsg.includes('khóa vĩnh viễn') || errorMsg.includes('đình chỉ')) {
        signOut();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [isLoaded, session?.id]);

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
