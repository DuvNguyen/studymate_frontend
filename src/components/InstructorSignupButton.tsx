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

export function InstructorSignupButton({ className, children }: Props) {
  const { user, loading } = useCurrentUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
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

    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setShowConfirm(false);
    await signOut();
    window.localStorage.setItem('intended_role', 'INSTRUCTOR');
    router.push('/sign-up?role=instructor');
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
        message={`Giảng viên và Học viên phải sử dụng 2 tài khoản riêng biệt.\n\nTài khoản hiện tại của bạn đang là ${user?.role}. Bạn có muốn ĐĂNG XUẤT tài khoản này để tạo tài khoản Giảng viên mới (bằng một Email khác) không?`}
        confirmText="Đồng ý đăng xuất"
        cancelText="Để sau"
        confirmVariant="warning"
      />
    </>
  );
}
