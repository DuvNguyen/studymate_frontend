'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { StudentSignupButton } from './StudentSignupButton';
import { InstructorSignupButton } from './InstructorSignupButton';

export function HeroActionButtons() {
  const { isSignedIn, isLoaded: clerkLoaded } = useAuth();
  const { user, loading } = useCurrentUser();

  // Trạng thái đang tải (Atomic Loading State) — Hiển thị Skeleton để tránh giật lag layout
  if (!clerkLoaded || loading || (isSignedIn && !user)) {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full sm:w-auto">
        <div className="w-full sm:w-56 h-[60px] bg-gray-200 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] animate-pulse"></div>
        <div className="w-full sm:w-56 h-[60px] bg-gray-200 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] animate-pulse"></div>
      </div>
    );
  }

  // Trường hợp CHƯA đăng nhập
  if (!user) {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
        <StudentSignupButton 
          className="w-full sm:w-auto px-8 py-4 bg-emerald-400 hover:bg-emerald-500 text-black font-black uppercase tracking-wider text-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-transform active:translate-y-1.5 active:translate-x-1.5 active:shadow-none"
        >
          Học với StudyMate
        </StudentSignupButton>
        <InstructorSignupButton 
          className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-gray-100 text-black font-black uppercase tracking-wider text-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-transform active:translate-y-1.5 active:translate-x-1.5 active:shadow-none"
        >
          Dạy trên StudyMate
        </InstructorSignupButton>
      </div>
    );
  }

  // Trường hợp ĐÃ đăng nhập thành công
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
      <Link 
        href="/dashboard"
        className="w-full sm:w-auto px-8 py-4 bg-emerald-400 hover:bg-emerald-500 text-black font-black uppercase tracking-wider text-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-transform active:translate-y-1.5 active:translate-x-1.5 active:shadow-none inline-flex items-center justify-center"
      >
        Dashboard
      </Link>
      
      {user.role === 'INSTRUCTOR' ? (
        <Link 
          href="/dashboard/instructor/kyc"
          className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-gray-100 text-black font-black uppercase tracking-wider text-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-transform active:translate-y-1.5 active:translate-x-1.5 active:shadow-none inline-flex items-center justify-center"
        >
          Dạy trên StudyMate
        </Link>
      ) : (
        <StudentSignupButton 
          className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-gray-100 text-black font-black uppercase tracking-wider text-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-transform active:translate-y-1.5 active:translate-x-1.5 active:shadow-none"
        >
          Dạy trên StudyMate
        </StudentSignupButton>
      )}
    </div>
  );
}
