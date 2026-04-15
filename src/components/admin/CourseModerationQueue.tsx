'use client';

import { useState, useEffect } from 'react';
import { useAdminCourses } from '@/hooks/useAdminCourses';
import { Button } from '@/components/Button';

export default function CourseModerationQueue() {
  const { courses, loading, error, fetchCourses, approveCourse, rejectCourse } = useAdminCourses();
  const [rejectReason, setRejectReason] = useState('');
  const [activeCourseId, setActiveCourseId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetchCourses({ page: 1, limit: 50, status: 'PENDING_REVIEW' });
  }, [fetchCourses]);

  const refetch = () => fetchCourses({ page: 1, limit: 50, status: 'PENDING_REVIEW' });

  const handleApprove = async (id: number) => {
    if (!window.confirm("Xác nhận phê duyệt khóa học này? Khóa học sẽ được PUBLISH.")) return;
    try {
      await approveCourse(id);
      refetch();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleReject = async (id: number) => {
    if (!rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }
    try {
      await rejectCourse(id, rejectReason);
      setRejectReason('');
      setActiveCourseId(null);
      refetch();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 flex justify-between items-center">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-black/70 mb-1">Kiếm duyệt nội dung</p>
          <h1 className="text-3xl font-black text-black uppercase tracking-tight leading-none">Hàng đợi Khóa học</h1>
        </div>
        <Button onClick={refetch} variant="outline" size="sm">
          Làm mới ↻
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-none animate-spin" />
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-16 text-center">
          <p className="text-xl font-black uppercase tracking-widest text-black/40 leading-none">
            Không có khóa học nào đang chờ duyệt.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {courses.map((course) => (
            <div key={course.id} className="relative z-0">
              <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-8 flex flex-col md:flex-row gap-8 relative z-10">
                <div className="flex-1">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <h3 className="text-2xl font-black text-black uppercase leading-tight">
                      {course.title}
                    </h3>
                    <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 bg-amber-300 text-black border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] whitespace-nowrap">
                      Chờ duyệt
                    </span>
                  </div>
                  <p className="text-xs font-black text-black/70 mb-6 uppercase tracking-widest">
                    GV: {course.instructor?.fullName || 'N/A'} • Giá: {course.price}đ • Danh mục: {course.category?.name || 'N/A'}
                  </p>
                  
                  <div className="grid grid-cols-3 gap-6 text-sm mb-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-yellow-50 p-6">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black/80 block mb-1">Chương</span>
                      <strong className="text-base font-black text-black underline decoration-2">{course.sectionCount}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black/80 block mb-1">Bài học</span>
                      <strong className="text-base font-black text-black">{course.lessonCount}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black/80 block mb-1">Tổng thời lượng</span>
                      <strong className="text-base font-black text-black italic">{Math.floor((course.totalDuration || 0) / 60)} phút</strong>
                    </div>
                  </div>

                  <Button 
                    onClick={() => setExpandedId(expandedId === course.id ? null : course.id)} 
                    variant={expandedId === course.id ? 'primary' : 'outline'}
                    size="sm"
                    className="text-[10px]"
                  >
                    {expandedId === course.id ? 'Đóng chi tiết ∧' : 'Xem nội dung khóa học ∨'}
                  </Button>
                </div>

                <div className="flex flex-col justify-center gap-4 w-full md:w-48 border-t-4 border-black md:border-t-0 md:border-l-4 md:pl-8 pt-6 md:pt-0">
                  <Button 
                    onClick={() => handleApprove(course.id)}
                    className="bg-emerald-400 py-4 hover:bg-emerald-500"
                  >
                    Phê Duyệt
                  </Button>
                  <Button 
                    onClick={() => setActiveCourseId(course.id)}
                    variant="danger"
                    className="py-4 bg-red-400 text-black hover:bg-red-500"
                  >
                    Từ chối
                  </Button>
                </div>
              </div>

              {expandedId === course.id && (
                <div className="bg-white border-x-2 border-b-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-8 pt-12 mt-[-10px] space-y-8 relative z-0 animate-in slide-in-from-top-4 fade-in duration-300">
                  <div className="space-y-4">
                    <h4 className="font-black text-xs uppercase tracking-[0.3em] border-b-4 border-black pb-2 inline-block text-black">Nội dung chi tiết</h4>
                    
                    {course.sections?.map((section: any, index: number) => (
                      <div key={section.id} className="border-2 border-black p-4 mb-4 bg-gray-50">
                        <h5 className="font-black text-sm uppercase text-black mb-3">Chương {index + 1}: {section.title}</h5>
                        <div className="space-y-2">
                          {section.lessons?.map((lesson: any, lIndex: number) => (
                            <div key={lesson.id} className="bg-white border-2 border-black p-3 text-xs flex justify-between items-center relative overflow-hidden">
                              <span className="font-bold relative z-10 text-black">Bài {lIndex + 1}: {lesson.title}</span>
                              <div className="flex gap-2">
                                {lesson.isPreview && <span className="bg-blue-200 border-2 border-black text-[9px] px-2 py-0.5 font-black uppercase">Preview</span>}
                                {lesson.youtubeVideoId ? (
                                  <span className="bg-emerald-200 border-2 border-black text-[9px] px-2 py-0.5 font-black uppercase">Có Video</span>
                                ) : (
                                  <span className="bg-amber-200 border-2 border-black text-[9px] px-2 py-0.5 font-black uppercase">Chưa có video</span>
                                )}
                              </div>
                            </div>
                          ))}
                          {(!section.lessons || section.lessons.length === 0) && (
                            <p className="text-[10px] uppercase font-black text-gray-500 italic p-2 border-2 border-dashed border-gray-300">Chương này chưa có bài học.</p>
                          )}
                        </div>
                      </div>
                    ))}
                    {(!course.sections || course.sections.length === 0) && (
                      <div className="bg-yellow-50 border-2 border-black p-4 text-center">
                        <p className="text-xs font-black uppercase italic text-black/60">Khóa học này đang trống, không có nội dung.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeCourseId === course.id && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
                  <div className="bg-white border-4 border-black p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-xl w-full">
                    <h2 className="text-3xl font-black uppercase mb-6 tracking-tighter leading-none">Từ chối Khóa học</h2>
                    <p className="text-xs font-black text-black/70 uppercase tracking-[0.2em] mb-6">Khóa học: {course.title}</p>
                    
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Nhập lý do chi tiết (VD: Nội dung bài 2 vi phạm bản quyền)..."
                      className="w-full border-4 border-black p-6 font-black text-lg bg-gray-50 focus:bg-yellow-50 outline-none placeholder:text-black/30 min-h-[160px] mb-8 shadow-inner transition-colors"
                    />

                    <div className="flex gap-6">
                      <Button 
                        onClick={() => handleReject(course.id)}
                        className="flex-1 bg-red-400 text-black py-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-red-500"
                      >
                        Xác nhận từ chối
                      </Button>
                      <Button 
                        onClick={() => { setActiveCourseId(null); setRejectReason(''); }}
                        variant="outline"
                        className="px-10 py-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100"
                      >
                        Hủy
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
