'use client';

import MainLayout from '@/components/MainLayout';
import { useCurrentUser } from '@/hooks/useCurrentUser';

const ROLE_BADGE: Record<string, { label: string; cls: string }> = {
  ADMIN:      { label: 'Admin',        cls: 'bg-red-400 text-black border-2 border-black' },
  STAFF:      { label: 'Staff',        cls: 'bg-amber-300 text-black border-2 border-black' },
  INSTRUCTOR: { label: 'Instructor',   cls: 'bg-purple-300 text-black border-2 border-black' },
  STUDENT:    { label: 'Học viên',     cls: 'bg-emerald-300 text-black border-2 border-black' },
};

const STATUS_BADGE: Record<string, string> = {
  ACTIVE:    'bg-emerald-400 text-black border-2 border-black',
  BANNED:    'bg-red-400 text-black border-2 border-black',
  SUSPENDED: 'bg-amber-300 text-black border-2 border-black',
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
        <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-8 text-center max-w-sm">
          <p className="text-sm font-black text-white bg-red-600 border-2 border-black uppercase mb-3 inline-block px-4 py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -rotate-2">
            Không thể kết nối
          </p>
          <p className="text-sm font-bold text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  const roleBadge = ROLE_BADGE[user.role] ?? ROLE_BADGE['STUDENT'];
  const statusCls = STATUS_BADGE[user.status] ?? 'bg-white text-black border-2 border-black';

  return (
    <MainLayout role={user.role} kycStatus={user.kycStatus}>
      <div className="max-w-5xl mx-auto space-y-8 pt-4">

        {/* Welcome header */}
        <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-8">
          <p className="text-[10px] font-black uppercase tracking-widest text-purple-900 bg-purple-200 border-2 border-purple-900 px-3 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] inline-block mb-4">
            Tổng quan
          </p>
          <h1 className="text-3xl sm:text-4xl font-black text-black uppercase tracking-tight mb-2">
            Xin chào{user.firstName ? `, ${user.firstName}` : ''}! 
          </h1>
          <p className="text-sm text-gray-700 font-bold">{user.email}</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-transform">
            <p className="text-xs font-black uppercase tracking-widest text-gray-600 mb-4 border-b-2 border-black pb-2">Vai trò</p>
            <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] inline-block ${roleBadge.cls}`}>
              {roleBadge.label}
            </span>
          </div>

          <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-transform">
            <p className="text-xs font-black uppercase tracking-widest text-gray-600 mb-4 border-b-2 border-black pb-2">Trạng thái</p>
            <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] inline-block ${statusCls}`}>
              {user.status}
            </span>
          </div>

          <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-transform">
            <p className="text-xs font-black uppercase tracking-widest text-gray-600 mb-4 border-b-2 border-black pb-2">ID Hệ Thống</p>
            <p className="text-2xl font-black text-black font-mono">#{user.id}</p>
          </div>
        </div>

        {/* Content area by role */}
        {user.role === 'STUDENT' && (
          <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-8">
            <h2 className="text-xl font-black text-black uppercase mb-4">Khóa học của bạn</h2>
            <div className="border-4 border-dashed border-gray-300 p-8 text-center bg-gray-50">
              <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Bạn chưa đăng ký khóa học nào.</p>
            </div>
          </div>
        )}

        {(user.role === 'ADMIN' || user.role === 'STAFF') && (
          <div className="bg-emerald-100 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-8 text-center mt-6">
            <h2 className="text-xl font-black text-black uppercase mb-2">Thống kê hệ thống</h2>
            <p className="text-sm text-emerald-900 font-bold uppercase tracking-widest">Khu vực đang được phát triển</p>
          </div>
        )}

        {user.role === 'INSTRUCTOR' && (
          <div className="bg-amber-100 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-8 text-center mt-6">
            <h2 className="text-xl font-black text-black uppercase mb-2">Khóa học của tôi</h2>
            <p className="text-sm text-amber-900 font-bold uppercase tracking-widest">Tính năng đang được phát triển</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}