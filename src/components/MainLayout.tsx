'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton, useUser } from '@clerk/nextjs';

// Icons đơn giản bằng SVG inline
function IconHome() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}
function IconCourses() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}
function IconMyLearning() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}
function IconWishlist() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}
function IconDashboard() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}
function IconMenu() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}
function IconCart() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}
function IconProfile() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

// Nav items theo từng role
const navByRole: Record<string, { href: string; label: string; icon: React.ReactNode }[]> = {
  STUDENT: [
    { href: '/dashboard', label: 'Tổng quan', icon: <IconDashboard /> },
    { href: '/courses', label: 'Khóa học', icon: <IconCourses /> },
    { href: '/my-learning', label: 'Học của tôi', icon: <IconMyLearning /> },
    { href: '/wishlist', label: 'Yêu thích', icon: <IconWishlist /> },
    { href: '/dashboard/profile', label: 'Hồ sơ', icon: <IconProfile /> },
  ],
  INSTRUCTOR: [
    { href: '/dashboard', label: 'Tổng quan', icon: <IconDashboard /> },
    { href: '/dashboard/instructor/kyc', label: 'Hồ sơ Giảng viên', icon: <IconProfile /> },
    { href: '/instructor/courses', label: 'Khóa học của tôi', icon: <IconCourses /> },
    { href: '/instructor/revenue', label: 'Doanh thu', icon: <IconDashboard /> },
    { href: '/dashboard/profile', label: 'Cài đặt Account', icon: <IconProfile /> },
  ],
  STAFF: [
    { href: '/dashboard', label: 'Tổng quan', icon: <IconDashboard /> },
    { href: '/admin/kyc', label: 'Duyệt KYC', icon: <IconUsers /> },
    { href: '/admin/courses', label: 'Duyệt khóa học', icon: <IconCourses /> },
    { href: '/admin/refunds', label: 'Hoàn tiền', icon: <IconDashboard /> },
    { href: '/dashboard/profile', label: 'Hồ sơ', icon: <IconProfile /> },
  ],
  ADMIN: [
    { href: '/dashboard', label: 'Tổng quan', icon: <IconDashboard /> },
    { href: '/admin/users', label: 'Người dùng', icon: <IconUsers /> },
    { href: '/admin/courses', label: 'Khóa học', icon: <IconCourses /> },
    { href: '/admin/kyc', label: 'Duyệt KYC', icon: <IconUsers /> },
    { href: '/admin/finance', label: 'Tài chính', icon: <IconDashboard /> },
    { href: '/dashboard/profile', label: 'Hồ sơ', icon: <IconProfile /> },
  ],
};

interface MainLayoutProps {
  children: React.ReactNode;
  role?: string;
}

export default function MainLayout({ children, role = 'STUDENT' }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const { user } = useUser();

  const navItems = navByRole[role] ?? navByRole['STUDENT'];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">

      {/* Sidebar */}
      <aside
        className={`
          ${sidebarOpen ? 'w-64' : 'w-16'}
          bg-gray-900 text-white flex flex-col
          transition-all duration-300 ease-in-out
          flex-shrink-0
        `}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-gray-700">
          {sidebarOpen ? (
            <span className="text-xl font-bold text-white">StudyMate</span>
          ) : (
            <span className="text-xl font-bold text-white">S</span>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 mx-2 rounded-lg mb-1
                  transition-colors duration-150
                  ${isActive
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }
                `}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {sidebarOpen && (
                  <span className="text-sm font-medium truncate">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Role badge ở dưới sidebar */}
        {sidebarOpen && (
          <div className="p-4 border-t border-gray-700">
            <span className={`
              text-xs font-semibold px-2 py-1 rounded-full
              ${role === 'ADMIN' ? 'bg-red-600 text-white' :
                role === 'STAFF' ? 'bg-yellow-600 text-white' :
                role === 'INSTRUCTOR' ? 'bg-blue-600 text-white' :
                'bg-gray-600 text-gray-200'}
            `}>
              {role}
            </span>
          </div>
        )}
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            {/* Toggle sidebar */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <IconMenu />
            </button>

            {/* Search bar */}
            <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2 w-80">
              <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Tìm kiếm khóa học..."
                className="bg-transparent text-sm outline-none w-full text-gray-700"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Cart — chỉ hiện với STUDENT */}
            {role === 'STUDENT' && (
              <Link href="/cart" className="relative text-gray-600 hover:text-gray-900">
                <IconCart />
                <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  0
                </span>
              </Link>
            )}

            {/* User info */}
            <div className="flex items-center gap-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-800">
                  {user?.firstName || user?.emailAddresses[0]?.emailAddress}
                </p>
                <p className="text-xs text-gray-500">{role}</p>
              </div>
              <UserButton />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}