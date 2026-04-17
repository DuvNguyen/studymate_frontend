'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/Button';
import { useState, useEffect, Suspense } from 'react';
import toast from 'react-hot-toast';
import { PAYMENT_CONFIG } from '@/constants/payment';
import PublicLayout from '@/components/PublicLayout';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { getToken } = useAuth();
  const router = useRouter();
  const [isSimulating, setIsSimulating] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [fetching, setFetching] = useState(true);

  // Poll for order status
  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`http://localhost:3001/api/v1/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await res.json();
        if (res.ok) {
          setOrder(result.data);
          
          // Automatic redirect if completed
          if (result.data.status === 'COMPLETED') {
            toast.success('Thanh toán thành công! Đang chuyển hướng...');
            setTimeout(() => {
              router.push('/dashboard/student/courses');
            }, 2000);
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      } finally {
        setFetching(false);
      }
    };

    fetchOrder(); // Initial fetch
    
    // Set up polling interval every 3 seconds
    const interval = setInterval(fetchOrder, 3000);
    
    return () => clearInterval(interval);
  }, [orderId, getToken, router]);

  const handleSimulatePayment = async () => {
    if (!orderId) return;
    setIsSimulating(true);
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:3001/api/v1/orders/${orderId}/simulate-payment`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Lỗi xác nhận thanh toán');
      
      // Polling will handle the redirect automatically once status changes to COMPLETED
      toast.success('Gửi yêu cầu giả lập thanh toán thành công!');
    } catch (err: any) {
      toast.error(err.message);
      setIsSimulating(false);
    }
  };

  if (fetching && !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-none animate-spin mb-4"></div>
        <p className="font-black uppercase tracking-widest text-xs">Đang tải thông tin đơn hàng...</p>
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
        <p className="text-gray-500 font-bold mb-8 italic">Vui lòng kiểm tra lại mã đơn hàng hoặc liên hệ hỗ trợ.</p>
        <Link href="/cart">
          <Button variant="outline" className="border-2 font-black">QUAY LẠI GIỎ HÀNG</Button>
        </Link>
      </div>
    );
  }

  const vietQrUrl = `https://img.vietqr.io/image/${PAYMENT_CONFIG.BANK_BIN}-${PAYMENT_CONFIG.ACCOUNT_NO}-compact2.png?amount=${Math.round(order.total_amount)}&addInfo=${encodeURIComponent(`THANHTOAN ${order.order_number}`)}&accountName=${encodeURIComponent(PAYMENT_CONFIG.ACCOUNT_NAME)}`;

  return (
    <div className="max-w-2xl mx-auto px-4 pb-24">
      <div className="text-center mb-10">
        <div className="inline-block bg-amber-300 border-2 border-black px-4 py-1 mb-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-[10px] font-black uppercase tracking-[0.2em]">Cổng thanh toán StudyMate</p>
        </div>
        <h1 className="text-4xl font-black uppercase text-black mb-2 tracking-tighter">
          Thanh toán an toàn
        </h1>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
          ĐƠN HÀNG: <span className="text-black">#{order.order_number}</span> • TRẠNG THÁI: <span className={order.status === 'COMPLETED' ? 'text-emerald-600' : 'text-amber-500'}>{order.status}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* QR Section */}
        <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="aspect-square bg-white border-2 border-black flex items-center justify-center p-2 mb-4 relative overflow-hidden group">
            <img 
              src={vietQrUrl} 
              alt="VietQR Payment"
              className="w-full h-full object-contain"
            />
            {order.status === 'COMPLETED' && (
              <div className="absolute inset-0 bg-emerald-500/90 flex flex-col items-center justify-center text-white p-4 text-center">
                <div className="w-16 h-16 border-4 border-white flex items-center justify-center mb-4 rounded-none">
                  <span className="text-4xl font-black">✓</span>
                </div>
                <p className="font-black uppercase text-lg leading-tight">THANH TOÁN THÀNH CÔNG</p>
              </div>
            )}
          </div>
          <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-tight">Hỗ trợ tất cả ngân hàng & ứng dụng tài chính</p>
        </div>

        {/* Info Section */}
        <div className="space-y-6">
          <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-xs font-black uppercase text-gray-400 mb-4 border-b-2 border-black border-dashed pb-2">Thông tin tài khoản</h3>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black uppercase text-gray-500 mb-1">Số tài khoản</p>
                <p className="text-lg font-black text-black">{PAYMENT_CONFIG.ACCOUNT_NO}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-gray-500 mb-1">Chủ tài khoản</p>
                <p className="text-sm font-black text-black uppercase">{PAYMENT_CONFIG.ACCOUNT_NAME}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-gray-500 mb-1">Số tiền cần chuyển</p>
                <p className="text-2xl font-black text-emerald-600">₫{Number(order.total_amount).toLocaleString('vi-VN')}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-gray-500 mb-1">Nội dung chuyển khoản</p>
                <div className="bg-amber-50 border-2 border-black border-dashed p-3 relative group">
                  <p className="text-sm font-black text-black uppercase">THANHTOAN {order.order_number}</p>
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[8px] bg-black text-white px-1 font-black">COPY</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
             <Button 
              size="lg" 
              className={`w-full py-4 text-sm font-black ${order.status === 'COMPLETED' ? 'bg-emerald-400 opacity-50 cursor-not-allowed' : 'bg-emerald-400 hover:bg-emerald-500'} border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all`}
              onClick={handleSimulatePayment}
              disabled={isSimulating || order.status === 'COMPLETED'}
            >
              {isSimulating ? 'ĐANG CHỜ XÁC NHẬN...' : order.status === 'COMPLETED' ? 'ĐÃ THANH TOÁN' : 'TÔI ĐÃ CHUYỂN KHOẢN'}
            </Button>
            
            <p className="text-[10px] font-bold text-gray-500 italic text-center leading-relaxed">
              * Hệ thống sẽ tự động cập nhật trạng thái sau khi tiền vào tài khoản. Đừng đóng trang này cho đến khi nhận được xác nhận thành công.
            </p>
          </div>
        </div>
      </div>

      {/* Admin/Demo Simulator Tools (ONLY FOR DEMO) */}
      <div className="mt-16 pt-8 border-t-4 border-black border-dotted">
        <div className="bg-zinc-100 border-2 border-black p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-zinc-500">Demo Simulation Tool</p>
            <p className="text-[9px] font-bold text-zinc-400 uppercase">Sử dụng để mô phỏng Webhook ngân hàng gửi về StudioMate</p>
          </div>
          <button 
            onClick={handleSimulatePayment}
            disabled={isSimulating || order.status === 'COMPLETED'}
            className="text-[10px] font-black uppercase bg-black text-white px-3 py-2 hover:bg-zinc-800 disabled:opacity-50"
          >
            Mô phỏng tiền đã vào
          </button>
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
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-none animate-spin"></div>
        </div>
      }>
        <CheckoutContent />
      </Suspense>
    </PublicLayout>
  );
}
