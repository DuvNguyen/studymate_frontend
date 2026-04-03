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
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <MainLayout role={appUser?.role}>
      <div className="p-8 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Duyệt KYC Giảng Viên</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {kycs.map((u) => (
              <div key={u.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    {u.fullName || u.email}
                    <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full font-semibold">Chờ duyệt</span>
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">{u.email}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <span className="text-gray-500 block mb-1">Ngân hàng</span>
                      <strong className="text-gray-900">{u.instructorProfile?.bankName || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-1">Tài liệu đính kèm</span>
                      <strong className="text-gray-900">{u.instructorProfile?.documents?.length || 0} files files</strong>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center gap-3 w-full md:w-32">
                  <button 
                    onClick={() => handleAction(u.id, 'APPROVED')}
                    disabled={actionLoading === u.id}
                    className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-sm transition-colors text-sm disabled:opacity-50"
                  >
                    {actionLoading === u.id ? '...' : 'Phê Duyệt'}
                  </button>
                  <button 
                    onClick={() => handleAction(u.id, 'REJECTED')}
                    disabled={actionLoading === u.id}
                    className="w-full py-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-lg transition-colors text-sm disabled:opacity-50"
                  >
                    {actionLoading === u.id ? '...' : 'Từ chối'}
                  </button>
                </div>
              </div>
            ))}

            {kycs.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-500">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Không có yêu cầu KYC nào đang chờ duyệt.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </MainLayout>
  );
}
