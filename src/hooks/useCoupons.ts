'use client';

import { useState, useCallback } from 'react';
import { useSession } from '@clerk/nextjs';

export interface Coupon {
  id: number;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount: number | null;
  startDate: string | null;
  endDate: string | null;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface CouponValidation {
  coupon: Coupon;
  discountAmount: number;
}

export function useCoupons() {
  const { session } = useSession();
  const [validating, setValidating] = useState(false);
  const [creating, setCreating] = useState(false);
  const [myCoupons, setMyCoupons] = useState<Coupon[]>([]);

  const validateCoupon = useCallback(async (code: string, subtotal: number): Promise<CouponValidation> => {
    setValidating(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/coupons/validate?code=${encodeURIComponent(code)}&subtotal=${subtotal}`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Mã giảm giá không hợp lệ');
      return json.data || json;
    } finally {
      setValidating(false);
    }
  }, []);

  const fetchMyCoupons = useCallback(async () => {
    if (!session) return;
    const token = await session.getToken();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/coupons/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (res.ok) setMyCoupons(json.data || json);
  }, [session]);

  const createCoupon = useCallback(async (data: Partial<Coupon>) => {
    if (!session) throw new Error('Unauthorized');
    setCreating(true);
    try {
      const token = await session.getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/coupons`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Lỗi tạo mã giảm giá');
      await fetchMyCoupons();
      return json.data || json;
    } finally {
      setCreating(false);
    }
  }, [session, fetchMyCoupons]);

  return { validating, creating, myCoupons, validateCoupon, createCoupon, fetchMyCoupons };
}
