'use client';

import { useState, useEffect } from 'react';
import { Course } from './useCourses';

export interface Lesson {
  id: number;
  title: string;
  durationSecs: number;
  isPreview: boolean;
  youtubeVideoId: string | null;
  position: number;
}

export interface Section {
  id: number;
  title: string;
  position: number;
  lessons: Lesson[];
}

export interface CourseDetail extends Course {
  sections: Section[];
}

interface UseCourseDetailReturn {
  course: CourseDetail | null;
  loading: boolean;
  error: string | null;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export function useCourseDetail(slug: string): UseCourseDetailReturn {
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(true); // Vẫn ở trạng thái loading nếu chưa có slug
      return;
    }

    const controller = new AbortController();
    
    // Reset state về trang thái ban đầu mỗi khi slug thay đổi
    setLoading(true);
    setCourse(null);
    setError(null);

    fetch(`${API_BASE}/courses/${slug}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) throw new Error('NOT_FOUND');
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((json) => {
        const payload = json?.data ?? json;
        if (!payload) throw new Error('NOT_FOUND');
        setCourse(payload);
        setLoading(false);
      })
      .catch((err: Error) => {
        if (err.name === 'AbortError') return;
        setError(err.message);
        setLoading(false);
      });

    return () => controller.abort();
  }, [slug]);

  return { course, loading, error };
}
