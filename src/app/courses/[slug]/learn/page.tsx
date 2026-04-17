'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useMemo, useCallback } from 'react';
import MainLayout from '@/components/MainLayout';
import { YouTubePlayer } from '@/components/YouTubePlayer';
import { useCourseLearn } from '@/hooks/useCourseLearn';
import { Lesson } from '@/hooks/useCourseDetail';
import { useEnrolledCourses } from '@/hooks/useEnrolledCourses';
import { useLessonProgress } from '@/hooks/useLessonProgress';
import LoadingScreen from '@/components/LoadingScreen';
import { useDiscussions, Discussion } from '@/hooks/useDiscussions';
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
  Award,
  Send,
  Zap,
  Target,
  Flag,
  ChevronLeft,
  Trash2,
  Pencil,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export default function LearnPage() {
  const { slug } = useParams() as { slug: string };
  const { course, loading: courseLoading, error: courseError } = useCourseLearn(slug);
  const { enrollments, loading: enrollLoading } = useEnrolledCourses();
  const { user } = useCurrentUser();
  const router = useRouter();
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  // Find current enrollment
  const enrollment = useMemo(() => {
    if (!course || !enrollments) return null;
    return enrollments.find(e => e.course.slug === slug || e.course_id === course.id);
  }, [course?.id, enrollments, slug]);
  
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
  
  const { discussions, addDiscussion, loading: discussionsLoading, markBestAnswer, deleteDiscussion, updateDiscussion } = useDiscussions(activeLesson?.id);
  const [qaSearch, setQaSearch] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);

  // Set initial active lesson
  useEffect(() => {
    if (course && course.sections.length > 0 && !activeLesson) {
      const firstLesson = course.sections[0].lessons[0];
      if (firstLesson) setActiveLesson(firstLesson);
    }
  }, [course, activeLesson]);

  // Handle section expansion
  useEffect(() => {
    if (course) {
      const initial: Record<number, boolean> = {};
      course.sections.forEach(s => {
        initial[s.id] = true;
      });
      setExpandedSections(initial);
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

  const currentProgress = activeLesson ? progressMap[activeLesson.id] : null;


  const toggleBestAnswer = async (id: number) => {
    try {
      await markBestAnswer(id);
    } catch (err: any) {
      toast.error(err.message);
    }
  };


  const handlePrev = () => {
    if (currentIndex > 0) {
      setActiveLesson(allLessons[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < allLessons.length - 1) {
      setActiveLesson(allLessons[currentIndex + 1]);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#f0f0f0] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px] p-4 lg:p-8">
        <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-8">
          
          {/* Main Mission Control Area */}
          <div className="flex-1 flex flex-col gap-6">
            
            {/* Header: Mission Status */}
            <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => router.push(`/courses/${course.slug}`)}
                  className="w-14 h-14 border-4 border-black bg-white hover:bg-yellow-400 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 flex items-center justify-center"
                >
                  <ArrowLeft className="w-6 h-6 text-black" />
                </button>
                <div>
                  <h1 className="text-3xl font-black text-black uppercase tracking-tighter leading-none mb-2">
                    {course.title}
                  </h1>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black px-2 py-1 bg-black text-white uppercase tracking-widest">MISSION IN PROGRESS</span>
                    <span className="text-[10px] font-black px-2 py-1 bg-emerald-400 border-2 border-black text-black uppercase tracking-widest">
                      {enrollment?.progress_percent}% COMPLETED
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Progress Gauges */}
              <div className="flex items-center gap-4">
                <div className="w-48 h-8 bg-gray-100 border-4 border-black relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                  <div 
                    className="h-full bg-emerald-400 border-right-4 border-black transition-all duration-1000" 
                    style={{ width: `${enrollment?.progress_percent}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-black uppercase tracking-[0.2em] drop-shadow-[0_1.2px_1.2px_rgba(255,255,255,0.8)]">PROGRESS GAUGE</span>
                </div>
              </div>
            </div>

            {/* Stage Frame: Video Player */}
            <div className="relative group">
              <div className="bg-white border-4 border-black p-4 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
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
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)]"></div>
                    <span className="text-[10px] font-black text-white uppercase tracking-tighter bg-black/50 px-2 py-1">LIVE_SESSION: {activeLesson?.title}</span>
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
                  className={`flex-1 md:flex-none px-10 py-5 font-black uppercase text-sm border-r-4 border-black transition-colors ${activeTab === 'overview' ? 'bg-black text-white' : 'hover:bg-yellow-400 text-black'}`}
                >
                  <div className="flex items-center justify-center gap-3">
                    <Info className="w-4 h-4" /> TỔNG QUAN
                  </div>
                </button>
                <button 
                  onClick={() => setActiveTab('qa')}
                  className={`flex-1 md:flex-none px-10 py-5 font-black uppercase text-sm border-r-4 border-black transition-colors ${activeTab === 'qa' ? 'bg-black text-white' : 'hover:bg-yellow-400 text-black'}`}
                >
                  <div className="flex items-center justify-center gap-3">
                    <MessageSquare className="w-4 h-4" /> THẢO LUẬN ({discussions.length})
                  </div>
                </button>
              </div>

              <div className="p-8">
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
                              } catch (err: any) {
                                toast.error(err.message);
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
                           <div className="w-12 h-12 border-4 border-black border-t-transparent animate-spin"></div>
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
            <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sticky top-8">
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
                              onClick={() => setActiveLesson(lesson)}
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
                      </div>
                    )}
                  </div>
                ))}
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

function DiscussionItem({ 
  discussion, 
  onMarkBest, 
  onDelete,
  onUpdate,
  onReply, 
  currentUser,
  level = 0 
}: { 
  discussion: Discussion, 
  onMarkBest: (id: number) => void, 
  onDelete: (id: number) => void,
  onUpdate: (id: number, content: string) => void,
  onReply: (content: string) => Promise<void>, 
  currentUser: any,
  level?: number 
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(discussion.content);

  return (
    <div className={`space-y-6 animate-in slide-in-from-left-4 duration-300 ${level > 0 ? 'ml-12 border-l-4 border-black pl-8 mt-6' : ''}`}>
      <div className={`p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 ${discussion.is_best_answer ? 'bg-emerald-50' : 'bg-white'}`}>
        <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-black border-dotted">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-black border-4 border-black overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {discussion.user.avatarUrl ? (
                <img src={discussion.user.avatarUrl} alt={discussion.user.fullName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-yellow-400 flex items-center justify-center font-black italic">USER</div>
              )}
            </div>
            <div>
              <p className="text-lg font-black text-black leading-none mb-1 uppercase tracking-tighter">{discussion.user.fullName || 'ANONYMOUS'}</p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black px-1 bg-black text-white border border-black uppercase">{discussion.user.role?.roleName || 'STUDENT'}</span>
                <p className="text-[10px] font-black text-black uppercase tracking-widest">{new Date(discussion.created_at).toLocaleString()}</p>
                {discussion.is_edited && (
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter italic"> (ĐÃ CHỈNH SỬA)</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!discussion.is_deleted && currentUser?.id === discussion.user.id && (
              <button 
                onClick={() => {
                  setIsEditing(true);
                  setEditContent(discussion.content);
                }}
                className="w-10 h-10 border-2 border-black flex items-center justify-center hover:bg-yellow-400 text-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
            {!discussion.is_deleted && (currentUser?.id === discussion.user.id || ['ADMIN', 'STAFF', 'INSTRUCTOR'].includes(currentUser?.role?.roleName || '')) && (
              <button 
                onClick={() => onDelete(discussion.id)}
                className="w-10 h-10 border-2 border-black flex items-center justify-center hover:bg-red-500 hover:text-white text-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            {discussion.is_best_answer && !discussion.is_deleted && (
              <div className="bg-emerald-400 border-4 border-black text-black text-xs font-black px-4 py-2 flex items-center gap-2 uppercase tracking-tighter shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Award className="w-4 h-4" /> CÂU TRẢ LỜI ĐÚNG
              </div>
            )}
          </div>
        </div>
        
        <div className={`text-md font-bold text-black leading-relaxed mb-8 whitespace-pre-line p-6 border-2 border-black ${discussion.is_deleted ? 'bg-gray-100 italic opacity-60' : 'bg-gray-50'}`}>
          {isEditing ? (
            <div className="space-y-4">
              <textarea 
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full h-32 p-4 border-2 border-black font-black text-sm text-black focus:outline-none focus:bg-white resize-none"
              />
              <div className="flex justify-end gap-4">
                <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>HỦY</Button>
                <Button 
                  size="sm"
                  onClick={async () => {
                    await onUpdate(discussion.id, editContent);
                    setIsEditing(false);
                  }}
                >
                  LƯU THAY ĐỔI
                </Button>
              </div>
            </div>
          ) : (
            discussion.is_deleted ? discussion.content.replace(/_/g, '') : discussion.content
          )}
        </div>
        
        <div className="flex items-center gap-6">
          {!discussion.is_deleted && (
            <>
              <button 
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2 bg-black text-white px-4 py-2 hover:bg-yellow-400 hover:text-black transition-colors"
              >
                <MessageSquare className="w-4 h-4" /> TRẢ LỜI
              </button>
              <button 
                onClick={() => onMarkBest(discussion.id)}
                className={`text-[11px] font-black uppercase tracking-widest flex items-center gap-2 px-4 py-2 border-2 border-black transition-colors ${discussion.is_best_answer ? 'bg-emerald-400 text-black shadow-[4px_4px_0px_0px_rgba(34,197,94,1)]' : 'bg-white text-black hover:bg-emerald-50'}`}
              >
                <Award className="w-4 h-4 text-black" /> {discussion.is_best_answer ? 'HỦY ĐÁNH DẤU' : 'HỮU ÍCH'}
              </button>
            </>
          )}
        </div>

        {showReplyForm && (
          <div className="mt-8 pt-8 border-t-4 border-black border-double animate-in fade-in slide-in-from-top-4">
            <textarea 
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="NHẬP PHẢN HỒI INTELLIGENCE CỦA BẠN..."
              className="w-full h-32 p-4 border-4 border-black font-black text-sm text-black focus:outline-none focus:bg-yellow-50 mb-4 resize-none placeholder:text-black/10"
            />
            <div className="flex justify-end gap-4">
              <Button variant="outline" size="sm" onClick={() => setShowReplyForm(false)}>HỦY</Button>
              <Button 
                size="sm"
                onClick={async () => {
                  if (!replyContent.trim()) return;
                  await onReply(replyContent);
                  setReplyContent('');
                  setShowReplyForm(false);
                }}
                disabled={!replyContent.trim()}
              >
                GỬI PHẢN HỒI
              </Button>
            </div>
          </div>
        )}
      </div>

      {discussion.children && discussion.children.length > 0 && (
        <div className="space-y-6">
          {discussion.children.map((child) => (
            <DiscussionItem 
              key={child.id} 
              discussion={child} 
              onMarkBest={onMarkBest} 
              onDelete={onDelete}
              onUpdate={onUpdate}
              onReply={onReply} 
              currentUser={currentUser}
              level={level + 1} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
