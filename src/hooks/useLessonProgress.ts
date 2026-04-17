'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';

export interface LessonProgress {
  id: number;
  lesson_id: number;
  watched_duration: number;
  completed: boolean;
  last_watched_at: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export function useLessonProgress(enrollmentId?: number) {
  const { getToken } = useAuth();
  const [progressMap, setProgressMap] = useState<Record<number, LessonProgress>>({});
  const [loading, setLoading] = useState(false);

  const fetchProgress = useCallback(async () => {
    if (!enrollmentId) return;
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/lesson-progress/enrollment/${enrollmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        const data = (json.data ?? json) as LessonProgress[];
        const map: Record<number, LessonProgress> = {};
        data.forEach((p: LessonProgress) => {
          map[p.lesson_id] = p;
        });
        setProgressMap(map);
      }
    } catch (err) {
      console.error('Error fetching progress:', err);
    } finally {
      setLoading(false);
    }
  }, [enrollmentId, getToken]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const upsertProgress = async (lessonId: number, watchedDuration: number, completed?: boolean) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/lesson-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ lessonId, watchedDuration, completed }),
      });
      if (res.ok) {
        const json = await res.json();
        const newProgress = (json.data ?? json) as LessonProgress;
        setProgressMap(prev => ({
          ...prev,
          [lessonId]: newProgress,
        }));
        return newProgress;
      }
    } catch (err) {
      console.error('Error updating progress:', err);
    }
  };

  return { progressMap, loading, upsertProgress, refreshProgress: fetchProgress };
}
