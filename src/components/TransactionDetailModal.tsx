'use client';

import React from 'react';
import { X, User, Calendar, CreditCard, ArrowRightLeft, ShieldCheck } from 'lucide-react';

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transaction: any;
}

export function TransactionDetailModal({ isOpen, onClose, transaction }: TransactionDetailModalProps) {
  if (!isOpen || !transaction) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'text-emerald-700 bg-emerald-100 border-emerald-500';
      case 'LOCKED': return 'text-amber-700 bg-amber-100 border-amber-500';
      case 'CANCELLED': return 'text-rose-700 bg-rose-100 border-rose-500';
      case 'RELEASED': return 'text-blue-700 bg-blue-100 border-blue-500';
      case 'COMPLETED': return 'text-emerald-500 bg-black border-white';
      default: return 'text-black bg-zinc-100 border-black';
    }
  };

  const getExpectedAvailableDate = (createdAt: string) => {
    const date = new Date(createdAt);
    date.setDate(date.getDate() + 30);
    return date.toLocaleDateString('vi-VN');
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getTransactionSource = (tx: any) => {
    switch (tx.transaction_type) {
      case 'PURCHASE':
        return tx.order_item?.order?.student?.profile?.fullName || 'Học viên';
      case 'EARNING':
        return 'StudyMate Platform';
      case 'PLATFORM_FEE':
        return 'Course Booking';
      case 'WITHDRAWAL':
        return tx.wallet?.user?.profile?.fullName || 'Giảng viên';
      case 'REFUND':
        return 'StudyMate Platform';
      default:
        return 'Hệ thống';
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getTransactionDest = (tx: any) => {
    switch (tx.transaction_type) {
      case 'PURCHASE':
        return 'StudyMate Platform';
      case 'EARNING':
        return tx.wallet?.user?.profile?.fullName || 'Giảng viên';
      case 'PLATFORM_FEE':
        return 'Hệ thống (Commission)';
      case 'WITHDRAWAL':
        return 'Bank Account';
      case 'REFUND':
        return tx.wallet?.user?.profile?.fullName || 'Người dùng';
      default:
        return 'Ví người dùng';
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden animate-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-black text-white p-6 border-b-4 border-black flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-violet-400 border-2 border-white flex items-center justify-center -rotate-3 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.3)]">
                <ShieldCheck size={24} className="text-black" />
             </div>
             <h3 className="text-xl font-black uppercase tracking-tighter italic">Kiểm tra Giao dịch</h3>
          </div>
          <button onClick={onClose} className="hover:rotate-90 transition-transform bg-white text-black border-2 border-black p-1">
             <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Main Info */}
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-zinc-50 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
               <div className="flex-shrink-0 w-12 h-12 bg-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(168,85,247,1)]">
                  <ArrowRightLeft className="text-white" size={24} />
               </div>
               <div className="flex-1">
                  <p className="text-[10px] font-black uppercase text-black mb-1 leading-none">Mã giao dịch</p>
                  <p className="font-mono font-black text-lg text-black underline underline-offset-4 decoration-4">TX-{transaction.id}</p>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(168,85,247,1)]">
                   <div className="flex items-center gap-2 mb-2 text-black font-black">
                      <User size={14} />
                      <span className="text-[10px] font-black uppercase leading-none">Luồng tiền</span>
                   </div>
                   <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                         <span className="text-[8px] font-black bg-black text-white px-1 py-0.5">TỪ</span>
                         <span className="font-black text-black text-[11px] uppercase truncate">{getTransactionSource(transaction)}</span>
                      </div>
                      <ArrowRightLeft size={10} className="text-black/40 ml-2" />
                      <div className="flex items-center gap-2">
                         <span className="text-[8px] font-black bg-black text-white px-1 py-0.5">ĐẾN</span>
                         <span className="font-black text-black text-[11px] uppercase truncate">{getTransactionDest(transaction)}</span>
                      </div>
                   </div>
                   <div className="mt-3 pt-2 border-t border-black/10">
                      <p className="text-[8px] font-black text-black/50 uppercase">Người thụ hưởng (Wallet Owner)</p>
                      <p className="font-black text-black text-[10px] uppercase truncate">
                         {transaction.wallet?.user?.profile?.fullName || (transaction.wallet?.user_id === 1 ? 'SYSTEM' : `USER ${transaction.wallet?.user_id}`)}
                      </p>
                      <p className="text-[9px] font-black text-black/40 italic">
                         UID: {String(transaction.wallet?.user_id).padStart(4, '0')}
                      </p>
                   </div>
                </div>
               <div className="p-4 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(59,130,246,1)]">
                  <div className="flex items-center gap-2 mb-2 text-black font-black">
                     <Calendar size={14} />
                     <span className="text-[10px] font-black uppercase leading-none">Dự kiến khả dụng</span>
                  </div>
                  <p className="font-black text-black text-sm uppercase">
                    {getExpectedAvailableDate(transaction.created_at)}
                  </p>
                  <p className="text-[10px] font-black text-black/70 uppercase italic mt-1">
                    {transaction.status === 'AVAILABLE' ? 'Đã kích hoạt' : 'Khóa 30 ngày'}
                  </p>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="p-4 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(34,197,94,1)]">
                  <div className="flex items-center gap-2 mb-2 text-black font-black">
                     <CreditCard size={14} />
                     <span className="text-[10px] font-black uppercase leading-none">Loại GD</span>
                  </div>
                  <p className="font-black text-black text-xs uppercase italic">
                     {transaction.transaction_type}
                  </p>
               </div>
                <div className="p-4 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(251,191,36,1)]">
                   <div className="flex items-center gap-2 mb-2 text-black font-black">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                         <line x1="12" y1="1" x2="12" y2="23" />
                         <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                      <span className="text-[10px] font-black uppercase leading-none">Biến động</span>
                   </div>
                   <p className={`font-black text-xl ${transaction.amount > 0 ? 'text-emerald-700' : 'text-rose-600'} tabular-nums tracking-tighter`}>
                     {transaction.amount > 0 ? '+' : ''}{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(transaction.amount)}
                   </p>
                   {transaction.transaction_type === 'EARNING' && transaction.order_item && (
                     <div className="mt-2 pt-2 border-t border-black/10">
                        <p className="text-[8px] font-black text-black/50 uppercase italic">Tỷ lệ sau phí (Net share)</p>
                        <p className="text-sm font-black text-emerald-600">
                          {((1 - transaction.order_item.commission_rate) * 100).toFixed(0)}%
                        </p>
                     </div>
                   )}
                </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-zinc-900 text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
             <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-white/60 mb-1">Trạng thái hiện tại</span>
                <span className={`text-xs font-black uppercase italic tracking-wider px-3 py-1 border-2 ${getStatusColor(transaction.status)} shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]`}>
                   {transaction.status}
                </span>
             </div>
             <div className="flex flex-col items-end">
                <span className="text-[10px] font-black uppercase text-white/60 mb-1">Số dư sau GD</span>
                <span className="text-lg font-mono font-black text-white italic tracking-tighter">
                  {transaction.wallet?.user_id === 1 ? '***' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(transaction.balance_after || 0)}
                </span>
             </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4">
            <button 
              onClick={onClose}
              className="w-full bg-yellow-400 text-black border-4 border-black p-4 font-black uppercase text-sm tracking-widest hover:bg-yellow-300 transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
            >
              Đóng chi tiết
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
