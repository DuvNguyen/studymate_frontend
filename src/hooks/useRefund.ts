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
}

export function useRefund() {
  const { session } = useSession();
  const [loading, setLoading] = useState(false);
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);

  const fetchMyRefunds = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const token = await session.getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/refunds/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setRefundRequests(json.data || json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [session]);

  const fetchAllRefundRequests = useCallback(async (status?: string) => {
    if (!session) return;
    setLoading(true);
    try {
      const token = await session.getToken();
      const url = `${process.env.NEXT_PUBLIC_API_URL}/refunds/admin/all${status ? `?status=${status}` : ''}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setRefundRequests(json.data || json);
    } catch (err) {
      console.error(err);
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
    const token = await session.getToken();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/refunds/request`, {
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
    return res.json();
  };

  const processRefund = async (id: number, status: string, adminNote?: string) => {
    if (!session) return;
    const token = await session.getToken();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/refunds/admin/${id}/process`, {
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
    return res.json();
  };

  return {
    loading,
    refundRequests,
    fetchMyRefunds,
    fetchAllRefundRequests,
    requestRefund,
    processRefund,
  };
}
