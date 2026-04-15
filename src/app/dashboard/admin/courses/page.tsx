'use client';

import { useCurrentUser } from '@/hooks/useCurrentUser';
import MainLayout from '@/components/MainLayout';
import CourseModerationQueue from '@/components/admin/CourseModerationQueue';

export default function AdminCoursesPage() {
  const { user: appUser, loading } = useCurrentUser();

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
    <MainLayout role={appUser?.role}>
      <CourseModerationQueue />
    </MainLayout>
  );
}
