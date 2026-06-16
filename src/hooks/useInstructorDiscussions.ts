'use client';

import { API_BASE } from '@/constants/api';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Discussion } from './useDiscussions';


export function useInstructorDiscussions(lessonId?: number) {
  const { getToken } = useAuth();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [statusFilter, setStatusFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [repliedFilter, setRepliedFilter] = useState<'all' | 'yes' | 'no'>('all');

  const fetchDiscussions = useCallback(async (
    page: number = 1,
    status: 'all' | 'read' | 'unread' = statusFilter,
    replied: 'all' | 'yes' | 'no' = repliedFilter
  ) => {
    setLoading(true);
    try {
      const token = await getToken();
      if (lessonId) {
        const res = await fetch(`${API_BASE}/discussions/lesson/${lessonId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const json = await res.json();
          const actualData = json.data ?? json ?? [];
          setDiscussions(actualData);
          setMeta({ total: actualData.length, page: 1, limit: 20, totalPages: 1 });
        }
      } else {
        const res = await fetch(
          `${API_BASE}/discussions/instructor?page=${page}&limit=20&status=${status}&replied=${replied}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          const json = await res.json();
          const actualData = json.data?.data || json.data || [];
          const actualMeta = json.data?.meta || json.meta || { total: 0, page: 1, limit: 20, totalPages: 1 };
          
          setDiscussions(actualData);
          setMeta(actualMeta);
        }
      }
    } catch (err) {
      console.error('Error fetching instructor discussions:', err);
    } finally {
      setLoading(false);
    }
  }, [getToken, statusFilter, repliedFilter, lessonId]);

  useEffect(() => {
    if (lessonId !== undefined) {
      if (lessonId) {
        fetchDiscussions(1);
      } else {
        setDiscussions([]);
      }
    } else {
      fetchDiscussions(1);
    }
  }, [lessonId, fetchDiscussions]);

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
    // Optimistic Update
    const toggleBestAnswerInTree = (nodes: Discussion[]): Discussion[] => {
      return nodes.map(node => {
        if (node.id === id) {
          return { ...node, is_best_answer: !node.is_best_answer };
        }
        if (node.children) {
          return { ...node, children: toggleBestAnswerInTree(node.children) };
        }
        return node;
      });
    };
    setDiscussions(prev => toggleBestAnswerInTree(prev));

    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/discussions/${id}/best-answer`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchDiscussions(meta.page);
        return true;
      } else {
        await fetchDiscussions(meta.page); // Rollback
      }
    } catch (err) {
      console.error('Error marking best answer:', err);
      await fetchDiscussions(meta.page); // Rollback
    }
  };

  const voteDiscussion = async (id: number, value: number) => {
    // Optimistic Update
    const updateTree = (nodes: Discussion[]): Discussion[] => {
      return nodes.map(node => {
        if (node.id === id) {
          const oldVote = node.userVote;
          let newUpvotes = node.upvotes;
          let newDownvotes = node.downvotes;

          if (oldVote === 1) newUpvotes -= 1;
          if (oldVote === -1) newDownvotes -= 1;
          
          if (value === 1) newUpvotes += 1;
          if (value === -1) newDownvotes += 1;

          return { ...node, userVote: value, upvotes: Math.max(0, newUpvotes), downvotes: Math.max(0, newDownvotes) };
        }
        if (node.children) {
          return { ...node, children: updateTree(node.children) };
        }
        return node;
      });
    };
    setDiscussions(prev => updateTree(prev));

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
      } else {
        await fetchDiscussions(meta.page); // Rollback
      }
    } catch (err) {
      console.error('Error voting:', err);
      await fetchDiscussions(meta.page); // Rollback
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

  const markAsRead = async (id: number) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/discussions/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchDiscussions(meta.page);
        return true;
      }
    } catch (err) {
      console.error('Error marking discussion as read:', err);
    }
  };

  const markLessonAsRead = async (lessonId: number) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/discussions/lesson/${lessonId}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchDiscussions(meta.page);
        return true;
      }
    } catch (err) {
      console.error('Error marking lesson as read:', err);
    }
  };

  return {
    discussions,
    loading,
    meta,
    statusFilter,
    setStatusFilter,
    repliedFilter,
    setRepliedFilter,
    fetchDiscussions,
    addReply,
    markBestAnswer,
    voteDiscussion,
    deleteDiscussion,
    updateDiscussion,
    markAsRead,
    markLessonAsRead,
  };
}
