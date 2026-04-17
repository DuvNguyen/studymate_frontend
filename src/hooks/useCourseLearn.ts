'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { CourseDetail } from './useCourseDetail';

interface UseCourseLearnReturn {
  course: CourseDetail | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export function useCourseLearn(slug: string): UseCourseLearnReturn {
  const { getToken, isLoaded } = useAuth();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourse = useCallback(async () => {
    if (!slug || !isLoaded) return;
    
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE}/courses/${slug}/learn`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 403) throw new Error('FORBIDDEN');
        if (res.status === 404) throw new Error('NOT_FOUND');
        throw new Error(`HTTP ${res.status}`);
      }

      const json = await res.json();
      setCourse((json.data ?? json) as CourseDetail);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [slug, isLoaded, getToken]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  return { course, loading, error, refresh: fetchCourse };
}
