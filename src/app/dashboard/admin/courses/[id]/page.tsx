'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/Button';
import { ArrowLeft } from 'lucide-react';

interface LessonItem {
  id: number;
  title: string;
  youtubeVideoId?: string | null;
  isPreview?: boolean;
  durationSecs?: number | null;
}

interface SectionItem {
  id: number;
  title: string;
  lessons: LessonItem[];
}

interface CourseDetail {
  id: number;
  title: string;
  slug: string;
  status: string;
  price: number;
  rejectionReason?: string | null;
  instructor?: { fullName?: string | null };
  category?: { name?: string | null };
  sections: SectionItem[];
}

export default function AdminCourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getToken, isLoaded } = useAuth();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoaded || !id) return;

    const fetchDetail = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/courses/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        const payload = json.data || json;
        setCourse(payload || null);
      } catch {
        setCourse(null);
      } finally {
        setLoading(false);
      }
    };

    void fetchDetail();
  }, [getToken, id, isLoaded]);

  const allLessons = useMemo(() => {
    if (!course?.sections) return [];
    return course.sections.flatMap((section) => section.lessons || []);
  }, [course]);

  const selectedLesson = useMemo(() => {
    if (!allLessons.length) return null;
    if (selectedLessonId) {
      const found = allLessons.find((l) => l.id === selectedLessonId);
      if (found) return found;
    }
    return allLessons.find((l) => !!l.youtubeVideoId) || allLessons[0];
  }, [allLessons, selectedLessonId]);

  if (loading) {
    return (
      <MainLayout role="ADMIN" allowedRoles={['ADMIN', 'STAFF']}>
        <div className="w-[calc(100%-12px)] sm:w-full max-w-7xl mx-auto py-10 flex justify-center">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-none animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (!course) {
    return (
      <MainLayout role="ADMIN" allowedRoles={['ADMIN', 'STAFF']}>
        <div className="w-[calc(100%-12px)] sm:w-full max-w-7xl mx-auto py-10">
          <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-8">
            <p className="text-sm font-black uppercase text-black">Không tìm thấy khóa học.</p>
            <Button className="mt-4" onClick={() => router.push('/dashboard/admin/courses')}>
              Quay lại duyệt khóa học
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout role="ADMIN" allowedRoles={['ADMIN', 'STAFF']}>
      <div className="w-[calc(100%-12px)] sm:w-full max-w-7xl mx-auto py-4 sm:py-6 space-y-4 sm:space-y-6">
        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-5">
          <button
            onClick={() => router.push('/dashboard/admin/courses')}
            className="inline-flex items-center gap-1 text-[10px] font-black uppercase underline mb-2"
          >
            <ArrowLeft size={14} /> Quay lại hàng đợi
          </button>
          <h1 className="text-lg sm:text-2xl font-black uppercase leading-tight truncate" title={course.title}>
            {course.title}
          </h1>
          <p className="mt-1 text-[10px] sm:text-xs font-black uppercase text-black/70 truncate">
            GV: {course.instructor?.fullName || 'N/A'} • Danh mục: {course.category?.name || 'N/A'} • Trạng thái: {course.status}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4">
          <div className="bg-white border-2 border-black p-3 sm:p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="aspect-video border-2 border-black bg-black overflow-hidden">
              {selectedLesson?.youtubeVideoId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${selectedLesson.youtubeVideoId}`}
                  className="w-full h-full"
                  title={selectedLesson.title || 'Course lesson preview'}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-xs font-black uppercase">
                  Bài học này chưa có video
                </div>
              )}
            </div>
            <p className="mt-2 text-[10px] sm:text-xs font-black uppercase truncate" title={selectedLesson?.title || ''}>
              {selectedLesson ? `Đang xem: ${selectedLesson.title}` : 'Chưa có bài học'}
            </p>
          </div>

          <div className="bg-white border-2 border-black p-3 sm:p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-h-[70vh] overflow-y-auto">
            <h2 className="text-xs sm:text-sm font-black uppercase mb-3">Nội dung khóa học</h2>
            <div className="space-y-3">
              {course.sections?.map((section, sIndex) => (
                <div key={section.id} className="border-2 border-black bg-zinc-50">
                  <div className="px-3 py-2 border-b-2 border-black">
                    <p className="text-[10px] sm:text-xs font-black uppercase truncate" title={section.title}>
                      Chương {sIndex + 1}: {section.title}
                    </p>
                  </div>
                  <div className="p-2 space-y-2">
                    {section.lessons?.length ? (
                      section.lessons.map((lesson, lIndex) => {
                        const active = selectedLesson?.id === lesson.id;
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => setSelectedLessonId(lesson.id)}
                            className={`w-full text-left border-2 border-black px-2 py-2 transition-all ${
                              active ? 'bg-black text-white' : 'bg-white text-black hover:bg-zinc-100'
                            }`}
                          >
                            <p
                              className="text-[10px] sm:text-xs font-black uppercase truncate"
                              title={lesson.title}
                            >
                              Bài {lIndex + 1}: {lesson.title}
                            </p>
                            <p className={`text-[9px] font-black uppercase mt-1 ${active ? 'text-white/80' : 'text-black/60'}`}>
                              {lesson.youtubeVideoId ? 'Có video' : 'Chưa có video'}
                              {lesson.isPreview ? ' • Preview' : ''}
                            </p>
                          </button>
                        );
                      })
                    ) : (
                      <p className="text-[10px] font-black uppercase text-black/50 px-1 py-1">Chương này chưa có bài học.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

