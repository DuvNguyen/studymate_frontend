'use client';

import { useEffect, useState } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const { getToken, isLoaded: isAuthLoaded } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    // Chỉ chạy khi đã lấy được thông tin user từ Clerk
    if (!isLoaded || !user) return;

    // Xem thử trong lúc đăng ký, chúng ta có đính metadata gì vào Webhook không?
    // Do webhooks đã xử lý, `user.publicMetadata.role` có thể đã được gán bởi Webhook (nếu Clerk có cơ chế đồng thuận nhanh).
    // Phân luồng đơn giản:
    // Vì lúc Webhook chạy, metadata `role` đã được lưu. Giờ ta chỉ cần đọc xem user này là INSTRUCTOR hay STUDENT để Redirect mượt mà.
    
    // Tuy nhiên, NextJS Frontend của Clerk Public Metadata thỉnh thoảng sẽ bị cache khoảng 10s.
    // Tốt hơn hết là gọi lên Backend API một phát "/users/me" để lấy role chính xác nhất ở DB NestJS.

    const checkRoleAndRedirect = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const intendedRole = window.localStorage.getItem('intended_role') || 'STUDENT';

        const res = await fetch('http://localhost:3001/api/v1/auth/onboard', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ role: intendedRole })
        });

        if (res.ok) {
          const { data } = await res.json();
          const role = data.role; // Lấy 'INSTRUCTOR' hoặc 'STUDENT'
          
          if (role === 'INSTRUCTOR') {
             router.replace('/dashboard/instructor/kyc'); // Dashboard riêng
          } else {
             router.replace('/dashboard'); // Mặc định về Dashboard Học viên
          }
        } else {
          setError('Không thể đồng bộ hồ sơ, bạn hãy thử tải lại trang nhé.');
        }
      } catch (err) {
        setError('Có lỗi khi đồng bộ hồ sơ, đang thử lại...');
      }
    };

    checkRoleAndRedirect();
  }, [isLoaded, isAuthLoaded, user, router, getToken]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-6"></div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Đang thiết lập cổng không gian học tập...</h1>
      <p className="text-slate-500 max-w-md">
        {error || 'Xin vui lòng chờ giây lát, StudyMate đang tối ưu hoá trải nghiệm dành riêng cho vai trò của bạn.'}
      </p>
    </div>
  );
}
