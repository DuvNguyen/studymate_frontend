'use client';

import MainLayout from '@/components/MainLayout';
import { useEnrolledCourses } from '@/hooks/useEnrolledCourses';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/Button';

export default function StudentCoursesPage() {
  const { enrollments, loading, error } = useEnrolledCourses();

  return (
    <MainLayout role="STUDENT">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black uppercase text-black tracking-tighter mb-2">
            KHÓA HỌC CỦA TÔI
          </h1>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest border-l-4 border-black pl-4">
            QUẢN LÝ TIẾN ĐỘ VÀ TIẾP TỤC HÀNH TRÌNH HỌC TẬP
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-black border-t-transparent animate-spin mb-4" />
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">Đang tải dữ liệu...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-sm font-black text-red-600 uppercase tracking-widest mb-2">Đã có lỗi xảy ra</p>
            <p className="text-sm font-bold text-gray-700 uppercase">{error}</p>
          </div>
        ) : enrollments.length === 0 ? (
          <div className="bg-amber-50 border-4 border-black border-dashed p-20 text-center">
            <p className="text-lg font-black text-black uppercase mb-6">Bạn chưa đăng ký khóa học nào</p>
            <Link href="/courses">
              <Button size="lg" className="bg-amber-400 hover:bg-amber-500 font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase">
                Khám phá khóa học ngay
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {enrollments.map((enrollment) => (
              <div 
                key={enrollment.id} 
                className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col"
              >
                {/* Thumbnail */}
                <div className="relative h-48 border-b-4 border-black overflow-hidden group">
                  <Image
                    src={enrollment.course.thumbnail || '/placeholder-course.jpg'}
                    alt={enrollment.course.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-emerald-400 border-2 border-black px-3 py-1 text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    {enrollment.progress_percent}% HOÀN THÀNH
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-grow flex flex-col">
                  <p className="text-[10px] font-black uppercase text-amber-600 mb-2 tracking-widest">
                    {enrollment.course.instructor_name}
                  </p>
                  <h3 className="text-xl font-black text-black uppercase leading-none mb-4 line-clamp-2 min-h-[40px]">
                    {enrollment.course.title}
                  </h3>
                  
                  {/* Progress Bar */}
                  <div className="mt-auto pt-4 border-t-2 border-black border-dashed">
                    <div className="w-full h-4 bg-gray-100 border-2 border-black flex overflow-hidden mb-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <div 
                        className="h-full bg-emerald-400 border-r-2 border-black transition-all duration-1000" 
                        style={{ width: `${enrollment.progress_percent}%` }}
                      />
                    </div>
                    
                    <Link href={`/courses/${enrollment.course.slug}/learn`} className="block">
                      <Button className="w-full bg-black text-white hover:bg-emerald-500 hover:text-black border-2 border-black font-black uppercase tracking-widest transition-colors py-3">
                        {enrollment.progress_percent > 0 ? 'TIẾP TỤC HỌC' : 'BẮT ĐẦU HỌC'}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
