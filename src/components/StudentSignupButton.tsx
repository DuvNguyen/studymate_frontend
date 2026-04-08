'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';
import { useCurrentUser } from '../hooks/useCurrentUser';

interface Props {
  className?: string;
  children: React.ReactNode;
}

export function StudentSignupButton({ className, children }: Props) {
  const { user, loading } = useCurrentUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if (loading) return;

    if (!user) {
      window.localStorage.setItem('intended_role', 'STUDENT');
      router.push('/sign-up?role=student');
      return;
    }

    if (user.role === 'STUDENT') {
      router.push('/dashboard');
      return;
    }

    const confirmNewAccount = window.confirm(
      `Hệ thống yêu cầu các nhóm người dùng sử dụng tài khoản riêng biệt.\n\nTài khoản hiện tại của bạn đang là ${user.role}. Bạn có muốn ĐĂNG XUẤT tài khoản này để tạo tài khoản Học viên mới (bằng một Email khác) không?`
    );

    if (confirmNewAccount) {
      await signOut();
      window.localStorage.setItem('intended_role', 'STUDENT');
      router.push('/sign-up?role=student');
    }
  };

  return (
    <button onClick={handleClick} className={className}>
      {children}
    </button>
  );
}
