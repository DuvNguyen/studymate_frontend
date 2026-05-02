'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Discussion } from './useDiscussions';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export function useInstructorDiscussions() {
  const { getToken } = useAuth();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });

  const fetchDiscussions = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/discussions/instructor?page=${page}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        // Backend TransformInterceptor wraps paginated responses in data.data
        const actualData = json.data?.data || json.data || [];
        const actualMeta = json.data?.meta || json.meta || meta;
        
        setDiscussions(actualData);
        setMeta(actualMeta);
      }
    } catch (err) {
      console.error('Error fetching instructor discussions:', err);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchDiscussions();
  }, [fetchDiscussions]);

  const addReply = async (courseId: number, lessonId: number, parentId: number, content: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/discussions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ courseId, lessonId, parentId, content }),
      });
      if (res.ok) {
        await fetchDiscussions(meta.page);
        return true;
      } else {
        const errJson = await res.json();
        throw new Error(errJson.message || 'Lỗi khi gửi phản hồi');
      }
    } catch (err) {
      console.error('Error adding reply:', err);
      throw err;
    }
  };

  const markBestAnswer = async (id: number) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/discussions/${id}/best-answer`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchDiscussions(meta.page);
        return true;
      }
    } catch (err) {
      console.error('Error marking best answer:', err);
    }
  };

  const voteDiscussion = async (id: number, value: number) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/discussions/${id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ value }),
      });
      if (res.ok) {
        await fetchDiscussions(meta.page);
        return true;
      }
    } catch (err) {
      console.error('Error voting:', err);
    }
  };

  const deleteDiscussion = async (id: number) => {
    if (!confirm('BẠN CÓ CHẮC CHẮN MUỐN XÓA THẢO LUẬN NÀY?')) return;
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/discussions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchDiscussions(meta.page);
        return true;
      }
    } catch (err) {
      console.error('Error deleting discussion:', err);
    }
  };

  const updateDiscussion = async (id: number, content: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/discussions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        await fetchDiscussions(meta.page);
        return true;
      }
    } catch (err) {
      console.error('Error updating discussion:', err);
    }
  };

  return {
    discussions,
    loading,
    meta,
    fetchDiscussions,
    addReply,
    markBestAnswer,
    voteDiscussion,
    deleteDiscussion,
    updateDiscussion,
  };
}
