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
  const [activeTab, setActiveTab] = useState<'PENDING' | 'PENDING_UPDATE' | 'APPROVED' | 'REJECTED' | 'ALL'>('PENDING');
  const { session } = useClerk();
  const { user: appUser, loading: appLoading } = useCurrentUser();

  const fetchKycs = async () => {
    try {
      setLoading(true);
      const token = await session?.getToken();
      if (!token) return;

      const res = await fetch(`http://localhost:3001/api/v1/users/kyc-requests`, {
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
      fetchKycs();
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
        fetchKycs();
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
    <MainLayout role={appUser?.role} allowedRoles={['ADMIN', 'STAFF']}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 flex justify-between items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Quản lý</p>
            <h1 className="text-3xl font-black text-black uppercase tracking-tight leading-none">Duyệt KYC Giảng Viên</h1>
          </div>
          <button onClick={fetchKycs} className="font-black uppercase text-sm border-2 border-black px-4 py-2 hover:bg-gray-50 flex items-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-px active:translate-x-px active:shadow-none transition-all">
            Làm mới ↻
          </button>
        </div>

        <div className="grid grid-cols-5 gap-2 p-2 -m-2 overflow-visible w-full">
          {[
            { id: 'PENDING', label: 'DUYÊT MỚI' },
            { id: 'PENDING_UPDATE', label: 'CẬP NHẬT' },
            { id: 'APPROVED', label: 'ĐÃ DUYỆT' },
            { id: 'REJECTED', label: 'TỪ CHỐI' },
            { id: 'ALL', label: 'TẤT CẢ' }
          ].map(tab => {
            const count = tab.id === 'ALL' ? kycs.length : kycs.filter(u => u.instructorProfile?.kycStatus === tab.id).length;
            const hasUnread = count > 0 && activeTab !== tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`group relative w-full h-14 flex items-center justify-center px-1 font-black uppercase text-[10px] sm:text-xs border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-px hover:translate-x-px hover:shadow-none ${
                  activeTab === tab.id ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                <span className="text-center break-words leading-tight">{tab.label}</span>
                {hasUnread && (
                  <span className="absolute -top-2 -right-1 w-4 h-4 bg-red-600 border-2 border-black rounded-full shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] animate-bounce z-20" />
                )}
              </button>
            );
          })}
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-40 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-none animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {(() => {
              const filtered = kycs.filter(u => activeTab === 'ALL' || u.instructorProfile?.kycStatus === activeTab);
              
              if (filtered.length === 0) {
                const labelMap: Record<string, string> = {
                  'PENDING': 'đang chờ duyệt mới',
                  'PENDING_UPDATE': 'yêu cầu cập nhật',
                  'APPROVED': 'đã duyệt',
                  'REJECTED': 'bị từ chối',
                  'ALL': 'nào'
                };
                return (
                  <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-12 text-center">
                    <p className="text-sm font-black uppercase tracking-widest text-gray-400">
                      Không có bản ghi {labelMap[activeTab] || ''} nào.
                    </p>
                  </div>
                );
              }

              return filtered.map((u) => (
                <div key={u.id} className="relative z-0">
                  <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 flex flex-col md:flex-row gap-6 relative z-10 transition-all">
                    <div className="flex-1">
                      <h3 className="text-xl font-black text-gray-900 flex items-center gap-3 mb-1">
                        {u.fullName || u.email}
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                          u.instructorProfile?.kycStatus === 'PENDING' ? 'bg-amber-300 text-black' :
                          u.instructorProfile?.kycStatus === 'PENDING_UPDATE' ? 'bg-blue-300 text-black' :
                          u.instructorProfile?.kycStatus === 'APPROVED' ? 'bg-green-300 text-black' :
                          'bg-red-300 text-black'
                        }`}>
                          {u.instructorProfile?.kycStatus === 'PENDING' ? 'Duyệt Mới' :
                           u.instructorProfile?.kycStatus === 'PENDING_UPDATE' ? 'Cập Nhật' :
                           u.instructorProfile?.kycStatus === 'APPROVED' ? 'Đã Duyệt' :
                           'Từ Chối'}
                        </span>
                      </h3>
                      <p className="text-xs text-gray-500 font-bold mb-4">{u.email}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 border-2 border-black p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                          <p className="text-[10px] uppercase font-black text-gray-500 mb-2">Ngân Hàng</p>
                          <p className="text-sm font-black text-black">{u.instructorProfile?.bankName || 'N/A'}</p>
                        </div>
                        <div className="bg-gray-50 border-2 border-black p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                          <p className="text-[10px] uppercase font-black text-gray-500 mb-2">Tài liệu đính kèm</p>
                          <p className="text-sm font-black text-black">
                            {u.instructorDocuments?.length || 0} files
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 justify-center min-w-[140px]">
                      {u.instructorProfile?.kycStatus === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleAction(u.id, 'APPROVED')}
                            disabled={actionLoading === u.id}
                            className="bg-green-400 hover:bg-green-500 text-black border-2 border-black px-4 py-2 font-black text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-px hover:translate-x-px hover:shadow-none transition-all disabled:opacity-50"
                          >
                            {actionLoading === u.id ? '...' : 'Phê Duyệt'}
                          </button>
                          <button
                            onClick={() => handleAction(u.id, 'REJECTED')}
                            disabled={actionLoading === u.id}
                            className="bg-red-400 hover:bg-red-500 text-black border-2 border-black px-4 py-2 font-black text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-px hover:translate-x-px hover:shadow-none transition-all disabled:opacity-50"
                          >
                            {actionLoading === u.id ? '...' : 'Từ Chối'}
                          </button>
                        </>
                      )}

                      {u.instructorProfile?.kycStatus === 'PENDING_UPDATE' && (
                        <>
                          <button
                            onClick={() => handleAction(u.id, 'APPROVED')}
                            disabled={actionLoading === u.id}
                            className="bg-green-400 hover:bg-green-500 text-black border-2 border-black px-4 py-2 font-black text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-px hover:translate-x-px hover:shadow-none transition-all disabled:opacity-50"
                          >
                            {actionLoading === u.id ? '...' : 'Duyệt Cập Nhật'}
                          </button>
                          <button
                            onClick={() => handleAction(u.id, 'REJECTED')}
                            disabled={actionLoading === u.id}
                            className="bg-red-400 hover:bg-red-500 text-black border-2 border-black px-4 py-2 font-black text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-px hover:translate-x-px hover:shadow-none transition-all disabled:opacity-50"
                          >
                            {actionLoading === u.id ? '...' : 'Từ Chối Cập Nhật'}
                          </button>
                        </>
                      )}

                      {u.instructorProfile?.kycStatus === 'REJECTED' && (
                        <button
                          onClick={() => handleAction(u.id, 'APPROVED')}
                          disabled={actionLoading === u.id}
                          className="bg-black text-white border-2 border-black px-4 py-2 font-black text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-px hover:translate-x-px hover:shadow-none transition-all disabled:opacity-50"
                        >
                          {actionLoading === u.id ? '...' : 'Duyệt Lại'}
                        </button>
                      )}
                      
                      <button 
                        onClick={() => setExpandedId(expandedId === u.id ? null : u.id)}
                        className="bg-black text-white border-2 border-black px-4 py-2 font-black text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-px hover:translate-x-px hover:shadow-none transition-all whitespace-nowrap"
                      >
                        {expandedId === u.id ? 'Thu gọn ^' : 'Xem hồ sơ đầy đủ v'}
                      </button>
                    </div>
                  </div>

                  {/* Hiển thị lý do từ chối nếu có */}
                  {u.instructorProfile?.kycStatus === 'REJECTED' && u.instructorProfile?.rejectionReason && (
                     <div className="bg-red-50 border-x-2 border-b-2 border-black p-4 relative z-0 mt-[-2px] ml-6 mr-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                       <p className="text-[10px] uppercase font-black text-red-600">Lý do từ chối:</p>
                       <p className="text-sm font-black text-black">{u.instructorProfile.rejectionReason}</p>
                     </div>
                  )}

                  {expandedId === u.id && (
                    <div className="bg-white border-x-2 border-b-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 pt-8 mt-[-10px] grid grid-cols-1 md:grid-cols-2 gap-8 relative z-0 animate-in slide-in-from-top-2 fade-in duration-200">
                      {u.instructorProfile?.kycStatus === 'PENDING_UPDATE' && (
                        <div className="md:col-span-2 bg-blue-50 border-2 border-dashed border-blue-400 p-4 mb-4">
                          <p className="text-xs font-black text-blue-700 uppercase tracking-widest mb-1"> Đang xem dữ liệu yêu cầu cập nhật</p>
                          <p className="text-[10px] font-bold text-blue-600">Những thông tin dưới đây là dữ liệu mới do giảng viên vừa gửi lên.</p>
                        </div>
                      )}

                      {(() => {
                        const profile = u.instructorProfile;
                        if (!profile) return null;
                        const hasPending = profile?.kycStatus === 'PENDING_UPDATE' && profile?.pendingData;
                        const data = hasPending ? profile.pendingData : profile;

                        const isChanged = (key: string) => {
                          if (!hasPending) return true; 
                          const oldVal = (profile as any)?.[key];
                          const newVal = (data as any)?.[key];
                          return JSON.stringify(oldVal) !== JSON.stringify(newVal);
                        };

                        return (
                          <>
                            {/* Thông tin thanh toán */}
                            {(isChanged('bankName') || isChanged('bankAccountName') || isChanged('bankAccountNumber')) && (
                              <div className="space-y-4">
                                <h4 className="text-xs font-black uppercase tracking-widest border-b-2 border-black pb-2 mb-4">Thông tin thanh toán</h4>
                                <div className="grid grid-cols-1 gap-4">
                                  {isChanged('bankName') && (
                                    <div>
                                      <p className="text-[10px] uppercase font-black text-gray-500">Ngân hàng</p>
                                      <p className="text-sm font-black text-black">{data?.bankName || 'N/A'}</p>
                                    </div>
                                  )}
                                  {isChanged('bankAccountName') && (
                                    <div>
                                      <p className="text-[10px] uppercase font-black text-gray-500">Chủ thẻ</p>
                                      <p className="text-sm font-black text-black uppercase tracking-tight">{data?.bankAccountName || 'N/A'}</p>
                                    </div>
                                  )}
                                  {isChanged('bankAccountNumber') && (
                                    <div className="bg-amber-100 border-2 border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] inline-block">
                                      <p className="text-[10px] uppercase font-black text-gray-500">Số TK</p>
                                      <p className="text-base font-black text-black tracking-widest">{data?.bankAccountNumber || 'N/A'}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Danh hiệu nổi bật */}
                            {isChanged('certificates') && (
                              <div className="space-y-4">
                                <h4 className="text-xs font-black uppercase tracking-widest border-b-2 border-black pb-2 mb-4">Danh hiệu nổi bật</h4>
                                <div className="grid grid-cols-1 gap-4">
                                  {data?.certificates?.length > 0 ? (
                                    <div className="space-y-4">
                                      {data.certificates.map((c: any, idx: number) => {
                                        const title = typeof c === 'string' ? c : c.title;
                                        const fileUrl = typeof c === 'object' ? c?.fileUrl : null;
                                        const isPdf = fileUrl?.toLowerCase().endsWith('.pdf');

                                        return (
                                          <div key={idx} className="bg-white border-2 border-black p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                            <div className="flex justify-between items-start gap-2">
                                              <p className="text-sm font-black text-black">• {title}</p>
                                              {fileUrl ? (
                                                <a href={fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 group">
                                                  {isPdf ? (
                                                    <div className="flex items-center gap-1.5 bg-red-50 border border-black px-2 py-1 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                                                      <span className="text-red-600">
                                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                          <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                                                        </svg>
                                                      </span>
                                                      <span className="text-[10px] font-black text-black">XEM PDF</span>
                                                    </div>
                                                  ) : (
                                                    <div className="flex items-center gap-1.5 bg-blue-50 border border-black px-2 py-1 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                                                      <span className="text-blue-600">
                                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                                        </svg>
                                                      </span>
                                                      <span className="text-[10px] font-black text-black">XEM ẢNH</span>
                                                    </div>
                                                  )}
                                                </a>
                                              ) : (
                                                <span className="text-[10px] font-bold text-gray-400 italic">Không có tài liệu</span>
                                              )}
                                            </div>
                                            <p className="text-[9px] uppercase font-black text-gray-400 mt-1">Minh chứng đính kèm</p>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <p className="text-sm italic text-gray-400">Chưa cập nhật danh hiệu.</p>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Tài liệu định danh */}
                            {isChanged('idCardUrl') && (
                              <div className="md:col-span-2 space-y-4">
                                <h4 className="text-xs font-black uppercase tracking-widest border-b-2 border-black pb-2 mb-4">Tài liệu định danh (CMND/CCCD)</h4>
                                <div className="bg-white border-2 border-black p-4 inline-block shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                  {data?.idCardUrl ? (
                                    <a href={data.idCardUrl} target="_blank" rel="noreferrer" className="block hover:opacity-90 transition-opacity">
                                      <img src={data.idCardUrl} alt="ID Card" className="max-h-80 w-auto object-contain" />
                                    </a>
                                  ) : (
                                    <div className="h-40 w-80 bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                                      <p className="text-xs font-black text-gray-400 uppercase">Chưa có ảnh CCCD</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Portfolio Documents */}
                            {isChanged('documents') && (
                              <div className="md:col-span-2 space-y-4 pt-4">
                                <h4 className="text-xs font-black uppercase tracking-widest border-b-2 border-black pb-2 mb-4">Hồ sơ năng lực bổ sung</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                  {u.instructorDocuments?.length > 0 ? (
                                    u.instructorDocuments.map((doc: any) => (
                                      <div key={doc.id} className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group">
                                        <div className="flex justify-between items-start mb-3">
                                          <div>
                                            <span className="text-[9px] font-black uppercase bg-black text-white px-1.5 py-0.5">{doc.documentType}</span>
                                            <p className="text-sm font-black text-black mt-1 line-clamp-1">{doc.title}</p>
                                          </div>
                                        </div>
                                        {doc.fileUrl ? (
                                          <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="block relative overflow-hidden bg-gray-100 border border-black aspect-video flex items-center justify-center">
                                            {doc.fileUrl.toLowerCase().endsWith('.pdf') ? (
                                              <div className="flex flex-col items-center gap-2">
                                                <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                                  <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                                                </svg>
                                                <span className="text-[10px] font-black text-black">XEM PDF</span>
                                              </div>
                                            ) : (
                                              <img src={doc.fileUrl} alt={doc.title} className="h-40 w-auto object-cover" />
                                            )}
                                          </a>
                                        ) : (
                                          <span className="text-xs italic text-gray-400">Không có file</span>
                                        )}
                                      </div>
                                    ))
                                  ) : <span className="text-xs text-gray-700 font-bold italic">Chưa có tài liệu đính kèm</span>}
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              ));
            })()}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
