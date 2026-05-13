'use client';

import { useState, useCallback } from 'react';
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
        profile?: {
          fullName: string;
        };
      };
    };
    commission_rate: number;
    platform_fee: number;
    instructor_amount: number;
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
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [session]);

  const [transactionMeta, setTransactionMeta] = useState({ total: 0, totalPages: 1, page: 1 });

  const fetchTransactions = useCallback(async (page: number = 1, limit: number = 10) => {
    if (!session) return;
    try {
      const token = await session.getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wallets/me/transactions?page=${page}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Không thể lấy lịch sử giao dịch');
      const json = await res.json();
      const content = json.data || json;
      
      const items = Array.isArray(content) ? content : (content.items || []);
      const total = content.total || items.length;
      const totalPages = content.totalPages || Math.ceil(total / limit);

      setTransactions(items);
      setTransactionMeta({ total, totalPages, page });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
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
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
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
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
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

  const exportPayoutsCsv = async (ids: number[]) => {
    if (!session) return;
    const token = await session.getToken();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wallets/payouts/export-csv`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids }),
    });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.message || 'Lỗi xuất file CSV');
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studymate_payouts_${Date.now()}.csv`;
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
    const json = await res.json();
    return json.data || json;
  };

  return {
    wallet,
    transactions,
    transactionMeta,
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
    exportPayoutsCsv,
    reconcilePayouts,
  };
}
