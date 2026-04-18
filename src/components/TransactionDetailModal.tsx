'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: any;
}

export function TransactionDetailModal({ 
  isOpen, 
  onClose, 
  transaction 
}: TransactionDetailModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !transaction) return null;

  const isEarning = transaction.transaction_type === 'EARNING';
  const orderInfo = transaction.order_item?.order;
  const studentInfo = orderInfo?.student;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />
      <div 
        className="w-full max-w-md bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-4 border-black bg-emerald-400">
          <h3 className="text-2xl font-black uppercase tracking-tighter text-black italic">
            Chi tiết giao dịch
          </h3>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-white border-4 border-black text-black hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none font-black text-2xl"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="pb-4 border-b-2 border-black border-dashed">
              <p className="text-[10px] font-black uppercase text-black mb-1 opacity-60 italic">Mã giao dịch</p>
              <p className="font-mono font-black text-black text-lg underline">TX-{transaction.id}</p>
            </div>

            <div className="pb-4 border-b-2 border-black border-dashed">
              <p className="text-[10px] font-black uppercase text-black mb-1 opacity-60 italic">Loại giao dịch</p>
              <p className="font-black text-black uppercase">{transaction.transaction_type === 'EARNING' ? 'Thu nhập từ khóa học' : transaction.transaction_type}</p>
            </div>

            <div className="pb-4 border-b-2 border-black border-dashed">
              <p className="text-[10px] font-black uppercase text-black mb-1 opacity-60 italic">Thời gian</p>
              <p className="font-black text-black uppercase">{new Date(transaction.created_at).toLocaleString('vi-VN')}</p>
            </div>

            {/* Locked Until / Availability Info */}
            {transaction.status === 'LOCKED' && transaction.locked_until && (
              <div className="pb-4 border-b-2 border-black border-dashed">
                <p className="text-[10px] font-black uppercase text-black mb-1 opacity-60 italic">Ngày khả dụng (dự kiến)</p>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-amber-400 border border-black animate-pulse"></span>
                  <p className="font-black text-black uppercase">
                    {new Date(transaction.locked_until).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <p className="text-[9px] font-bold text-black mt-1 italic">
                  Tiền sẽ tự động chuyển sang khả dụng sau khi hết thời gian khóa (30 ngày).
                </p>
              </div>
            )}

            {transaction.status === 'AVAILABLE' && (
              <div className="pb-4 border-b-2 border-black border-dashed">
                <p className="text-[10px] font-black uppercase text-black mb-1 opacity-60 italic">Trạng thái quỹ</p>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-emerald-400 border border-black"></span>
                  <p className="font-black text-emerald-600 uppercase">ĐÃ KHẢ DỤNG — Có thể rút</p>
                </div>
              </div>
            )}

            {isEarning && (
              <>
                <div className="pb-4 border-b-2 border-black border-dashed">
                  <p className="text-[10px] font-black uppercase text-black mb-1 opacity-60 italic">Học viên mua</p>
                  <p className="font-black text-black uppercase">{studentInfo?.full_name || 'Hệ thống'}</p>
                  <p className="text-[10px] font-bold text-black opacity-80 uppercase italic">{studentInfo?.email}</p>
                </div>
                <div className="pb-4 border-b-2 border-black border-dashed">
                  <p className="text-[10px] font-black uppercase text-black mb-1 opacity-60 italic">Mã đơn hàng</p>
                  <p className="font-black text-black uppercase underline">#{orderInfo?.order_number || 'N/A'}</p>
                </div>
              </>
            )}

            <div className="pt-2">
              <p className="text-[10px] font-black uppercase text-black mb-1 opacity-60 italic text-right">Giá trị thay đổi</p>
              <p className={`text-4xl font-black text-right tracking-tighter ${transaction.amount > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {transaction.amount > 0 ? '+' : ''}{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(transaction.amount)}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-zinc-50 border-t-4 border-black">
          <button 
            onClick={onClose}
            className="w-full py-4 bg-black text-white font-black uppercase tracking-widest hover:bg-yellow-400 hover:text-black transition-all border-4 border-black shadow-[4px_4px_0px_0px_rgba(34,197,94,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            ĐÓNG CỬA SỔ
          </button>
        </div>
      </div>
    </div>
  );
}
