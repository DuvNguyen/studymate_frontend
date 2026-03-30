'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from '@clerk/nextjs';

export interface AdminUser {
  id: number;
  clerkUserId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  status: string;
  createdAt: string;
}

interface FetchUsersParams {
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
  search?: string;
}

export function useAdminUsers() {
  const { session } = useSession();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async (params: FetchUsersParams = {}) => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const token = await session.getToken();
      
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.role) queryParams.append('role', params.role);
      if (params.status) queryParams.append('status', params.status);
      if (params.search) queryParams.append('search', params.search);

      const qs = queryParams.toString();
      const url = `${process.env.NEXT_PUBLIC_API_URL}/users${qs ? `?${qs}` : ''}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || 'Lỗi lấy danh sách user');
      }

      const json = await res.json();
      setUsers(json.data);
      setTotal(json.total);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [session]);

  const updateStatus = async (id: number, status: string) => {
    if (!session) return;
    try {
      const token = await session.getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}/status`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
         const json = await res.json();
         throw new Error(json.message || 'Lỗi cập nhật trạng thái');
      }
      // Reload danh sách
      await fetchUsers();
      return true;
    } catch (err: any) {
      throw err;
    }
  };

  const updateRole = async (id: number, roleId: number) => {
    if (!session) return;
    try {
      const token = await session.getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}/role`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roleId }),
      });
      if (!res.ok) {
         const json = await res.json();
         throw new Error(json.message || 'Lỗi cập nhật role');
      }
      // Reload danh sách
      await fetchUsers();
      return true;
    } catch (err: any) {
      throw err;
    }
  };

  return { users, total, loading, error, fetchUsers, updateStatus, updateRole };
}
