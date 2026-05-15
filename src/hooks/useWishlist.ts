'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Course } from './useCourses';
import toast from 'react-hot-toast';

export interface WishlistItem {
  id: number;
  courseId: number;
  course: Course;
  addedAt: string;
}

const DEFAULT_API_BASE = 'http://localhost:3001/api/v1';
const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_BASE).replace(/\/+$/, '');

export function useWishlist() {
  const { getToken, isLoaded } = useAuth();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWishlist = useCallback(async () => {
    const token = await getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE}/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) throw new Error('Lỗi tải danh sách yêu thích');
      
      const json = await res.json();
      setWishlist(json.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    if (isLoaded) {
      fetchWishlist();
    }
  }, [isLoaded, fetchWishlist]);

  const toggleWishlist = useCallback(async (courseId: number, status?: boolean) => {
    const token = await getToken();
    if (!token) {
      toast.error('Vui lòng đăng nhập để sử dụng tính năng này');
      return null;
    }

    try {
      const res = await fetch(`${API_BASE}/wishlist/${courseId}`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (!res.ok) throw new Error('Lỗi cập nhật danh sách yêu thích');
      
      const json = await res.json();
      
      // Refresh list if we are on the wishlist page
      fetchWishlist();
      
      // toast.success(json.message);
      return json.data.isInWishlist;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
      return null;
    }
  }, [getToken, fetchWishlist]);

  const checkInWishlist = useCallback(async (courseId: number) => {
    const token = await getToken();
    if (!token) return false;
    
    try {
      const res = await fetch(`${API_BASE}/wishlist/check/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) return false;
      const json = await res.json();
      return json.data.isInWishlist;
    } catch {
      return false;
    }
  }, [getToken]);

  return { 
    wishlist, 
    loading, 
    error, 
    toggleWishlist, 
    checkInWishlist, 
    refresh: fetchWishlist 
  };
}
