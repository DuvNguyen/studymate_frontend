'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/Button';
import MainLayout from '@/components/MainLayout';
import LoadingScreen from '@/components/LoadingScreen';
import { useUser } from '@clerk/nextjs';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useRouter } from 'next/navigation';
import { WithdrawalModal } from '@/components/WithdrawalModal';
import { TransactionDetailModal } from '@/components/TransactionDetailModal';

export default function InstructorWalletPage() {
  const { user: currentUser, loading: userLoading } = useCurrentUser();
  const router = useRouter();
  const {
    wallet,
    transactions,
    payouts,
    loading,
    fetchWallet,
    fetchTransactions,
    fetchMyPayouts,
  } = useWallet();

  const { user } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Filtering states
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Transaction detail states
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  // Set default filter to current month
  useEffect(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    // Format to YYYY-MM-DD
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    
    setStartDate(formatDate(firstDay));
    setEndDate(formatDate(lastDay));
  }, []);

  useEffect(() => {
    if (currentUser?.role === 'INSTRUCTOR') {
      fetchWallet();
      fetchTransactions();
      fetchMyPayouts();
    }
  }, [currentUser, fetchWallet, fetchTransactions, fetchMyPayouts]);

  // Client-side filtering logic
  const filteredTransactions = transactions.filter(tx => {
    if (!startDate || !endDate) return true;
    const txDate = new Date(tx.created_at).toISOString().split('T')[0];
    return txDate >= startDate && txDate <= endDate;
  });

  const getTransactionBadge = (type: string) => {
    const base = "border-2 border-black px-2 py-0.5 text-[9px] font-black uppercase shadow-[1px_1px_0px_rgba(0,0,0,1)]";
    switch (type) {
      case 'EARNING':
        return <span className={`${base} bg-white text-black`}>Thu nhập</span>;
      case 'WITHDRAWAL':
        return <span className={`${base} bg-yellow-400 text-black`}>Rút tiền</span>;
      case 'REFUND':
        return <span className={`${base} bg-rose-500 text-white`}>Hoàn tiền</span>;
      default:
        return <span className={`${base} bg-black text-white`}>{type}</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    const base = "border-2 border-black px-2 py-0.5 text-[9px] font-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] flex items-center gap-2 w-fit";
    switch (status) {
      case 'LOCKED':
        return <span className={`${base} bg-zinc-200 text-black`}><span className="w-1.5 h-1.5 bg-black"></span> Đang khóa</span>;
      case 'AVAILABLE':
        return <span className={`${base} bg-emerald-400 text-black`}><span className="w-1.5 h-1.5 bg-black animate-ping"></span> Khả dụng</span>;
      case 'COMPLETED':
        return <span className={`${base} bg-blue-400 text-black`}>Xong</span>;
      case 'PENDING':
        return <span className={`${base} bg-amber-400 text-black italic`}>Đang chờ duyệt...</span>;
      case 'REJECTED':
        return <span className={`${base} bg-red-600 text-white`}>Từ chối</span>;
      default:
        return <span className="text-black font-black uppercase text-[9px] border-2 border-black px-2">{status}</span>;
      }
  };

  if ((userLoading && !currentUser) || (loading && !wallet)) {
    return (
      <LoadingScreen 
        title="ĐANG TẢI DỮ LIỆU TÀI CHÍNH..."
        description="VUI LÒNG CHỜ GIÂY LÁT, STUDYMATE ĐANG KẾT NỐI VỚI HỆ THỐNG GIAO DỊCH."
      />
    );
  }

  if (currentUser?.role !== 'INSTRUCTOR' && !userLoading) {
    return null;
  }

  return (
    <MainLayout role="INSTRUCTOR" allowedRoles={['INSTRUCTOR']}>
      <div className="bg-white min-h-screen">
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-12 pb-24">
          
          {/* Header Section - Neo-Brutalist Premium */}
          <div className="bg-black border-4 border-black shadow-[8px_8px_0px_0px_rgba(34,197,94,1)] p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <span className="bg-emerald-400 text-black border-2 border-black px-3 py-1 text-[10px] font-black uppercase tracking-[0.3em] mb-4 inline-block shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                Ví & Tài chính
              </span>
              <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white leading-none italic">
                Ví của tôi
              </h1>
            </div>
            <div className="bg-white border-4 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
               <p className="text-[10px] font-black uppercase text-black mb-1">ID NGƯỜI DÙNG</p>
               <p className="text-xl font-mono font-black text-black">#{wallet?.user_id || '0000'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left Column: Balances & Payout Form */}
            <div className="lg:col-span-5 space-y-10">
              
              {/* Balance Card - Refined Neo-Brutalism */}
              <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden">
                <div className="bg-yellow-400 border-b-4 border-black p-4 font-black uppercase tracking-widest text-center text-sm text-black">
                  TỔNG QUAN TÀI CHÍNH
                </div>
                <div className="p-8 space-y-8">
                  <div className="bg-emerald-400 border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] -rotate-1">
                    <p className="text-[11px] font-black uppercase tracking-widest text-black mb-2 flex items-center gap-2">
                       <span className="w-2 h-2 bg-black rounded-full animate-pulse"></span>
                       Số dư khả dụng
                    </p>
                    <p className="text-6xl font-black tracking-tighter text-black">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(wallet?.balance_available || 0)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-4">
                    <div className="bg-white border-4 border-black p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rotate-1">
                      <p className="text-[10px] font-black uppercase tracking-tighter text-black mb-1">Đang đóng băng</p>
                      <p className="text-2xl font-black text-black">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(wallet?.balance_pending || 0)}
                      </p>
                    </div>
                    <div className="bg-violet-400 border-4 border-black p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] -rotate-1">
                      <p className="text-[10px] font-black uppercase tracking-tighter text-black mb-1">Tổng thu nhập</p>
                      <p className="text-2xl font-black text-black">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(wallet?.total_earned || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Withdraw Trigger Card */}
              <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-20 h-20 bg-emerald-400 border-4 border-black flex items-center justify-center -rotate-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                   <IconWallet />
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-black leading-none mb-2 italic">Rút tiền về tài khoản</h3>
                  <p className="text-xs font-black text-black uppercase tracking-widest">Xử lý trong vòng 24 - 48h làm việc</p>
                </div>
                <Button 
                  onClick={() => setIsModalOpen(true)}
                  className="w-full h-16 bg-black text-white hover:bg-yellow-400 hover:text-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
                >
                  <span className="text-lg font-black uppercase tracking-widest italic">Yêu cầu rút tiền →</span>
                </Button>
              </div>

              {/* Modal Withdrawal Form */}
              <WithdrawalModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                wallet={wallet}
                currentUser={currentUser}
                onSuccess={() => fetchWallet()}
              />
            </div>

            {/* Right Column: Histories */}
            <div className="lg:col-span-7 space-y-10">
              
              {/* Transaction History */}
              <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-8 border-black pb-6 mb-10 gap-6">
                  <h2 className="text-4xl font-black uppercase text-black italic tracking-tighter">
                    Lịch sử dòng tiền
                  </h2>
                  
                  {/* Date Filter Controls */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center bg-white border-2 border-black p-1 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                      <input 
                        type="date" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)}
                        className="bg-transparent font-black text-[12px] outline-none px-2 py-1 text-black"
                      />
                      <span className="font-black px-1 text-[10px] text-black">→</span>
                      <input 
                        type="date" 
                        value={endDate} 
                        onChange={(e) => setEndDate(e.target.value)}
                        className="bg-transparent font-black text-[12px] outline-none px-2 py-1 text-black"
                      />
                    </div>
                    <button 
                      onClick={() => { setStartDate(''); setEndDate(''); }}
                      className="bg-black text-white px-4 py-2 text-[10px] font-black uppercase hover:bg-emerald-400 hover:text-black border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
                    >
                      TẤT CẢ
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredTransactions.length === 0 ? (
                    <div className="py-24 text-center border-8 border-dashed border-black text-black font-black uppercase text-3xl bg-white rotate-1">
                      {transactions.length === 0 ? 'CHƯA CÓ GIAO DỊCH' : 'KHÔNG CÓ KẾT QUẢ'}
                    </div>
                  ) : (
                    filteredTransactions.map((tx) => (
                      <div key={tx.id} className="border-2 border-black p-4 flex flex-col md:flex-row justify-between items-start md:items-center bg-white hover:bg-zinc-50 transition-all shadow-[4px_4px_0px_rgba(0,0,0,1)] group relative">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 border-2 border-black flex items-center justify-center font-black text-xl shadow-[2px_2px_0px_rgba(0,0,0,1)] ${tx.amount > 0 ? 'bg-emerald-400' : 'bg-red-500'}`}>
                            {tx.amount > 0 ? '↑' : '↓'}
                          </div>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              {getTransactionBadge(tx.transaction_type)}
                              <span className="text-[10px] font-black text-black font-mono underline bg-white px-1 border border-black">TX-{tx.id}</span>
                              
                              {/* Detail Trigger Icon */}
                              <button 
                                onClick={() => { setSelectedTransaction(tx); setIsDetailModalOpen(true); }}
                                className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center hover:bg-emerald-400 hover:text-black transition-colors shadow-[2px_2px_0px_rgba(0,0,0,0.2)] ml-1"
                                title="Xem chi tiết"
                              >
                                <span className="text-[14px] font-black leading-none">!</span>
                              </button>
                            </div>
                            <p className="font-black text-sm uppercase leading-tight text-black tracking-tight">
                              {tx.transaction_type === 'EARNING' 
                                ? `Mua: ${tx.order_item?.course?.title}`
                                : tx.transaction_type === 'WITHDRAWAL' ? 'Yêu cầu rút tiền' : 'Giao dịch hệ thống'}
                            </p>
                            <p className="text-[11px] font-black text-black uppercase tracking-widest italic">
                              {new Date(tx.created_at).toLocaleString('vi-VN')}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 md:mt-0 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center w-full md:w-auto gap-4 md:gap-1">
                          <p className={`text-lg font-black tracking-tighter ${tx.amount > 0 ? 'text-black' : 'text-red-600'}`}>
                            {tx.amount > 0 ? '+' : ''}{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tx.amount)}
                          </p>
                          {getStatusBadge(tx.status)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Detail Modal */}
              <TransactionDetailModal 
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                transaction={selectedTransaction}
              />

              {/* Payout History Section */}
              <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8">
                <h2 className="text-4xl font-black uppercase mb-12 border-b-8 border-black pb-4 text-black italic tracking-tighter px-2">
                  Trạng thái rút tiền
                </h2>
                <div className="space-y-8">
                  {payouts.length === 0 ? (
                    <div className="py-20 text-center border-8 border-dashed border-black text-black font-black uppercase text-3xl italic">
                       Chưa có yêu cầu rút tiền
                    </div>
                  ) : (
                    payouts.map((po) => (
                      <div key={po.id} className="border-4 border-black p-8 bg-white shadow-[10px_10px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 bg-black text-white px-5 py-2 text-xs font-black uppercase tracking-widest italic group-hover:bg-yellow-400 group-hover:text-black transition-colors">
                          REQ-{po.id}
                        </div>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                          <div className="space-y-6">
                            <div className="flex flex-wrap items-center gap-6">
                              <p className="text-4xl font-black text-black tracking-tighter">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(po.amount)}
                              </p>
                              {getStatusBadge(po.status)}
                            </div>
                            <div className="space-y-2 border-l-8 border-black pl-6">
                              <p className="text-sm font-black text-black uppercase tracking-widest flex items-center gap-2">
                                <span className="p-1 bg-black text-white text-[10px]">BANK</span>
                                {po.bankName} • {po.bankAccountNumber}
                              </p>
                              <p className="text-sm font-black text-black uppercase italic">
                                CHỦ TK: {po.bankAccountName}
                              </p>
                              <div className="pt-2">
                                <span className="bg-black text-white px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.2em]">
                                  GỬI: {new Date(po.requestedAt).toLocaleDateString('vi-VN')}
                                </span>
                              </div>
                            </div>
                          </div>
                          {po.adminNote && (
                            <div className="bg-white border-4 border-black p-6 md:w-80 shadow-[6px_6px_0px_rgba(0,0,0,1)] -rotate-1 group-hover:rotate-0 transition-transform">
                               <p className="text-[10px] font-black uppercase text-black mb-2 border-b-2 border-black pb-1 flex items-center gap-1">
                                 <span className="w-1.5 h-1.5 bg-black"></span>
                                 PHẢN HỒI TỪ QUẢN TRỊ:
                               </p>
                               <p className="text-sm font-black italic text-black leading-relaxed">"{po.adminNote}"</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function IconWallet() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );
}