'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from '@clerk/nextjs';
import { Course } from './useCourses';
import toast from 'react-hot-toast';

export interface WishlistItem {
  id: number;
  courseId: number;
  course: Course;
  addedAt: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export function useWishlist() {
  const { session, isLoaded } = useSession();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWishlist = useCallback(async () => {
    if (!session) {
      setLoading(false);
      return;
    }
    
    try {
      const token = await session.getToken();
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
  }, [session]);

  useEffect(() => {
    if (isLoaded && session) {
      fetchWishlist();
    } else if (isLoaded && !session) {
      setLoading(false);
    }
  }, [isLoaded, session, fetchWishlist]);

  const toggleWishlist = useCallback(async (courseId: number, status?: boolean) => {
    if (!session) {
      toast.error('Vui lòng đăng nhập để sử dụng tính năng này');
      return null;
    }

    try {
      const token = await session.getToken();
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
  }, [session, fetchWishlist]);

  const checkInWishlist = useCallback(async (courseId: number) => {
    if (!session) return false;
    
    try {
      const token = await session.getToken();
      const res = await fetch(`${API_BASE}/wishlist/check/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) return false;
      const json = await res.json();
      return json.data.isInWishlist;
    } catch {
      return false;
    }
  }, [session]);

  return { 
    wishlist, 
    loading, 
    error, 
    toggleWishlist, 
    checkInWishlist, 
    refresh: fetchWishlist 
  };
}
