'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import MainLayout from '@/components/MainLayout';
import { YouTubePlayer } from '@/components/YouTubePlayer';
import { useCourseLearn } from '@/hooks/useCourseLearn';
import { Lesson } from '@/hooks/useCourseDetail';
import LoadingScreen from '@/components/LoadingScreen';
import { useInstructorDiscussions } from '@/hooks/useInstructorDiscussions';
import { Discussion } from '@/hooks/useDiscussions';
import { DiscussionItem } from '@/components/DiscussionItem';
import { Button } from '@/components/Button';
import { 
  Play, 
  MessageSquare, 
  ChevronRight, 
  ChevronDown,
  Target,
  ChevronLeft,
  Settings,
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useCurrentUser } from '@/hooks/useCurrentUser';

/**
 * CHẾ ĐỘ XEM CỦA GIẢNG VIÊN (INSTRUCTOR VIEW)
 * Tách biệt hoàn toàn với lộ trình học của học viên.
 * Không check enrollment, không lưu progress.
 */
export default function InstructorViewPage() {
  const { slug } = useParams() as { slug: string };
  const { course, loading: courseLoading, error: courseError } = useCourseLearn(slug);
  const { user, loading: userLoading } = useCurrentUser();
  const router = useRouter();
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  const [activeTab, setActiveTab] = useState<'overview' | 'qa'>('overview');
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});
  
  // Sử dụng hook riêng cho giảng viên để quản lý thảo luận (có quyền xóa, mark best, etc)
  const { 
    discussions, 
    loading: discussionsLoading, 
    addReply, 
    markBestAnswer, 
    deleteDiscussion, 
    updateDiscussion, 
    voteDiscussion 
  } = useInstructorDiscussions();

  const allLessons = useMemo(() => {
    if (!course) return [];
    return course.sections.flatMap(s => s.lessons);
  }, [course]);

  const currentIndex = useMemo(() => {
    if (!activeLesson || allLessons.length === 0) return -1;
    return allLessons.findIndex(l => l.id === activeLesson.id);
  }, [activeLesson, allLessons]);

  // Set initial active lesson
  useEffect(() => {
    if (course && course.sections.length > 0 && !activeLesson) {
      const searchParams = new URLSearchParams(window.location.search);
      const lessonId = searchParams.get('lesson');
      
      if (lessonId) {
        const targetLesson = allLessons.find(l => l.id === Number(lessonId));
        if (targetLesson) {
          setTimeout(() => setActiveLesson(targetLesson), 0);
          return;
        }
      }

      const firstLesson = course.sections[0].lessons[0];
      if (firstLesson) setTimeout(() => setActiveLesson(firstLesson), 0);
    }
  }, [course, activeLesson, allLessons]);

  // Handle section expansion
  useEffect(() => {
    if (course) {
      const initial: Record<number, boolean> = {};
      course.sections.forEach(s => {
        initial[s.id] = true;
      });
      setTimeout(() => setExpandedSections(initial), 0);
    }
  }, [course]);

  const handlePrev = () => {
    if (currentIndex > 0) setActiveLesson(allLessons[currentIndex - 1]);
  };

  const handleNext = () => {
    if (currentIndex < allLessons.length - 1) setActiveLesson(allLessons[currentIndex + 1]);
  };

  if (courseLoading || userLoading) {
    return (
      <MainLayout role="INSTRUCTOR" allowedRoles={['INSTRUCTOR']}>
        <LoadingScreen 
          title="ĐANG CHUẨN BỊ PHÒNG ĐIỀU KHIỂN..." 
          description="ĐANG TẢI DỮ LIỆU KHÓA HỌC DƯỚI QUYỀN GIẢNG VIÊN."
          fullScreen={false}
        />
      </MainLayout>
    );
  }

  if (courseError || !course) {
    return (
      <MainLayout role="INSTRUCTOR" allowedRoles={['INSTRUCTOR']}>
        <div className="p-12 text-center border-8 border-black m-12 bg-red-100 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
          <h1 className="text-5xl font-black mb-6 italic text-black uppercase tracking-tighter">ERROR: ACCESS_DENIED</h1>
          <p className="text-xl font-black mb-10 text-black uppercase">BẠN KHÔNG CÓ QUYỀN TRUY CẬP HOẶC KHÓA HỌC KHÔNG TỒN TẠI.</p>
          <Button size="lg" onClick={() => router.push('/dashboard/instructor/courses')} className="bg-black text-white">
            QUAY LẠI DASHBOARD
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout role="INSTRUCTOR" allowedRoles={['INSTRUCTOR']}>
      <div className="min-h-screen bg-[#f7f7f7] p-4 lg:p-8">
        {/* Instructor Mode Banner */}
        <div className="max-w-[1600px] mx-auto mb-8 bg-black text-white p-4 border-4 border-black flex items-center justify-between shadow-[8px_8px_0px_0px_rgba(251,191,36,1)]">
           <div className="flex items-center gap-4">
              <ShieldCheck className="w-8 h-8 text-yellow-400" />
              <div>
                 <h2 className="font-black uppercase italic tracking-widest text-lg">Chế độ xem Giảng viên</h2>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Bạn đang xem nội dung với tư cách là chủ sở hữu. Các tiến trình học tập sẽ không được lưu lại.</p>
              </div>
           </div>
           <div className="flex gap-4">
              <Button 
                variant="outline" 
                className="bg-white text-black border-2 border-white hover:bg-yellow-400"
                onClick={() => router.push(`/dashboard/instructor/courses/${course.id}/builder`)}
              >
                 <Settings size={16} className="mr-2" /> CHỈNH SỬA
              </Button>
              <Button 
                className="bg-yellow-400 text-black border-2 border-black hover:bg-white"
                onClick={() => router.push('/dashboard/instructor/courses')}
              >
                 DASHBOARD
              </Button>
           </div>
        </div>

        <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-8">
          
          {/* Main Area */}
          <div className="flex-1 flex flex-col gap-6">
            
            {/* Header */}
            <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
               <div className="flex items-center gap-6">
                  <div className="w-14 h-14 border-4 border-black bg-zinc-100 flex items-center justify-center shrink-0">
                     <BookOpen className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-black text-black uppercase tracking-tighter leading-none mb-2">
                      {course.title}
                    </h1>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-black px-2 py-1 bg-zinc-800 text-white uppercase tracking-widest">COURSE_PREVIEW</span>
                      <span className="text-[10px] font-black px-2 py-1 bg-white border-2 border-black text-black uppercase tracking-widest">
                        {course.status}
                      </span>
                    </div>
                  </div>
               </div>
            </div>

            {/* Video Player Area */}
            <div className="bg-white border-4 border-black p-4 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
              <div className="aspect-video bg-black relative overflow-hidden border-4 border-black">
                {activeLesson?.youtubeVideoId ? (
                  <YouTubePlayer 
                    key={activeLesson.id}
                    videoId={activeLesson.youtubeVideoId}
                    initialTime={0}
                    onProgress={() => {}} // Instructors don't save progress
                    onEnd={() => toast.success('XEM XONG BÀI HỌC (CHẾ ĐỘ PREVIEW)')}
                  />
                ) : activeLesson?.content ? (
                  <div className="bg-white p-12 h-full overflow-y-auto prose max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: activeLesson.content }} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-white gap-4">
                    <div className="w-12 h-12 border-4 border-white animate-pulse"></div>
                    <p className="font-black uppercase tracking-widest italic text-center">Nội dung bài học chưa được tải lên.<br/>Vui lòng vào Builder để cập nhật.</p>
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                 <div className="flex gap-2">
                    <Button variant="outline" onClick={handlePrev} disabled={currentIndex <= 0} className="border-2 border-black h-12 w-12 !px-0 flex items-center justify-center">
                       <ChevronLeft />
                    </Button>
                    <Button variant="outline" onClick={handleNext} disabled={currentIndex >= allLessons.length - 1} className="border-2 border-black h-12 w-12 !px-0 flex items-center justify-center">
                       <ChevronRight />
                    </Button>
                 </div>
                 <div className="text-[10px] font-black uppercase tracking-widest bg-gray-100 px-4 py-3 border-2 border-black italic">
                    BÀI HỌC HIỆN TẠI: {activeLesson?.title}
                 </div>
              </div>
            </div>

            {/* Tabs (Overview & Q&A) */}
            <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex border-b-4 border-black">
                <button 
                  onClick={() => setActiveTab('overview')}
                  className={`px-10 py-5 font-black uppercase text-sm border-r-4 border-black transition-colors ${activeTab === 'overview' ? 'bg-black text-white' : 'hover:bg-yellow-400 text-black'}`}
                >
                  TỔNG QUAN
                </button>
                <button 
                  onClick={() => setActiveTab('qa')}
                  className={`px-10 py-5 font-black uppercase text-sm border-r-4 border-black transition-colors ${activeTab === 'qa' ? 'bg-black text-white' : 'hover:bg-yellow-400 text-black'}`}
                >
                  QUẢN LÝ THẢO LUẬN
                </button>
              </div>

              <div className="p-8">
                {activeTab === 'overview' ? (
                  <div className="animate-in fade-in duration-500">
                    <div className="flex items-center gap-4 mb-8">
                      <Target className="w-8 h-8 text-black" />
                      <h2 className="text-3xl font-black uppercase tracking-tighter text-black">Mô tả khóa học</h2>
                    </div>
                    <div className="text-lg font-bold text-black leading-[1.8] border-l-8 border-black pl-8 bg-gray-50 p-8">
                      {course.description || 'Chưa có mô tả cho khóa học này.'}
                    </div>
                  </div>
                ) : (
                  <div className="animate-in fade-in duration-500 space-y-8">
                    <div className="bg-amber-100 border-4 border-black p-6 flex items-center gap-4 italic font-bold text-black uppercase text-sm">
                       <ShieldCheck className="shrink-0" /> Tại đây bạn có thể phản hồi học viên và quản lý các thảo luận của bài học này.
                    </div>
                    
                    <div className="space-y-8 pb-12">
                      {discussionsLoading ? (
                        <div className="flex items-center justify-center py-20">
                           <div className="w-12 h-12 border-4 border-black border-t-transparent animate-spin"></div>
                        </div>
                      ) : discussions.length === 0 ? (
                        <div className="text-center py-24 border-4 border-dashed border-black bg-gray-50 opacity-50">
                          <MessageSquare className="w-20 h-20 mx-auto mb-6 text-black" />
                          <p className="text-2xl font-black text-black uppercase italic">Chưa có thảo luận nào trong bài học này.</p>
                        </div>
                      ) : (
                        discussions.map((d: Discussion) => (
                          <DiscussionItem 
                            key={d.id} 
                            discussion={d} 
                            onMarkBest={markBestAnswer}
                            onVote={voteDiscussion}
                            onDelete={deleteDiscussion}
                            onUpdate={updateDiscussion}
                            onReply={async (content) => {
                               await addReply(course.id, activeLesson?.id || 0, d.id, content);
                               toast.success('ĐÃ GỬI PHẢN HỒI GIẢNG VIÊN!');
                            }}
                            currentUser={user}
                          />
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-[400px] flex-shrink-0">
            <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sticky top-8">
              <div className="p-6 border-b-4 border-black bg-black text-white">
                <h2 className="text-xl font-black uppercase tracking-widest italic">Nội dung bài giảng</h2>
              </div>
              
              <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                {course.sections.map((section, sIndex) => (
                  <div key={section.id} className="border-b-4 border-black last:border-0">
                    <button 
                      onClick={() => setExpandedSections(prev => ({ ...prev, [section.id]: !prev[section.id] }))}
                      className="w-full p-5 flex items-center justify-between bg-zinc-50 hover:bg-yellow-50"
                    >
                      <div className="flex items-center gap-4">
                        <span className="font-black text-lg italic">{sIndex + 1}.</span>
                        <span className="font-black text-black uppercase tracking-tight text-left leading-tight truncate">{section.title}</span>
                      </div>
                      {expandedSections[section.id] ? <ChevronDown /> : <ChevronRight />}
                    </button>

                    {expandedSections[section.id] && (
                      <div className="bg-white p-2 space-y-2 border-t-2 border-black">
                        {section.lessons.map((lesson) => (
                          <button
                            key={lesson.id}
                            onClick={() => setActiveLesson(lesson)}
                            className={`w-full p-4 flex items-center gap-4 border-2 border-black transition-all ${activeLesson?.id === lesson.id ? 'bg-black text-white translate-x-1' : 'bg-white text-black hover:bg-gray-100'}`}
                          >
                            <Play size={14} />
                            <span className="text-xs font-bold uppercase truncate">{lesson.title}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="p-6 bg-yellow-400 border-t-4 border-black text-center">
                 <Button 
                   className="w-full bg-black text-white border-2 border-black hover:bg-white hover:text-black font-black uppercase italic"
                   onClick={() => router.push(`/dashboard/instructor/courses/${course.id}/builder`)}
                 >
                    QUAY LẠI BUILDER
                 </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
