'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton, useUser } from '@clerk/nextjs';
import SearchBar from './SearchBar';

// Icons SVG
function IconHome() {
  return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
}
function IconCourses() {
  return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
}
function IconMyLearning() {
  return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
}
function IconWishlist() {
  return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>;
}
function IconDashboard() {
  return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
}
function IconUsers() {
  return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
}
function IconMenu() {
  return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" /></svg>;
}
function IconCart() {
  return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
}
function IconProfile() {
  return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
}

const ROLE_CONFIG: Record<string, { label: string; color: string }> = {
  ADMIN:      { label: 'Admin',      color: 'bg-red-500 text-white' },
  STAFF:      { label: 'Staff',      color: 'bg-amber-400 text-black' },
  INSTRUCTOR: { label: 'Instructor', color: 'bg-indigo-500 text-white' },
  STUDENT:    { label: 'Student',    color: 'bg-emerald-500 text-white' },
  USER:       { label: 'Pending Instructor', color: 'bg-gray-400 text-white' },
};

const navByRole: Record<string, { href: string; label: string; icon: React.ReactNode }[]> = {
  STUDENT: [
    { href: '/dashboard',         label: 'Tổng quan',     icon: <IconDashboard /> },
    { href: '/courses',           label: 'Khóa học',      icon: <IconCourses /> },
    { href: '/my-learning',       label: 'Học của tôi',   icon: <IconMyLearning /> },
    { href: '/wishlist',          label: 'Yêu thích',     icon: <IconWishlist /> },
    { href: '/dashboard/profile', label: 'Hồ sơ',         icon: <IconProfile /> },
  ],
  INSTRUCTOR: [
    { href: '/dashboard',                   label: 'Tổng quan',        icon: <IconDashboard /> },
    { href: '/dashboard/instructor/kyc',    label: 'Hồ sơ Giảng viên', icon: <IconProfile /> },
    { href: '/instructor/courses',          label: 'Khóa học của tôi', icon: <IconCourses /> },
    { href: '/instructor/revenue',          label: 'Doanh thu',        icon: <IconDashboard /> },
    { href: '/dashboard/profile',           label: 'Hồ sơ',            icon: <IconProfile /> },
  ],
  STAFF: [
    { href: '/dashboard',         label: 'Tổng quan',      icon: <IconDashboard /> },
    { href: '/admin/kyc',         label: 'Duyệt KYC',      icon: <IconUsers /> },
    { href: '/admin/courses',     label: 'Duyệt khóa học', icon: <IconCourses /> },
    { href: '/admin/refunds',     label: 'Hoàn tiền',      icon: <IconDashboard /> },
    { href: '/dashboard/profile', label: 'Hồ sơ',          icon: <IconProfile /> },
  ],
  ADMIN: [
    { href: '/dashboard',         label: 'Tổng quan',   icon: <IconDashboard /> },
    { href: '/admin/users',       label: 'Người dùng',  icon: <IconUsers /> },
    { href: '/admin/courses',     label: 'Khóa học',    icon: <IconCourses /> },
    { href: '/admin/kyc',         label: 'Duyệt KYC',   icon: <IconUsers /> },
    { href: '/admin/finance',     label: 'Tài chính',   icon: <IconDashboard /> },
    { href: '/dashboard/profile', label: 'Hồ sơ',       icon: <IconProfile /> },
  ],
  USER: [
    { href: '/dashboard/instructor/kyc', label: 'Hồ sơ Giảng viên', icon: <IconProfile /> },
  ],
};

interface MainLayoutProps {
  children: React.ReactNode;
  role?: string;
  kycStatus?: string | null;
}

