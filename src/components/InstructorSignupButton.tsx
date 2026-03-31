'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';
import { useCurrentUser } from '../hooks/useCurrentUser';

interface Props {
  className?: string;
  children: React.ReactNode;
}

export function InstructorSignupButton({ className, children }: Props) {
  const { user, loading } = useCurrentUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    // Nếu đang tải thông tin user, tạm thời không làm gì hoặc cho phép
    if (loading) return;

    if (!user) {
      window.localStorage.setItem('intended_role', 'INSTRUCTOR');
      router.push('/sign-up?role=instructor');
      return;
    }

    if (user.role === 'INSTRUCTOR') {
      router.push('/dashboard/instructor/kyc');
      return;
    }

    const confirmNewAccount = window.confirm(
      `Yêu cầu hệ thống: Giảng viên và Học viên phải sử dụng 2 tài khoản riêng biệt.\n\nTài khoản hiện tại của bạn đang là ${user.role}. Bạn có muốn ĐĂNG XUẤT tài khoản này để tạo tài khoản Giảng viên mới (bằng một Email khác) không?`
    );

    if (confirmNewAccount) {
      await signOut();
      window.localStorage.setItem('intended_role', 'INSTRUCTOR');
      router.push('/sign-up?role=instructor');
    }
  };

  return (
    <button onClick={handleClick} className={className}>
      {children}
    </button>
  );
}
