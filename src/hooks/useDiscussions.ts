'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';

export interface UserMini {
  id: number;
  fullName: string;
  avatarUrl: string;
  role?: { roleName: string };
  is_deleted: boolean;
}

export interface Discussion {
  id: number;
  course_id: number;
  lesson_id: number;
  content: string;
  is_best_answer: boolean;
  is_edited: boolean;
  is_deleted: boolean;
  parent_id: number | null;
  user: UserMini;
  created_at: string;
  updated_at: string;
  children: Discussion[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export function useDiscussions(lessonId?: number) {
  const { getToken } = useAuth();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const fetchDiscussions = useCallback(async () => {
    if (!lessonId) return;
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/discussions/lesson/${lessonId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setDiscussions((json.data ?? json) as Discussion[]);
      }
    } catch (err) {
      console.error('Error fetching discussions:', err);
    } finally {
      setLoading(false);
    }
  }, [lessonId, getToken]);

  useEffect(() => {
    if (lessonId) {
      fetchDiscussions();
    } else {
      setDiscussions([]);
    }
  }, [lessonId, fetchDiscussions]);

  const addDiscussion = async (courseId: number, content: string, parentId?: number) => {
    if (!lessonId) return;
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/discussions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ courseId, lessonId, content, parentId }),
      });
      if (res.ok) {
        await fetchDiscussions(); // Refresh the tree
        return true;
      } else {
        const errJson = await res.json();
        throw new Error(errJson.message || 'Lỗi khi gửi thảo luận');
      }
    } catch (err) {
      console.error('Error adding discussion:', err);
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
        await fetchDiscussions();
        return true;
      }
    } catch (err) {
      console.error('Error marking best answer:', err);
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
        await fetchDiscussions();
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
        await fetchDiscussions();
        return true;
      }
    } catch (err) {
      console.error('Error updating discussion:', err);
    }
  };

  const searchDiscussions = async (courseId: number, keyword: string) => {
    setIsSearching(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/discussions/course/${courseId}/search?q=${encodeURIComponent(keyword)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        return (json.data ?? json) as Discussion[];
      }
    } catch (err) {
      console.error('Error searching discussions:', err);
    } finally {
      setIsSearching(false);
    }
    return [];
  };

  return { 
    discussions, 
    loading, 
    addDiscussion, 
    markBestAnswer, 
    deleteDiscussion,
    updateDiscussion,
    searchDiscussions, 
    isSearching,
    refreshDiscussions: fetchDiscussions 
  };
}
