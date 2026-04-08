'use client';

import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { useCurrentUser } from '../hooks/useCurrentUser';

export function NavbarUserMenu() {
  const { user, loading } = useCurrentUser();

  if (loading) {
    return <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-none animate-spin"></div>;
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/sign-in" className="text-xs font-black uppercase tracking-widest text-black hover:bg-amber-300 px-3 py-2 border-2 border-transparent hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hidden sm:block">
          Đăng nhập
        </Link>
        <Link 
          href="/sign-up?role=student" 
          className="bg-emerald-400 text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-xs font-black uppercase tracking-widest py-2 px-5 transition-transform active:translate-y-1 active:translate-x-1 active:shadow-none"
        >
          Đăng ký
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Link 
        href="/dashboard" 
        className="text-xs font-black uppercase tracking-widest text-black hover:bg-amber-300 px-3 py-2 border-2 border-transparent hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hidden sm:block"
      >
        Dashboard
      </Link>
      <div className="flex items-center gap-3 border-l-4 border-black pl-4">
        <div className="hidden lg:block text-right">
          <p className="text-sm font-black text-black uppercase">
            {user.firstName || user.email || 'HỌC VIÊN'}
          </p>
          <p className="text-[10px] font-black uppercase tracking-widest bg-amber-300 border-2 border-black px-1.5 py-0.5 inline-block shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            {user.role}
          </p>
        </div>
        <div className="border-2 border-black p-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white active:translate-y-0.5 active:translate-x-0.5 active:shadow-none transition-transform">
          <UserButton appearance={{ elements: { avatarBox: "rounded-none h-8 w-8" } }} />
        </div>
      </div>
    </div>
  );
}
