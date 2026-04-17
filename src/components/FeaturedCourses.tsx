'use client';

import React from 'react';
import { useCourses } from '@/hooks/useCourses';
import CourseCard from './CourseCard';

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
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
