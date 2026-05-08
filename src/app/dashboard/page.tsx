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

  return (
    <MainLayout role={user?.role} kycStatus={user?.kycStatus}>
      {loading ? (
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-none animate-spin mx-auto mb-3" />
            <p className="text-xs font-black uppercase tracking-widest text-gray-500">Đang tải...</p>
          </div>
        </div>
      ) : error || !user ? (
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-8 text-center max-w-sm">
            <p className="text-sm font-black text-white bg-red-600 border-2 border-black uppercase mb-3 inline-block px-4 py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -rotate-2">
              Không thể kết nối
            </p>
            <p className="text-sm font-bold text-gray-700">{error || 'Không tìm thấy người dùng'}</p>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto space-y-8 pt-4">
          {/* Welcome header */}
          <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-8">
            <p className="text-[10px] font-black uppercase tracking-widest text-purple-900 bg-purple-200 border-2 border-purple-900 px-3 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] inline-block mb-4">
              Tổng quan
            </p>
            <h1 className="text-3xl sm:text-5xl font-black text-black uppercase tracking-tighter mb-2">
              Xin chào{user.firstName ? `, ${user.firstName}` : ''}! 
            </h1>
            <p className="text-sm text-gray-700 font-bold uppercase tracking-widest bg-gray-50 inline-block px-4 py-2 border-2 border-black border-dashed">{user.email}</p>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-8 hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all">
              <p className="text-xs font-black uppercase tracking-widest text-gray-600 mb-6 border-b-2 border-black pb-2">Hồ sơ người dùng</p>
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Vai trò hiện tại:</span>
                <span className={`text-xs font-black uppercase tracking-wider px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] inline-block text-center ${ROLE_BADGE[user.role]?.cls || ''}`}>
                  {ROLE_BADGE[user.role]?.label || user.role}
                </span>
              </div>
            </div>

            <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-8 hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all">
              <p className="text-xs font-black uppercase tracking-widest text-gray-600 mb-6 border-b-2 border-black pb-2">Bảo mật & Trạng thái</p>
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Trạng thái hệ thống:</span>
                <span className={`text-xs font-black uppercase tracking-wider px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] inline-block text-center ${STATUS_BADGE[user.status] || ''}`}>
                  {user.status}
                </span>
              </div>
            </div>

            <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-8 hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all">
              <p className="text-xs font-black uppercase tracking-widest text-gray-600 mb-6 border-b-2 border-black pb-2">Định danh StudyMate</p>
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">ID định danh:</span>
                <p className="text-3xl font-black text-black font-mono bg-yellow-400 border-2 border-black px-4 py-1 inline-block shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] self-start">#{user.id}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}