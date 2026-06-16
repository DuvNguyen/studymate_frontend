'use client';

import { Suspense, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/MainLayout';
import { useInstructorDiscussions } from '@/hooks/useInstructorDiscussions';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Pagination } from '@/components/Pagination';
import { MessageSquare, BookOpen, ChevronRight } from 'lucide-react';

function InstructorDiscussionsContent() {
  const { user, loading: userLoading } = useCurrentUser();
  const router = useRouter();
  
  const {
    discussions,
    loading: discussionsLoading,
    meta,
    statusFilter,
    setStatusFilter,
    repliedFilter,
    setRepliedFilter,
    fetchDiscussions,
    markLessonAsRead,
  } = useInstructorDiscussions();

  // Group discussions by lesson ID
  const groupedLessons = useMemo(() => {
    if (!Array.isArray(discussions)) return [];
    
    const groups: Record<number, {
      lessonId: number;
      lessonTitle: string;
      courseTitle: string;
      courseSlug: string;
      count: number;
      hasUnread: boolean;
    }> = {};

    discussions.forEach((d) => {
      const lessonId = d.lesson_id;
      if (!lessonId) return;
      
      if (!groups[lessonId]) {
        groups[lessonId] = {
          lessonId,
          lessonTitle: d.lesson?.title || 'Bài học không tên',
          courseTitle: d.course?.title || 'Khóa học không tên',
          courseSlug: d.course?.slug || '',
          count: 0,
          hasUnread: false,
        };
      }
      groups[lessonId].count += 1;
      if (!d.is_read) {
        groups[lessonId].hasUnread = true;
      }
    });

    return Object.values(groups);
  }, [discussions]);

  return (
    <MainLayout role={user?.role} allowedRoles={['INSTRUCTOR']} loading={userLoading}>
      <div className="max-w-5xl mx-auto space-y-8 pb-20">
        {/* Header */}
        <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-indigo-500 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Instructor Dashboard</p>
              <h1 className="text-3xl font-black text-black uppercase tracking-tighter">Quản lý Thảo luận</h1>
            </div>
          </div>
          <p className="text-sm font-bold text-gray-700 mt-4 max-w-2xl">
            Theo dõi và phản hồi các câu hỏi từ học viên trên toàn bộ các khóa học của bạn. 
            Nhấp chọn bài học hoặc lọc trạng thái bên dưới để bắt đầu phản hồi nhanh chóng.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-6 items-center bg-white border-4 border-black p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-black uppercase text-black">Trạng thái đọc:</span>
            <div className="flex gap-2">
              {(['all', 'unread', 'read'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-1.5 text-xs font-black uppercase border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:translate-x-0.5 active:shadow-none ${
                    statusFilter === status
                      ? 'bg-black text-white shadow-none translate-y-0.5 translate-x-0.5'
                      : 'bg-white text-black hover:bg-gray-100'
                  }`}
                >
                  {status === 'all' ? 'Tất cả' : status === 'unread' ? 'Mới' : 'Đã xem'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-black uppercase text-black">Phản hồi:</span>
            <div className="flex gap-2">
              {(['all', 'no', 'yes'] as const).map((replied) => (
                <button
                  key={replied}
                  onClick={() => setRepliedFilter(replied)}
                  className={`px-4 py-1.5 text-xs font-black uppercase border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:translate-x-0.5 active:shadow-none ${
                    repliedFilter === replied
                      ? 'bg-black text-white shadow-none translate-y-0.5 translate-x-0.5'
                      : 'bg-white text-black hover:bg-gray-100'
                  }`}
                >
                  {replied === 'all' ? 'Tất cả' : replied === 'no' ? 'Chưa trả lời' : 'Đã trả lời'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Discussions Grouped List */}
        <div className="space-y-6">
          {discussionsLoading ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="w-12 h-12 border-4 border-black border-t-transparent animate-spin mb-4"></div>
              <p className="font-black uppercase text-xs tracking-widest text-black">Đang tải thảo luận...</p>
            </div>
          ) : groupedLessons.length === 0 ? (
            <div className="bg-white border-4 border-black p-20 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="w-20 h-20 bg-gray-100 border-4 border-black flex items-center justify-center mx-auto mb-6 rotate-3">
                <MessageSquare size={40} className="text-gray-400" />
              </div>
              <h2 className="text-2xl font-black text-black uppercase italic mb-2">Chưa có thảo luận nào!</h2>
              <p className="font-bold text-gray-500">Không tìm thấy bài học nào có câu hỏi phù hợp bộ lọc hiện tại.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {groupedLessons.map((group) => (
                <div
                  key={group.lessonId}
                  className={`bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0 ${
                      group.hasUnread ? 'bg-amber-400 text-black' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase bg-indigo-100 text-indigo-900 border border-indigo-900 px-2 py-0.5">
                          {group.courseTitle}
                        </span>
                        {group.hasUnread && (
                          <span className="text-[10px] font-black uppercase bg-amber-400 text-black border border-black px-2 py-0.5 animate-pulse">
                            Mới
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-black">
                        Ở video <span className="underline decoration-indigo-500 decoration-2 font-black">{group.lessonTitle}</span> có <span className="font-black text-indigo-600">{group.count}</span> thảo luận {statusFilter === 'unread' || group.hasUnread ? 'mới' : statusFilter === 'read' ? 'đã xem' : ''} cần chú ý.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                    {group.hasUnread && (
                      <button
                        onClick={async () => {
                          await markLessonAsRead(group.lessonId);
                        }}
                        className="px-3 py-1.5 text-xs font-black uppercase bg-emerald-400 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:translate-x-0.5 active:shadow-none hover:bg-emerald-500"
                      >
                        Đã đọc
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        if (group.hasUnread) {
                          await markLessonAsRead(group.lessonId);
                        }
                        router.push(`/courses/${group.courseSlug}/instructor-view?lesson=${group.lessonId}`);
                      }}
                      className="px-4 py-1.5 text-xs font-black uppercase bg-black text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:translate-x-0.5 active:shadow-none hover:bg-gray-800 flex items-center gap-2"
                    >
                      Xem trong bài học <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {meta.totalPages > 1 && (
                <div className="flex justify-center mt-12">
                  <Pagination 
                    currentPage={meta.page}
                    totalPages={meta.totalPages}
                    onPageChange={(p) => fetchDiscussions(p)}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default function InstructorDiscussionsPage() {
  return (
    <Suspense
      fallback={
        <MainLayout allowedRoles={['INSTRUCTOR']} loading>
          <div className="max-w-5xl mx-auto py-12 px-4">
            <div className="flex flex-col items-center justify-center py-24 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="w-12 h-12 border-4 border-black border-t-transparent animate-spin mb-4"></div>
              <p className="font-black uppercase text-xs tracking-widest text-black">Đang tải thảo luận...</p>
            </div>
          </div>
        </MainLayout>
      }
    >
      <InstructorDiscussionsContent />
    </Suspense>
  );
}
