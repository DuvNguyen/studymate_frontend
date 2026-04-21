'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import useDebounce from '../hooks/useDebounce';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const debouncedQuery = useDebounce(query, 300);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery.length < 2) {
        setSuggestions([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/courses/suggest?q=${encodeURIComponent(debouncedQuery)}`);
        const data = await res.json();
        setSuggestions(data);
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (query.trim()) {
      router.push(`/courses?search=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/courses');
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <form onSubmit={handleSearch} className="hidden lg:flex items-center bg-white border-2 border-black px-4 py-2 w-80 lg:w-96 focus-within:bg-amber-50 focus-within:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
        <button type="submit" aria-label="Search" className="flex-shrink-0 cursor-pointer outline-none">
          <svg className="w-5 h-5 text-black mr-2 hover:text-amber-600 transition-colors" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
            <path strokeLinecap="square" strokeLinejoin="miter" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="TÌM KIẾM KHÓA HỌC..."
          className="bg-transparent text-xs font-black uppercase tracking-wider outline-none w-full text-black placeholder-black/40"
        />
        {loading && <div className="w-4 h-4 border-2 border-black border-t-transparent animate-spin ml-2" />}
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 w-full mt-1 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50">
          {suggestions.map((s) => (
            <div
              key={s.slug}
              onClick={() => {
                router.push(`/courses/${s.slug}`);
                setShowSuggestions(false);
                setQuery('');
              }}
              className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-100 cursor-pointer border-b border-black/10 last:border-none"
            >
              {s.thumbnailUrl && (
                <img src={s.thumbnailUrl} alt={s.title} className="w-10 h-10 object-cover border border-black" />
              )}
              <div className="flex-1">
                <p className="text-[11px] font-black uppercase leading-tight line-clamp-1">{s.title}</p>
                <p className="text-[9px] font-bold text-gray-500 uppercase mt-0.5">Khóa học</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
