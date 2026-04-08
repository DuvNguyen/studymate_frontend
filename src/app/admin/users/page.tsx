'use client';

import { useEffect, useState } from 'react';
import { useClerk } from '@clerk/nextjs';
import { useDeleteUser } from '../../../hooks/useDeleteUser';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import MainLayout from '../../../components/MainLayout';

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
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('STUDENT');
  const { session } = useClerk();
  const { deleteUser, loading: isDeleting } = useDeleteUser();
  const [isActing, setIsActing] = useState(false);
  const { user: appUser, loading: appLoading } = useCurrentUser();

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

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = await session?.getToken();
      if (!token) return;

      const res = await fetch(`http://localhost:3001/api/v1/users?limit=50&role=${activeTab}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setUsers(json.data);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error(err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchUsers();
    }
  }, [session, activeTab]);

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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <MainLayout role={appUser?.role}>
      <div className="p-8 min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">Quản lý Người dùng</h1>

          {/* Tabs */}
          <div className="flex space-x-2 border-b border-gray-200 mb-6">
            {tabs.map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`py-3 px-6 font-semibold text-sm rounded-t-lg transition-colors ${
                  activeTab === tab.value
                    ? 'bg-white border-t border-l border-r border-gray-200 text-purple-700'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
              <table className="min-w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200">
                    <th className="p-4 font-semibold text-gray-600">ID</th>
                    <th className="p-4 font-semibold text-gray-600">Họ và Tên</th>
                    <th className="p-4 font-semibold text-gray-600">Email</th>
                    {activeTab === 'INSTRUCTOR' && (
                      <th className="p-4 font-semibold text-gray-600">Vi phạm</th>
                    )}
                    <th className="p-4 font-semibold text-gray-600">Trạng thái</th>
                    <th className="p-4 font-semibold text-gray-600 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const statusCfg = STATUS_CONFIG[u.status] ?? { label: u.status, cls: 'bg-gray-100 text-gray-600 border border-black' };
                    const isBanned = u.status === 'BANNED' || u.status === 'SUSPENDED';

                    return (
                      <tr key={u.id} className="border-b border-gray-100 hover:bg-slate-50 transition-colors">
                        <td className="p-4 text-gray-500 font-mono text-sm">{u.id}</td>
                        <td className="p-4 font-medium text-gray-800">
                          {u.fullName || <span className="text-gray-400 italic">Chưa cập nhật</span>}
                        </td>
                        <td className="p-4 text-gray-600">{u.email}</td>

                        {activeTab === 'INSTRUCTOR' && (
                          <td className="p-4 text-center">
                            <span className={`font-bold ${u.violationCount > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                              {u.violationCount || 0}
                            </span>
                          </td>
                        )}

                        <td className="p-4">
                          <div className="flex flex-col gap-1.5">
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
                              className={`px-3 py-0.5 font-bold text-[10px] uppercase tracking-wider w-fit ${statusCfg.cls} ${
                                isBanned ? 'cursor-pointer' : 'cursor-default'
                              }`}
                              title={isBanned ? 'Bấm để xem lý do ban' : undefined}
                            >
                              {statusCfg.label}{isBanned ? ' ℹ️' : ''}
                            </button>
                          </div>
                        </td>

                        <td className="p-4 flex gap-3 justify-center items-center">
                          {isBanned ? (
                            <button
                              onClick={() => handleUnban(u.id, u.email)}
                              disabled={isActing || u.role === 'ADMIN'}
                              className={`${ACTION_BTN_BASE} bg-emerald-100 text-emerald-800 hover:bg-emerald-200`}
                            >
                              Bỏ đình chỉ
                            </button>
                          ) : (
                            <button
                              onClick={() => openBanModal(u.id, u.email)}
                              disabled={isActing || u.role === 'ADMIN'}
                              className={`${ACTION_BTN_BASE} bg-orange-100 text-orange-800 hover:bg-orange-200`}
                            >
                              Cấm 
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(u.id, u.email)}
                            disabled={isDeleting || u.role === 'ADMIN'}
                            className={`${ACTION_BTN_BASE} bg-red-100 text-red-800 hover:bg-red-200`}
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
          )}
        </div>
      </div>

      {/* MODAL */}
      {banModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white border-2 border-black rounded-sm shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-black text-black mb-2 uppercase tracking-tight">Cấm người dùng</h2>
            <p className="text-sm text-gray-800 mb-4 border-l-4 border-red-500 pl-3">
              Tài khoản <span className="font-bold text-black underline">{banModal.email}</span> sẽ bị đình chỉ quyền truy cập ngay lập tức.
            </p>

            <label className="block text-xs font-black uppercase text-black mb-1">
              Lý do vi phạm
            </label>

            <textarea
              className="w-full border-2 border-black rounded-sm px-3 py-2 text-sm text-black font-bold focus:outline-none focus:bg-slate-50 resize-none placeholder-gray-500"
              rows={3}
              placeholder="Ví dụ: Vi phạm bản quyền nội dung 2 lần..."
              value={banModal.reason}
              onChange={(e) => setBanModal(prev => ({ ...prev, reason: e.target.value }))}
            />

            <div className="flex gap-4 mt-6 justify-end">
              {/* Fix: Thêm text-black cho nút Hủy */}
              <button
                onClick={() => setBanModal({ open: false, userId: null, email: '', reason: '' })}
                className="px-6 py-2 text-xs font-bold uppercase border-2 border-black bg-white text-black hover:bg-gray-100 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmBan}
                disabled={isActing}
                className="px-6 py-2 text-xs font-bold uppercase border-2 border-black bg-red-600 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50 transition-all"
              >
                {isActing ? 'Xử lý...' : 'Xác nhận Cấm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XEM LÝ DO BAN */}
      {banReasonModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 w-full max-w-sm mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-black uppercase tracking-wider">Chi tiết đình chỉ</h2>
              <button
                onClick={() => setBanReasonModal(prev => ({ ...prev, open: false }))}
                className="text-gray-500 hover:text-black font-black text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <p className="text-xs font-bold text-gray-600 mb-4 border-l-4 border-black pl-2">{banReasonModal.email}</p>

            <div className="space-y-3">
              <div className="bg-gray-50 border-2 border-black p-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Trạng thái</p>
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 border border-black ${
                  banReasonModal.status === 'BANNED' ? 'bg-red-100 text-red-900' : 'bg-amber-100 text-amber-900'
                }`}>
                  {banReasonModal.status === 'BANNED' ? 'Bị cấm' : 'Đình chỉ'}
                </span>
              </div>

              {banReasonModal.banReason ? (
                <div className="bg-gray-50 border-2 border-black p-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Lý do</p>
                  <p className="text-sm font-medium text-gray-800">{banReasonModal.banReason}</p>
                </div>
              ) : (
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 p-3">
                  <p className="text-xs text-gray-400 italic">Không có lý do được ghi nhận.</p>
                </div>
              )}

              {banReasonModal.bannedAt && (
                <div className="bg-gray-50 border-2 border-black p-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Thời điểm ban</p>
                  <p className="text-sm font-bold text-gray-800 font-mono">
                    {new Date(banReasonModal.bannedAt).toLocaleString('vi-VN')}
                  </p>
                </div>
              )}

              <div className="bg-gray-50 border-2 border-black p-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Số vi phạm</p>
                <p className={`text-xl font-black font-mono ${
                  banReasonModal.violationCount >= 2 ? 'text-red-700' : 'text-amber-700'
                }`}>
                  {banReasonModal.violationCount}
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setBanReasonModal(prev => ({ ...prev, open: false }))}
                className="px-5 py-2 text-xs font-black uppercase border-2 border-black bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] hover:-translate-y-[1px] active:translate-y-0 transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}