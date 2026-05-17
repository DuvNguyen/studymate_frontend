'use client';

import { UserButton, useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useCart } from '../contexts/CartContext';
import { NotificationBell } from './NotificationBell';

export function NavbarUserMenu() {
  const { isSignedIn, isLoaded: clerkLoaded } = useAuth();
  const { user, loading } = useCurrentUser();
  const { cart } = useCart();
  const cartItemCount = cart?.cart_items?.length || 0;

  // Hiển thị skeleton khi Clerk chưa load xong, HOẶC khi đang load, HOẶC khi đã đăng nhập Clerk nhưng chưa load xong user từ database
  if (!clerkLoaded || loading || (isSignedIn && !user)) {
    return (
      <div className="flex items-center gap-3 border-l-4 border-black pl-4">
        <div className="flex flex-col items-end gap-1.5 opacity-50">
          <div className="w-20 h-4 bg-gray-300 animate-pulse"></div>
          <div className="w-12 h-3 bg-gray-300 border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] animate-pulse"></div>
        </div>
        <div className="w-9 h-9 bg-gray-300 border-2 border-black p-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] animate-pulse"></div>
      </div>
    );
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
      {/* Nút Cart - Chỉ cho STUDENT */}
      {user.role === 'STUDENT' && (
        <Link href="/cart" className="relative group">
          <div className="w-9 h-9 border-2 border-black flex items-center justify-center bg-white group-hover:bg-amber-300 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-active:translate-y-0.5 group-active:translate-x-0.5 group-active:shadow-none">
            <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          {cartItemCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 border-2 border-black flex items-center justify-center text-[10px] leading-none font-black text-white">
              {cartItemCount}
            </span>
          )}
        </Link>
      )}

      {/* Chuông thông báo */}
      <NotificationBell />

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
              {user.role === 'INSTRUCTOR' && (
                <UserButton.Link
                  label="Ví của tôi"
                  labelIcon={<IconWallet />}
                  href="/dashboard/instructor/wallet"
                />
              )}
              {(user.role === 'ADMIN' || user.role === 'STAFF') && (
                <UserButton.Link
                  label="Đối soát"
                  labelIcon={<IconReconcile />}
                  href="/dashboard/admin/reconciliation"
                />
              )}
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

function IconWallet() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );
}

function IconReconcile() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
