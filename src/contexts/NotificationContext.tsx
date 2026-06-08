'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useSession } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { io, Socket } from 'socket.io-client';

export type NotificationCategory = 'LEARNING' | 'TRANSACTIONS' | 'SYSTEM';

export interface Notification {
  id: number;
  userId: number;
  type: 'SYSTEM' | 'COURSE' | 'ORDER' | 'COMMUNITY' | 'ENROLLMENT' | 'WALLET' | 'QUIZ' | 'KYC' | 'REVIEW';
  category?: NotificationCategory;
  eventType?: string;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: Record<string, unknown> | null;
  linkUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface NotificationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface FetchNotificationOptions {
  page?: number;
  limit?: number;
  category?: NotificationCategory;
  status?: 'read' | 'unread';
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: (options?: FetchNotificationOptions) => Promise<{ data: Notification[]; meta?: NotificationMeta }>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: (category?: NotificationCategory) => Promise<void>;
  deleteOldNotifications: (before?: string) => Promise<number>;
  openNotification: (notification: Notification) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

function getApiUrl() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is not configured');
  }
  return apiUrl.replace(/\/+$/, '');
}

function getSocketUrl(apiUrl: string) {
  return apiUrl.replace(/\/api\/v\d+\/?$/, '');
}

function playNotificationSound() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const audio = new AudioContextClass();
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = 'square';
    oscillator.frequency.value = 880;
    gain.gain.value = 0.03;
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start();
    oscillator.stop(audio.currentTime + 0.12);
  } catch {
    // Browser may block audio before user interaction.
  }
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { session } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);

  const fetchNotifications = useCallback(async (options: FetchNotificationOptions = {}) => {
    if (!session) return { data: [] };
    setLoading(true);
    try {
      const token = await session.getToken();
      const params = new URLSearchParams();
      if (options.page) params.set('page', String(options.page));
      if (options.limit) params.set('limit', String(options.limit));
      if (options.category) params.set('category', options.category);
      if (options.status) params.set('status', options.status);

      const endpoint = params.toString()
        ? `${getApiUrl()}/notifications?${params.toString()}`
        : `${getApiUrl()}/notifications/me`;
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.warn(`Failed to fetch notifications: ${res.status} ${res.statusText}`, errorText);
        return { data: [] };
      }

      const json = await res.json();
      const payload = json.data || json;
      const data: Notification[] = Array.isArray(payload) ? payload : payload.data || [];
      const meta: NotificationMeta | undefined = Array.isArray(payload) ? undefined : payload.meta;

      if (!options.category && !options.status && (!options.page || options.page === 1)) {
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.isRead).length);
      }

      return { data, meta };
    } catch {
      return { data: [] };
    } finally {
      setLoading(false);
    }
  }, [session]);

  const markAsRead = useCallback(async (id: number) => {
    if (!session) return;
    try {
      const token = await session.getToken();
      const res = await fetch(`${getApiUrl()}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch {
      return;
    }
  }, [session]);

  const markAllAsRead = useCallback(async (category?: NotificationCategory) => {
    if (!session) return;
    try {
      const token = await session.getToken();
      const suffix = category ? `?category=${category}` : '';
      const res = await fetch(`${getApiUrl()}/notifications/read-all${suffix}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotifications((prev) => {
          const next = prev.map((n) => (!category || n.category === category ? { ...n, isRead: true } : n));
          setUnreadCount(next.filter((n) => !n.isRead).length);
          return next;
        });
      }
    } catch {
      return;
    }
  }, [session]);

  const deleteOldNotifications = useCallback(async (before?: string) => {
    if (!session) return 0;
    try {
      const token = await session.getToken();
      const suffix = before ? `?before=${encodeURIComponent(before)}` : '';
      const res = await fetch(`${getApiUrl()}/notifications/old${suffix}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return 0;
      const json = await res.json();
      const payload = json.data || json;
      await fetchNotifications();
      return Number(payload.deleted || 0);
    } catch {
      return 0;
    }
  }, [fetchNotifications, session]);

  const openNotification = useCallback(async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    if (notification.linkUrl) {
      router.push(notification.linkUrl);
    }
  }, [markAsRead, router]);

  useEffect(() => {
    if (session) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [session, fetchNotifications]);

  useEffect(() => {
    if (!session) return;
    let isMounted = true;

    async function connectSocket() {
      try {
        const token = await session?.getToken();
        if (!token || !isMounted) return;

        const socket = io(`${getSocketUrl(getApiUrl())}/notifications`, {
          auth: { token },
          transports: ['websocket', 'polling'],
          withCredentials: true,
          reconnectionAttempts: 1,
          timeout: 3000,
        });

        socket.on('connect_error', () => {
          socket.disconnect();
        });

        socket.on('notification:new', (notification: Notification) => {
          setNotifications((prev) => {
            if (prev.some((item) => item.id === notification.id)) return prev;
            return [notification, ...prev];
          });
          setUnreadCount((prev) => prev + (notification.isRead ? 0 : 1));
          toast(notification.title, {
            duration: 5000,
            icon: '🔔',
          });
          playNotificationSound();
        });

        socketRef.current = socket;
      } catch {
        return;
      }
    }

    connectSocket();

    return () => {
      isMounted = false;
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [session]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteOldNotifications,
        openNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}
