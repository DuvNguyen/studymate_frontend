'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '@/components/MainLayout';
import { toast } from 'react-hot-toast';
import VideoPickerModal from '@/components/instructor/VideoPickerModal';

export default function CourseBuilderPage() {
  const { id } = useParams();
  const { getToken } = useAuth();
  const router = useRouter();

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');

  const [addingLessonToSectionId, setAddingLessonToSectionId] = useState<number | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [editSectionTitle, setEditSectionTitle] = useState('');

  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
  const [editLessonTitle, setEditLessonTitle] = useState('');
  const [editSelectedVideo, setEditSelectedVideo] = useState<any>(null);

  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState<'NEW' | 'EDIT'>('NEW');


  useEffect(() => {
    fetchCourseDetail();
  }, [id]);

  const fetchCourseDetail = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:3001/api/v1/instructor/courses/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCourse(data.data || data);
      } else {
        toast.error('Không tìm thấy khóa học');
        router.push('/dashboard/instructor/courses');
      }
    } catch (e) {
      toast.error('Lỗi khi tải khóa học');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSection = async () => {
    if (!newSectionTitle.trim()) return;
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:3001/api/v1/instructor/courses/${id}/sections`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: newSectionTitle })
      });
      if (res.ok) {
        toast.success('Đã thêm chương học');
        setNewSectionTitle('');
        setIsAddingSection(false);
        fetchCourseDetail();
      } else {
        toast.error('Không thể thêm chương học');
      }
    } catch (e) {
      toast.error('Lỗi kết nối');
    }
  };

  const handleSubmitCourse = async () => {
    if (!confirm('Bạn có chắc chắn muốn gửi duyệt khóa học này? Sau khi gửi, bạn sẽ không thể chỉnh sửa cho đến khi có kết quả duyệt.')) return;
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:3001/api/v1/instructor/courses/${id}/submit`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Đã gửi khóa học để phê duyệt');
        fetchCourseDetail();
      } else {
        const error = await res.json();
        toast.error(error.message || 'Lỗi gửi duyệt khóa học');
      }
    } catch {
      toast.error('Lỗi kết nối');
    }
  };

  const handleCreateLesson = async (sectionId: number) => {
    if (!newLessonTitle.trim()) {
      toast.error('Vui lòng nhập tên bài học');
      return;
    }
    try {
      const token = await getToken();
      const body: any = { title: newLessonTitle };
      if (selectedVideo) {
        body.videoId = selectedVideo.id;
      }
      const res = await fetch(`http://localhost:3001/api/v1/instructor/sections/${sectionId}/lessons`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        toast.success('Đã thêm bài học');
        setAddingLessonToSectionId(null);
        setNewLessonTitle('');
        setSelectedVideo(null);
        fetchCourseDetail();
      } else {
        const error = await res.json();
        toast.error(error.message || 'Không thể thêm bài học');
      }
    } catch (e) {
      toast.error('Lỗi kết nối');
    }
  };

  const handleUpdateSection = async (sectionId: number) => {
    if (!editSectionTitle.trim()) return;
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:3001/api/v1/instructor/sections/${sectionId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editSectionTitle })
      });
      if (res.ok) {
        toast.success('Đã cập nhật chương');
        setEditingSectionId(null);
        fetchCourseDetail();
      } else {
        toast.error('Lỗi khi cập nhật chương');
      }
    } catch { toast.error('Lỗi kết nối'); }
  };

  const handleDeleteSection = async (sectionId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa chương này (bao gồm tất cả bài học bên trong)?')) return;
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:3001/api/v1/instructor/sections/${sectionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Đã xóa chương');
        fetchCourseDetail();
      } else {
        toast.error('Lỗi khi xóa chương');
      }
    } catch { toast.error('Lỗi kết nối'); }
  };

  const handleUpdateLesson = async (lessonId: number) => {
    if (!editLessonTitle.trim()) return;
    try {
      const token = await getToken();
      const body: any = { title: editLessonTitle };
      if (editSelectedVideo) {
        body.videoId = editSelectedVideo.id;
      }
      const res = await fetch(`http://localhost:3001/api/v1/instructor/lessons/${lessonId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        toast.success('Đã cập nhật bài học');
        setEditingLessonId(null);
        fetchCourseDetail();
      } else {
        const error = await res.json();
        toast.error(error.message || 'Lỗi khi cập nhật bài học');
      }
    } catch { toast.error('Lỗi kết nối'); }
  };

  const handleDeleteLesson = async (lessonId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài học này?')) return;
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:3001/api/v1/instructor/lessons/${lessonId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Đã xóa bài học');
        fetchCourseDetail();
      } else {
        toast.error('Lỗi khi xóa bài học');
      }
    } catch { toast.error('Lỗi kết nối'); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="w-8 h-8 border-4 border-black border-t-transparent animate-spin rounded-none" />
      </div>
    );
  }

  return (
    <MainLayout role="INSTRUCTOR">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-black/70 mb-1">Xây dựng khóa học</p>
              <h1 className="text-3xl font-black text-black uppercase tracking-tight leading-none mb-4">{course?.title}</h1>
              <p className="text-sm font-bold text-black border-l-4 border-black pl-3 py-1 bg-yellow-50 mb-2 inline-block">
                Trạng thái: <span className="uppercase">{course?.status}</span>
              </p>
              {course?.status === 'REJECTED' && course?.rejectionReason && (
                <div className="bg-red-50 border-2 border-dashed border-red-500 p-4 mt-2 max-w-2xl">
                  <h4 className="text-red-800 font-black uppercase text-xs mb-1">Lý do từ chối:</h4>
                  <p className="text-red-900 text-sm font-medium">{course?.rejectionReason}</p>
                </div>
              )}
            </div>
            
            {(course?.status === 'DRAFT' || course?.status === 'REJECTED') && (
              <button 
                onClick={handleSubmitCourse}
                className="bg-emerald-400 border-2 border-black px-6 py-3 font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                Gửi duyệt khóa học
              </button>
            )}
            {course?.status === 'PENDING_REVIEW' && (
              <div className="bg-amber-300 border-2 border-black px-6 py-3 font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black">
                Đang chờ duyệt
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {course?.sections?.map((section: any, index: number) => (
            <div key={section.id} className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
              <div className="flex justify-between items-center mb-4 border-b-2 border-black pb-2">
                {editingSectionId === section.id ? (
                  <div className="flex gap-2 w-full pr-4">
                    <input
                      type="text"
                      value={editSectionTitle}
                      onChange={(e) => setEditSectionTitle(e.target.value)}
                      className="flex-1 bg-white border-2 border-black px-2 py-1 font-black uppercase text-sm outline-none focus:bg-yellow-50"
                    />
                    <button onClick={() => handleUpdateSection(section.id)} className="bg-emerald-400 border-2 border-black px-3 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-px hover:translate-x-px hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">Lưu</button>
                    <button onClick={() => setEditingSectionId(null)} className="bg-white border-2 border-black px-3 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-px hover:translate-x-px hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">Hủy</button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-black text-black uppercase">
                      Chương {index + 1}: {section.title}
                    </h2>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingSectionId(section.id); setEditSectionTitle(section.title); }} className="text-xs font-black uppercase bg-yellow-100 border-2 border-black px-2 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-200">Sửa</button>
                      <button onClick={() => handleDeleteSection(section.id)} className="text-xs font-black uppercase bg-red-100 border-2 border-black px-2 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-red-200 text-red-900">Xóa</button>
                    </div>
                  </>
                )}
              </div>
              <div className="space-y-3 mb-4">
                {section.lessons?.map((lesson: any, lIndex: number) => (
                  <div key={lesson.id} className="bg-gray-50 border-2 border-black p-4">
                    {editingLessonId === lesson.id ? (
                      <div className="space-y-4">
                        <input
                          type="text"
                          value={editLessonTitle}
                          onChange={(e) => setEditLessonTitle(e.target.value)}
                          className="w-full bg-white border-2 border-black px-4 py-2 font-black uppercase text-sm outline-none"
                        />
                        <div className="flex justify-between items-center">
                          <div className="flex gap-4 items-center">
                            <button onClick={() => { setPickerMode('EDIT'); setPickerOpen(true); }} className="bg-black text-white px-4 py-2 text-xs font-black uppercase">
                              {editSelectedVideo ? 'ĐỔI VIDEO' : '+ CHỌN VIDEO'}
                            </button>
                            {editSelectedVideo && (
                              <span className="text-xs font-bold bg-green-200 border-2 border-black px-2 py-1 line-clamp-1">✓ {editSelectedVideo.title?.substring(0, 30)}</span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleUpdateLesson(lesson.id)} className="bg-emerald-400 border-2 border-black px-4 py-2 text-xs font-black uppercase block shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">Lưu</button>
                            <button onClick={() => setEditingLessonId(null)} className="bg-white border-2 border-black px-4 py-2 text-xs font-black uppercase block shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">Hủy</button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col gap-1">
                          <div>
                            <span className="font-black text-sm uppercase mr-2 text-black">Bài {lIndex + 1}:</span>
                            <span className="font-bold text-sm text-black">{lesson.title}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {lesson.youtubeVideoId ? (
                               <span className="bg-emerald-100 text-emerald-900 border border-black font-black text-[10px] px-2 py-1 uppercase inline-block">Đã có Video</span>
                            ) : (
                               <span className="bg-amber-100 text-amber-900 border border-black font-black text-[10px] px-2 py-1 uppercase inline-block">Thiếu Video</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => { setEditingLessonId(lesson.id); setEditLessonTitle(lesson.title); setEditSelectedVideo(lesson.video ? { id: lesson.video.id, title: lesson.video.title } : null); }} className="text-xs font-black uppercase bg-white border-2 border-black px-2 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100">Sửa</button>
                          <button onClick={() => handleDeleteLesson(lesson.id)} className="text-xs font-black uppercase bg-red-50 text-red-900 border-2 border-black px-2 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-red-100">Xóa</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {addingLessonToSectionId === section.id && (
                  <div className="bg-yellow-50 border-2 border-black p-4 space-y-4">
                    <input
                      type="text"
                      value={newLessonTitle}
                      onChange={(e) => setNewLessonTitle(e.target.value)}
                      placeholder="NHẬP TÊN BÀI HỌC..."
                      className="w-full bg-white border-2 border-black px-4 py-2 font-black uppercase text-sm outline-none"
                    />
                    
                    <div className="flex gap-4 items-center">
                      <button
                        onClick={() => { setPickerMode('NEW'); setPickerOpen(true); }}
                        className="bg-black text-white px-4 py-2 text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      >
                        {selectedVideo ? 'ĐỔI VIDEO' : '+ CHỌN VIDEO (TÙY CHỌN)'}
                      </button>
                      {selectedVideo && (
                        <span className="text-xs font-bold bg-green-200 border-2 border-black px-2 py-1 line-clamp-1">
                          ✓ {selectedVideo.title?.substring(0, 30)}...
                        </span>
                      )}
                    </div>
                    
                    <div className="flex justify-end gap-2 border-t-2 border-black pt-4">
                      <button
                        onClick={() => {
                          setAddingLessonToSectionId(null);
                          setNewLessonTitle('');
                          setSelectedVideo(null);
                        }}
                        className="bg-white border-2 border-black px-4 py-2 text-xs font-black uppercase border-b-[4px]"
                      >
                        HỦY
                      </button>
                      <button
                        onClick={() => handleCreateLesson(section.id)}
                        className="bg-emerald-400 border-2 border-black px-4 py-2 text-xs font-black uppercase border-b-[4px]"
                      >
                        LƯU BÀI HỌC
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {addingLessonToSectionId !== section.id && (
                <button 
                  onClick={() => setAddingLessonToSectionId(section.id)}
                  className="text-xs font-black uppercase tracking-widest text-black bg-yellow-100 border-2 border-black px-4 py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-200 transition-colors mt-2"
                >
                  + Thêm bài học
                </button>
              )}
            </div>
          ))}

          {isAddingSection ? (
            <div className="bg-gray-100 border-2 border-black border-dashed p-6 flex gap-4">
              <input 
                type="text" 
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                placeholder="NHẬP TÊN CHƯƠNG MỚI..."
                className="flex-1 bg-white border-2 border-black px-4 py-2 font-black uppercase placeholder:text-gray-400 outline-none focus:bg-yellow-50"
              />
              <button 
                onClick={handleCreateSection}
                className="bg-black text-white px-6 py-2 border-2 border-black font-black uppercase tracking-widest hover:bg-gray-800"
              >
                Lưu
              </button>
              <button 
                onClick={() => setIsAddingSection(false)}
                className="bg-white text-black px-4 py-2 border-2 border-black font-black uppercase tracking-widest hover:bg-gray-100"
              >
                Hủy
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsAddingSection(true)}
              className="w-full bg-gray-100 border-2 border-black border-dashed p-6 text-center font-black uppercase tracking-widest text-black/60 hover:bg-gray-200 hover:text-black transition-colors"
            >
              + THÊM CHƯƠNG MỚI
            </button>
          )}
        </div>
      </div>

      <VideoPickerModal 
        isOpen={pickerOpen} 
        onClose={() => setPickerOpen(false)} 
        onSelect={(id, videoData) => {
          if (pickerMode === 'EDIT') {
            setEditSelectedVideo(videoData);
          } else {
            setSelectedVideo(videoData);
          }
          setPickerOpen(false);
        }} 
      />
    </MainLayout>
  );
}
