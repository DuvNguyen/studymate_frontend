'use client';

import { Course } from '@/hooks/useCourses';
import CourseCard from './CourseCard';

interface CoursesGridProps {
  courses: Course[];
  loading: boolean;
}

function CourseCardSkeleton() {
  return (
    <div className="bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] animate-pulse">
      <div className="aspect-video bg-gray-200 border-b-2 border-black" />
      <div className="p-3 flex flex-col gap-2">
        <div className="h-4 bg-gray-200 border border-gray-300 w-full" />
        <div className="h-3 bg-gray-200 border border-gray-300 w-2/3" />
        <div className="h-3 bg-gray-200 border border-gray-300 w-1/2" />
        <div className="h-5 bg-gray-200 border border-gray-300 w-1/3 mt-1" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-300 bg-gray-50">
      <div className="w-16 h-16 bg-amber-100 border-2 border-black flex items-center justify-center mb-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
        <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>
      <p className="font-black text-lg text-black">Chưa có khóa học nào</p>
      <p className="text-sm text-gray-500 mt-1 font-medium">Danh mục này hiện chưa có khóa học được publish.</p>
    </div>
  );
}

export default function CoursesGrid({ courses, loading }: CoursesGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <CourseCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!courses.length) {
    return (
      <div className="grid grid-cols-1">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
