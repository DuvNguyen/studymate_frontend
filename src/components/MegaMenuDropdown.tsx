'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Category, SubCategory } from '@/hooks/useCategories';

// Popular topics tĩnh — có thể fetch từ API sau
const POPULAR_TOPICS = [
  'React',
  'Python AI',
  'Excel nâng cao',
  'Figma',
  'Docker',
  'Digital Marketing',
  'Photoshop',
  'Giao tiếp tiếng Anh',
  'Quản lý dự án',
  'TensorFlow',
];

interface MegaMenuDropdownProps {
  categories: Category[];
  onClose: () => void;
}

export default function MegaMenuDropdown({ categories, onClose }: MegaMenuDropdownProps) {
  const [activeCategory, setActiveCategory] = useState<Category | null>(
    categories[0] ?? null,
  );

  return (
    <div
      className="absolute left-0 top-full mt-0 w-screen max-w-4xl
                 bg-white border-2 border-black border-t-0
                 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
                 flex z-50 animate-fadeIn"
      onMouseLeave={onClose}
    >
      {/* Cột 1 — Root categories */}
      <div className="w-56 border-r-2 border-black flex-shrink-0 py-2 overflow-y-auto max-h-[70vh]">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`
              w-full flex items-center justify-between px-4 py-2.5
              text-xs font-black uppercase tracking-wide text-left
              border-b border-gray-100 last:border-b-0
              transition-all duration-100
              ${activeCategory?.id === cat.id
                ? 'bg-amber-300 text-black border-l-4 border-l-black'
                : 'text-gray-800 hover:bg-gray-50 border-l-4 border-l-transparent'
              }
            `}
            onMouseEnter={() => setActiveCategory(cat)}
            onClick={onClose}
          >
            <span className="truncate">{cat.name}</span>
            {cat.children.length > 0 && (
              <svg className="w-3 h-3 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </button>
        ))}
      </div>

      {/* Cột 2 — Sub-categories */}
      <div className="flex-1 py-4 px-5 border-r-2 border-black overflow-y-auto max-h-[70vh]">
        {activeCategory && activeCategory.children.length > 0 ? (
          <>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">
              {activeCategory.name}
            </p>
            <div className="space-y-0.5">
              {activeCategory.children.map((sub: SubCategory) => (
                <Link
                  key={sub.id}
                  href={`/courses?category=${sub.slug}`}
                  onClick={onClose}
                  className="
                    block px-3 py-2 text-sm font-bold text-gray-900
                    hover:bg-amber-300 hover:border-l-4 hover:border-l-black
                    border-l-4 border-l-transparent
                    transition-all duration-100
                  "
                >
                  {sub.name}
                </Link>
              ))}
            </div>
            {/* Link xem tất cả */}
            <Link
              href={`/courses?category=${activeCategory.slug}`}
              onClick={onClose}
              className="
                inline-block mt-4 text-[11px] font-black uppercase tracking-widest
                text-black underline underline-offset-4 hover:text-amber-600
                transition-colors
              "
            >
              Xem tất cả {activeCategory.name} →
            </Link>
          </>
        ) : (
          <p className="text-xs text-gray-500 font-bold mt-2">Chưa có danh mục con</p>
        )}
      </div>

      {/* Cột 3 — Popular topics */}
      <div className="w-52 flex-shrink-0 py-4 px-5 overflow-y-auto max-h-[70vh]">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">
          Chủ đề nổi bật
        </p>
        <div className="space-y-1">
          {POPULAR_TOPICS.map((topic) => (
            <Link
              key={topic}
              href={`/courses?q=${encodeURIComponent(topic)}`}
              onClick={onClose}
              className="
                block text-sm font-bold text-gray-900
                hover:text-black hover:underline underline-offset-4
                transition-colors py-1
              "
            >
              {topic}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
