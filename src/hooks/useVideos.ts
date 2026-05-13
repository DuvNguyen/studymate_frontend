'use client';

import { useSession } from '@clerk/nextjs';
import { useState, useEffect, useCallback } from 'react';

export interface Video {
  id: number;
  youtubeVideoId: string | null;
  storageKey: string;
  cdnUrl: string | null;
  status: 'PROCESSING' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  durationSecs: number | null;
  title: string | null;
  definition: string | null;  
  rejectReason: string | null;
  fileSizeKb: number | null;
  uploadedAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface FetchVideosParams {
  page?: number;
  limit?: number;
  uploaderId?: number;
  id?: number;
  status?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL + '/videos';

// ─── Hook: Giảng viên upload video ───
export function useUploadVideo() {
  const { session } = useSession();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File, title?: string) => {
    if (!session) throw new Error('Chưa đăng nhập');
    setUploading(true);
    setError(null);
    try {
      const token = await session.getToken();
      const formData = new FormData();
      formData.append('file', file);
      if (title) formData.append('title', title);

      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || 'Lỗi upload video');
      }

      const json = await res.json();
      return json.data as Video;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading, error };
}

// ─── Hook: Lấy danh sách video của Giảng viên ───
export function useInstructorVideos() {
  const { session, isLoaded } = useSession();
  const [videos, setVideos] = useState<Video[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = useCallback(async (params: FetchVideosParams = {}) => {
    if (!session) return;
    try {
      setLoading(true);
      const token = await session.getToken();
      
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.set('page', params.page.toString());
      if (params.limit) queryParams.set('limit', params.limit.toString());
      if (params.status) queryParams.set('status', params.status);

      const res = await fetch(`${API_URL}/instructor?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Lỗi lấy danh sách video');
      const json = await res.json();
      const d = json.data || json;
      setVideos(d.data || []);
      setMeta(d.meta || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (isLoaded && session) {
      fetchVideos({ page: 1, limit: 5 });
    } else if (isLoaded && !session) {
      setLoading(false);
    }
  }, [isLoaded, session, fetchVideos]);

  return { videos, meta, loading, error, refetch: fetchVideos };
}

// ─── Hook: Staff/Admin lấy danh sách chờ duyệt ───
export function usePendingVideos() {
  const { session, isLoaded } = useSession();
  const [videos, setVideos] = useState<Video[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = useCallback(async (params: FetchVideosParams = {}) => {
    if (!session) return;
    try {
      setLoading(true);
      const token = await session.getToken();
      
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.set('page', params.page.toString());
      if (params.limit) queryParams.set('limit', params.limit.toString());
      if (params.uploaderId) queryParams.set('uploaderId', params.uploaderId.toString());
      if (params.id) queryParams.set('id', params.id.toString());
      if (params.status) queryParams.set('status', params.status);

      const res = await fetch(`${API_URL}/pending?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Lỗi lấy danh sách chờ duyệt');
      const json = await res.json();
      const d = json.data || json;
      setVideos(d.data || []);
      setMeta(d.meta || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (isLoaded && session) {
      fetchVideos({ page: 1, limit: 5 });
    } else if (isLoaded && !session) {
      setLoading(false);
    }
  }, [isLoaded, session, fetchVideos]);

  return { videos, meta, loading, error, refetch: fetchVideos };
}

// ─── Hook: Staff/Admin duyệt video ───
export function useReviewVideo() {
  const { session } = useSession();
  const [reviewing, setReviewing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const review = async (id: number, status: 'APPROVED' | 'REJECTED', reason?: string) => {
    if (!session) throw new Error('Chưa đăng nhập');
    setReviewing(true);
    setError(null);
    try {
      const token = await session.getToken();
      const body: Record<string, string> = { status };
      if (reason) body.reason = reason;

      const res = await fetch(`${API_URL}/${id}/review`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || 'Lỗi duyệt video');
      }

      const json = await res.json();
      return json.data as Video;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      throw err;
    } finally {
      setReviewing(false);
    }
  };

  return { review, reviewing, error };
}

// ─── Hook: Xóa video (Giảng viên/Admin) ───
export function useDeleteVideo() {
  const { session } = useSession();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = async (id: number) => {
    if (!session) throw new Error('Chưa đăng nhập');
    setDeleting(true);
    setError(null);
    try {
      const token = await session.getToken();
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || 'Lỗi khi xóa video');
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      throw err;
    } finally {
      setDeleting(false);
    }
  };

  return { remove, deleting, error };
}
