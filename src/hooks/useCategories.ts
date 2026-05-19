'use client';

import { useState, useEffect } from 'react';
import { API_V1 } from '@/constants/api';

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

// Cache đơn giản tránh fetch lại mỗi lần mount
let cachedCategories: Category[] | null = null;

export function useCategories(): UseCategoriesReturn {
  const REQUEST_TIMEOUT_MS = 10000;
  const RETRY_DELAY_MS = 1200;
  const [categories, setCategories] = useState<Category[]>(cachedCategories ?? []);
  const [loading, setLoading] = useState<boolean>(!cachedCategories);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cachedCategories) return;

    const controller = new AbortController();
    setTimeout(() => {
      setLoading(true);
    }, 0);

    const fetchWithRetry = async (retries = 1): Promise<Response> => {
      let lastError: unknown = null;

      for (let attempt = 0; attempt <= retries; attempt += 1) {
        if (controller.signal.aborted) {
          throw new DOMException('Request aborted', 'AbortError');
        }

        const timeoutController = new AbortController();
        const timeoutId = setTimeout(() => timeoutController.abort(), REQUEST_TIMEOUT_MS);
        const abortBridge = () => timeoutController.abort();
        controller.signal.addEventListener('abort', abortBridge);

        try {
          return await fetch(`${API_V1}/categories`, { signal: timeoutController.signal });
        } catch (err) {
          if (controller.signal.aborted) throw err;
          lastError = err;

          if (attempt < retries) {
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
          }
        } finally {
          clearTimeout(timeoutId);
          controller.signal.removeEventListener('abort', abortBridge);
        }
      }

      throw lastError ?? new Error('Failed to fetch categories');
    };

    fetchWithRetry(1)
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
