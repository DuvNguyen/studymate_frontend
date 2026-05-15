'use client';

import Link from 'next/link';
import { useCategories, Category } from '@/hooks/useCategories';

export default function CategoryNavBar({ 
  bgColor = 'bg-white',
  className = ''
}: { 
  bgColor?: string;
  className?: string;
}) {
  const { categories, loading } = useCategories();

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

  return (
    <div className={`relative border-b-2 border-black ${bgColor} z-40 ${className}`}>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-1 min-h-10 flex flex-wrap items-center gap-0 overflow-visible">
        {/* Nút "TẤT CẢ" ở đầu */}
        <div className="relative">
          <Link
            href="/courses"
            className={`
              inline-flex items-center px-3 h-10 text-[11px] font-black uppercase tracking-wide
              border-b-2 transition-all duration-100 whitespace-nowrap
              ${typeof window !== 'undefined' && window.location.pathname === '/courses' && !window.location.search.includes('category=')
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
              className="inline-flex items-center px-3 h-10 text-[11px] font-black uppercase tracking-wide border-b-2 transition-all duration-100 whitespace-nowrap border-transparent text-gray-700 hover:text-black hover:border-black hover:bg-amber-100"
            >
              {cat.name}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
