'use client';

import { SignUp } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function SignUpPage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Lưu lại ý nguyện (role) của user khi vừa ấn nút từ trang chủ
    const role = searchParams?.get('role');
    if (role === 'instructor' || role === 'student') {
      window.localStorage.setItem('intended_role', role.toUpperCase());
    }
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <SignUp fallbackRedirectUrl="/onboarding" signInFallbackRedirectUrl="/dashboard" />
    </div>
  );
}