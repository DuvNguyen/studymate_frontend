'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { ConfirmModal } from './ConfirmModal';

interface Props {
  className?: string;
  children: React.ReactNode;
}

export function StudentSignupButton({ className, children }: Props) {
  const { user, loading } = useCurrentUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);

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

    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setShowConfirm(false);
    await signOut();
    window.localStorage.setItem('intended_role', 'STUDENT');
    router.push('/sign-up?role=student');
  };

  return (
    <>
      <button onClick={handleClick} className={className}>
        {children}
      </button>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirm}
        title="Yêu cầu hệ thống"
        message={`Hệ thống yêu cầu các nhóm người dùng sử dụng tài khoản riêng biệt.\n\nTài khoản hiện tại của bạn đang là ${user?.role}. Bạn có muốn ĐĂNG XUẤT tài khoản này để tạo tài khoản Học viên mới (bằng một Email khác) không?`}
        confirmText="Đồng ý đăng xuất"
        cancelText="Để sau"
        confirmVariant="warning"
      />
    </>
  );
}
