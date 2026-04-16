'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/courses?search=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/courses');
    }
  };

  return (
    <form onSubmit={handleSearch} className="hidden lg:flex items-center bg-white border-2 border-black px-4 py-2 w-80 lg:w-96 focus-within:bg-amber-50 focus-within:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
      <button type="submit" aria-label="Search" className="flex-shrink-0 cursor-pointer outline-none">
        <svg className="w-5 h-5 text-black mr-2 hover:text-amber-600 transition-colors" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
          <path strokeLinecap="square" strokeLinejoin="miter" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="TÌM KIẾM KHÓA HỌC..."
        className="bg-transparent text-xs font-black uppercase tracking-wider outline-none w-full text-black placeholder-black/40"
      />
    </form>
  );
}