export default function MainLayout({ children, role = 'STUDENT', kycStatus = null }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const { user } = useUser();

  const isLockedInstructor = role === 'INSTRUCTOR' && kycStatus !== 'APPROVED';
  const isPendingUserRole = role === 'USER';
  const isKycRoute = pathname.includes('/kyc');

  const navItems = navByRole[role] ?? navByRole['STUDENT'];
  const displayedNavItems = isLockedInstructor || isPendingUserRole
    ? navItems.filter(item => item.href.includes('/kyc')) 
    : navItems;
  const roleCfg = ROLE_CONFIG[role] ?? ROLE_CONFIG['STUDENT'];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Sidebar */}
      <aside
        className={`
          ${sidebarOpen ? 'w-56' : 'w-14'}
          bg-gray-900 text-white flex flex-col
          transition-all duration-200 ease-in-out flex-shrink-0
          border-r-2 border-black
        `}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center h-14 px-4 border-b-2 border-gray-700 hover:bg-gray-800 transition-colors">
          {sidebarOpen ? (
            <span className="text-lg font-black text-white tracking-tight uppercase">StudyMate</span>
          ) : (
            <span className="text-lg font-black text-white">S</span>
          )}
        </Link>

        {/* Nav items */}
        <nav className="flex-1 py-3 overflow-y-auto space-y-0.5">
          {displayedNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 mx-2 rounded-sm text-xs font-bold uppercase tracking-wide
                  transition-all duration-150
                  ${isActive
                    ? 'bg-white text-black shadow-[2px_2px_0px_0px_rgba(255,255,255,0.3)]'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }
                `}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {sidebarOpen && (
                  <span className="truncate">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Role badge */}
        {sidebarOpen && (
          <div className="p-3 border-t-2 border-gray-700">
            <span className={`text-[10px] font-black px-2 py-1 uppercase tracking-widest border border-black ${roleCfg.color}`}>
              {roleCfg.label}
            </span>
          </div>
        )}
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="h-20 bg-white border-b-4 border-black flex items-center justify-between px-6 flex-shrink-0 shadow-[0px_4px_0px_0px_rgba(0,0,0,1)] z-10">
          <div className="flex items-center gap-4">
            <button
               onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-black bg-white hover:bg-amber-300 transition-colors p-2.5 border-2 border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-none active:translate-y-0.5 active:translate-x-0.5"
            >
              <IconMenu />
            </button>
            <SearchBar />
          </div>

          {/* Homepage style links directly in Dashboard header */}
          <nav className="hidden lg:flex gap-6 text-sm font-black uppercase tracking-widest text-black">
            <Link href="#" className="hover:bg-amber-300 px-3 py-1 border-2 border-transparent hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">Khóa học</Link>
            <Link href="#" className="hover:bg-amber-300 px-3 py-1 border-2 border-transparent hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">Sự kiện</Link>
            <Link href="#" className="hover:bg-amber-300 px-3 py-1 border-2 border-transparent hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">Blog</Link>
          </nav>

          <div className="flex items-center gap-5">
            {role === 'STUDENT' && (
              <Link href="/cart" className="relative text-black hover:bg-emerald-300 border-2 border-black p-2.5 rounded-none transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:translate-x-0.5">
                <IconCart />
                <span className="absolute -top-2.5 -right-2.5 bg-red-400 text-black border-2 border-black text-[10px] font-black rounded-none w-6 h-6 flex items-center justify-center shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                  0
                </span>
              </Link>
            )}
            <div className="flex items-center gap-4 bg-gray-50 border-2 border-black p-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <div className="hidden md:block pl-2 text-right">
                <p className="text-xs font-black text-black">
                  {user?.firstName || user?.emailAddresses[0]?.emailAddress}
                </p>
                <div className="mt-0.5">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 border-2 border-black inline-block ${roleCfg.color.replace('text-white', 'text-black')}`}>
                    {roleCfg.label}
                  </span>
                </div>
              </div>
              <div className="border-2 border-black">
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-9 h-9 rounded-none",
                      userButtonTrigger: "focus:shadow-none focus:outline-none"
                    }
                  }}
                >
                  <UserButton.MenuItems>
                    <UserButton.Link
                      label="Trang chủ"
                      labelIcon={<IconHome />}
                      href="/"
                    />
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
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 flex flex-col">
          {(!isKycRoute && (isLockedInstructor || isPendingUserRole)) ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-lg text-center space-y-6">
                 <div className="w-16 h-16 mx-auto bg-amber-300 border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-3">
                    <span className="text-3xl font-black text-black">!</span>
                 </div>
                 <h2 className="text-2xl font-black uppercase text-black">
                   {kycStatus === 'PENDING' ? 'Hồ sơ đang được duyệt' : 
                    kycStatus === 'REJECTED' ? 'Hồ sơ bị từ chối' : 
                    'Hồ sơ chưa hoàn thiện'}
                 </h2>
                 <p className="text-sm font-bold text-gray-600">
                   {kycStatus === 'PENDING' ? 'Hồ sơ của bạn đang được duyệt, vui lòng đợi. Hồ sơ sẽ được duyệt trong khoảng 2 đến 3 ngày làm việc.' : 
                    kycStatus === 'REJECTED' ? 'Hồ sơ của bạn không hợp lệ. Bạn vui lòng tạo lại một tài khoản mới nếu muốn tham gia giảng dạy sau này.' : 
                    'Vui lòng hoàn thiện hồ sơ đăng ký KYC để được cấp phép kinh doanh khóa học!'}
                 </p>
                 <Link href="/dashboard/instructor/kyc" className="inline-block px-6 py-3 bg-indigo-500 text-white font-black uppercase tracking-wider border-2 border-black hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform">
                   {kycStatus === 'UNSUBMITTED' ? 'Bắt đầu điền hồ sơ' : 'Kiểm tra trạng thái'}
                 </Link>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}