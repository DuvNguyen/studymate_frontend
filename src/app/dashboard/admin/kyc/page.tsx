'use client';

import { useEffect, useState } from 'react';
import { useClerk } from '@clerk/nextjs';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import MainLayout from '@/components/MainLayout';

export default function AdminKycPage() {
  const [kycs, setKycs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
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
              <div key={u.id} className="relative z-0">
                <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 flex flex-col md:flex-row gap-6 relative z-10 transition-all">
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

                    <button 
                      onClick={() => setExpandedId(expandedId === u.id ? null : u.id)} 
                      className="font-black uppercase tracking-wider text-[10px] px-3 py-2 border-2 border-black bg-black text-white hover:bg-gray-800 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:translate-x-[1px] active:shadow-none"
                    >
                      {expandedId === u.id ? 'Ẩn hồ sơ ∧' : 'Xem hồ sơ đầy đủ ∨'}
                    </button>
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

                {expandedId === u.id && (
                  <div className="bg-white border-x-2 border-b-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 pt-8 mt-[-10px] grid grid-cols-1 md:grid-cols-2 gap-8 relative z-0 animate-in slide-in-from-top-2 fade-in duration-200">
                    <div>
                      <h4 className="font-black text-xs uppercase tracking-widest mb-3 border-b-2 border-black pb-2 inline-block text-black">Thông tin Thanh toán</h4>
                      <ul className="text-sm space-y-3 font-medium">
                        <li>
                          <span className="text-gray-700 font-bold uppercase tracking-wider text-[10px] block mb-0.5">Ngân hàng</span> 
                          <strong className="text-black font-black text-base">{u.instructorProfile?.bankName}</strong>
                        </li>
                        <li>
                          <span className="text-gray-700 font-bold uppercase tracking-wider text-[10px] block mb-0.5">Chủ thẻ</span> 
                          <strong className="uppercase text-black font-black text-base">{u.instructorProfile?.bankAccountName}</strong>
                        </li>
                        <li>
                          <span className="text-gray-700 font-bold uppercase tracking-wider text-[10px] block mb-0.5">Số TK</span> 
                          <strong className="font-mono text-lg bg-yellow-200 text-black px-2 py-0.5 border-2 border-black font-black">{u.instructorProfile?.bankAccountNumber}</strong>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-black text-xs uppercase tracking-widest mb-3 border-b-2 border-black pb-2 inline-block text-black">Danh hiệu nổi bật</h4>
                      {u.instructorProfile?.certificates?.length > 0 ? (
                        <ul className="text-sm list-disc pl-4 space-y-2 font-bold text-black bg-gray-50 border-2 border-black p-4">
                          {u.instructorProfile.certificates.map((c: string, idx: number) => <li key={idx} className="ml-2">{c}</li>)}
                        </ul>
                      ) : <span className="text-xs text-gray-700 font-bold italic">Chưa cập nhật</span>}
                    </div>

                    <div className="md:col-span-2">
                      <h4 className="font-black text-xs uppercase tracking-widest mb-3 text-black">Tài liệu định danh (CMND/CCCD)</h4>
                      {u.instructorProfile?.idCardUrl ? (
                        <a href={u.instructorProfile.idCardUrl} target="_blank" rel="noreferrer" className="inline-block border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform bg-white/50 p-2">
                          <img src={u.instructorProfile.idCardUrl} alt="ID Card" className="h-64 w-auto object-contain border border-gray-200" />
                        </a>
                      ) : <span className="text-xs text-gray-700 font-bold italic bg-gray-100 px-2 py-1 border border-dashed border-gray-400">Không có ảnh định danh</span>}
                    </div>

                    <div className="md:col-span-2">
                      <h4 className="font-black text-xs uppercase tracking-widest mb-3 text-black">Văn bằng & Chứng chỉ đính kèm</h4>
                      <div className="flex flex-wrap gap-5">
                        {u.instructorProfile?.documents?.length > 0 ? (
                          u.instructorProfile.documents.map((doc: any, j: number) => (
                            <div key={j} className="border-2 border-black p-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full md:w-auto">
                              <p className="text-[10px] font-black uppercase text-white bg-black inline-block px-2 py-0.5 mb-2">{doc.documentType}</p>
                              <p className="text-base font-black mb-3 text-black border-dashed border-b border-gray-400 pb-1">{doc.title}</p>
                              {doc.fileUrl ? (
                                <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="block border-2 border-black hover:-translate-y-1 transition-transform cursor-zoom-in bg-gray-50 p-1">
                                  <img src={doc.fileUrl} alt={doc.title} className="h-40 w-auto object-cover" />
                                </a>
                              ) : <span className="text-xs italic text-gray-700">Chưa upload file</span>}
                            </div>
                          ))
                        ) : <span className="text-xs text-gray-700 font-bold italic bg-gray-100 px-2 py-1 border border-dashed border-gray-400">Không có bằng cấp đính kèm</span>}
                      </div>
                    </div>
                  </div>
                )}
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
