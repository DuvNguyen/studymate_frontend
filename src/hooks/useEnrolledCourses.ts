import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';

export function useEnrolledCourses() {
  const { getToken, isLoaded } = useAuth();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEnrollments = useCallback(async () => {
    if (!isLoaded) return;
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await fetch('http://localhost:3001/api/v1/enrollments/my-courses', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await res.json();
      if (res.ok) {
        setEnrollments(result.data);
      } else {
        setError(result.message || 'Không thể tải danh sách khóa học');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getToken, isLoaded]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  return { enrollments, loading, error, refresh: fetchEnrollments };
}
