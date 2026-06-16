'use client';

import { API_BASE } from '@/constants/api';
import { useEffect, useState } from 'react';
import { useSession, useClerk } from '@clerk/nextjs';

type AccessStatus = {
  status: 'ACTIVE' | 'BANNED' | 'SUSPENDED' | string;
  banReason: string | null;
  bannedAt: string | null;
};

export default function AccessRestrictedPage() {
  const { session, isLoaded } = useSession();
  const { signOut } = useClerk();
  const [data, setData] = useState<AccessStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const handleSignOutToHome = async () => {
    await signOut({ redirectUrl: '/' });
  };

  const handleSignOutToSignIn = async () => {
    await signOut({ redirectUrl: '/sign-in' });
  };

  useEffect(() => {
    const load = async () => {
      if (!isLoaded) return;
      if (!session) {
        setLoading(false);
        setError('Bạn chưa đăng nhập.');
        return;
      }

      try {
        const token = await session.getToken();
        const res = await fetch(`${API_BASE}/auth/access-status`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Không thể lấy trạng thái truy cập');
        if (json.data?.status === 'ACTIVE') {
          window.location.href = '/dashboard';
          return;
        }
        setData(json.data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isLoaded, session]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
        <p className="inline-block bg-red-400 text-black font-black uppercase tracking-widest px-3 py-1 border-2 border-black mb-4">
          Truy cập bị hạn chế
        </p>
        <h1 className="text-3xl font-black text-black uppercase mb-3">
          Tài khoản của bạn đã bị cấm truy cập
        </h1>

        {loading ? (
          <p className="text-sm font-bold text-gray-900">Đang tải thông tin...</p>
        ) : error ? (
          <p className="text-sm font-bold text-black bg-red-100 border-2 border-black p-3">{error}</p>
        ) : (
          <div className="space-y-4">
            <div className="bg-red-100 border-2 border-black p-4">
              <p className="text-[11px] font-black uppercase tracking-widest text-black mb-2">Lý do vi phạm</p>
              <p className="text-sm font-bold text-black">{data?.banReason || 'Không có ghi chú từ quản trị viên.'}</p>
            </div>
            <p className="text-xs font-black uppercase tracking-wider text-gray-700">
              Trạng thái: {data?.status}
              {data?.bannedAt ? ` • Thời điểm khóa: ${new Date(data.bannedAt).toLocaleString('vi-VN')}` : ''}
            </p>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleSignOutToHome}
            className="px-4 py-2 bg-black text-white border-2 border-black font-black uppercase tracking-widest"
          >
            Đăng xuất
          </button>
          <button
            onClick={handleSignOutToSignIn}
            className="px-4 py-2 bg-white text-black border-2 border-black font-black uppercase tracking-widest"
          >
            Đăng nhập tài khoản khác
          </button>
        </div>
      </div>
    </div>
  );
}
