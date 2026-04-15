import { useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';

export function useAdminCourses() {
  const { getToken } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCourses = useCallback(async ({ page = 1, limit = 10, status = '' }) => {
    setLoading(true);
    setError('');
    try {
      const token = await getToken();
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (status) params.append('status', status);

      const res = await fetch(`http://localhost:3001/api/v1/admin/courses?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const d = data.data || data;
        setCourses(d.data || d);
        setTotal(d.meta?.total || 0);
      } else {
        const err = await res.json();
        setError(err.message || 'Lỗi lấy danh sách khóa học');
      }
    } catch {
      setError('Lỗi kết nối Server');
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  const approveCourse = async (id: number) => {
    const token = await getToken();
    const res = await fetch(`http://localhost:3001/api/v1/admin/courses/${id}/approve`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Lỗi khi duyệt khóa học');
    }
  };

  const rejectCourse = async (id: number, reason: string) => {
    const token = await getToken();
    const res = await fetch(`http://localhost:3001/api/v1/admin/courses/${id}/reject`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reason })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Lỗi khi từ chối khóa học');
    }
  };

  return { courses, total, loading, error, fetchCourses, approveCourse, rejectCourse };
}
