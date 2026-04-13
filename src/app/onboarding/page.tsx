'use client';

import { useEffect, useState, useRef } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const { getToken, isLoaded: isAuthLoaded } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const isFetchingRef = useRef(false);

  useEffect(() => {
    // Chỉ chạy khi đã lấy được thông tin user từ Clerk
    if (!isLoaded || !user) return;
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    
    const checkRoleAndRedirect = async (retryCount = 0) => {
      try {
        console.log(`[Onboarding] Bắt đầu đồng bộ hồ sơ (Lần thử: ${retryCount + 1})`);
        const token = await getToken();
        if (!token) {
          console.error('[Onboarding] Không lấy được JWT token từ Clerk');
          return;
        }

        const intendedRole = window.localStorage.getItem('intended_role') || 'STUDENT';
        console.log(`[Onboarding] Intended Role from LocalStorage: ${intendedRole}`);

        const res = await fetch('http://localhost:3001/api/v1/auth/onboard', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ role: intendedRole })
        });

        console.log(`[Onboarding] API Response Status: ${res.status}`);

        if (res.ok) {
          const { data } = await res.json();
          console.log('[Onboarding] Thành công:', data);
          const role = data.role; 
          
          if (role === 'INSTRUCTOR') {
             router.replace('/dashboard/instructor/kyc'); 
          } else {
             router.replace('/dashboard'); 
          }
        } else if (res.status === 401 || res.status === 404 || res.status === 500) {
          console.warn(`[Onboarding] Backend chưa sẵn sàng (Status ${res.status}). Đang thử lại...`);
          if (retryCount < 10) {
            setTimeout(() => checkRoleAndRedirect(retryCount + 1), 1500);
          } else {
            console.error('[Onboarding] Đã thử tối đa 10 lần nhưng vẫn thất bại.');
            setError('Không thể đồng bộ hồ sơ. Vui lòng thử tải lại trang hoặc liên hệ hỗ trợ.');
            isFetchingRef.current = false;
          }
        } else {
          const errorData = await res.json().catch(() => null);
          console.error('[Onboarding] Lỗi từ Backend:', errorData);
          setError('Không thể đồng bộ hồ sơ, bạn hãy thử tải lại trang nhé.');
          isFetchingRef.current = false;
        }
      } catch (err: any) {
        console.error('[Onboarding] Exception catch:', err.message || err);
        if (retryCount < 10) {
          setTimeout(() => checkRoleAndRedirect(retryCount + 1), 1500);
        } else {
          setError('Có lỗi khi đồng bộ hồ sơ. Vui lòng tải lại trang.');
          isFetchingRef.current = false;
        }
      }
    };

    checkRoleAndRedirect();
  }, [isLoaded, isAuthLoaded, user, router, getToken]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-none animate-spin mb-6"></div>
      <h1 className="text-2xl font-black text-black uppercase tracking-tight mb-2">Đang thiết lập cổng không gian học tập...</h1>
      <p className="text-xs font-black uppercase tracking-widest text-gray-500 max-w-md">
        {error || 'Xin vui lòng chờ giây lát, StudyMate đang tối ưu hoá trải nghiệm dành riêng cho vai trò của bạn.'}
      </p>
    </div>
  );
}
