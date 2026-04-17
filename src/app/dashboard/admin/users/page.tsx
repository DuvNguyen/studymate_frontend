'use client';

import { useEffect, useState } from 'react';
import { useClerk } from '@clerk/nextjs';
import { useDeleteUser } from '@/hooks/useDeleteUser';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import MainLayout from '@/components/MainLayout';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { Pagination } from '@/components/Pagination';

type Tab = 'STUDENT' | 'INSTRUCTOR' | 'STAFF' | 'ADMIN';

interface BanModalState {
  open: boolean;
  userId: number | null;
  email: string;
  reason: string;
}

interface BanReasonModalState {
  open: boolean;
  email: string;
  banReason: string | null;
  bannedAt: string | null;
  violationCount: number;
  status: string;
}

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState<Tab>('STUDENT');
  const [page, setPage] = useState(1);
  const { session } = useClerk();
  const { deleteUser, loading: isDeleting } = useDeleteUser();
  const [isActing, setIsActing] = useState(false);
  const { user: appUser, loading: appLoading } = useCurrentUser();
  const { users, meta, loading, fetchUsers, updateStatus } = useAdminUsers();

  const [banModal, setBanModal] = useState<BanModalState>({
    open: false,
    userId: null,
    email: '',
    reason: '',
  });

  const [banReasonModal, setBanReasonModal] = useState<BanReasonModalState>({
    open: false,
    email: '',
    banReason: null,
    bannedAt: null,
    violationCount: 0,
    status: '',
  });

  useEffect(() => {
    if (session) {
      fetchUsers({ page, limit: 10, role: activeTab });
    }
  }, [session, activeTab, page, fetchUsers]);

  const handleDelete = async (id: number, email: string) => {
    const confirm = window.confirm(`Bạn có CHẮC CHẮN muốn XÓA CỨNG người dùng [${email}] không?\n\nHành động này sẽ xóa dữ liệu trên Clerk và DB, KHÔNG THỂ KHÔI PHỤC!`);
    if (!confirm) return;

    try {
      await deleteUser(id);
      alert('Đã xóa cứng người dùng thành công!');
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Có lỗi xảy ra khi xóa người dùng');
    }
  };

  const openBanModal = (id: number, email: string) => {
    setBanModal({ open: true, userId: id, email, reason: '' });
  };

  const handleConfirmBan = async () => {
    if (!banModal.userId) return;
    try {
      setIsActing(true);
      const token = await session?.getToken();
      const res = await fetch(`http://localhost:3001/api/v1/users/${banModal.userId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'BANNED', reason: banModal.reason || undefined })
      });
      if (res.ok) {
        setBanModal({ open: false, userId: null, email: '', reason: '' });
        fetchUsers();
      } else {
        const error = await res.json();
        alert(error.message || 'Có lỗi khi cấm người dùng.');
      }
    } catch (err: any) {
      alert(err.message || 'Có lỗi khi gọi API.');
    } finally {
      setIsActing(false);
    }
  };

  const handleUnban = async (id: number, email: string) => {
    const confirm = window.confirm(`Bỏ đình chỉ người dùng [${email}]?`);
    if (!confirm) return;
    try {
      setIsActing(true);
      const token = await session?.getToken();
      const res = await fetch(`http://localhost:3001/api/v1/users/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'ACTIVE' })
      });
      if (res.ok) {
        fetchUsers();
      } else {
        const error = await res.json();
        alert(error.message || 'Có lỗi khi bỏ đình chỉ.');
      }
    } catch (err: any) {
      alert(err.message || 'Có lỗi khi gọi API.');
    } finally {
      setIsActing(false);
    }
  };

  const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
    ACTIVE: { 
      label: 'Hoạt động', 
      cls: 'bg-emerald-100 text-emerald-700 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
    },
    BANNED: { 
      label: 'Bị cấm', 
      cls: 'bg-red-100 text-red-700 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
    },
    SUSPENDED: { 
      label: 'Đình chỉ', 
      cls: 'bg-yellow-100 text-yellow-700 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
    },
  };

  const ACTION_BTN_BASE = "px-3 py-1.5 border border-black font-bold text-xs uppercase tracking-tight rounded-sm transition-all hover:-translate-y-[1px] hover:-translate-x-[1px] active:translate-y-[1px] active:translate-x-[1px] active:shadow-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0";

  const tabs: { value: Tab; label: string }[] = [
    { value: 'STUDENT',    label: 'Học viên' },
    { value: 'INSTRUCTOR', label: 'Giảng viên' },
    { value: 'STAFF',      label: 'Nhân viên (Staff)' },
    { value: 'ADMIN',      label: 'Quản trị viên' },
  ];

  if (appLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-none h-10 w-10 border-4 border-black border-t-transparent"></div>
      </div>
    );
  }

  return (
    <MainLayout role={appUser?.role}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Quản lý</p>
          <h1 className="text-2xl font-black text-gray-900 uppercase">Quản lý Người dùng</h1>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {tabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => {
                setActiveTab(tab.value);
                setPage(1);
              }}
              className={`py-2 px-6 font-black text-xs uppercase tracking-widest border-2 border-black transition-all ${
                activeTab === tab.value
                  ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-y-[-2px] translate-x-[-2px]'
                  : 'bg-white text-black hover:bg-gray-100 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="animate-spin rounded-none h-10 w-10 border-4 border-black border-t-transparent"></div>
          </div>
        ) : (
          <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black text-white border-b-2 border-black">
                    <th className="p-4 font-black uppercase text-[10px] tracking-widest">Họ và Tên</th>
                    <th className="p-4 font-black uppercase text-[10px] tracking-widest">Email</th>
                    {activeTab === 'INSTRUCTOR' && (
                      <th className="p-4 font-black uppercase text-[10px] tracking-widest">Vi phạm</th>
                    )}
                    <th className="p-4 font-black uppercase text-[10px] tracking-widest">Trạng thái</th>
                    <th className="p-4 font-black uppercase text-[10px] tracking-widest text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-black">
                  {users.map((u) => {
                    const statusCfg = STATUS_CONFIG[u.status] ?? { label: u.status, cls: 'bg-gray-100 text-gray-600 border border-black' };
                    const isBanned = u.status === 'BANNED' || u.status === 'SUSPENDED';

                    return (
                      <tr key={u.id} className="hover:bg-yellow-50 transition-colors">
                        <td className="p-4">
                          <div className="text-sm font-black text-black uppercase">
                            {u.fullName || <span className="text-gray-400 italic">Chưa cập nhật</span>}
                          </div>
                        </td>
                        <td className="p-4 text-xs font-bold text-gray-600">{u.email}</td>

                        {activeTab === 'INSTRUCTOR' && (
                          <td className="p-4 text-center">
                            <span className={`font-black ${u.violationCount > 0 ? 'text-red-500 underline decoration-2' : 'text-gray-400'}`}>
                              {u.violationCount || 0}
                            </span>
                          </td>
                        )}

                        <td className="p-4">
                          <button
                            type="button"
                            onClick={() => {
                              if (isBanned) {
                                setBanReasonModal({
                                  open: true,
                                  email: u.email,
                                  banReason: u.banReason ?? null,
                                  bannedAt: u.bannedAt ?? null,
                                  violationCount: u.violationCount || 0,
                                  status: u.status,
                                });
                              }
                            }}
                            className={`px-3 py-1 font-black text-[9px] uppercase tracking-wider ${statusCfg.cls} ${
                              isBanned ? 'cursor-pointer hover:scale-105 transition-transform' : 'cursor-default'
                            }`}
                          >
                            {statusCfg.label}{isBanned ? ' ℹ️' : ''}
                          </button>
                        </td>

                        <td className="p-4 flex gap-2 justify-center items-center">
                          {isBanned ? (
                            <button
                              onClick={() => handleUnban(u.id, u.email)}
                              disabled={isActing || u.role === 'ADMIN'}
                              className={`${ACTION_BTN_BASE} bg-emerald-400 text-black`}
                            >
                              Bỏ đình chỉ
                            </button>
                          ) : (
                            <button
                              onClick={() => openBanModal(u.id, u.email)}
                              disabled={isActing || u.role === 'ADMIN'}
                              className={`${ACTION_BTN_BASE} bg-amber-400 text-black`}
                            >
                              Cấm 
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(u.id, u.email)}
                            disabled={isDeleting || u.role === 'ADMIN'}
                            className={`${ACTION_BTN_BASE} bg-red-400 text-black`}
                          >
                            {isDeleting ? '...' : 'Xóa Cứng'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {meta && (
          <Pagination
            currentPage={page}
            totalPages={meta.totalPages}
            onPageChange={(p) => setPage(p)}
          />
        )}
      </div>

      {/* MODALS remain same but with minor path corrections */}
      {banModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 w-full max-w-md mx-4">
            <h2 className="text-2xl font-black text-black mb-4 uppercase tracking-tighter">Cấm người dùng</h2>
            <p className="text-sm font-bold text-gray-800 mb-6 border-l-4 border-red-500 pl-3">
              Tài khoản <span className="font-black text-black underline">{banModal.email}</span> sẽ bị đình chỉ ngay lập tức.
            </p>

            <textarea
              className="w-full border-2 border-black p-4 text-sm text-black font-bold focus:outline-none focus:bg-yellow-50 resize-none placeholder-gray-400 min-h-[100px]"
              placeholder="Nhập lý do vi phạm..."
              value={banModal.reason}
              onChange={(e) => setBanModal(prev => ({ ...prev, reason: e.target.value }))}
            />

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setBanModal({ open: false, userId: null, email: '', reason: '' })}
                className="flex-1 px-6 py-3 text-xs font-black uppercase border-2 border-black bg-white text-black hover:bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmBan}
                disabled={isActing}
                className="flex-1 px-6 py-3 text-xs font-black uppercase border-2 border-black bg-red-400 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50"
              >
                {isActing ? '...' : 'Xác nhận Cấm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BAN REASON MODAL */}
      {banReasonModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] p-8 w-full max-w-sm mx-4">
            <div className="flex items-center justify-between mb-6 border-b-4 border-black pb-4">
              <h2 className="text-lg font-black uppercase tracking-tighter">Chi tiết đình chỉ</h2>
              <button onClick={() => setBanReasonModal(prev => ({ ...prev, open: false }))} className="font-black text-2xl hover:rotate-90 transition-transform">✕</button>
            </div>

            <div className="space-y-4">
              <div className="bg-yellow-50 border-2 border-black p-4">
                <p className="text-[10px] font-black uppercase text-gray-500 mb-1">Email</p>
                <p className="text-sm font-black text-black">{banReasonModal.email}</p>
              </div>

              <div className="bg-red-50 border-2 border-black p-4">
                <p className="text-[10px] font-black uppercase text-gray-500 mb-1">Lý do</p>
                <p className="text-sm font-bold text-black">{banReasonModal.banReason || 'Không có lý do ghi nhận'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 border-2 border-black p-4 text-center">
                  <p className="text-[10px] font-black uppercase text-gray-500 mb-1">Vi phạm</p>
                  <p className="text-2xl font-black text-red-600">{banReasonModal.violationCount}</p>
                </div>
                <div className="bg-gray-50 border-2 border-black p-4 text-center">
                  <p className="text-[10px] font-black uppercase text-gray-500 mb-1">Tình trạng</p>
                  <p className="text-xs font-black uppercase">{banReasonModal.status}</p>
                </div>
              </div>
            </div>

            <button
                onClick={() => setBanReasonModal(prev => ({ ...prev, open: false }))}
                className="w-full mt-8 py-3 text-xs font-black uppercase border-2 border-black bg-black text-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]"
              >
                Đóng
            </button>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
