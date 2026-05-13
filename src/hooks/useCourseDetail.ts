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
  content: string | null;
}

export interface Quiz {
  id: number;
  title: string;
  description: string | null;
  passingScore: number;
  timeLimit: number;
  numQuestions: number;
  isFinal: boolean;
  sectionId: number | null;
}

export interface Section {
  id: number;
  title: string;
  position: number;
  lessons: Lesson[];
  quiz: Quiz | null;
}

export interface CourseDetail extends Course {
  sections: Section[];
  finalQuiz: Quiz | null;
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
      setTimeout(() => {
        setLoading(true); // Vẫn ở trạng thái loading nếu chưa có slug
      }, 0);
      return;
    }

    const controller = new AbortController();
    
    // Reset state về trang thái ban đầu mỗi khi slug thay đổi
    setTimeout(() => {
      setLoading(true);
      setCourse(null);
      setError(null);
    }, 0);

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
