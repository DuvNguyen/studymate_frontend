'use client';

import { useState } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import MainLayout from '@/components/MainLayout';
import PendingInstructorsList from '@/components/admin/PendingInstructorsList';
import VideoModerationQueue from '@/components/admin/VideoModerationQueue';

export default function AdminVideosPage() {
  const { user: appUser, loading } = useCurrentUser();
  const [viewMode, setViewMode] = useState<'INSTRUCTOR' | 'ALL_VIDEOS'>('INSTRUCTOR');

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

  return (
    <MainLayout role={appUser?.role} allowedRoles={['ADMIN', 'STAFF']}>
      <div className="w-[calc(100%-12px)] sm:w-full max-w-7xl mx-auto mb-6 px-1.5 sm:px-0">
        {/* Toggle View Mode */}
        <div className="flex bg-white border-2 border-black p-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full sm:w-fit">
          <button
            onClick={() => setViewMode('INSTRUCTOR')}
            className={`flex-1 sm:flex-initial px-6 py-2 text-xs font-black uppercase tracking-wider transition-all ${
              viewMode === 'INSTRUCTOR'
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            Theo giảng viên
          </button>
          <button
            onClick={() => setViewMode('ALL_VIDEOS')}
            className={`flex-1 sm:flex-initial px-6 py-2 text-xs font-black uppercase tracking-wider transition-all ${
              viewMode === 'ALL_VIDEOS'
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            Tất cả video
          </button>
        </div>
      </div>

      {viewMode === 'INSTRUCTOR' ? (
        <PendingInstructorsList />
      ) : (
        <VideoModerationQueue />
      )}
    </MainLayout>
  );
}
