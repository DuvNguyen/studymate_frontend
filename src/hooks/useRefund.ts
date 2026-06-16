import { API_BASE } from '@/constants/api';
import { useState, useCallback } from 'react';
import { useSession } from '@clerk/nextjs';

export interface RefundRequest {
  id: number;
  enrollment_id: number;
  student_id: number;
  course_id: number;
  amount: number;
  reason: string;
  bank_name: string;
  bank_account_number: string;
  bank_account_name: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  admin_note: string | null;
  processed_at: string | null;
  processed_by_id?: number | null;
  created_at: string;
  student?: {
    full_name: string;
    email: string;
  };
  course?: {
    title: string;
  };
  enrollment?: {
    enrolled_at: string;
    progress_percent: number;
  };
  processed_by?: {
    id: number;
    full_name?: string;
    email?: string;
  };
}

export function useRefund() {
  const { session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);

  const fetchMyRefunds = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const token = await session.getToken();
      const res = await fetch(`${API_BASE}/refunds/my`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message || 'Lỗi tải dữ liệu hoàn tiền');
        return;
      }
      const data = json.data;
      setRefundRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('[useRefund] fetchMyRefunds error:', err);
      setError(err instanceof Error ? err.message : 'Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  }, [session]);

  const fetchAllRefundRequests = useCallback(async (
    status?: string,
    dateFrom?: string,
    dateTo?: string,
  ) => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const token = await session.getToken();
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);
      const query = params.toString();
      const url = `${API_BASE}/refunds/admin/all${query ? `?${query}` : ''}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message || 'Lỗi tải danh sách hoàn tiền');
        setRefundRequests([]);
        return;
      }
      const data = json.data;
      // Guard: chỉ set nếu là array, tránh crash [...refundRequests]
      setRefundRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('[useRefund] fetchAllRefundRequests error:', err);
      setError(err instanceof Error ? err.message : 'Lỗi kết nối');
      setRefundRequests([]);
    } finally {
      setLoading(false);
    }
  }, [session]);

  const requestRefund = async (data: {
    enrollmentId: number;
    reason: string;
    bankName: string;
    bankAccountNumber: string;
    bankAccountName: string;
  }) => {
    if (!session) return;
    setLoading(true);
    try {
      const token = await session.getToken();
      const res = await fetch(`${API_BASE}/refunds/request`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || 'Lỗi gửi yêu cầu hoàn tiền');
      }
      return await res.json();
    } finally {
      setLoading(false);
    }
  };

  const processRefund = async (id: number, status: string, adminNote?: string) => {
    if (!session) return;
    setLoading(true);
    try {
        const token = await session.getToken();
        const res = await fetch(`${API_BASE}/refunds/admin/${id}/process`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, adminNote }),
        });
        if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || 'Lỗi xử lý yêu cầu');
        }
        return await res.json();
    } finally {
        setLoading(false);
    }
  };

  return {
    loading,
    error,
    refundRequests,
    fetchMyRefunds,
    fetchAllRefundRequests,
    requestRefund,
    processRefund,
  };
}
