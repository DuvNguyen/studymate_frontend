'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUser } from '@clerk/nextjs';

export default function ProfilePage() {
  const { profile, loading, error, updateProfile, updating } = useUserProfile();
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();

  const [bio, setBio] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  // Sync dữ liệu từ hook sang form state (cite: 86)
  useEffect(() => {
    if (profile) {
      setBio(profile.bio || '');
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      await updateProfile({ bio });
      setMessage({ type: 'success', text: 'Cập nhật hồ sơ thành công!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Có lỗi xảy ra' });
    }
  };

  if (loading || !clerkLoaded) {
    return (
      <MainLayout role="STUDENT">
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </MainLayout>
    );
  }

  if (error || !profile) {
    return (
      <MainLayout role="STUDENT">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error || 'Không tải được hồ sơ'}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout role={profile.role}>
      <div className="max-w-12xl border border-gray-200 bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Header Cover - Giữ lại gradient để tạo điểm nhấn */}
        <div className="h-32 bg-gradient-to-r from-purple-500 to-indigo-600"></div>
        
        <div className="px-6 sm:px-8 relative pb-8">
          {/* Thông tin định danh (Read-only từ Clerk) */}
          <div className="-mt-8 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h1 className="text-3xl font-bold text-gray-900">
                {clerkUser?.fullName || clerkUser?.firstName || 'Học viên StudyMate'}
              </h1>
              <p className="text-gray-600 text-lg">{clerkUser?.primaryEmailAddress?.emailAddress || profile.email}</p>
              <div className="mt-3 flex gap-2">
                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full uppercase">
                  Vai trò: {profile.role}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase">
                  Trạng thái: {profile.status}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h2 className="text-xl font-bold text-gray-800 border-b-2 border-purple-100 pb-2 mb-6">
                Giới thiệu bản thân
              </h2>
              
              {message.text && (
                <div className={`p-4 mb-6 rounded-lg text-sm font-medium border ${
                  message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {message.type === 'success' ? '✓ ' : '✕ '} {message.text}
                </div>
              )}

              <div className="mb-6 bg-blue-50 text-blue-700 p-4 rounded-lg text-sm flex gap-3 border border-blue-100">
                <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Các thông tin cơ bản (Họ tên, Email) được đồng bộ từ tài khoản Clerk. Vui lòng truy cập cài đặt tài khoản để thay đổi các thông tin này.</span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">Tiểu sử (Bio)</label>
                  <textarea
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition resize-none text-gray-800"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Bạn là ai? Kể một chút về kinh nghiệm và mục tiêu học tập của bạn trên StudyMate..."
                  />
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <p>Mô tả này sẽ hiển thị trên hồ sơ công khai của bạn.</p>
                    <span className={`font-mono ${bio.length > 500 ? 'text-red-500 font-bold' : ''}`}>
                      {bio.length}/500
                    </span>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={updating || bio.length > 500}
                    className="bg-[#2d2f31] hover:bg-black text-white px-8 py-3 rounded-lg font-bold transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md"
                  >
                    {updating ? 'Đang cập nhật...' : 'Lưu hồ sơ'}
                  </button>
                </div>
              </form>
            </div>

            {/* Cột phải: Thông tin tài khoản nội bộ (cite: 62) */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 border-b-2 border-gray-100 pb-2 mb-6">Tài khoản</h2>
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-6">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-black tracking-tighter mb-2">Tham gia từ</p>
                  <p className="text-sm font-bold text-gray-800 bg-white p-2 rounded border border-gray-100">
                    {new Date(profile.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-black tracking-tighter mb-2">ID Hệ thống</p>
                  <p className="text-[10px] font-mono text-gray-500 bg-white p-2 rounded border border-gray-100 break-all leading-relaxed">
                    {profile.clerkUserId}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-400 leading-relaxed italic">
                    Dữ liệu hồ sơ được lưu trữ an toàn trên PostgreSQL (Neon DB).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}