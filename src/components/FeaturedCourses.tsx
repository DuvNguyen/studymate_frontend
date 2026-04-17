'use client';

import React from 'react';
import Link from 'next/link';
import { useCourses } from '@/hooks/useCourses';

export default function FeaturedCourses() {
  const { courses, loading, error } = useCourses({
    limit: 4,
    sortBy: 'studentCount',
    sortOrder: 'DESC',
  });

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border-4 border-black h-80 animate-pulse shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"></div>
        ))}
      </div>
    );
  }

  if (error || courses.length === 0) {
    return (
      <div className="bg-amber-50 border-4 border-black p-8 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black uppercase text-sm">
        Không thể tải khóa học nổi bật lúc này.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {courses.map((course) => (
        <Link 
          href={`/courses/${course.slug}`}
          key={course.id} 
          className="group bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col hover:-translate-y-2 hover:-translate-x-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
        >
          <div className="relative h-48 w-full border-b-4 border-black bg-emerald-200 overflow-hidden">
            {course.thumbnailUrl ? (
              <img 
                src={course.thumbnailUrl} 
                alt={course.title} 
                className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-300 scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-black text-xs uppercase opacity-30">
                {course.title}
              </div>
            )}
            {course.studentCount > 1000 && (
              <div className="absolute top-4 left-4 bg-amber-400 border-2 border-black text-black text-[10px] font-black uppercase tracking-wider px-3 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                Bán chạy
              </div>
            )}
          </div>
          
          <div className="p-6 flex flex-col flex-grow">
            <div className="text-[10px] font-black uppercase tracking-widest text-purple-900 bg-purple-200 border-2 border-purple-900 px-2 py-1 inline-block mb-4 self-start shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              {course.category?.name || 'Chưa phân loại'}
            </div>
            <h3 className="text-xl font-black text-black uppercase leading-tight mb-3 line-clamp-2">
              {course.title}
            </h3>
            <p className="text-sm font-bold text-gray-600 mb-6 line-clamp-1">{course.instructor?.fullName || 'Giảng viên StudyMate'}</p>
            
            <div className="mt-auto flex items-center justify-between border-t-4 border-black pt-4">
              <div className="flex items-center gap-1">
                <span className="bg-black text-white px-2 py-1 text-xs font-black">
                  {course.avgRating > 0 ? course.avgRating.toFixed(1) : 'NEW'} ★
                </span>
                <span className="text-xs font-bold text-gray-500 ml-1">({course.studentCount})</span>
              </div>
              <div className="font-black text-black text-lg">
                {course.price > 0 ? `${course.price.toLocaleString('vi-VN')}đ` : 'Miễn phí'}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
