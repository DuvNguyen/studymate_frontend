'use client';

import { useNotificationContext } from '@/contexts/NotificationContext';
export type { Notification, NotificationCategory } from '@/contexts/NotificationContext';

export function useNotifications() {
  return useNotificationContext();
}
