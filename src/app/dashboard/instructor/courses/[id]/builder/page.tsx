'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '@/components/MainLayout';
import { toast } from 'react-hot-toast';
import VideoPickerModal from '@/components/instructor/VideoPickerModal';
import QuestionBankManager from '@/components/instructor/QuestionBankManager';
import QuizSettingsModal from '@/components/instructor/QuizSettingsModal';
import { BookOpen, FileQuestion, Settings2, Plus } from 'lucide-react';
import { Button } from '@/components/Button';

export default function CourseBuilderPage() {
  const { id } = useParams();
  const { getToken } = useAuth();
  const router = useRouter();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  const [editLessonIsPreview, setEditLessonIsPreview] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editSelectedVideo, setEditSelectedVideo] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [newLessonIsPreview, setNewLessonIsPreview] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState<'NEW' | 'EDIT' | 'COURSE_PREVIEW'>('NEW');

  // Course Settings
  const [editingCourseSettings, setEditingCourseSettings] = useState(false);
  const [editThumbnailUrl, setEditThumbnailUrl] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editCoursePreviewVideo, setEditCoursePreviewVideo] = useState<any>(null);

  // Quiz states
  const [isBankManagerOpen, setIsBankManagerOpen] = useState(false);
  const [isQuizSettingsOpen, setIsQuizSettingsOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [quizToEdit, setQuizToEdit] = useState<any>(null);
  const [sectionIdForQuiz, setSectionIdForQuiz] = useState<number | null>(null);


  useEffect(() => {
    fetchCourseDetail();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchCourseDetail = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:3001/api/v1/instructor/courses/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const courseData = data.data || data;
        setCourse(courseData);
        setEditThumbnailUrl(courseData.thumbnailUrl || '');
        setEditCoursePreviewVideo(courseData.previewVideo || null);
      } else {
        toast.error('Không tìm thấy khóa học');
        router.push('/dashboard/instructor/courses');
      }
    } catch {
      toast.error('Lỗi khi tải khóa học');
    } finally {
      setLoading(false);
    }
  };

  const uploadFileToServer = async (file: File) => {
    const token = await getToken();
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('http://localhost:3001/api/v1/uploads/image', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) throw new Error('Có lỗi xảy ra khi tải ảnh lên.');
    const { data } = await res.json();
    return data.url;
  };

  const handleUpdateCourseSettings = async () => {
    setIsUploading(true);
    try {
      let finalThumbnailUrl = editThumbnailUrl;
      if (thumbnailFile) {
        finalThumbnailUrl = await uploadFileToServer(thumbnailFile);
      }

      const token = await getToken();
      const res = await fetch(`http://localhost:3001/api/v1/instructor/courses/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          thumbnailUrl: finalThumbnailUrl,
          previewVideoId: editCoursePreviewVideo ? editCoursePreviewVideo.id : null,
        })
      });
      if (res.ok) {
        toast.success('Đã lưu cài đặt khóa học');
        setEditingCourseSettings(false);
        setThumbnailFile(null);
        if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
        setThumbnailPreview(null);
        fetchCourseDetail();
      } else {
        toast.error('Lỗi khi lưu cài đặt');
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi kết nối');
    } finally {
      setIsUploading(false);
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
    } catch {
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
      const body: { title: string; isPreview: boolean; videoId?: number } = { title: newLessonTitle, isPreview: newLessonIsPreview };
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
        setNewLessonIsPreview(false);
        setSelectedVideo(null);
        fetchCourseDetail();
      } else {
        const error = await res.json();
        toast.error(error.message || 'Không thể thêm bài học');
      }
    } catch {
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
      const body: { title: string; isPreview: boolean; videoId?: number } = { title: editLessonTitle, isPreview: editLessonIsPreview };
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
              <p className="text-xs font-black uppercase tracking-widest text-black mb-2">Xây dựng khóa học</p>
              <h1 className="text-2xl font-black text-black uppercase tracking-tight leading-none mb-4">{course?.title}</h1>
              <div className="flex items-center gap-4 mb-4">
                <p className="text-sm font-black text-black border-l-4 border-black pl-3 py-1 bg-yellow-50 inline-block shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  Trạng thái: <span className="uppercase text-black">{course?.status}</span>
                </p>
                <button
                  onClick={() => setEditingCourseSettings(!editingCourseSettings)}
                  className="bg-black border-2 border-black px-4 py-1 text-xs font-black uppercase text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-400 hover:text-black transition-all active:shadow-none active:translate-y-px active:translate-x-px"
                >
                  {editingCourseSettings ? 'TRỞ LẠI' : 'CÀI ĐẶT CHUNG (THUMBNAIL...)'}
                </button>
              </div>

              {editingCourseSettings && (
                <div className="bg-gray-100 border-2 border-black p-4 mb-4 max-w-2xl space-y-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest mb-1 text-black">
                      Ảnh bìa Khóa học
                    </label>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id="thumbnailInput"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setThumbnailFile(file);
                              const preview = URL.createObjectURL(file);
                              setThumbnailPreview(preview);
                            }
                          }}
                        />
                        <label
                          htmlFor="thumbnailInput"
                          className="cursor-pointer bg-black text-white px-4 py-2 text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-px hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
                        >
                          {thumbnailPreview || editThumbnailUrl ? 'ĐỔI ẢNH' : '+ TẢI ẢNH LÊN'}
                        </label>
                        <span className="text-xs font-black text-black uppercase italic">Hoặc dán URL:</span>
                      </div>
                      <input
                        type="text"
                        value={editThumbnailUrl}
                        onChange={(e) => setEditThumbnailUrl(e.target.value)}
                        placeholder="DÁN ĐƯỜNG DẪN ẢNH (VD: HTTPS://IMAGES.UNSPLASH.COM/...)"
                        className="w-full bg-white border-2 border-black px-3 py-2 font-black text-sm text-black outline-none focus:bg-yellow-50 placeholder:text-black"
                      />
                    </div>
                    {(thumbnailPreview || editThumbnailUrl) && (
                      <div className="mt-2 relative inline-block">
                        <img 
                          src={thumbnailPreview || editThumbnailUrl} 
                          alt="Thumbnail Preview" 
                          className="h-24 w-auto object-cover border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" 
                        />
                        {thumbnailPreview && (
                           <button 
                             onClick={() => { setThumbnailFile(null); setThumbnailPreview(null); }}
                             className="absolute -top-2 -right-2 bg-red-500 text-black w-6 h-6 flex items-center justify-center border-2 border-black font-black text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                           >
                             X
                           </button>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest mb-1 text-black">
                      Video Giới thiệu (Preview Video)
                    </label>
                    <div className="flex gap-4 items-center">
                      <button 
                        onClick={() => { setPickerMode('COURSE_PREVIEW'); setPickerOpen(true); }} 
                        className="bg-black text-white px-4 py-2 text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-400 hover:text-black transition-all"
                      >
                        {editCoursePreviewVideo ? 'ĐỔI VIDEO' : '+ CHỌN VIDEO'}
                      </button>
                      {editCoursePreviewVideo && (
                        <span className="text-xs font-black bg-green-200 border-2 border-black px-2 py-1 line-clamp-1">
                          ✓ {editCoursePreviewVideo.title?.substring(0, 30)}...
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={handleUpdateCourseSettings}
                      disabled={isUploading}
                      className="bg-emerald-400 border-2 border-black px-4 py-2 text-xs font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-emerald-500 active:shadow-none active:translate-y-1 active:translate-x-1 transition-all disabled:opacity-50"
                    >
                      {isUploading ? 'ĐANG LƯU...' : 'LƯU CÀI ĐẶT'}
                    </button>
                  </div>
                </div>
              )}

              {course?.status === 'REJECTED' && course?.rejectionReason && (
                <div className="bg-red-50 border-2 border-dashed border-red-500 p-4 mt-2 max-w-2xl">
                  <h4 className="text-red-900 font-black uppercase text-xs mb-1">Lý do từ chối:</h4>
                  <p className="text-red-900 text-sm font-black">{course?.rejectionReason}</p>
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
            
            <button 
              onClick={() => setIsBankManagerOpen(true)}
              className="bg-zinc-800 border-2 border-black px-6 py-3 font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-white hover:bg-black transition-all flex items-center gap-2"
            >
              <BookOpen size={20} /> QUẢN LÝ NGÂN HÀNG CÂU HỎI
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
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
                    <button onClick={() => handleUpdateSection(section.id)} className="bg-emerald-400 border-2 border-black px-4 py-1 text-xs font-black uppercase text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-emerald-500 hover:translate-y-px hover:translate-x-px hover:shadow-none transition-all">LƯU</button>
                    <button onClick={() => setEditingSectionId(null)} className="bg-white border-2 border-black px-4 py-1 text-xs font-black uppercase text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 hover:translate-y-px hover:translate-x-px hover:shadow-none transition-all">HUỶ</button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-lg font-black text-black uppercase">
                      Chương {index + 1}: {section.title}
                    </h2>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => { setEditingSectionId(section.id); setEditSectionTitle(section.title); }}
                        className="bg-yellow-400 border-2 border-black px-4 py-2 text-xs font-black uppercase text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-500 active:shadow-none active:translate-x-px active:translate-y-px transition-all"
                      >
                        SỬA
                      </button>
                      <button 
                        onClick={() => handleDeleteSection(section.id)}
                        className="bg-red-500 border-2 border-black px-4 py-2 text-xs font-black uppercase text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-red-600 active:shadow-none active:translate-x-px active:translate-y-px"
                      >
                        XÓA
                      </button>
                    </div>
                  </>
                )}
              </div>
              <div className="space-y-3 mb-4">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {section.lessons?.map((lesson: any, lIndex: number) => (
                  <div key={lesson.id} className="bg-gray-50 border-2 border-black p-4">
                    {editingLessonId === lesson.id ? (
                      <div className="space-y-4">
                        <div className="flex gap-4 items-center mb-2">
                          <input
                            type="text"
                            value={editLessonTitle}
                            onChange={(e) => setEditLessonTitle(e.target.value)}
                            className="flex-1 bg-white border-2 border-black px-4 py-2 font-black uppercase text-sm text-black outline-none focus:bg-yellow-50 placeholder:text-black"
                          />
                          <label className="flex items-center gap-2 cursor-pointer font-black text-xs uppercase bg-white border-2 border-black px-3 py-2 text-black">
                            <input
                              type="checkbox"
                              checked={editLessonIsPreview}
                              onChange={(e) => setEditLessonIsPreview(e.target.checked)}
                              className="w-4 h-4 accent-black cursor-pointer"
                            />
                            Học thử
                          </label>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex gap-4 items-center">
                            <button onClick={() => { setPickerMode('EDIT'); setPickerOpen(true); }} className="bg-black text-white px-4 py-2 text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-400 hover:text-black transition-all">
                               {editSelectedVideo ? 'ĐỔI VIDEO' : '+ CHỌN VIDEO'}
                            </button>
                            {editSelectedVideo && (
                              <span className="text-xs font-bold bg-green-200 border-2 border-black px-2 py-1 line-clamp-1">✓ {editSelectedVideo.title?.substring(0, 30)}</span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleUpdateLesson(lesson.id)} className="bg-emerald-400 border-2 border-black px-4 py-2 text-xs font-black uppercase text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-emerald-500 transition-all">LƯU</button>
                            <button onClick={() => setEditingLessonId(null)} className="bg-white border-2 border-black px-4 py-2 text-xs font-black uppercase text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 transition-all">HUỶ</button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col gap-1">
                          <div>
                             <span className="font-black text-base uppercase mr-2 text-black">Bài {lIndex + 1}:</span>
                             <span className="font-bold text-base text-black">{lesson.title}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {lesson.isPreview && <span className="bg-yellow-300 text-black border border-black font-black text-[10px] px-2 py-1 uppercase inline-block shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">Học thử</span>}
                            {lesson.youtubeVideoId ? (
                               <span className="bg-emerald-400 text-black border-2 border-black font-black text-[10px] px-2 py-1 uppercase inline-block shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">Đã có Video</span>
                            ) : (
                               <span className="bg-amber-400 text-black border-2 border-black font-black text-[10px] px-2 py-1 uppercase inline-block shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">Thiếu Video</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => { 
                              setEditingLessonId(lesson.id); 
                              setEditLessonTitle(lesson.title); 
                              setEditLessonIsPreview(lesson.isPreview);
                              setEditSelectedVideo(lesson.video ? { id: lesson.video.id, title: lesson.video.title } : null); 
                            }} 
                            className="bg-yellow-400 border-2 border-black px-4 py-2 text-xs font-black uppercase text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-500 active:shadow-none active:translate-x-px active:translate-y-px transition-all"
                          >
                            SỬA
                          </button>
                          <button 
                            onClick={() => handleDeleteLesson(lesson.id)} 
                            className="bg-red-500 border-2 border-black px-4 py-2 text-xs font-black uppercase text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-red-600 active:shadow-none active:translate-x-px active:translate-y-px transition-all"
                          >
                            XÓA
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {addingLessonToSectionId === section.id && (
                  <div className="bg-yellow-50 border-2 border-black p-4 space-y-4">
                    <div className="flex gap-4 items-center">
                      <input
                        type="text"
                        value={newLessonTitle}
                        onChange={(e) => setNewLessonTitle(e.target.value)}
                        placeholder="NHẬP TÊN BÀI HỌC..."
                        className="flex-1 bg-white border-2 border-black px-4 py-2 font-black uppercase text-sm text-black outline-none focus:bg-yellow-50 placeholder:text-black"
                      />
                      <label className="flex items-center gap-2 cursor-pointer font-black text-xs uppercase bg-white border-2 border-black px-3 py-2 text-black hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={newLessonIsPreview}
                          onChange={(e) => setNewLessonIsPreview(e.target.checked)}
                          className="w-4 h-4 accent-black cursor-pointer"
                        />
                        Học thử
                      </label>
                    </div>
                    
                    <div className="flex gap-4 items-center">
                      <button
                        onClick={() => { setPickerMode('NEW'); setPickerOpen(true); }}
                        className="bg-black text-white px-4 py-2 text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-400 hover:text-black transition-all"
                      >
                        {selectedVideo ? 'ĐỔI VIDEO' : '+ CHỌN VIDEO (TÙY CHỌN)'}
                      </button>
                      {selectedVideo && (
                        <span className="text-xs font-bold bg-green-200 border-2 border-black px-2 py-1 line-clamp-1 text-black">
                          ✓ {selectedVideo.title?.substring(0, 30)}...
                        </span>
                      )}
                    </div>
                    
                    <div className="flex justify-end gap-2 border-t-2 border-black pt-4">
                      <button
                        onClick={() => {
                          setAddingLessonToSectionId(null);
                          setNewLessonTitle('');
                          setNewLessonIsPreview(false);
                          setSelectedVideo(null);
                        }}
                        className="bg-white border-2 border-black px-4 py-2 text-xs font-black uppercase border-b-[4px] text-black"
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

              <div className="flex gap-4 mt-6">
                <div className="flex-1">
                  {section.quiz ? (
                    <div className="bg-emerald-50 border-2 border-black p-4 flex justify-between items-center h-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <div className="flex items-center gap-3">
                        <div className="bg-emerald-400 p-2 border-2 border-black">
                          <FileQuestion size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase opacity-60 leading-none mb-1">Kiểm tra chương</p>
                          <h4 className="font-black uppercase text-[11px] line-clamp-1">{section.quiz.title}</h4>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          setQuizToEdit(section.quiz);
                          setSectionIdForQuiz(section.id);
                          setIsQuizSettingsOpen(true);
                        }}
                        className="bg-white border-2 border-black px-3 py-1 text-[10px] font-black uppercase hover:bg-yellow-400 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none whitespace-nowrap"
                      >
                        SỬA
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => {
                        setQuizToEdit(null);
                        setSectionIdForQuiz(section.id);
                        setIsQuizSettingsOpen(true);
                      }}
                      className="w-full bg-emerald-400 border-2 border-black py-3 font-black uppercase text-xs hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-px active:translate-x-px active:shadow-none text-black h-full"
                    >
                      <Plus size={16} /> BÀI KIỂM TRA CHƯƠNG
                    </button>
                  )}
                </div>

                <div className="flex-1">
                  {addingLessonToSectionId !== section.id && (
                    <button 
                      onClick={() => setAddingLessonToSectionId(section.id)}
                      className="w-full h-full bg-yellow-300 border-2 border-black py-3 font-black uppercase text-xs tracking-wider text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-400 hover:translate-y-px hover:translate-x-px hover:shadow-none transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={16} /> BÀI HỌC MỚI
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isAddingSection ? (
            <div className="bg-gray-100 border-2 border-black border-dashed p-6 flex gap-4">
              <input 
                type="text" 
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                placeholder="NHẬP TÊN CHƯƠNG MỚI..."
                className="flex-1 bg-white border-2 border-black px-4 py-2 font-black uppercase placeholder:text-black text-black outline-none focus:bg-yellow-50"
              />
              <button 
                onClick={handleCreateSection}
                className="bg-black text-white px-6 py-2 border-2 border-black font-black uppercase tracking-widest hover:bg-yellow-400 hover:text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                Lưu
              </button>
              <button 
                onClick={() => setIsAddingSection(false)}
                className="bg-white text-black px-4 py-2 border-2 border-black font-black uppercase tracking-widest hover:bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                Hủy
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsAddingSection(true)}
              className="w-full bg-yellow-400 border-4 border-black p-5 text-center font-black uppercase tracking-widest text-black hover:bg-yellow-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all text-sm"
            >
              + THÊM CHƯƠNG MỚI
            </button>
          )}

          {/* Final Quiz Section */}
          <div className="mt-12 border-t-8 border-black pt-12 space-y-6">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter flex items-center gap-4 text-black border-b-8 border-black pb-4">
               <Settings2 size={40} className="text-black" /> BÀI KIỂM TRA CUỐI KHÓA
            </h2>
            <p className="font-black text-lg bg-yellow-400 border-4 border-black p-6 max-w-3xl italic text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-10">
               LƯU Ý: ĐÂY LÀ ĐIỀU KIỆN BẮT BUỘC ĐỂ HỌC VIÊN HOÀN THÀNH KHÓA HỌC. HỌC VIÊN ĐƯỢC LÀM TỐI ĐA 2 LẦN.
            </p>

            {course?.finalQuiz ? (
              <div className="bg-emerald-400 border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center group">
                 <div className="flex items-center gap-6">
                    <div className="bg-white p-4 border-4 border-black">
                       <FileQuestion size={40} />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black uppercase">{course.finalQuiz.title}</h3>
                       <div className="flex gap-4 mt-2">
                           <span className="text-xs font-black uppercase bg-black text-white px-3 py-1 italic shadow-[2px_2px_0px_0px_rgba(255,255,255,0.3)]">Thời gian: {course.finalQuiz.timeLimit}p</span>
                           <span className="text-xs font-black uppercase bg-black text-white px-3 py-1 italic shadow-[2px_2px_0px_0px_rgba(255,255,255,0.3)]">Số câu hỏi: {course.finalQuiz.numQuestions}</span>
                           <span className="text-xs font-black uppercase bg-black text-white px-3 py-1 italic shadow-[2px_2px_0px_0px_rgba(255,255,255,0.3)]">Điểm đạt: {course.finalQuiz.passingScore}%</span>
                       </div>
                    </div>
                 </div>
                 <Button 
                   onClick={() => {
                     setQuizToEdit(course.finalQuiz);
                     setSectionIdForQuiz(null);
                     setIsQuizSettingsOpen(true);
                   }}
                   className="bg-white text-black hover:bg-yellow-400 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] h-16 px-8 text-lg font-black"
                 >
                    CÀI ĐẶT
                 </Button>
              </div>
            ) : (
              <div className="bg-white border-8 border-black border-dashed p-16 text-center group cursor-pointer hover:bg-emerald-400 transition-all shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] active:translate-x-2 active:translate-y-2 active:shadow-none"
                   onClick={() => {
                     setQuizToEdit(null);
                     setSectionIdForQuiz(null);
                     setIsQuizSettingsOpen(true);
                   }}
              >
                 <Plus className="mx-auto mb-8 group-hover:rotate-90 transition-transform text-black" size={80} />
                 <h3 className="text-3xl font-black uppercase text-black italic tracking-tighter">CHƯA CÓ BÀI KIỂM TRA CUỐI KHÓA</h3>
                 <p className="text-xl font-black italic text-black mt-4 border-t-2 border-black pt-4 inline-block uppercase">Nhấp vào đây để thêm bài kiểm tra rèn luyện kiến thức tổng hợp</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <VideoPickerModal 
        isOpen={pickerOpen} 
        onClose={() => setPickerOpen(false)} 
        onSelect={(id, videoData) => {
          if (pickerMode === 'EDIT') {
            setEditSelectedVideo(videoData);
          } else if (pickerMode === 'COURSE_PREVIEW') {
            setEditCoursePreviewVideo(videoData);
          } else {
            setSelectedVideo(videoData);
          }
          setPickerOpen(false);
        }} 
      />

      {isBankManagerOpen && (
        <QuestionBankManager courseId={Number(id)} onClose={() => setIsBankManagerOpen(false)} />
      )}

      {isQuizSettingsOpen && (
        <QuizSettingsModal 
          courseId={Number(id)}
          sectionId={sectionIdForQuiz}
          quiz={quizToEdit}
          onClose={() => setIsQuizSettingsOpen(false)}
          onSaved={fetchCourseDetail}
        />
      )}
    </MainLayout>
  );
}
