'use client';

import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { useCurrentUser } from '../hooks/useCurrentUser';

export function NavbarUserMenu() {
  const { user, loading } = useCurrentUser();

  if (loading) {
    return <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse"></div>;
  }

  if (!user) {
    return (
      <>
        <Link href="/sign-in" className="text-sm font-semibold text-slate-700 hover:text-purple-600 transition hidden sm:block">
          Đăng nhập
        </Link>
        <Link 
          href="/sign-up?role=student" 
          className="bg-black hover:bg-slate-800 text-white text-sm font-semibold py-2 px-5 rounded-full transition-all hover:shadow-lg hover:-translate-y-0.5"
        >
          Đăng ký
        </Link>
      </>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Link href="/dashboard" className="text-sm font-semibold text-purple-600 hover:text-purple-800 transition mr-4 hidden sm:block">
      Dashboard
      </Link>
      <div className="flex items-center gap-3">
        <div className="hidden md:block text-right">
          <p className="text-sm font-medium text-gray-800">
            {user.firstName || user.email || 'Học viên'}
          </p>
          <p className="text-xs text-purple-600 font-bold uppercase tracking-wider">{user.role}</p>
        </div>
        <UserButton />
      </div>
    </div>
  );
}
