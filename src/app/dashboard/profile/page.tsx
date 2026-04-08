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
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-black border-t-transparent animate-spin rounded-none" />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Đang tải...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !profile) {
    return (
      <MainLayout role="STUDENT">
        <div className="bg-red-50 border-2 border-red-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-4 text-red-800 font-bold text-sm">
          {error || 'Không tải được hồ sơ'}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout role={profile.role}>
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header card */}
        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          {/* Accent bar */}
          <div className="h-2 bg-black" />
          <div className="p-6">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              {clerkUser?.fullName || clerkUser?.firstName || 'Học viên StudyMate'}
            </h1>
            <p className="text-sm text-gray-500 font-medium mt-0.5">
              {clerkUser?.primaryEmailAddress?.emailAddress || profile.email}
            </p>
            <div className="mt-3 flex gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 bg-indigo-100 text-indigo-900 border border-indigo-900">
                {profile.role}
              </span>
              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 border ${
                profile.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-900 border-emerald-900' :
                profile.status === 'BANNED' ? 'bg-red-100 text-red-900 border-red-900' :
                'bg-amber-100 text-amber-900 border-amber-900'
              }`}>
                {profile.status}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Bio form (2/3) */}
          <div className="md:col-span-2 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Giới thiệu bản thân</p>

            {/* Alert message */}
            {message.text && (
              <div className={`p-3 mb-4 text-xs font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                message.type === 'success' ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-900'
              }`}>
                {message.type === 'success' ? '✓ ' : '✕ '}{message.text}
              </div>
            )}

            {/* Info notice */}
            <div className="mb-5 p-3 bg-indigo-50 border-l-4 border-indigo-900 text-xs text-indigo-900 font-medium">
              Họ tên và Email được đồng bộ từ Clerk. Truy cập cài đặt tài khoản để thay đổi.
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2">
                  Tiểu sử (Bio)
                </label>
                <textarea
                  rows={8}
                  className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-shadow resize-none text-sm text-gray-800 font-medium bg-gray-50"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Bạn là ai? Kể về kinh nghiệm và mục tiêu học tập..."
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Hiển thị trên hồ sơ công khai</p>
                  <span className={`text-[10px] font-black font-mono ${bio.length > 500 ? 'text-red-700' : 'text-gray-400'}`}>
                    {bio.length}/500
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={updating || bio.length > 500}
                  className="px-6 py-2.5 bg-black text-white text-xs font-black uppercase tracking-widest border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] hover:-translate-y-[1px] hover:-translate-x-[1px] active:translate-y-[1px] active:translate-x-[1px] active:shadow-none disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {updating ? 'Đang lưu...' : 'Lưu hồ sơ'}
                </button>
              </div>
            </form>
          </div>

          {/* Account info (1/3) */}
          <div className="space-y-4">
            <div className="bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Thông tin tài khoản</p>

              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Tham gia từ</p>
                  <p className="text-sm font-bold text-gray-800 bg-gray-50 border border-gray-200 px-3 py-2">
                    {new Date(profile.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">ID Hệ Thống</p>
                  <p className="text-[10px] font-mono text-gray-500 bg-gray-50 border border-gray-200 px-3 py-2 break-all leading-relaxed">
                    {profile.clerkUserId}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-2 border-black bg-gray-50 p-4">
              <p className="text-[10px] text-gray-400 leading-relaxed italic">
                Dữ liệu lưu trữ trên PostgreSQL (Neon DB).
              </p>
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}