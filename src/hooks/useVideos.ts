'use client';

import { useSession } from '@clerk/nextjs';
import { useState, useEffect } from 'react';

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
    } catch (err: any) {
      setError(err.message);
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = async () => {
    if (!session) return;
    try {
      setLoading(true);
      const token = await session.getToken();
      const res = await fetch(`${API_URL}/instructor`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Lỗi lấy danh sách video');
      const json = await res.json();
      setVideos(json.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && session) {
      fetchVideos();
    } else if (isLoaded && !session) {
      setLoading(false);
    }
  }, [isLoaded, session]);

  return { videos, loading, error, refetch: fetchVideos };
}

// ─── Hook: Staff/Admin lấy danh sách chờ duyệt ───
export function usePendingVideos() {
  const { session, isLoaded } = useSession();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = async () => {
    if (!session) return;
    try {
      setLoading(true);
      const token = await session.getToken();
      const res = await fetch(`${API_URL}/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Lỗi lấy danh sách chờ duyệt');
      const json = await res.json();
      setVideos(json.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && session) {
      fetchVideos();
    } else if (isLoaded && !session) {
      setLoading(false);
    }
  }, [isLoaded, session]);

  return { videos, loading, error, refetch: fetchVideos };
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
      const body: any = { status };
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
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setReviewing(false);
    }
  };

  return { review, reviewing, error };
}
