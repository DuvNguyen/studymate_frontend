'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { NavbarUserMenu } from './NavbarUserMenu';
import SearchBar from './SearchBar';
import CategoryNavBar from './CategoryNavBar';
import MegaMenuDropdown from './MegaMenuDropdown';
import { useCategories } from '@/hooks/useCategories';

function IconChevronDown() {
  return (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export default function Navbar({ 
  categoryBgColor = 'bg-white' 
}: { 
  categoryBgColor?: string 
}) {
  const { categories } = useCategories();
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMegaMenuOpen(true);
  };

  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setMegaMenuOpen(false), 200);
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-white">
      {/* Tier 1 — Navbar chính */}
      <div className="border-b-4 border-black shadow-[0px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 flex-shrink-0 active:translate-y-0.5 active:translate-x-0.5 transition-transform"
          >
            <div className="w-8 h-8 bg-amber-300 border-2 border-black flex items-center justify-center text-black font-black text-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              S
            </div>
            <span className="text-2xl font-black text-black uppercase tracking-tighter hidden sm:block">
              StudyMate
            </span>
          </Link>

          {/* Nút Tìm khóa học — mở mega menu */}
          <div
            className="relative flex-shrink-0 hidden md:block"
            onMouseEnter={openMenu}
            onMouseLeave={scheduleClose}
          >
            <button
              onClick={() => setMegaMenuOpen((prev) => !prev)}
              className={`
                flex items-center gap-1.5 px-4 py-2
                text-xs font-black uppercase tracking-widest
                border-2 border-black transition-all duration-150
                shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
                active:translate-y-0.5 active:translate-x-0.5 active:shadow-none
                ${megaMenuOpen
                  ? 'bg-amber-300 text-black shadow-none translate-y-0.5 translate-x-0.5'
                  : 'bg-white text-black hover:bg-amber-300'
                }
              `}
            >
              Tìm khóa học
              <span className={`transition-transform duration-200 ${megaMenuOpen ? 'rotate-180' : ''}`}>
                <IconChevronDown />
              </span>
            </button>

            {/* Mega menu dropdown - tier 3 */}
            {megaMenuOpen && categories.length > 0 && (
              <div
                onMouseEnter={openMenu}
                onMouseLeave={scheduleClose}
              >
                <MegaMenuDropdown
                  categories={categories}
                  onClose={() => setMegaMenuOpen(false)}
                />
              </div>
            )}
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-lg hidden md:block">
            <SearchBar />
          </div>

          {/* Nav links */}
          <nav className="hidden lg:flex gap-1 text-xs font-black uppercase tracking-widest text-black flex-shrink-0">
            <Link href="#" className="hover:bg-amber-300 px-3 py-1.5 border-2 border-transparent hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
              Sự kiện
            </Link>
            <Link href="#" className="hover:bg-amber-300 px-3 py-1.5 border-2 border-transparent hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
              Blog
            </Link>
          </nav>

          {/* User menu */}
          <div className="flex-shrink-0">
            <NavbarUserMenu />
          </div>
        </div>
      </div>

      {/* Tier 2 — Row danh mục */}
      <CategoryNavBar bgColor={categoryBgColor} />
    </header>
  );
}
