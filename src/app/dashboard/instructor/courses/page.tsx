'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/MainLayout';
import { toast } from 'react-hot-toast';

export default function InstructorCoursesPage() {
  const { getToken } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch('http://localhost:3001/api/v1/instructor/courses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCourses(data.data || data); // handle wrapped data
      }
    } catch (e) {
      toast.error('Lỗi tải danh sách khóa học');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDraft = async () => {
    try {
      const token = await getToken();
      const res = await fetch('http://localhost:3001/api/v1/instructor/courses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: 'Khóa học nháp mới', categoryId: 1 }) // Hardcoded categoryId for now
      });
      if (res.ok) {
        const resData = await res.json();
        const courseId = resData.data?.id || resData.id;
        router.push(`/dashboard/instructor/courses/${courseId}/builder`);
      } else {
        toast.error('Không thể tạo khóa học mới');
      }
    } catch (e) {
      toast.error('Lỗi kết nối');
    }
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
        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 flex justify-between items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-black/70 mb-1">Giảng viên</p>
            <h1 className="text-3xl font-black text-black uppercase tracking-tight leading-none">Khóa học của tôi</h1>
          </div>
          <button 
            onClick={handleCreateDraft}
            className="px-6 py-3 bg-black text-white font-black uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:-translate-y-[1px] active:translate-y-0 transition-transform"
          >
            + TẠO KHÓA HỌC
          </button>
        </div>

        {courses.length === 0 ? (
          <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-16 text-center">
            <p className="text-xl font-black uppercase tracking-widest text-black/40 leading-none">
              Bạn chưa có khóa học nào.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-black text-black uppercase leading-tight mb-2">{course.title}</h3>
                  <span className="px-3 py-1 bg-yellow-100 text-black border-2 border-black font-black text-xs uppercase">
                    {course.status}
                  </span>
                </div>
                <button 
                  onClick={() => router.push(`/dashboard/instructor/courses/${course.id}/builder`)}
                  className="px-6 py-3 bg-emerald-400 text-black font-black uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-emerald-500 active:translate-y-[1px] transition-all"
                >
                  XÂY DỰNG NỘI DUNG ➔
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
