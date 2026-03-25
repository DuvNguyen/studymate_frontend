'use client';

import MainLayout from '@/components/MainLayout';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export default function DashboardPage() {
  const { user, loading, error } = useCurrentUser();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white rounded-lg p-8 shadow text-center max-w-sm">
          <p className="text-red-500 font-medium mb-2">Không thể kết nối backend</p>
          <p className="text-gray-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <MainLayout role={user.role}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Xin chào! 👋</h1>
          <p className="text-gray-500">{user.email}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-sm text-gray-500 mb-1">Vai trò</p>
            <p className={`text-lg font-bold ${user.role === 'ADMIN' ? 'text-red-600' : user.role === 'STAFF' ? 'text-yellow-600' : user.role === 'INSTRUCTOR' ? 'text-blue-600' : 'text-purple-600'}`}>
              {user.role}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-sm text-gray-500 mb-1">Trạng thái</p>
            <p className="text-lg font-bold text-green-600">{user.status}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-sm text-gray-500 mb-1">ID trong hệ thống</p>
            <p className="text-lg font-bold text-gray-700 font-mono">#{user.id}</p>
          </div>
        </div>
        {user.role === 'STUDENT' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Tiếp tục học</h2>
            <p className="text-gray-400 text-sm">Bạn chưa đăng ký khóa học nào.</p>
          </div>
        )}
        {(user.role === 'ADMIN' || user.role === 'STAFF') && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Thống kê hệ thống</h2>
            <p className="text-gray-400 text-sm">Đang phát triển...</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}