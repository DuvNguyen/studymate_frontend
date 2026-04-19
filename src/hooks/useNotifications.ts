'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from '@clerk/nextjs';

export interface Notification {
  id: number;
  userId: number;
  type: 'SYSTEM' | 'COURSE' | 'ORDER' | 'COMMUNITY' | 'ENROLLMENT' | 'WALLET' | 'QUIZ' | 'KYC' | 'REVIEW';
  title: string;
  message: string;
  isRead: boolean;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export function useNotifications() {
  const { session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const token = await session.getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch notifications');
      const json = await res.json();
      const data: Notification[] = json.data || json;
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.isRead).length);
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  }, [session]);

  const markAsRead = useCallback(async (id: number) => {
    if (!session) return;
    const token = await session.getToken();
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, [session]);

  const markAllAsRead = useCallback(async () => {
    if (!session) return;
    const token = await session.getToken();
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/read-all`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, [session]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return { notifications, loading, unreadCount, fetchNotifications, markAsRead, markAllAsRead };
}
