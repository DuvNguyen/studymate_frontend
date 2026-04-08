'use client';

import { useEffect, useState } from 'react';
import { useClerk } from '@clerk/nextjs';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import MainLayout from '../../../components/MainLayout';

export default function AdminKycPage() {
  const [kycs, setKycs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const { session } = useClerk();
  const { user: appUser, loading: appLoading } = useCurrentUser();

  const fetchPendingKycs = async () => {
    try {
      setLoading(true);
      const token = await session?.getToken();
      if (!token) return;

      const res = await fetch('http://localhost:3001/api/v1/users/kyc-pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setKycs(json.data);
      } else {
        setKycs([]);
      }
    } catch (err) {
      console.error(err);
      setKycs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchPendingKycs();
    }
  }, [session]);

  const handleAction = async (id: number, status: 'APPROVED' | 'REJECTED') => {
    let reason = '';
    if (status === 'REJECTED') {
      const input = window.prompt("Nhập lý do từ chối (bắt buộc):");
      if (!input) return; // Nếu user cancel hoặc bỏ trống thì hủy
      reason = input;
    } else {
      const confirm = window.confirm("Xác nhận phê duyệt KYC cho Giảng viên này?");
      if (!confirm) return;
    }

    try {
      setActionLoading(id);
      const token = await session?.getToken();
      const res = await fetch(`http://localhost:3001/api/v1/users/${id}/kyc-status`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ status, reason })
      });

      if (res.ok) {
        alert(status === 'APPROVED' ? 'Đã duyệt KYC thành công!' : 'Đã từ chối KYC.');
        fetchPendingKycs();
      } else {
        const err = await res.json();
        alert(err.message || 'Có lỗi xảy ra.');
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi kết nối.');
    } finally {
      setActionLoading(null);
    }
  };

  if (appLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-none animate-spin mx-auto mb-3" />
          <p className="text-xs font-black uppercase tracking-widest text-gray-500">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <MainLayout role={appUser?.role}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Quản lý</p>
          <h1 className="text-2xl font-black text-gray-900 uppercase">Duyệt KYC Giảng Viên</h1>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-40 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-none animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {kycs.map((u) => (
              <div key={u.id} className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <h3 className="text-xl font-black text-gray-900 flex items-center gap-3 mb-1">
                    {u.fullName || u.email}
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-900">
                      Chờ duyệt
                    </span>
                  </h3>
                  <p className="text-sm font-medium text-gray-500 mb-4">{u.email}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-gray-50 p-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">Ngân hàng</span>
                      <strong className="text-sm font-black text-gray-900">{u.instructorProfile?.bankName || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">Tài liệu đính kèm</span>
                      <strong className="text-sm font-black text-gray-900">{u.instructorProfile?.documents?.length || 0} files</strong>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center gap-3 w-full md:w-40 border-t-2 border-black md:border-t-0 md:border-l-2 md:pl-6 pt-4 md:pt-0">
                  <button 
                    onClick={() => handleAction(u.id, 'APPROVED')}
                    disabled={actionLoading === u.id}
                    className="w-full inline-flex items-center justify-center font-black uppercase tracking-wider text-xs px-4 py-3 transition-colors border-2 border-black bg-emerald-400 text-black hover:bg-emerald-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading === u.id ? '...' : 'Phê Duyệt'}
                  </button>
                  <button 
                    onClick={() => handleAction(u.id, 'REJECTED')}
                    disabled={actionLoading === u.id}
                    className="w-full inline-flex items-center justify-center font-black uppercase tracking-wider text-xs px-4 py-3 transition-colors border-2 border-black bg-red-400 text-black hover:bg-red-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading === u.id ? '...' : 'Từ chối'}
                  </button>
                </div>
              </div>
            ))}

            {kycs.length === 0 && (
              <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-12 text-center">
                <p className="text-sm font-black uppercase tracking-widest text-gray-500">
                  Không có yêu cầu KYC nào đang chờ duyệt.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
