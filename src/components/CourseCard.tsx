'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Course } from '@/hooks/useCourses';

const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: 'Cơ bản',
  INTERMEDIATE: 'Trung cấp',
  ADVANCED: 'Nâng cao',
};

const LEVEL_COLORS: Record<string, string> = {
  BEGINNER: 'bg-green-100 text-green-800 border-green-300',
  INTERMEDIATE: 'bg-amber-100 text-amber-800 border-amber-300',
  ADVANCED: 'bg-red-100 text-red-800 border-red-300',
};

interface CourseCardProps {
  course: Course;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-3 h-3 ${i < Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-200'}`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-[11px] font-bold text-gray-600 ml-0.5">
        {rating > 0 ? rating.toFixed(1) : 'Mới'}
      </span>
    </div>
  );
}

export default function CourseCard({ course }: CourseCardProps) {
  const hasDiscount = course.originalPrice && course.originalPrice > course.price;
  const levelLabel = LEVEL_LABELS[course.level] ?? course.level;
  const levelColor = LEVEL_COLORS[course.level] ?? 'bg-gray-100 text-gray-700 border-gray-300';

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group block bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all duration-150"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-100 border-b-2 border-black overflow-hidden group">
        {course.thumbnailUrl ? (
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => {
              // Fallback if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.classList.add('flex', 'items-center', 'justify-center', 'bg-amber-50');
                parent.innerHTML += `
                  <div class="p-6 text-center">
                    <svg class="w-12 h-12 text-amber-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span class="text-[10px] font-black uppercase text-black block leading-tight px-2">${course.title}</span>
                  </div>
                `;
              }
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100">
            <svg className="w-12 h-12 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Level badge */}

        {/* Level badge */}
        <span className={`absolute top-2 left-2 text-[10px] font-black uppercase px-1.5 py-0.5 border ${levelColor}`}>
          {levelLabel}
        </span>
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col gap-2">
        {/* Title */}
        <h3 className="font-black text-sm text-black line-clamp-2 leading-tight group-hover:text-amber-700 transition-colors">
          {course.title}
        </h3>

        {/* Instructor */}
        <div className="flex items-center gap-1.5">
          {course.instructor.avatarUrl ? (
            <Image
              src={course.instructor.avatarUrl}
              alt={course.instructor.fullName ?? ''}
              width={18}
              height={18}
              className="rounded-full border border-black object-cover"
            />
          ) : (
            <div className="w-[18px] h-[18px] rounded-full bg-amber-300 border border-black flex items-center justify-center text-[9px] font-black">
              {(course.instructor.fullName ?? 'I')[0].toUpperCase()}
            </div>
          )}
          <span className="text-[11px] text-gray-600 font-medium truncate">
            {course.instructor.fullName ?? 'Giảng viên'}
          </span>
        </div>

        {/* Rating + Students */}
        <div className="flex items-center justify-between">
          <StarRating rating={course.avgRating} />
          <span className="text-[10px] text-gray-500 font-medium">
            {course.studentCount.toLocaleString('vi-VN')} học viên
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
          <span className="font-black text-base text-black">
            {course.price === 0
              ? 'Miễn phí'
              : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.price)}
          </span>
          {hasDiscount && (
            <span className="text-[11px] text-gray-400 line-through font-medium">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.originalPrice!)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
