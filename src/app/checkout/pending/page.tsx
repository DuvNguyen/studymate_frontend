'use client';

import { API_BASE } from '@/constants/api';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { useState, useEffect, Suspense, useCallback, useLayoutEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import PublicLayout from '@/components/PublicLayout';
import LoadingSpinner from '@/components/LoadingSpinner';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || searchParams.get('orderCode');
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const cancelled =
    searchParams.get('cancelled') === '1' || searchParams.get('cancel') === 'true';
  const isPayosPaidReturn =
    searchParams.get('code') === '00' &&
    searchParams.get('status') === 'PAID' &&
    searchParams.get('cancel') !== 'true';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [order, setOrder] = useState<any>(null);
  const [fetching, setFetching] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const redirectingRef = useRef(false);

  const redirectToMyCourses = useCallback(() => {
    if (redirectingRef.current) return;

    redirectingRef.current = true;
    const destination = new URL('/dashboard/student/courses?fromCheckout=1&payment=success', window.location.origin);
    if (destination.hostname === '127.0.0.1') {
      destination.hostname = 'localhost';
    }

    window.location.replace(destination.toString());
  }, []);

  useLayoutEffect(() => {
    if (!isPayosPaidReturn) return;

    toast.success('Thanh toán PayOS thành công! Đang chuyển tới khóa học của bạn...');
    redirectToMyCourses();
  }, [isPayosPaidReturn, redirectToMyCourses]);

  const fetchOrderStatus = useCallback(async () => {
    if (!orderId || !isLoaded) return;

    if (!isSignedIn) {
      setErrorMessage('Vui lòng đăng nhập lại để kiểm tra đơn hàng.');
      setFetching(false);
      return;
    }

    setErrorMessage('');

    try {
      const token = await getToken();
      if (!token) {
        setErrorMessage('Không lấy được phiên đăng nhập, vui lòng tải lại trang.');
        return;
      }
      const now = Date.now();
      const res = await fetch(
        `${API_BASE}/orders/${orderId}?t=${now}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        },
      );

      const result = await res.json();
      if (!res.ok) {
        setErrorMessage(result.message || 'Không thể tải thông tin đơn hàng.');
        return;
      }

      if (res.ok) {
        const latestOrder = result.data;
        setOrder(latestOrder);

        if (latestOrder.status === 'COMPLETED') {
          toast.success('Thanh toán thành công! Đang chuyển hướng...');
          redirectToMyCourses();
        }
      }
    } catch (err) {
      console.error('Polling error:', err);
      setErrorMessage('Không thể kết nối backend để kiểm tra đơn hàng.');
    } finally {
      setFetching(false);
    }
  }, [getToken, isLoaded, isSignedIn, orderId, redirectToMyCourses]);

  useEffect(() => {
    if (isLoaded || !fetching || order) return;

    const timeout = setTimeout(() => {
      setFetching(false);
      setErrorMessage(
        'Phiên đăng nhập chưa sẵn sàng sau khi quay về từ PayOS. Vui lòng tải lại trang hoặc đăng nhập lại.',
      );
    }, 5000);

    return () => clearTimeout(timeout);
  }, [fetching, isLoaded, order]);

  // Poll for order status
  useEffect(() => {
    if (!orderId) {
      setFetching(false);
      setErrorMessage('Thiếu mã đơn hàng từ PayOS.');
      return;
    }

    if (!isLoaded) return;

    fetchOrderStatus();

    const interval = setInterval(fetchOrderStatus, 3000);

    return () => clearInterval(interval);
  }, [isLoaded, orderId, fetchOrderStatus]);


  if (fetching && !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <LoadingSpinner size="lg" className="mb-4" />
        <p className="font-black uppercase tracking-widest text-xs">{isPayosPaidReturn ? 'THANH TOÁN THÀNH CÔNG, ĐANG CHUYỂN TRANG...' : isLoaded ? 'ĐANG TẢI THÔNG TIN ĐƠN HÀNG...' : 'ĐANG ĐỒNG BỘ PHIÊN ĐĂNG NHẬP...'}</p>
      </div>
    );
  }

  if (!orderId || !order) {
    return (
      <div className="pt-36 max-w-6xl mx-auto px-4 text-center">
        <div className="w-20 h-20 bg-red-100 border-4 border-black flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <span className="text-4xl font-black text-red-600">!</span>
        </div>
        <h1 className="text-2xl font-black text-black uppercase mb-4">KHÔNG TÌM THẤY ĐƠN HÀNG</h1>
        <p className="text-gray-700 font-bold mb-8 italic">{errorMessage || 'Vui lòng kiểm tra lại mã đơn hàng hoặc liên hệ hỗ trợ.'}</p>
        <Link href="/cart">
          <Button variant="outline" className="border-2 font-black">QUAY LẠI GIỎ HÀNG</Button>
        </Link>
      </div>
    );
  }


  return (
    <div className="max-w-2xl mx-auto px-4 pb-24">
      <div className="text-center mb-10">
        <div className="inline-block bg-amber-300 border-2 border-black px-4 py-1 mb-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-[10px] font-black uppercase tracking-[0.2em]">PayOS Checkout</p>
        </div>
        <h1 className="text-4xl font-black uppercase text-black mb-2 tracking-tighter">
          Đang xác nhận thanh toán
        </h1>
        <p className="text-xs font-bold text-gray-700 uppercase tracking-widest">
          ĐƠN HÀNG: <span className="text-black">#{order.order_number}</span> • TRẠNG THÁI: <span className={order.status === 'COMPLETED' ? 'text-emerald-700' : 'text-amber-700'}>{order.status}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className={order.status === 'COMPLETED' ? 'bg-emerald-100 border-4 border-black p-8 text-center' : 'bg-amber-100 border-4 border-black p-8 text-center'}>
            {order.status === 'COMPLETED' ? (
              <>
                <div className="w-16 h-16 border-4 border-black bg-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <span className="text-4xl font-black text-black">✓</span>
                </div>
                <p className="font-black uppercase text-lg text-black leading-tight">Thanh toán thành công</p>
              </>
            ) : (
              <>
                <LoadingSpinner size="lg" className="mx-auto mb-4" />
                <p className="font-black uppercase text-lg text-black leading-tight">Đang chờ PayOS gửi xác nhận</p>
              </>
            )}
          </div>
          <p className="text-[10px] text-center text-gray-700 font-bold uppercase tracking-tight mt-4">
            Webhook PayOS là nguồn xác nhận chính. Trang này tự kiểm tra lại mỗi 3 giây.
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-xs font-black uppercase text-gray-700 mb-4 border-b-2 border-black border-dashed pb-2">Thông tin đơn hàng</h3>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black uppercase text-gray-700 mb-1">Mã đơn hàng</p>
                <p className="text-lg font-black text-black">{order.order_number}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-gray-700 mb-1">Số tiền</p>
                <p className="text-2xl font-black text-emerald-700">₫{Number(order.total_amount).toLocaleString('vi-VN')}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-gray-700 mb-1">Mã PayOS</p>
                <p className="text-xs font-black text-black break-all">{order.payment_gateway_id || 'Đang khởi tạo'}</p>
              </div>
            </div>
          </div>

          {cancelled && order.status !== 'COMPLETED' && (
            <div className="bg-red-100 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-xs font-black text-black uppercase leading-relaxed">
                Bạn vừa rời khỏi PayOS trước khi hoàn tất. Nếu đã chuyển khoản, vui lòng chờ webhook xác nhận hoặc liên hệ hỗ trợ với mã đơn hàng này.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {order.status === 'COMPLETED' ? (
              <Link href="/dashboard/student/purchases">
                <Button size="lg" className="w-full py-4 text-sm font-black bg-emerald-400 hover:bg-emerald-500 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all">
                  VÀO KHÓA HỌC CỦA TÔI
                </Button>
              </Link>
            ) : (
              <Button
                size="lg"
                className="w-full py-4 text-sm font-black bg-amber-300 hover:bg-amber-400 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                onClick={fetchOrderStatus}
              >
                KIỂM TRA LẠI NGAY
              </Button>
            )}

            <p className="text-[10px] font-bold text-gray-700 italic text-center leading-relaxed">
              * Không cấp khóa học dựa trên trang quay lại. Hệ thống chỉ mở khóa khi backend nhận webhook PayOS hợp lệ và số tiền khớp.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPendingPage() {
  return (
    <PublicLayout>
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
          <LoadingSpinner size="lg" />
        </div>
      }>
        <CheckoutContent />
      </Suspense>
    </PublicLayout>
  );
}
