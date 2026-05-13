'use client';

import { useState, useEffect } from 'react';

export interface InstructorPortfolio {
  id: number;
  fullName: string;
  avatarUrl: string | null;
  bio: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  certificates: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  courses: any[];
  totalCourses: number;
  createdAt: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export function useInstructorPortfolio(id: string | number, page: number = 1, limit: number = 6) {
  const [data, setData] = useState<InstructorPortfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    setTimeout(() => {
      setLoading(true);
    }, 0);
    fetch(`${API_BASE}/users/${id}/portfolio?page=${page}&limit=${limit}`)
      .then((res) => {
        if (!res.ok) throw new Error('Không thể tải thông tin giảng viên');
        return res.json();
      })
      .then((json) => {
        setData(json.data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id, page, limit]);

  return { data, loading, error };
}
