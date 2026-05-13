'use client';

import { useState, useEffect } from 'react';

export interface CourseInstructor {
  id: number;
  fullName: string | null;
  avatarUrl: string | null;
}

export interface CourseCategory {
  id: number;
  name: string;
  slug: string;
}

export interface Course {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  thumbnailUrl: string | null;
  price: number;
  originalPrice: number | null;
  language: string;
  level: string;
  status: string;
  totalDuration: number;
  lessonCount: number;
  sectionCount: number;
  studentCount: number;
  avgRating: number;
  reviewCount: number;
  publishedAt: string | null;
  createdAt: string;
  instructor: CourseInstructor;
  category: CourseCategory;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UseCoursesReturn {
  courses: Course[];
  meta: PaginationMeta | null;
  loading: boolean;
  error: string | null;
}

export interface CourseFilters {
  categorySlug?: string;
  search?: string;
  level?: string;
  page?: number;
  limit?: number;
  sortBy?: 'publishedAt' | 'avgRating' | 'studentCount';
  sortOrder?: 'ASC' | 'DESC';
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export function useCourses(filters: CourseFilters = {}): UseCoursesReturn {
  const [courses, setCourses] = useState<Course[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setTimeout(() => {
      setLoading(true);
      setError(null);
    }, 0);

    // Build query string từ filters
    const params = new URLSearchParams();
    if (filters.categorySlug) params.set('categorySlug', filters.categorySlug);
    if (filters.search) params.set('search', filters.search);
    if (filters.level) params.set('level', filters.level);
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);

    fetch(`${API_BASE}/courses?${params.toString()}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        // TransformInterceptor wrap trong { data: { data: [...], meta: {...} } }
        const payload = json?.data ?? json;
        const items: Course[] = payload?.data ?? payload;
        const metaInfo: PaginationMeta | null = payload?.meta ?? null;

        setCourses(Array.isArray(items) ? items : []);
        setMeta(metaInfo);
        setLoading(false);
      })
      .catch((err: Error) => {
        if (err.name === 'AbortError') return;
        setError(err.message);
        setLoading(false);
      });

    return () => controller.abort();
   
  }, [
    filters.categorySlug,
    filters.search,
    filters.level,
    filters.page,
    filters.limit,
    filters.sortBy,
    filters.sortOrder,
  ]);

  return { courses, meta, loading, error };
}
