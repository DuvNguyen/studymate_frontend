'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { useCourses, CourseFilters } from '@/hooks/useCourses';
import { useCategories } from '@/hooks/useCategories';
import CoursesGrid from '@/components/CoursesGrid';
import Navbar from '@/components/Navbar';
import CategoryNavBar from '@/components/CategoryNavBar';

const LEVEL_OPTIONS = [
  { value: '', label: 'Tất cả cấp độ' },
  { value: 'BEGINNER', label: 'Cơ bản' },
  { value: 'INTERMEDIATE', label: 'Trung cấp' },
  { value: 'ADVANCED', label: 'Nâng cao' },
];

function CoursesPageContent() {
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get('category') ?? undefined;

  const { categories } = useCategories();
  const [level, setLevel] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);

  const filters: CourseFilters = {
    categorySlug,
    search: search || undefined,
    level: level || undefined,
    page,
    limit: 12,
  };

  const { courses, meta, loading } = useCourses(filters);

  // Tìm tên category hiện tại để hiển thị heading
  const currentCategory = categories.find((c) => c.slug === categorySlug)
    ?? categories.flatMap((c) => c.children).find((c) => c.slug === categorySlug);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleLevelChange = (newLevel: string) => {
    setLevel(newLevel);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar fixed ở trên cùng - Đồng bộ hoàn toàn với homepage */}
      <Navbar />
      
      {/* Header padding for offset fixed navbar - Đồng bộ spacing với homepage */}
      <div className="pt-36">
        {/* Category Hero section — Premium style like Udemy */}
        <div className="border-b-2 border-black bg-white">
          <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
            {currentCategory ? (
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">
                  <span className="bg-black text-white px-2 py-0.5">Lĩnh vực</span>
                  <span className="text-gray-400">/</span>
                  <span>{currentCategory.name}</span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-black text-black tracking-tighter uppercase leading-none">
                  Khóa học {currentCategory.name}
                </h1>
                <p className="text-lg font-bold text-gray-600 max-w-2xl">
                  {meta ? `${meta.total.toLocaleString('vi-VN')} khóa học chất lượng giúp bạn làm chủ kỹ năng trong lĩnh vực này.` : 'Khám phá các khóa học chất lượng hàng đầu.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <h1 className="text-4xl lg:text-5xl font-black text-black tracking-tighter uppercase">
                  Tất cả khóa học
                </h1>
                <p className="text-lg font-bold text-gray-600">
                  {meta ? `Tổng cộng ${meta.total.toLocaleString('vi-VN')} khóa học sẵn sàng cho lộ trình học tập của bạn.` : 'Tìm kiếm lộ trình học tập phù hợp.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search box */}
          <form onSubmit={handleSearch} className="flex flex-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm kiếm khóa học..."
              className="flex-1 px-3 py-2 text-sm font-black text-black bg-white outline-none placeholder:text-gray-400"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white text-sm font-black border-l-2 border-black hover:bg-amber-400 hover:text-black transition-colors"
            >
              Tìm
            </button>
          </form>

          {/* Level filter */}
          <select
            value={level}
            onChange={(e) => handleLevelChange(e.target.value)}
            className="border-2 border-black px-3 py-2 text-sm font-black text-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none cursor-pointer"
          >
            {LEVEL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Active filters */}
        {(categorySlug || level || search) && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs font-bold text-gray-500 uppercase">Đang lọc:</span>
            {currentCategory && (
              <a
                href="/courses"
                className="inline-flex items-center gap-1 text-xs font-black px-2 py-0.5 bg-amber-300 border border-black text-black"
              >
                {currentCategory.name}
                <span className="text-black/60">×</span>
              </a>
            )}
            {level && (
              <button
                onClick={() => handleLevelChange('')}
                className="inline-flex items-center gap-1 text-xs font-black px-2 py-0.5 bg-blue-100 border border-black text-black"
              >
                {LEVEL_OPTIONS.find((o) => o.value === level)?.label}
                <span className="text-black/60">×</span>
              </button>
            )}
            {search && (
              <button
                onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}
                className="inline-flex items-center gap-1 text-xs font-black px-2 py-0.5 bg-gray-100 border border-black text-black"
              >
                &quot;{search}&quot;
                <span className="text-black/60">×</span>
              </button>
            )}
          </div>
        )}

        {/* Course grid */}
        <CoursesGrid courses={courses} loading={loading} />

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-4 py-2 border-2 border-black text-sm font-black disabled:opacity-40 hover:bg-amber-300 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:shadow-none"
            >
              ← Trước
            </button>

            {Array.from({ length: Math.min(meta.totalPages, 5) }, (_, i) => {
              const p = Math.max(1, Math.min(page - 2, meta.totalPages - 4)) + i;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 border-2 border-black text-sm font-black transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                    p === page ? 'bg-black text-white' : 'bg-white hover:bg-amber-100'
                  }`}
                >
                  {p}
                </button>
              );
            })}

            <button
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={page >= meta.totalPages}
              className="px-4 py-2 border-2 border-black text-sm font-black disabled:opacity-40 hover:bg-amber-300 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:shadow-none"
            >
              Sau →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-black border-t-amber-400 rounded-full animate-spin mx-auto mb-2" />
          <p className="font-bold text-sm">Đang tải...</p>
        </div>
      </div>
    }>
      <CoursesPageContent />
    </Suspense>
  );
}
