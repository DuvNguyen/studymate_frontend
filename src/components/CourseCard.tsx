'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Course } from '@/hooks/useCourses';
import { useCart } from '@/contexts/CartContext';
import toast from 'react-hot-toast';
import { useCurrentUser } from '@/hooks/useCurrentUser';

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

function StarRating({ rating }: { rating: number | string }) {
  const numRating = Number(rating) || 0;
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-3 h-3 ${i < Math.round(numRating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-200'}`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-[11px] font-bold text-gray-600 ml-0.5">
        {numRating > 0 ? numRating.toFixed(1) : 'Mới'}
      </span>
    </div>
  );
}

export default function CourseCard({ course }: CourseCardProps) {
  const { user } = useCurrentUser();
  const { addToCart } = useCart();
  const hasDiscount = course.originalPrice && course.originalPrice > course.price;
  const levelLabel = LEVEL_LABELS[course.level] ?? course.level;
  const levelColor = LEVEL_COLORS[course.level] ?? 'bg-gray-100 text-gray-700 border-gray-300';


  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group flex flex-col bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:-translate-x-2 transition-all duration-200 cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-emerald-100 border-b-4 border-black overflow-hidden group">
        {course.thumbnailUrl ? (
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            className="object-cover transition-all duration-300 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.classList.add('flex', 'items-center', 'justify-center', 'bg-amber-50');
                parent.innerHTML += `
                  <div class="p-6 text-center">
                    <svg class="w-12 h-12 text-black mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                `;
              }
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-black text-xs uppercase opacity-30 px-4 text-center">
            {course.title}
          </div>
        )}

        {/* Level badge */}
        <span className={`absolute top-3 left-3 text-[10px] font-black uppercase px-2 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${levelColor}`}>
          {levelLabel}
        </span>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow gap-3">
        {/* Category */}
        <div className="text-[10px] font-black uppercase tracking-widest text-purple-900 bg-purple-200 border-2 border-purple-900 px-2 py-1 inline-block self-start shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          {course.category?.name || 'Chưa phân loại'}
        </div>

        {/* Title */}
        <h3 className="font-black text-lg text-black uppercase line-clamp-2 leading-tight group-hover:text-amber-600 transition-colors">
          {course.title}
        </h3>

        {/* Instructor */}
        <div className="flex items-center gap-2">
          {course.instructor.avatarUrl ? (
            <div className="relative w-6 h-6 border-2 border-black overflow-hidden shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
              <Image
                src={course.instructor.avatarUrl}
                alt={course.instructor.fullName ?? ''}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-6 h-6 bg-amber-300 border-2 border-black flex items-center justify-center text-[10px] font-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
              {(course.instructor.fullName ?? 'I')[0].toUpperCase()}
            </div>
          )}
          <span className="text-xs text-gray-600 font-bold truncate tracking-tight">
            {course.instructor.fullName ?? 'Giảng viên StudyMate'}
          </span>
        </div>

        {/* Rating + Students */}
        <div className="flex items-center justify-between mt-1">
          <StarRating rating={course.avgRating} />
          <span className="text-[10px] text-gray-500 font-black uppercase tracking-tighter">
            {course.studentCount.toLocaleString('vi-VN')} Students
          </span>
        </div>

        {/* Price & Add to Cart */}
        <div className="flex items-center justify-between pt-4 mt-auto border-t-4 border-black">
          <div className="flex flex-col">
            {hasDiscount && (
              <span className="text-[10px] text-gray-400 line-through font-black leading-none mb-1">
                {course.originalPrice?.toLocaleString('vi-VN')}đ
              </span>
            )}
            <span className="font-black text-xl text-black leading-none">
              {course.price === 0
                ? 'FREE'
                : `${course.price.toLocaleString('vi-VN')}đ`}
            </span>
          </div>

          {/* Add to Cart button - Chỉ hiện cho STUDENT */}
          {user?.role === 'STUDENT' && (
            <button
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const result = await addToCart(course.id);
                if (!result.success && result.error) {
                  toast.error(result.error);
                } else if (result.success) {
                  toast.success('Đã thêm vào giỏ hàng');
                }
              }}
              className="w-10 h-10 flex items-center justify-center bg-black hover:bg-yellow-400 text-white hover:text-black transition-all border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 outline-none group/cart"
              title="Thêm vào giỏ hàng"
            >
              <svg className="w-5 h-5 group-hover/cart:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
