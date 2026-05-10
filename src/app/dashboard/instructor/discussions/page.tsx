'use client';

import MainLayout from '@/components/MainLayout';
import { useInstructorDiscussions } from '@/hooks/useInstructorDiscussions';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { DiscussionItem } from '@/components/DiscussionItem';
import { Pagination } from '@/components/Pagination';
import { MessageSquare, BookOpen, Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function InstructorDiscussionsPage() {
  const { user, loading: userLoading } = useCurrentUser();
  const { 
    discussions, 
    loading: discussionsLoading, 
    meta, 
    fetchDiscussions, 
    addReply, 
    markBestAnswer,
    voteDiscussion,
    deleteDiscussion,
    updateDiscussion
  } = useInstructorDiscussions();

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
              Đánh dấu <span className="text-emerald-600 underline">Hữu ích</span> để giúp các học viên khác dễ dàng tìm thấy câu trả lời.
           </p>
        </div>

        {/* Discussions List */}
        <div className="space-y-6">
          {discussionsLoading ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
               <div className="w-12 h-12 border-4 border-black border-t-transparent animate-spin mb-4"></div>
               <p className="font-black uppercase text-xs tracking-widest">Đang tải thảo luận...</p>
            </div>
          ) : discussions.length === 0 ? (
            <div className="bg-white border-4 border-black p-20 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
               <div className="w-20 h-20 bg-gray-100 border-4 border-black flex items-center justify-center mx-auto mb-6 rotate-3">
                  <MessageSquare size={40} className="text-gray-400" />
               </div>
               <h2 className="text-2xl font-black text-black uppercase italic mb-2">Chưa có thảo luận nào!</h2>
               <p className="font-bold text-gray-500">Học viên của bạn vẫn chưa đặt câu hỏi nào trên các bài học.</p>
            </div>
          ) : (
            <div className="space-y-8">
               {Array.isArray(discussions) && discussions.map((d) => (
                 <div key={d.id} className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                    {/* Discussion Meta Header */}
                    <div className="bg-black text-white p-4 flex flex-wrap items-center justify-between gap-4 border-b-4 border-black">
                       <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                             <BookOpen size={14} className="text-indigo-400" />
                             <span className="text-[10px] font-black uppercase tracking-tight truncate max-w-[200px]">
                                {d.course?.title}
                             </span>
                          </div>
                          <div className="flex items-center gap-2">
                             <ChevronRight size={14} className="text-gray-600" />
                             <span className="text-[10px] font-black uppercase tracking-tight text-gray-400">
                                {d.lesson?.title}
                             </span>
                          </div>
                       </div>
                       <div className="flex items-center gap-2 text-gray-400">
                          <Clock size={12} />
                          <span className="text-[10px] font-bold uppercase">
                             {new Date(d.created_at).toLocaleDateString('vi-VN')}
                          </span>
                       </div>
                    </div>

                    {/* Actual Discussion Thread */}
                    <div className="p-8">
                       <DiscussionItem 
                         discussion={d}
                         onMarkBest={markBestAnswer}
                         onVote={voteDiscussion}
                         onDelete={deleteDiscussion}
                         onUpdate={updateDiscussion}
                         onReply={async (content) => { await addReply(d.course_id, d.lesson_id, d.id, content); }}
                         currentUser={user}
                       />
                    </div>

                    {/* Action Footer */}
                    <div className="bg-gray-50 p-4 border-t-2 border-black flex justify-end items-center gap-4">
                       <Link 
                         href={`/courses/${d.course?.slug}/instructor-view?lesson=${d.lesson_id}`}
                         className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:underline"
                       >
                         Xem trong bài học <ChevronRight size={14} />
                       </Link>
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
