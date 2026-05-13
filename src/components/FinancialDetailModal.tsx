'use client';

import React from 'react';

import { Info, User, BookOpen, Calendar, DollarSign, Activity, X } from 'lucide-react';

interface FinancialDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    id: string | number;
    type: 'PURCHASE' | 'EARNING' | 'REFUND' | 'WITHDRAWAL' | 'PLATFORM_FEE';
    title: string;
    instructor?: string;
    student?: string;
    date: string;
    amount: number;
    status: string;
    progress?: number;
    orderNumber?: string;
    canRefund?: boolean;
    refundReason?: string;
    onRefund?: () => void;
  };
}

export function FinancialDetailModal({ isOpen, onClose, data }: FinancialDetailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden animate-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-black text-white p-6 border-b-4 border-black flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-amber-300 border-2 border-white flex items-center justify-center -rotate-3">
                <Info size={24} className="text-black" />
             </div>
             <h3 className="text-xl font-black uppercase tracking-tighter italic">Chi tiết giao dịch</h3>
          </div>
          <button onClick={onClose} className="hover:rotate-90 transition-transform">
             <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Main Info */}
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-zinc-50 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
               <div className="flex-shrink-0 w-12 h-12 bg-black flex items-center justify-center">
                  <BookOpen className="text-white" size={24} />
               </div>
               <div className="flex-1">
                  <p className="text-[10px] font-black uppercase text-black/50 mb-1 leading-none">Khóa học</p>
                  <p className="font-black text-black leading-tight uppercase italic">{data.title}</p>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="p-4 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(34,197,94,1)]">
                  <div className="flex items-center gap-2 mb-2 text-black/50">
                     <User size={14} />
                     <span className="text-[10px] font-black uppercase leading-none">
                        {data.instructor ? 'Giảng viên' : 'Học viên'}
                     </span>
                  </div>
                  <p className="font-black text-black text-sm uppercase">
                     {data.instructor || data.student || 'Hệ thống'}
                  </p>
               </div>
               <div className="p-4 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(59,130,246,1)]">
                  <div className="flex items-center gap-2 mb-2 text-black/50">
                     <Activity size={14} />
                     <span className="text-[10px] font-black uppercase leading-none">Tiến độ</span>
                  </div>
                  <p className="font-black text-black text-sm">
                     {data.progress !== undefined ? `${data.progress}%` : '--'}
                  </p>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="p-4 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(168,85,247,1)]">
                  <div className="flex items-center gap-2 mb-2 text-black/50">
                     <Calendar size={14} />
                     <span className="text-[10px] font-black uppercase leading-none">Ngày thực hiện</span>
                  </div>
                  <p className="font-black text-black text-sm italic">
                     {new Date(data.date).toLocaleDateString('vi-VN')}
                  </p>
               </div>
               <div className="p-4 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(251,191,36,1)]">
                  <div className="flex items-center gap-2 mb-2 text-black/50">
                     <DollarSign size={14} />
                     <span className="text-[10px] font-black uppercase leading-none">Giá trị</span>
                  </div>
                  <p className="font-black text-lg text-black tabular-nums tracking-tighter">
                     {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.amount)}
                  </p>
               </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-zinc-900 text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
             <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase text-white/40 mb-1">Trạng thái</span>
                <span className="text-xs font-black uppercase italic text-amber-300 tracking-wider">
                   {data.status}
                </span>
             </div>
             <div className="flex flex-col items-end">
                <span className="text-[9px] font-black uppercase text-white/40 mb-1">Mã tham chiếu</span>
                <span className="text-xs font-mono font-black">{data.orderNumber || `TX-${data.id}`}</span>
             </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col gap-4">
            {data.canRefund && data.onRefund ? (
               <button 
                onClick={data.onRefund}
                className="w-full bg-yellow-400 text-black border-4 border-black p-4 font-black uppercase italic shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all hover:bg-yellow-300"
               >
                 Yêu cầu hoàn tiền →
               </button>
            ) : (
              data.status === 'COMPLETED' && data.refundReason && (
                <div className="bg-zinc-100 border-4 border-dashed border-black p-4 text-center">
                  <p className="text-[10px] font-black uppercase text-black/40 mb-1 leading-none italic">Điều kiện hoàn tiền</p>
                  <p className="font-black text-rose-500 text-xs uppercase tracking-widest leading-tight italic">
                    {data.refundReason}
                  </p>
                </div>
              )
            )}
            <button 
              onClick={onClose}
              className="w-full bg-white text-black border-4 border-black p-4 font-black uppercase text-xs tracking-widest hover:bg-zinc-100 transition-colors"
            >
              Quay lại danh sách
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
