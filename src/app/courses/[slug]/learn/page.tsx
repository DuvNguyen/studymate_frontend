'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, useMemo, useCallback, useTransition } from 'react';
import MainLayout from '@/components/MainLayout';
import { YouTubePlayer } from '@/components/YouTubePlayer';
import { useCourseLearn } from '@/hooks/useCourseLearn';
import { Lesson } from '@/hooks/useCourseDetail';
import { useEnrolledCourses } from '@/hooks/useEnrolledCourses';
import { useLessonProgress } from '@/hooks/useLessonProgress';
import LoadingScreen from '@/components/LoadingScreen';
import { useDiscussions, Discussion } from '@/hooks/useDiscussions';
import { DiscussionItem } from '@/components/DiscussionItem';
import { Button } from '@/components/Button';
import { 
  Play, 
  CheckCircle, 
  MessageSquare, 
  Info,
  Search, 
  ChevronRight, 
  ChevronDown,
  ArrowLeft,
  Send,
  Zap,
  Target,
  Flag,
  ChevronLeft,
  FileQuestion,
  FolderArchive,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function LearnPage() {
  const { slug } = useParams() as { slug: string };
  const { course, loading: courseLoading, error: courseError } = useCourseLearn(slug);
  const { enrollments, loading: enrollLoading } = useEnrolledCourses();
  const { user } = useCurrentUser();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  // Find current enrollment
  const enrollment = useMemo(() => {
    if (!course || !enrollments) return null;
    return enrollments.find(e => e.course.slug === slug || e.course_id === course.id);
  }, [course, enrollments, slug]);
  
  // Lesson navigation logic
  const allLessons = useMemo(() => {
    if (!course) return [];
    return course.sections.flatMap(s => s.lessons);
  }, [course]);

  const currentIndex = useMemo(() => {
    if (!activeLesson || allLessons.length === 0) return -1;
    return allLessons.findIndex(l => l.id === activeLesson.id);
  }, [activeLesson, allLessons]);

  const { progressMap, upsertProgress } = useLessonProgress(enrollment?.id);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'qa'>('overview');
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});
  const [mobileBoardOpen, setMobileBoardOpen] = useState(false);
  
  const { discussions, addDiscussion, loading: discussionsLoading, markBestAnswer, deleteDiscussion, updateDiscussion, voteDiscussion } = useDiscussions(activeLesson?.id);
  const [qaSearch, setQaSearch] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  
  const granularProgress = useMemo(() => {
    if (!allLessons || allLessons.length === 0) return 0;
    
    let totalValue = 0;
    allLessons.forEach(lesson => {
      const prog = progressMap[lesson.id];
      if (prog?.completed) {
        totalValue += 1;
      } else if (prog?.watched_duration && lesson.durationSecs) {
        // Add partial completion (capped at 0.99 to avoid jumping to 100% without 'completed' flag)
        totalValue += Math.min(prog.watched_duration / lesson.durationSecs, 0.99);
      }
    });
    
    // Fallback to backend enrollment percent if frontend calculation is lower 
    // (ensures we don't show less than what the server already confirmed)
    const calculated = Math.floor((totalValue / allLessons.length) * 100);
    return Math.max(calculated, enrollment?.progress_percent || 0);
  }, [allLessons, progressMap, enrollment?.progress_percent]);

  // Set initial active lesson
  useEffect(() => {
    if (course && course.sections.length > 0 && !activeLesson) {
      const firstLesson = course.sections[0].lessons[0];
      if (firstLesson) setTimeout(() => setActiveLesson(firstLesson), 0);
    }
  }, [course, activeLesson]);

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

  const handleProgress = useCallback(async (currentTime: number, duration: number) => {
    if (!activeLesson || !enrollment) return;
    
    const progressPercent = (currentTime / duration) * 100;
    const isActuallyLongEnough = duration > 30; // Min 30s to consider auto-complete
    const shouldMarkCompleted = progressPercent > 90 && isActuallyLongEnough;

    // Only update if current time is ahead of previously saved duration or we are marking completed
    const existingWatched = progressMap[activeLesson.id]?.watched_duration || 0;
    const isCompleted = progressMap[activeLesson.id]?.completed;
    
    if (currentTime > existingWatched || (shouldMarkCompleted && !isCompleted)) {
      await upsertProgress(activeLesson.id, currentTime, shouldMarkCompleted || isCompleted);
    }
  }, [activeLesson, enrollment, progressMap, upsertProgress]);

  const handleLessonEnd = useCallback(async () => {
    if (activeLesson) {
      await upsertProgress(activeLesson.id, activeLesson.durationSecs || 0, true);
      toast.success('CHÚC MỪNG! BẠN ĐÃ HOÀN THÀNH BÀI HỌC.');
    }
  }, [activeLesson, upsertProgress]);

  if (courseLoading || enrollLoading) {
    return (
      <MainLayout>
        <LoadingScreen 
          title="KHỞI TẠO NHIỆM VỤ..." 
          description="ĐANG TẢI DỮ LIỆU BÀI HỌC VÀ TIẾN ĐỘ CỦA BẠN. VUI LÒNG CHỜ GIÂY LÁT."
          fullScreen={false}
        />
      </MainLayout>
    );
  }

  if (courseError || !course) {
    return (
      <MainLayout>
        <div className="p-12 text-center border-8 border-black m-12 bg-red-100 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
          <Flag className="w-20 h-20 mx-auto mb-6 text-black" />
          <h1 className="text-5xl font-black mb-6 italic text-black uppercase tracking-tighter">MISSION ABORTED: 404</h1>
          <p className="text-xl font-black mb-10 text-black uppercase">KHÔNG TÌM THẤY KHÓA HỌC TRONG CƠ SỞ DỮ LIỆU</p>
          <Button size="lg" onClick={() => router.push('/courses')} className="bg-black text-white hover:bg-yellow-400">
            QUAY LẠI DANH SÁCH
          </Button>
        </div>
      </MainLayout>
    );
  }

  if (!enrollment && !courseLoading && !enrollLoading) {
    return (
      <MainLayout>
        <div className="p-16 text-center border-8 border-black m-12 bg-white shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
          <div className="w-24 h-24 bg-yellow-400 border-4 border-black mx-auto mb-8 flex items-center justify-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <Zap className="w-12 h-12 text-black" />
          </div>
          <h1 className="text-5xl font-black mb-6 text-black tracking-tighter uppercase">ACCESS DENIED</h1>
          <p className="text-xl font-black mb-12 text-black uppercase border-y-4 border-black py-4 inline-block">Vui lòng mua khóa học để bắt đầu hành trình.</p>
          <div className="flex justify-center gap-4">
            <Button size="lg" variant="outline" onClick={() => router.push('/courses')}>HỦY BỎ</Button>
            <Button size="lg" onClick={() => router.push(`/courses/${course.slug}`)}>MUA KHÓA HỌC NGAY</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (course?.status === 'ARCHIVED') {
    return (
      <MainLayout>
        <div className="p-16 text-center border-8 border-black m-12 bg-white shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
          <div className="w-24 h-24 bg-amber-400 border-4 border-black mx-auto mb-8 flex items-center justify-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] -rotate-3">
            <FolderArchive className="w-12 h-12 text-black" />
          </div>
          <h1 className="text-5xl font-black mb-6 text-black tracking-tighter uppercase italic">Khóa học đang được lưu trữ</h1>
          <p className="text-xl font-black mb-12 text-black uppercase border-y-4 border-black py-4 inline-block">
             GIẢNG VIÊN ĐÃ TẠM THỜI LƯU TRỮ KHÓA HỌC NÀY. BẠN HIỆN KHÔNG THỂ VÀO HỌC NỘI DUNG.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" onClick={() => router.push('/dashboard/student/courses')}>QUAY LẠI KHÓA HỌC CỦA TÔI</Button>
          </div>
          <p className="mt-8 text-xs font-black opacity-30 uppercase tracking-[0.3em]">Status: COURSE_STATUS_ARCHIVED</p>
        </div>
      </MainLayout>
    );
  }

  const currentProgress = activeLesson ? progressMap[activeLesson.id] : null;


  const toggleBestAnswer = async (id: number) => {
    try {
      await markBestAnswer(id);
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
    }
  };


  const handlePrev = () => {
    if (currentIndex > 0) {
      startTransition(() => {
        setActiveLesson(allLessons[currentIndex - 1]);
      });
    }
  };

  const handleNext = () => {
    if (currentIndex < allLessons.length - 1) {
      startTransition(() => {
        setActiveLesson(allLessons[currentIndex + 1]);
      });
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#f0f0f0] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px] p-2 sm:p-3 lg:p-8">
        <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-4 lg:gap-8">
          
          {/* Main Mission Control Area */}
          <div className="flex-1 flex flex-col gap-6">
            
            {/* Header: Mission Status */}
            <div className="bg-white border-4 border-black p-3 sm:p-4 md:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-6">
              <div className="flex items-start sm:items-center gap-3 sm:gap-6">
                <button 
                  onClick={() => router.push(`/courses/${course.slug}`)}
                  className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 border-4 border-black bg-white hover:bg-yellow-400 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 flex items-center justify-center"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-black" />
                </button>
                <div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-black uppercase tracking-tighter leading-none mb-2">
                    {course.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                    <span className="text-[10px] font-black px-2 py-1 bg-black text-white uppercase tracking-widest">MISSION IN PROGRESS</span>
                    <span className="text-[10px] font-black px-2 py-1 bg-emerald-400 border-2 border-black text-black uppercase tracking-widest">
                      {granularProgress}% COMPLETED
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Progress Gauges */}
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="w-full md:w-48 h-8 bg-gray-100 border-4 border-black relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                  <div 
                    className="h-full bg-emerald-400 border-right-4 border-black transition-all duration-500" 
                    style={{ width: `${granularProgress}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-black uppercase tracking-[0.2em] drop-shadow-[0_1.2px_1.2px_rgba(255,255,255,0.8)]">MISSION PROGRESS: {granularProgress}%</span>
                </div>
              </div>
            </div>

            {/* Stage Frame: Video Player */}
            <div className="relative group">
              <div className="bg-white border-4 border-black p-2 sm:p-3 md:p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative">
                {isPending && (
                   <div className="absolute inset-4 z-20 bg-white/60 backdrop-blur-[1px] flex flex-col items-center justify-center animate-in fade-in duration-200">
                      <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center gap-4">
                         <LoadingSpinner size="lg" />
                         <p className="text-[10px] font-black uppercase tracking-widest text-black">Đang chuyển bài học...</p>
                      </div>
                   </div>
                )}
                <div className="aspect-video bg-black relative overflow-hidden border-4 border-black">
                  {activeLesson?.youtubeVideoId ? (
                    <YouTubePlayer 
                      key={activeLesson.id}
                      videoId={activeLesson.youtubeVideoId}
                      initialTime={currentProgress?.watched_duration || 0}
                      onProgress={handleProgress}
                      onEnd={handleLessonEnd}
                    />
                  ) : activeLesson?.content ? (
                    <div className="bg-white p-12 h-full overflow-y-auto prose max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: activeLesson.content }} />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-white gap-4">
                      <div className="w-12 h-12 border-4 border-white animate-pulse"></div>
                      <p className="font-black uppercase tracking-widest italic">Signal Lost... Awaiting Content</p>
                    </div>
                  )}

                  {/* Status Overlay */}
                  <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10 flex items-center gap-2 max-w-[85%] pointer-events-none">
                    <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)]"></div>
                    <span className="text-[9px] sm:text-[10px] font-black text-white uppercase tracking-tighter bg-black/50 px-2 py-1 truncate">LIVE_SESSION: {activeLesson?.title}</span>
                  </div>
                </div>
              </div>

              {/* Navigation Controls over Video Area */}
              <div className="mt-4 flex justify-between items-center gap-4">
                 <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={handlePrev}
                      disabled={currentIndex <= 0}
                      className="h-12 w-12 !px-0 flex items-center justify-center disabled:opacity-30"
                    >
                       <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleNext}
                      disabled={currentIndex >= allLessons.length - 1}
                      className="h-12 w-12 !px-0 flex items-center justify-center disabled:opacity-30"
                    >
                       <ChevronRight className="w-6 h-6" />
                    </Button>
                 </div>
                 
                 <Button 
                    size="lg"
                    onClick={handleLessonEnd}
                    className={`${currentProgress?.completed ? 'bg-emerald-400 hover:bg-emerald-500' : 'bg-yellow-400 hover:bg-yellow-500'} flex-1 md:flex-none h-12`}
                  >
                    {currentProgress?.completed ? (
                      <span className="flex items-center gap-2 italic">MISSION ACCOMPLISHED <CheckCircle className="w-5 h-5 font-black" /></span>
                    ) : (
                      <span className="italic">COMPLETE MISSION</span>
                    )}
                  </Button>
              </div>
            </div>

            {/* Intelligence Area: Tabs */}
            <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex border-b-4 border-black">
                <button 
                  onClick={() => setActiveTab('overview')}
                  className={`flex-1 md:flex-none px-3 sm:px-6 md:px-10 py-3 sm:py-4 md:py-5 font-black uppercase text-[11px] sm:text-xs md:text-sm border-r-4 border-black transition-colors ${activeTab === 'overview' ? 'bg-black text-white' : 'hover:bg-yellow-400 text-black'}`}
                >
                  <div className="flex items-center justify-center gap-3">
                    <Info className="w-4 h-4" /> TỔNG QUAN
                  </div>
                </button>
                <button 
                  onClick={() => setActiveTab('qa')}
                  className={`flex-1 md:flex-none px-3 sm:px-6 md:px-10 py-3 sm:py-4 md:py-5 font-black uppercase text-[11px] sm:text-xs md:text-sm border-r-4 border-black transition-colors ${activeTab === 'qa' ? 'bg-black text-white' : 'hover:bg-yellow-400 text-black'}`}
                >
                  <div className="flex items-center justify-center gap-3">
                    <MessageSquare className="w-4 h-4" /> THẢO LUẬN ({discussions.length})
                  </div>
                </button>
              </div>

              <div className="p-4 sm:p-6 md:p-8">
                {activeTab === 'overview' ? (
                  <div className="animate-in fade-in duration-500">
                    <div className="flex items-center gap-4 mb-8">
                      <Target className="w-8 h-8 text-black" />
                      <h2 className="text-3xl font-black uppercase tracking-tighter text-black">PHÂN TÍCH NHIỆM VỤ</h2>
                    </div>
                    <div className="text-lg font-bold text-black leading-[1.8] border-l-8 border-yellow-400 pl-8 bg-gray-50 p-8">
                      {course.description || 'Chưa có thông tin phân tích chi tiết cho nhiệm vụ này.'}
                    </div>
                  </div>
                ) : (
                  <div className="animate-in fade-in duration-500 space-y-8">
                    {/* Q&A Terminal */}
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-black/30" />
                        <input 
                          type="text" 
                          placeholder="SEARCH INTELLIGENCE BASE..." 
                          value={qaSearch}
                          onChange={(e) => setQaSearch(e.target.value)}
                          className="w-full pl-14 pr-6 py-4 border-4 border-black bg-white focus:bg-yellow-50 focus:outline-none font-black text-black placeholder:text-black/20 uppercase tracking-widest"
                        />
                      </div>
                      <Button size="lg" onClick={() => setIsAsking(true)} className="h-16">
                        ĐĂNG CÂU HỎI MỚI
                      </Button>
                    </div>

                    {isAsking && (
                      <div className="border-4 border-black p-8 bg-yellow-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <h3 className="text-2xl font-black mb-6 uppercase italic text-black">NHẬP THẮC MẮC CỦA BẠN</h3>
                        <textarea 
                          value={newQuestion}
                          onChange={(e) => setNewQuestion(e.target.value)}
                          placeholder="Mô tả kỹ để giảng viên có thể hỗ trợ bạn tốt nhất..."
                          className="w-full h-40 p-6 border-4 border-black font-bold text-black focus:outline-none bg-white mb-6 resize-none"
                        />
                        <div className="flex justify-end gap-4">
                          <Button variant="outline" size="lg" onClick={() => setIsAsking(false)}>HỦY</Button>
                          <Button 
                            size="lg"
                            className="bg-black text-white"
                            onClick={async () => {
                              if (!newQuestion.trim()) return;
                                try {
                                  await addDiscussion(course.id, newQuestion);
                                  setNewQuestion('');
                                  setIsAsking(false);
                                  toast.success('ĐÃ ĐĂNG CÂU HỎI LÊN HỆ THỐNG!');
                                } catch (err) {
                                  const error = err as Error;
                                  toast.error(error.message);
                                }
                            }}
                          >
                            XÁC NHẬN GỬI <Send className="w-5 h-5 ml-2" />
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-8 pb-12">
                      {discussionsLoading ? (
                        <div className="flex items-center justify-center py-20">
                           <LoadingSpinner size="lg" />
                        </div>
                      ) : discussions.length === 0 ? (
                        <div className="text-center py-24 border-4 border-dashed border-black bg-gray-50 opacity-50">
                          <MessageSquare className="w-20 h-20 mx-auto mb-6 text-black" />
                          <p className="text-2xl font-black text-black uppercase italic">Chưa có dữ liệu thảo luận bài học.</p>
                        </div>
                      ) : (
                        discussions.map((d: Discussion) => (
                          <DiscussionItem 
                          key={d.id} 
                          discussion={d} 
                          onMarkBest={toggleBestAnswer}
                          onVote={voteDiscussion}
                          onDelete={deleteDiscussion}
                          onUpdate={updateDiscussion}
                          onReply={async (content) => {
                             if (!course) return;
                             await addDiscussion(course.id, content, d.id);
                             toast.success('PHẢN HỒI THÀNH CÔNG!');
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

          {/* Syllabus Sidebar: Operations Board */}
          <div className="w-full lg:w-[400px] flex-shrink-0">
            <div className="lg:hidden mb-3">
              <button
                onClick={() => setMobileBoardOpen((prev) => !prev)}
                className="w-full h-11 bg-white border-4 border-black font-black text-[11px] uppercase tracking-widest text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                {mobileBoardOpen ? 'ẨN DANH SÁCH BÀI HỌC' : 'MỞ DANH SÁCH BÀI HỌC'}
              </button>
            </div>
            <div className={`${mobileBoardOpen ? 'block' : 'hidden'} lg:block bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] lg:sticky lg:top-8`}>
              <div className="p-6 border-b-4 border-black bg-black flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-none animate-pulse"></div>
                  <h2 className="text-xl font-black uppercase text-white tracking-widest italic">Operations Board</h2>
                </div>
                <span className="text-[10px] font-black text-white/50">{course.sections.length} SECTIONS</span>
              </div>
              
              <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                {course.sections.map((section, sIndex) => (
                  <div key={section.id} className="border-b-4 border-black last:border-0">
                    <button 
                      onClick={() => setExpandedSections(prev => ({ ...prev, [section.id]: !prev[section.id] }))}
                      className={`w-full p-5 flex items-center justify-between transition-colors ${expandedSections[section.id] ? 'bg-white' : 'bg-gray-50 hover:bg-yellow-50'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 border-4 border-black flex items-center justify-center bg-black text-white shrink-0">
                           <span className="font-black text-lg italic">{sIndex + 1}</span>
                        </div>
                        <span className="font-black text-black uppercase tracking-tight text-left leading-tight truncate" title={section.title}>{section.title}</span>
                      </div>
                      {expandedSections[section.id] ? <ChevronDown className="w-6 h-6 text-black" /> : <ChevronRight className="w-6 h-6 text-black" />}
                    </button>

                    {expandedSections[section.id] && (
                      <div className="bg-gray-100 p-2 space-y-2 border-t-4 border-dotted border-black">
                        {section.lessons.map((lesson) => {
                          const isCompleted = progressMap[lesson.id]?.completed;
                          const isActive = activeLesson?.id === lesson.id;
                          
                          return (
                            <button
                              key={lesson.id}
                              onClick={() => {
                                startTransition(() => {
                                  setActiveLesson(lesson);
                                });
                              }}
                              className={`w-full p-4 flex items-center justify-between transition-all border-2 border-black relative group ${isActive ? 'bg-yellow-400 translate-x-2 translate-y-[-4px] shadow-[-8px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-white hover:bg-yellow-50 hover:translate-x-1 hover:translate-y-[-2px] hover:shadow-[-4px_2px_0px_0px_rgba(0,0,0,1)]'}`}
                            >
                              <div className="flex items-center gap-4 flex-1 min-w-0">
                                {isCompleted ? (
                                  <div className="w-8 h-8 bg-black border-2 border-black flex items-center justify-center shrink-0">
                                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                                  </div>
                                ) : (
                                  <div className={`w-8 h-8 border-2 border-black flex items-center justify-center shrink-0 ${isActive ? 'bg-white' : 'bg-gray-100'}`}>
                                    <Play className={`w-4 h-4 ${isActive ? 'text-black fill-black' : 'text-black'}`} />
                                  </div>
                                )}
                                <span className={`text-[12px] font-black text-left uppercase leading-tight truncate text-black ${isActive ? 'italic' : ''}`} title={lesson.title}>
                                  {lesson.title}
                                </span>
                              </div>
                              <div className="flex flex-col items-end shrink-0 ml-4">
                                <span className="text-[10px] font-black uppercase text-black">DUR.</span>
                                <span className="text-[12px] font-black italic text-black">
                                  {Math.floor(lesson.durationSecs / 60)}m
                                </span>
                              </div>
                            </button>
                          );
                        })}

                        {/* Section Quiz */}
                        {section.quiz && (
                          <Link
                            href={`/courses/${slug}/test/${section.quiz.id}`}
                            className="w-full p-4 flex items-center justify-between transition-all border-2 border-black bg-emerald-50 hover:bg-emerald-400 hover:translate-x-1 hover:translate-y-[-2px] hover:shadow-[-4px_2px_0px_0px_rgba(0,0,0,1)] group"
                          >
                             <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className="w-8 h-8 border-2 border-black bg-white flex items-center justify-center shrink-0 group-hover:bg-black group-hover:text-white transition-colors">
                                   <FileQuestion size={16} />
                                </div>
                                <span className="text-[12px] font-black text-left uppercase leading-tight truncate text-black">
                                   BÀI KIỂM TRA: {section.quiz.title}
                                </span>
                             </div>
                             <div className="flex flex-col items-end shrink-0 ml-4">
                                <span className="text-[10px] font-black uppercase text-black">EXAM</span>
                                <span className="text-[12px] font-black italic text-black">
                                   {section.quiz.numQuestions} Qs
                                </span>
                             </div>
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Final Exam Section in Sidebar */}
                {course.finalQuiz && (
                  <div className="p-4 border-b-4 border-black bg-rose-50">
                    <Link
                      href={`/courses/${slug}/test/${course.finalQuiz.id}`}
                      className="w-full p-6 border-4 border-black bg-black text-white hover:bg-rose-600 transition-all flex flex-col gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 group"
                    >
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Final Assessment</span>
                          <FileQuestion size={24} className="text-white group-hover:rotate-12 transition-transform" />
                       </div>
                       <h3 className="text-xl font-black uppercase italic tracking-tighter leading-none">{course.finalQuiz.title}</h3>
                       <p className="text-[10px] font-bold italic text-white/70">YÊU CẦU: ĐẠT {course.finalQuiz.passingScore}% ĐỂ NHẬN CHỨNG CHỈ</p>
                    </Link>
                  </div>
                )}
              </div>
              
              {/* Footer Stamp */}
              <div className="p-6 bg-yellow-400 border-t-4 border-black flex flex-col gap-2">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-black">ENROLLMENT_VERIFIED</span>
                    <CheckCircle className="w-4 h-4 text-black" />
                 </div>
                 <div className="text-[8px] font-bold opacity-30 break-all">SM-SYS-UID-{enrollment.id}-AUTH-HASH-VALID</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
