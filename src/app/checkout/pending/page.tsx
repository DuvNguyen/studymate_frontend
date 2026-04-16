'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/Button';
import { useState, useEffect, Suspense } from 'react';
import toast from 'react-hot-toast';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { getToken } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      try {
        const token = await getToken();
        const res = await fetch(`http://localhost:3001/api/v1/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await res.json();
        if (res.ok) {
          setOrder(result.data);
        } else {
          toast.error(result.message || 'Không thể lấy thông tin đơn hàng');
        }
      } catch (err) {
        console.error('Fetch order error:', err);
      } finally {
        setFetching(false);
      }
    };

    fetchOrder();
  }, [orderId, getToken]);

  const handleSimulatePayment = async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:3001/api/v1/orders/${orderId}/simulate-payment`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Lỗi xác nhận thanh toán');
      
      toast.success('Thanh toán thành công! Khóa học đã thuộc về bạn.');
      router.push('/dashboard/student/courses');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="pt-36 text-center font-black">ĐANG TẢI THÔNG TIN ĐƠN HÀNG...</div>;
  }

  if (!orderId || !order) {
    return (
      <div className="pt-36 max-w-6xl mx-auto px-4 text-center">
        <h1 className="text-2xl font-black text-red-600">LỖI: KHÔNG TÌM THẤY ĐƠN HÀNG</h1>
        <Link href="/cart" className="mt-4 inline-block underline">Quay lại giỏ hàng</Link>
      </div>
    );
  }

  const vietQrUrl = `https://img.vietqr.io/image/970436-123456789-compact2.png?amount=${Math.round(order.total_amount)}&addInfo=${encodeURIComponent(`THANHTOAN ${order.order_number}`)}&accountName=STUDYMATE%20CORP`;

  return (
    <div className="pt-36 max-w-xl mx-auto px-4 pb-20 text-center">
      <h1 className="text-4xl font-black uppercase text-black mb-4 tracking-tighter">
        THANH TOÁN ĐƠN HÀNG
      </h1>
      <p className="text-sm font-bold text-gray-500 mb-8 border-b-4 border-black pb-4">
        MÃ ĐƠN HÀNG: {order.order_number}
      </p>

      <div className="border-4 border-black p-8 bg-amber-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8">
        <h2 className="text-xl font-black text-black mb-6 uppercase tracking-tight">
          Quét mã QR để thanh toán
        </h2>
        
        <div className="w-80 h-80 mx-auto bg-white border-4 border-black flex items-center justify-center p-2 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <img 
            src={vietQrUrl} 
            alt="VietQR Payment"
            className="w-full h-full object-contain"
          />
        </div>

        <div className="space-y-2 text-left bg-white border-2 border-black p-4 mb-6">
          <p className="text-xs font-black uppercase text-gray-500">Thông tin chuyển khoản:</p>
          <p className="text-sm font-bold text-black uppercase">Ngân hàng: <span className="text-amber-600">VIETCOMBANK (970436)</span></p>
          <p className="text-sm font-bold text-black uppercase">Số tài khoản: <span className="text-amber-600">123456789</span></p>
          <p className="text-sm font-bold text-black uppercase">Chủ tài khoản: <span className="text-amber-600">STUDYMATE CORP</span></p>
          <p className="text-sm font-bold text-black uppercase">Số tiền: <span className="text-amber-600 font-black text-lg">{Number(order.total_amount).toLocaleString('vi-VN')} đ</span></p>
        </div>

        <p className="text-sm font-black text-black border-2 border-dashed border-black p-3 bg-white inline-block w-full">
          Nội dung: <span className="text-amber-600">THANHTOAN {order.order_number}</span>
        </p>
      </div>

      <Button 
        size="lg" 
        className="w-full py-4 text-lg bg-emerald-400 hover:bg-emerald-500 mb-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
        onClick={handleSimulatePayment}
        disabled={loading}
      >
        {loading ? 'ĐANG XỬ LÝ...' : 'TÔI ĐÃ CHUYỂN KHOẢN'}
      </Button>
      <p className="text-xs font-bold text-black/60 italic uppercase tracking-widest">
        Hệ thống sẽ tự động duyệt khóa học sau khi nhận được thanh toán
      </p>
    </div>
  );
}

export default function CheckoutPendingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Suspense fallback={<div className="pt-36 text-center font-black">Loading...</div>}>
        <CheckoutContent />
      </Suspense>
    </div>
  );
}
