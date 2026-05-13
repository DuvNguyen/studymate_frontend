'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@clerk/nextjs';

export interface UserProfile {
  id: number;
  clerkUserId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  role: string;
  status: string;
  createdAt: string;
}

export function useUserProfile() {
  const { session, isLoaded } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!session) {
      setLoading(false);
      return;
    }

    async function fetchProfile() {
      try {
        const token = await session!.getToken();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.message || 'Lỗi lấy thông tin cá nhân');
        }

        const json = await res.json();
        setProfile(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [isLoaded, session]);

  const updateProfile = async (data: {
    firstName?: string;
    lastName?: string;
    bio?: string;
    avatarUrl?: string;
  }) => {
    if (!session) return;
    setUpdating(true);
    setError(null);
    try {
      const token = await session.getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || 'Lỗi cập nhật hồ sơ');
      }

      const json = await res.json();
      setProfile(json.data); // Cập nhật lại state với dữ liệu mới
      return json.data;
    } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        throw err;
    } finally {
      setUpdating(false);
    }
  };

  return { profile, loading, error, updating, updateProfile };
}
