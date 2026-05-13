'use client';

import { useState, useEffect } from 'react';

export interface SubCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  iconUrl: string | null;
  sortOrder: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  iconUrl: string | null;
  sortOrder: number;
  children: SubCategory[];
}

interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

// Cache đơn giản tránh fetch lại mỗi lần mount
let cachedCategories: Category[] | null = null;

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>(cachedCategories ?? []);
  const [loading, setLoading] = useState<boolean>(!cachedCategories);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cachedCategories) return;

    const controller = new AbortController();
    setTimeout(() => {
      setLoading(true);
    }, 0);

    fetch(`${API_BASE}/categories`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        // Transform interceptor của backend wrap trong { data: [...] }
        const data: Category[] = json?.data ?? json;
        cachedCategories = data;
        setCategories(data);
      })
      .catch((err: Error) => {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  return { categories, loading, error };
}
