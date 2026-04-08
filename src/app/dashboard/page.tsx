'use client';

import MainLayout from '@/components/MainLayout';
import { useCurrentUser } from '@/hooks/useCurrentUser';

const ROLE_BADGE: Record<string, { label: string; cls: string }> = {
  ADMIN:      { label: 'Admin',        cls: 'bg-red-100 text-red-900 border border-red-900' },
  STAFF:      { label: 'Staff',        cls: 'bg-amber-100 text-amber-900 border border-amber-900' },
  INSTRUCTOR: { label: 'Instructor',   cls: 'bg-indigo-100 text-indigo-900 border border-indigo-900' },
  STUDENT:    { label: 'Học viên',     cls: 'bg-emerald-100 text-emerald-900 border border-emerald-900' },
};

const STATUS_BADGE: Record<string, string> = {
  ACTIVE:    'bg-emerald-100 text-emerald-900 border border-emerald-900',
  BANNED:    'bg-red-100 text-red-900 border border-red-900',
  SUSPENDED: 'bg-amber-100 text-amber-900 border border-amber-900',
};

export default function DashboardPage() {
  const { user, loading, error } = useCurrentUser();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-none animate-spin mx-auto mb-3" />
          <p className="text-xs font-black uppercase tracking-widest text-gray-500">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-8 text-center max-w-sm">
          <p className="text-sm font-black text-red-700 uppercase mb-1">Không thể kết nối</p>
          <p className="text-xs text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  const roleBadge = ROLE_BADGE[user.role] ?? ROLE_BADGE['STUDENT'];
  const statusCls = STATUS_BADGE[user.status] ?? 'bg-gray-100 text-gray-900 border border-black';

  return (
    <MainLayout role={user.role}>
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Welcome header */}
        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Tổng quan</p>
          <h1 className="text-2xl font-black text-gray-900 mb-0.5">
            Xin chào{user.firstName ? `, ${user.firstName}` : ''}! 
          </h1>
          <p className="text-sm text-gray-500 font-medium">{user.email}</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Vai trò</p>
            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 ${roleBadge.cls}`}>
              {roleBadge.label}
            </span>
          </div>

          <div className="bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Trạng thái</p>
            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 ${statusCls}`}>
              {user.status}
            </span>
          </div>

          <div className="bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">ID Hệ Thống</p>
            <p className="text-xl font-black text-gray-900 font-mono">#{user.id}</p>
          </div>
        </div>

        {/* Content area by role */}
        {user.role === 'STUDENT' && (
          <div className="bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Khóa học của bạn</p>
            <p className="text-sm text-gray-400 font-medium italic">Bạn chưa đăng ký khóa học nào.</p>
          </div>
        )}

        {(user.role === 'ADMIN' || user.role === 'STAFF') && (
          <div className="bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Thống kê hệ thống</p>
            <p className="text-sm text-gray-400 font-medium italic">Đang phát triển...</p>
          </div>
        )}

        {user.role === 'INSTRUCTOR' && (
          <div className="bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Khóa học của tôi</p>
            <p className="text-sm text-gray-400 font-medium italic">Đang phát triển...</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}