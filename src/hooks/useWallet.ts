'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from '@clerk/nextjs';

export interface Wallet {
  id: number;
  user_id: number;
  balance_pending: number;
  balance_available: number;
  total_earned: number;
  updated_at: string;
}

export interface Transaction {
  id: number;
  wallet_id: number;
  order_item_id: number | null;
  transaction_type: string;
  amount: number;
  status: string;
  locked_until: string | null;
  released_at: string | null;
  balance_after: number;
  created_at: string;
  order_item?: {
    course?: {
      title: string;
    };
    order?: {
      order_number: string;
      student?: {
        full_name: string;
        email: string;
      };
    };
  };
}

export interface Payout {
  id: number;
  instructorId: number;
  amount: number;
  bankAccountName: string;
  bankAccountNumber: string;
  bankName: string;
  status: string;
  adminNote: string | null;
  requestedAt: string;
  processedAt: string | null;
  instructor?: {
    fullName: string;
    email: string;
  };
}

export function useWallet() {
  const { session } = useSession();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWallet = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const token = await session.getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wallets/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Không thể lấy thông tin ví');
      const json = await res.json();
      setWallet(json.data || json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [session]);

  const fetchTransactions = useCallback(async () => {
    if (!session) return;
    try {
      const token = await session.getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wallets/me/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Không thể lấy lịch sử giao dịch');
      const json = await res.json();
      setTransactions(json.data || json);
    } catch (err: any) {
      setError(err.message);
    }
  }, [session]);

  const fetchMyPayouts = useCallback(async () => {
    if (!session) return;
    try {
      const token = await session.getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wallets/me/payouts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Không thể lấy danh sách yêu cầu rút tiền');
      const json = await res.json();
      setPayouts(json.data || json);
    } catch (err: any) {
      setError(err.message);
    }
  }, [session]);

  const requestPayout = async (data: {
    amount: number;
    bankAccountName: string;
    bankAccountNumber: string;
    bankName: string;
  }) => {
    if (!session) return;
    const token = await session.getToken();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wallets/payout-request`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.message || 'Lỗi gửi yêu cầu rút tiền');
    }
    await fetchWallet();
    await fetchMyPayouts();
    return true;
  };

  const fetchAllPayouts = useCallback(async (status?: string) => {
    if (!session) return;
    setLoading(true);
    try {
      const token = await session.getToken();
      const url = `${process.env.NEXT_PUBLIC_API_URL}/wallets/payouts${status ? `?status=${status}` : ''}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Không thể lấy danh sách yêu cầu rút tiền');
      const json = await res.json();
      setPayouts(json.data || json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [session]);

  const processPayout = async (id: number, status: string, adminNote?: string) => {
    if (!session) return;
    const token = await session.getToken();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wallets/payouts/${id}/process`, {
      method: 'PATCH',
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
    return true;
  };

  const exportPayouts = async (ids: number[]) => {
    if (!session) return;
    const token = await session.getToken();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wallets/payouts/export`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids }),
    });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.message || 'Lỗi xuất file');
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studymate_payouts_${Date.now()}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const reconcilePayouts = async (file: File) => {
    if (!session) return;
    const token = await session.getToken();
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wallets/payouts/reconcile`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.message || 'Lỗi đối soát');
    }
    return res.json();
  };

  return {
    wallet,
    transactions,
    payouts,
    loading,
    error,
    fetchWallet,
    fetchTransactions,
    fetchMyPayouts,
    requestPayout,
    fetchAllPayouts,
    processPayout,
    exportPayouts,
    reconcilePayouts,
  };
}
