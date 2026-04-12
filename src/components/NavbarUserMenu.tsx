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
          <div className="flex flex-col items-end gap-0.5">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-[10px] font-black uppercase tracking-widest text-black/60">xin chào,</span>
              <p className="text-sm font-black text-black uppercase">
                {user.firstName || user.email?.split('@')[0] || 'HỌC VIÊN'}
              </p>
            </div>
          <p className="text-[10px] font-black uppercase tracking-widest bg-amber-300 border-2 border-black px-1.5 py-0.5 inline-block shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black">
            {user.role}
          </p>
        </div>
        <div className="border-2 border-black p-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white active:translate-y-0.5 active:translate-x-0.5 active:shadow-none transition-transform">
          <UserButton appearance={{ elements: { avatarBox: "rounded-none h-8 w-8" } }}>
            <UserButton.MenuItems>
              <UserButton.Link
                label="Bảng điều khiển"
                labelIcon={<IconDashboard />}
                href="/dashboard"
              />
            </UserButton.MenuItems>
          </UserButton>
        </div>
      </div>
    </div>
  );
}

function IconDashboard() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}
