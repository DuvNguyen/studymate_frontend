'use client';

import { useState, useCallback } from 'react';
import { useSession } from '@clerk/nextjs';

export interface Review {
  id: number;
  userId: number;
  course_id: number;
  rating: number;
  comment: string | null;
  isPublished: boolean;
  createdAt: string;
  user?: {
    profile?: {
      fullName?: string;
      avatarUrl?: string;
    };
    email?: string;
  };
}

export function useReviews(courseId?: number) {
  const { session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = useCallback(async (id?: number) => {
    const targetId = id ?? courseId;
    if (!targetId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/reviews/course/${targetId}`
      );
      if (!res.ok) throw new Error('Failed to fetch reviews');
      const json = await res.json();
      setReviews(json.data || json);
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  const submitReview = useCallback(async (data: {
    courseId: number;
    rating: number;
    comment?: string;
  }) => {
    if (!session) throw new Error('Bạn cần đăng nhập để đánh giá');
    setSubmitting(true);
    try {
      const token = await session.getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/reviews`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Lỗi gửi đánh giá');
      // Refresh reviews
      await fetchReviews(data.courseId);
      return json.data || json;
    } finally {
      setSubmitting(false);
    }
  }, [session, fetchReviews]);

  return { reviews, loading, submitting, fetchReviews, submitReview };
}
