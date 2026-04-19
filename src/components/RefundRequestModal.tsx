'use client';

import { useState } from 'react';
import { Button } from './Button';
import { useRefund } from '@/hooks/useRefund';

interface RefundRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  enrollment: {
    id: number;
    course: {
      title: string;
      id: number;
    };
    order_item: {
      final_price: number;
    };
  };
  onSuccess: () => void;
}

export function RefundRequestModal({ isOpen, onClose, enrollment, onSuccess }: RefundRequestModalProps) {
  const { requestRefund, loading } = useRefund();
  const [reason, setReason] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await requestRefund({
        enrollmentId: enrollment.id,
        reason,
        bankName,
        bankAccountNumber,
        bankAccountName,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-rose-500 border-b-4 border-black p-4 flex justify-between items-center shadow-[0px_4px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-xl font-black uppercase text-black italic">Yêu cầu hoàn tiền</h2>
          <button onClick={onClose} className="text-black hover:bg-black hover:text-white transition-colors font-black text-2xl w-10 h-10 border-2 border-transparent hover:border-black flex items-center justify-center">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="bg-zinc-100 border-2 border-black p-4 mb-6">
            <p className="text-[10px] font-black uppercase text-black mb-1">Khóa học</p>
            <p className="text-lg font-black text-black">{enrollment.course.title}</p>
            <p className="text-sm font-black text-black mt-2 underline decoration-rose-500 decoration-4">
              SỐ TIỀN HOÀN TRẢ: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(enrollment.order_item.final_price)}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-black mb-1 ml-1">Lý do hoàn tiền</label>
              <textarea
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ví dụ: Tôi thấy nội dung không phù hợp với trình độ hiện tại của mình..."
                className="w-full border-2 border-black p-3 font-black text-sm focus:bg-zinc-50 outline-none transition-colors min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-black mb-1 ml-1">Tên Ngân hàng</label>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Ví dụ: Vietcombank, Techcombank..."
                  className="w-full border-2 border-black p-3 font-black text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-black mb-1 ml-1">Số tài khoản</label>
                <input
                  type="text"
                  required
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  placeholder="0123456789"
                  className="w-full border-2 border-black p-3 font-black text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-black mb-1 ml-1">Tên chủ tài khoản (In hoa không dấu)</label>
              <input
                type="text"
                required
                value={bankAccountName}
                onChange={(e) => setBankAccountName(e.target.value.toUpperCase())}
                placeholder="NGUYEN VAN A"
                className="w-full border-2 border-black p-3 font-black text-sm outline-none"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border-2 border-red-600 p-3 text-red-600 text-xs font-black uppercase">
              {error}
            </div>
          )}

          <div className="pt-4 flex gap-4">
            <Button
              type="button"
              onClick={onClose}
              className="flex-1 h-14 bg-white text-black border-2 border-black hover:bg-zinc-100 font-black uppercase text-xs"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-2 h-14 bg-black text-white hover:bg-rose-600 border-2 border-black font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none translate-x-[-2px] translate-y-[-2px] active:translate-x-0 active:translate-y-0 transition-all"
            >
              {loading ? 'ĐANG GỬI...' : 'XÁC NHẬN YÊU CẦU →'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
