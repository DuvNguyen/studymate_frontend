'use client';

import { useEffect, useState } from 'react';
import MainLayout from '@/components/MainLayout';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useCoupons, Coupon } from '@/hooks/useCoupons';
import LoadingScreen from '@/components/LoadingScreen';
import toast from 'react-hot-toast';

const DISCOUNT_TYPE_LABELS: Record<string, string> = {
  PERCENTAGE: 'Phần trăm (%)',
  FIXED: 'Cố định (₫)',
};

function CouponFormModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { createCoupon, creating } = useCoupons();
  const [form, setForm] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minOrderValue: '0',
    maxDiscountAmount: '',
    startDate: '',
    endDate: '',
    usageLimit: '',
    isActive: true,
  });

  const set = (k: string, v: any) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) return toast.error('Vui lòng nhập mã coupon');
    if (!form.discountValue || Number(form.discountValue) <= 0)
      return toast.error('Giá trị giảm giá phải > 0');
    try {
      await createCoupon({
        code: form.code.trim().toUpperCase(),
        discountType: form.discountType as any,
        discountValue: Number(form.discountValue),
        minOrderValue: Number(form.minOrderValue) || 0,
        maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : undefined,
        startDate: form.startDate ? new Date(form.startDate) as any : undefined,
        endDate: form.endDate ? new Date(form.endDate) as any : undefined,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
        isActive: form.isActive,
      });
      toast.success('Tạo mã giảm giá thành công!');
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error(e.message || 'Lỗi tạo mã giảm giá');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b-4 border-black bg-black">
          <h2 className="text-lg font-black uppercase text-white">Tạo mã giảm giá</h2>
          <button onClick={onClose} className="w-8 h-8 border-2 border-black bg-white hover:bg-red-100 flex items-center justify-center font-black text-lg text-black">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-4">
          {/* Code */}
          <div className="col-span-2">
            <label className="block text-[10px] font-black uppercase tracking-widest mb-1 text-black">Mã coupon *</label>
            <input
              value={form.code}
              onChange={(e) => set('code', e.target.value.toUpperCase())}
              placeholder="VD: SAVE97, INSTRUCTOR2026"
              className="w-full border-2 border-black px-3 py-2 text-sm font-bold text-black uppercase outline-none focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] placeholder:text-black/40"
            />
          </div>

          {/* Discount type */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest mb-1 text-black">Loại giảm giá</label>
            <select
              value={form.discountType}
              onChange={(e) => set('discountType', e.target.value)}
              className="w-full border-2 border-black px-3 py-2 text-sm font-bold text-black outline-none"
            >
              <option value="PERCENTAGE">Phần trăm (%)</option>
              <option value="FIXED">Cố định (₫)</option>
            </select>
          </div>

          {/* Discount value */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest mb-1 text-black">
              Giá trị {form.discountType === 'PERCENTAGE' ? '(%)' : '(₫)'} *
            </label>
            <input
              type="number"
              value={form.discountValue}
              onChange={(e) => set('discountValue', e.target.value)}
              placeholder={form.discountType === 'PERCENTAGE' ? '10' : '50000'}
              min="0"
              max={form.discountType === 'PERCENTAGE' ? '100' : undefined}
              className="w-full border-2 border-black px-3 py-2 text-sm font-bold text-black outline-none focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] placeholder:text-black/40"
            />
          </div>

          {/* Min order */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest mb-1 text-black">Đơn hàng tối thiểu (₫)</label>
            <input
              type="number"
              value={form.minOrderValue}
              onChange={(e) => set('minOrderValue', e.target.value)}
              min="0"
              placeholder="0"
              className="w-full border-2 border-black px-3 py-2 text-sm font-bold text-black outline-none focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] placeholder:text-black/40"
            />
          </div>

          {/* Max discount */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest mb-1 text-black">Giảm tối đa (₫) <span className="opacity-60">(tuỳ chọn)</span></label>
            <input
              type="number"
              value={form.maxDiscountAmount}
              onChange={(e) => set('maxDiscountAmount', e.target.value)}
              min="0"
              placeholder="Không giới hạn"
              className="w-full border-2 border-black px-3 py-2 text-sm font-bold text-black outline-none focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] placeholder:text-black/40"
            />
          </div>

          {/* Start date */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest mb-1 text-black">Ngày bắt đầu</label>
            <input
              type="datetime-local"
              value={form.startDate}
              onChange={(e) => set('startDate', e.target.value)}
              className="w-full border-2 border-black px-3 py-2 text-sm font-bold text-black outline-none"
            />
          </div>

          {/* End date */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest mb-1 text-black">Ngày kết thúc</label>
            <input
              type="datetime-local"
              value={form.endDate}
              onChange={(e) => set('endDate', e.target.value)}
              className="w-full border-2 border-black px-3 py-2 text-sm font-bold text-black outline-none"
            />
          </div>

          {/* Usage limit */}
          <div className="col-span-2">
            <label className="block text-[10px] font-black uppercase tracking-widest mb-1 text-black">Lượt dùng tối đa <span className="opacity-60">(tuỳ chọn)</span></label>
            <input
              type="number"
              value={form.usageLimit}
              onChange={(e) => set('usageLimit', e.target.value)}
              min="1"
              placeholder="Không giới hạn"
              className="w-full border-2 border-black px-3 py-2 text-sm font-bold text-black outline-none focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] placeholder:text-black/40"
            />
          </div>

          {/* Notice */}
          <div className="col-span-2 bg-amber-50 border-2 border-amber-400 px-4 py-3">
            <p className="text-xs font-black text-amber-800">
               Khi học viên dùng mã của bạn, bạn nhận <b>97%</b> doanh thu thay vì 70%. StudyMate chỉ thu 3% phí kỹ thuật.
            </p>
          </div>

          {/* Actions */}
          <div className="col-span-2 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 border-2 border-black font-black text-sm uppercase text-black hover:bg-gray-100 transition-colors">Huỷ</button>
            <button
              type="submit"
              disabled={creating}
              className="flex-1 py-3 bg-black text-white border-2 border-black font-black text-sm uppercase hover:bg-amber-400 hover:text-black disabled:opacity-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] active:shadow-none"
            >
              {creating ? 'Đang tạo...' : 'Tạo mã'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CouponRow({ coupon }: { coupon: Coupon }) {
  return (
    <tr className="border-b-2 border-black hover:bg-amber-50 transition-colors">
      <td className="px-4 py-3 font-black text-sm">{coupon.code}</td>
      <td className="px-4 py-3 text-xs font-bold">{DISCOUNT_TYPE_LABELS[coupon.discountType]}</td>
      <td className="px-4 py-3 font-black text-sm">
        {coupon.discountType === 'PERCENTAGE'
          ? `${coupon.discountValue}%`
          : `₫${Number(coupon.discountValue).toLocaleString('vi-VN')}`}
      </td>
      <td className="px-4 py-3 text-xs font-bold text-black/60">
        {coupon.usedCount}/{coupon.usageLimit ?? '∞'}
      </td>
      <td className="px-4 py-3">
        <span className={`text-[10px] font-black uppercase px-2 py-0.5 border-2 border-black ${coupon.isActive ? 'bg-emerald-300' : 'bg-gray-200'}`}>
          {coupon.isActive ? 'Đang hoạt động' : 'Tắt'}
        </span>
      </td>
      <td className="px-4 py-3 text-xs font-bold text-black/50">
        {coupon.endDate ? new Date(coupon.endDate).toLocaleDateString('vi-VN') : '—'}
      </td>
    </tr>
  );
}

export default function InstructorCouponsPage() {
  const { user, loading: userLoading } = useCurrentUser();
  const { myCoupons, fetchMyCoupons } = useCoupons();
  const [showModal, setShowModal] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [showPolicy, setShowPolicy] = useState(false);

  const MONTHLY_LIMIT = 3;

  // Count coupons created in current month (client-side)
  const thisMonthCount = myCoupons.filter((c) => {
    const d = new Date(c.createdAt);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;

  const slotsLeft = MONTHLY_LIMIT - thisMonthCount;
  const isLimitReached = slotsLeft <= 0;

  useEffect(() => {
    fetchMyCoupons().finally(() => setPageLoading(false));
  }, []);

  if (userLoading) return <LoadingScreen />;

  return (
    <MainLayout role={user?.role} kycStatus={user?.kycStatus} allowedRoles={['INSTRUCTOR']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-black">Mã giảm giá của tôi</h1>
            <p className="text-sm font-bold text-black mt-0.5">
              Nhận ngay <b className="text-black">97%</b> doanh thu về mình khi tạo mã giảm giá cho khóa học của bạn
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Monthly quota indicator */}
            <div className="border-2 border-black px-4 py-2 bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-[10px] font-black uppercase tracking-widest text-black mb-1">Tháng này</p>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {Array.from({ length: MONTHLY_LIMIT }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-5 h-5 border-2 border-black ${i < thisMonthCount ? 'bg-amber-400' : 'bg-white'}`}
                    />
                  ))}
                </div>
                <span className={`text-xs font-black ${isLimitReached ? 'text-red-600' : 'text-black'}`}>
                  {thisMonthCount}/{MONTHLY_LIMIT}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowModal(true)}
              disabled={isLimitReached}
              title={isLimitReached ? 'Đã đạt giới hạn 3 mã/tháng' : ''}
              className="px-5 py-3 bg-black text-white border-2 border-black font-black uppercase tracking-widest text-sm hover:bg-amber-400 hover:text-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] active:shadow-none"
            >
              + Tạo mã mới
            </button>
          </div>
        </div>

        {/* Limit warning */}
        {isLimitReached && (
          <div className="border-2 border-red-500 bg-red-50 px-4 py-3 flex items-center gap-3">
            <span className="text-xl">🚫</span>
            <p className="text-xs font-black text-red-700">
              Bạn đã dùng hết {MONTHLY_LIMIT} lượt tạo mã trong tháng này. Giới hạn sẽ reset vào ngày 1 tháng sau.
            </p>
          </div>
        )}

        {/* Table */}
        <div className="border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          {pageLoading ? (
            <div className="p-8 flex items-center justify-center">
              <div className="w-6 h-6 border-4 border-black border-t-transparent animate-spin" />
            </div>
          ) : myCoupons.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-4xl mb-3">🎟️</p>
              <p className="text-sm font-black uppercase tracking-widest text-black">
                Bạn chưa có mã giảm giá nào.
              </p>
              <p className="text-xs font-bold text-black mt-1">
                Tạo mã để tự quảng bá khóa học và nhận 97% doanh thu!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-black text-white">
                  <tr>
                    {['Mã', 'Loại', 'Giá trị', 'Lượt dùng', 'Trạng thái', 'Hết hạn'].map((h) => (
                      <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-left">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {myCoupons.map((c) => (
                    <CouponRow key={c.id} coupon={c} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        {/* Table Area ends here */}
        </div>
      </div>

      {/* Floating Info Icon - Fixed position above footer */}
      <div className="fixed bottom-32 right-8 z-[100] flex flex-col items-end gap-3">
        {showPolicy && (
          <div className="bg-amber-300 border-4 border-black p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-xs animate-in fade-in slide-in-from-bottom-2 duration-200">
            <h3 className="text-sm font-black uppercase tracking-widest mb-2 text-black"> CHÍNH SÁCH DOANH THU</h3>
            <ul className="space-y-3 text-xs font-bold text-black border-t-2 border-black/20 pt-3">
              <li>
                <span className="text-white bg-black px-1.5 py-0.5 text-[10px] mr-1">97/3</span>
                Khi học viên dùng mã của bạn, bạn nhận <b>97%</b>, sàn thu 3% phí kỹ thuật.
              </li>
              <li>
                <span className="text-white bg-black px-1.5 py-0.5 text-[10px] mr-1">70/30</span>
                Khi học viên tìm thấy khóa học qua StudyMate, bạn nhận <b>70%</b>. Sàn thu 30% phí vận hành & marketing.
              </li>
              <li className="italic opacity-80 pt-1">
                * Tự quảng bá khoá học bằng Coupon riêng là cách tốt nhất để tối ưu thu nhập của bạn!
              </li>
            </ul>
          </div>
        )}
        <button
          onMouseEnter={() => setShowPolicy(true)}
          onMouseLeave={() => setShowPolicy(false)}
          onClick={() => setShowPolicy(!showPolicy)}
          className="w-12 h-12 bg-black text-white border-4 border-white rounded-full flex items-center justify-center font-black text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] hover:bg-amber-400 hover:text-black transition-all hover:scale-110 active:scale-95 active:shadow-none"
        >
          !
        </button>
      </div>

      {showModal && (
        <CouponFormModal
          onClose={() => setShowModal(false)}
          onSuccess={() => fetchMyCoupons()}
        />
      )}
    </MainLayout>
  );
}
