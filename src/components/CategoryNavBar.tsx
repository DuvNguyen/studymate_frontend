'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCategories, Category } from '@/hooks/useCategories';

export default function CategoryNavBar({ 
  bgColor = 'bg-white',
  className = ''
}: { 
  bgColor?: string;
  className?: string;
}) {
  const { categories, loading } = useCategories();
  const pathname = usePathname();
  const isCoursesPage = pathname === '/courses';
  const isAllCoursesActive = isCoursesPage;
  const isDashboardRoute = pathname.startsWith('/dashboard');

  if (loading) {
    return (
      <div className="border-b-2 border-black bg-white">
        <div className="w-full px-4 h-10 flex items-center gap-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-4 bg-gray-200 border border-gray-300 animate-pulse"
              style={{ width: `${60 + i * 10}px` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!categories.length) return null;

  if (isDashboardRoute) {
    return (
      <div className={`relative border-b-2 border-black ${bgColor} z-40 ${className}`}>
        <div className="w-full px-3 sm:px-6 lg:px-8 h-9 flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-wider text-black/70">Học nhanh</p>
          <Link
            href="/courses"
            className="inline-flex items-center px-2.5 h-7 text-[10px] font-black uppercase tracking-wide border-2 border-black bg-amber-300 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            Khám phá khóa học
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative border-b-2 border-black ${bgColor} z-40 ${className}`}>
      <div className="w-full px-3 sm:px-6 lg:px-8 py-1 min-h-10 flex items-center gap-0 overflow-x-auto overflow-y-hidden whitespace-nowrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {/* Nút "TẤT CẢ" ở đầu */}
        <div className="relative">
          <Link
            href="/courses"
            className={`
              inline-flex items-center px-2.5 sm:px-3 h-9 sm:h-10 text-[10px] sm:text-[11px] font-black uppercase tracking-wide
              border-b-2 transition-all duration-100 whitespace-nowrap
              ${isAllCoursesActive
                ? 'border-black text-black bg-amber-300'
                : 'border-transparent text-black hover:bg-amber-100/50 hover:border-black'
              }
            `}
          >
            TẤT CẢ
          </Link>
        </div>

        {categories.map((cat: Category) => (
          <div key={cat.id} className="relative">
            <Link
              href={`/courses?category=${cat.slug}`}
              className="inline-flex items-center px-2.5 sm:px-3 h-9 sm:h-10 text-[10px] sm:text-[11px] font-black uppercase tracking-wide border-b-2 transition-all duration-100 whitespace-nowrap border-transparent text-gray-700 hover:text-black hover:border-black hover:bg-amber-100"
            >
              {cat.name}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
