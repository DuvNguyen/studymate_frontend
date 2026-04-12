'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useCategories, Category } from '@/hooks/useCategories';
import MegaMenuDropdown from './MegaMenuDropdown';

export default function CategoryNavBar({ 
  bgColor = 'bg-white',
  className = ''
}: { 
  bgColor?: string;
  className?: string;
}) {
  const { categories, loading } = useCategories();
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = (cat: Category) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveCategory(cat);
    setMegaMenuOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => {
      setMegaMenuOpen(false);
      setActiveCategory(null);
    }, 150);
  };

  const handleMegaMenuMouseEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

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
      <div className="w-full px-4 sm:px-6 lg:px-8 h-10 flex items-center gap-0 overflow-x-auto scrollbar-hide">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="relative flex-shrink-0"
            onMouseEnter={() => handleMouseEnter(cat)}
            onMouseLeave={handleMouseLeave}
          >
            <Link
              href={`/courses?category=${cat.slug}`}
              className={`
                inline-flex items-center px-3 h-10 text-[11px] font-black uppercase tracking-wide
                border-b-2 transition-all duration-100 whitespace-nowrap
                ${activeCategory?.id === cat.id && megaMenuOpen
                  ? 'border-black text-black bg-amber-300'
                  : 'border-transparent text-gray-700 hover:text-black hover:border-black hover:bg-amber-100'
                }
              `}
            >
              {cat.name}
            </Link>

            {/* Dropdown sub-categories khi hover (dành cho mobile / nếu mega menu bị tắt) */}
            {activeCategory?.id === cat.id && megaMenuOpen && (
              <div
                onMouseEnter={handleMegaMenuMouseEnter}
                onMouseLeave={() => {
                  setMegaMenuOpen(false);
                  setActiveCategory(null);
                }}
              >
                <MegaMenuDropdown
                  categories={categories}
                  onClose={() => {
                    setMegaMenuOpen(false);
                    setActiveCategory(null);
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
