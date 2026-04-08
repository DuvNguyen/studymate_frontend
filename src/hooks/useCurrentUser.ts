'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@clerk/nextjs';

interface CurrentUser {
  id: number;
  email: string;
  role: string;
  roleId: number;
  status: string;
  avatarUrl: string | null;
  clerkUserId: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  bio: string | null;
  createdAt: string;
}

export function useCurrentUser() {
  const { session, isLoaded } = useSession();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!session) {
      setLoading(false);
      return;
    }

    async function fetchUser() {
      try {
        const token = await session!.getToken();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.message || 'Lỗi không xác định');
        }

        const json = await res.json();
        setUser(json.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [isLoaded, session]);

  return { user, loading, error };
}