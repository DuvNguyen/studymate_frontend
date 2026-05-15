import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';

export function useEnrolledCourses() {
  const { getToken, isLoaded } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEnrollments = useCallback(async () => {
    if (!isLoaded) return;
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const now = Date.now();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/enrollments/my-courses?t=${now}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });

      const result = await res.json();
      if (res.ok) {
        setEnrollments(result.data);
      } else {
        setError(result.message || 'Không thể tải danh sách khóa học');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [getToken, isLoaded]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  return { enrollments, loading, error, refresh: fetchEnrollments };
}
