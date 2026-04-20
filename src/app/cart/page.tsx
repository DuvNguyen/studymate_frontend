'use client';

import { useCart } from '@/contexts/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/Button';
import { useRouter } from 'next/navigation';
import PublicLayout from '@/components/PublicLayout';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export default function CartPage() {
  const { user, loading: userLoading } = useCurrentUser();
  const { cart, loading, removeFromCart, checkout, checkoutLoading } = useCart();
  const router = useRouter();

  const handleCheckout = async () => {
    const result = await checkout();
    if (result.success && result.order) {
      router.push(`/checkout/pending?orderId=${result.order.id}`); 
    } else {
      alert(result.error);
    }
  };

  const totalAmount = cart?.cart_items?.reduce((sum: number, item: any) => sum + Number(item.final_price), 0) || 0;
  const itemCount = cart?.cart_items?.length || 0;

  // Nếu đang tải user thì hiện loading nhẹ
  if (userLoading) return null;

  // Nếu đã đăng nhập mà không phải STUDENT thì hiện 403
  if (user && user.role !== 'STUDENT') {
    return (
      <PublicLayout>
        <div className="flex-1 flex items-center justify-center py-20 px-4">
          <div className="bg-white border-8 border-black p-12 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] max-w-2xl text-center space-y-8 rotate-1">
            <div className="w-24 h-24 mx-auto bg-rose-500 border-4 border-black flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] -rotate-6">
              <span className="text-5xl font-black text-white px-2">403</span>
            </div>
            <div>
              <h2 className="text-4xl font-black uppercase text-black tracking-tighter italic">Truy cập bị từ chối</h2>
              <p className="text-xs font-black uppercase tracking-[0.2em] opacity-40 mt-2">RBAC_POLICY_VIOLATION</p>
            </div>
            <p className="text-lg font-bold text-black leading-relaxed">
               BẠN KHÔNG CÓ QUYỀN TRUY CẬP VÀO GIỎ HÀNG. CHỈ HỌC VIÊN MỚI CÓ THỂ THỰC HIỆN MUA KHÓA HỌC.
            </p>
            <div className="flex flex-col gap-4">
              <Link href="/" className="px-8 py-4 bg-black text-white font-black uppercase tracking-widest border-2 border-black hover:bg-yellow-400 hover:text-black hover:-translate-y-1 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
                Quay lại Trang chủ
              </Link>
              <p className="text-[10px] font-black opacity-30">ERR_CODE: SM-AUTH-403-FORBIDDEN</p>
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="max-w-6xl mx-auto px-4 pb-20">
        <h1 className="text-4xl font-black uppercase text-black tracking-tighter mb-8">
          Giỏ hàng của bạn
        </h1>

        {loading ? (
          <div className="text-center py-20 font-black text-black">ĐANG TẢI GIỎ HÀNG...</div>
        ) : itemCount === 0 ? (
          <div className="border-4 border-black p-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-amber-50">
            <h2 className="text-2xl font-black text-black mb-4">Giỏ hàng đang trống</h2>
            <p className="text-black mb-8 font-bold">Hãy khám phá các khóa học hấp dẫn và quay lại nhé!</p>
            <Link href="/courses">
              <Button size="lg">Khám phá khóa học</Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left side: Cart Items */}
            <div className="flex-1">
              <p className="font-black text-black mb-4 border-b-4 border-black pb-2 text-lg">
                {itemCount} KHÓA HỌC TRONG GIỎ HÀNG
              </p>
              
              <div className="space-y-6">
                {cart?.cart_items?.map((item: any) => (
                  <div key={item.id} className="flex flex-col sm:flex-row gap-4 p-4 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group">
                    <div className="w-full sm:w-40 aspect-video bg-gray-200 border-2 border-black flex-shrink-0 relative overflow-hidden">
                      {item.course?.thumbnailUrl ? (
                        <Image 
                          src={item.course.thumbnailUrl} 
                          alt={item.course.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-black">NO IMAGE</div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-black text-lg text-black uppercase leading-tight line-clamp-2 mb-1">
                          {item.course?.title || 'Khóa học'}
                        </h3>
                        <p className="text-xs font-black text-gray-800">GIẢNG VIÊN: ĐANG CẬP NHẬT</p>
                      </div>

                      <div className="flex items-center gap-4 mt-4 sm:mt-0">
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-xs font-black text-black underline hover:text-red-600 transition-colors uppercase"
                        >
                          Xóa khỏi giỏ
                        </button>
                      </div>
                    </div>

                    <div className="text-right sm:w-32 flex-shrink-0 flex flex-col justify-start">
                      <div className="text-xl font-black text-amber-500">
                        {Number(item.final_price).toLocaleString('vi-VN')} đ
                      </div>
                      {item.discount_amount > 0 && (
                        <div className="text-sm font-black text-black line-through">
                          {Number(item.original_price).toLocaleString('vi-VN')} đ
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side: Checkout Panel */}
            <div className="w-full lg:w-80 flex-shrink-0">
              <div className="border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white sticky top-40">
                <p className="text-lg font-black text-black mb-2 uppercase">Tổng tiền:</p>
                <div className="text-4xl font-black text-black mb-6 break-words">
                  {totalAmount.toLocaleString('vi-VN')} đ
                </div>

                <Button 
                  size="lg" 
                  className="w-full mb-4 py-4 text-lg bg-amber-400 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                >
                  {checkoutLoading ? 'ĐANG XỬ LÝ...' : 'THANH TOÁN NGAY'}
                </Button>

                <p className="text-xs font-bold text-center text-black">
                  Bạn sẽ chưa bị trừ tiền ở bước này
                </p>

                <div className="mt-8 border-t-2 border-black pt-6">
                  <p className="text-sm font-black text-black mb-2 uppercase">Mã giảm giá</p>
                  <div className="flex">
                    <input 
                      type="text" 
                      placeholder="NHẬP MÃ..." 
                      className="flex-1 border-2 border-black border-r-0 px-3 py-2 text-sm font-black outline-none w-full min-w-0"
                    />
                    <button className="bg-black text-white px-4 py-2 font-black text-sm hover:bg-amber-400 hover:text-black transition-colors focus:ring-0">
                      ÁP DỤNG
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
