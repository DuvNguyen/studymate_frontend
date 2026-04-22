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
import { Pagination } from '@/components/Pagination';
import { Wallet, HelpCircle, ArrowUpRight, ArrowDownLeft, Activity } from 'lucide-react';

export default function InstructorWalletPage() {
  const { user: currentUser, loading: userLoading } = useCurrentUser();
  const {
    wallet,
    transactions,
    transactionMeta,
    payouts,
    loading,
    fetchWallet,
    fetchTransactions,
    fetchMyPayouts,
  } = useWallet();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(6);

  useEffect(() => {
    if (currentUser?.role === 'INSTRUCTOR') {
      fetchWallet();
      fetchTransactions(1, 999);
      fetchMyPayouts();
    }
  }, [currentUser?.id, fetchWallet, fetchTransactions, fetchMyPayouts]);

  const filteredTransactions = transactions.filter(tx => {
    if (!startDate || !endDate) return true;
    const txDate = new Date(tx.created_at).toISOString().split('T')[0];
    return txDate >= startDate && txDate <= endDate;
  });

  const totalPages = Math.ceil(filteredTransactions.length / limit);
  const paginatedTransactions = filteredTransactions.slice((page - 1) * limit, page * limit);

  const getTypeBadge = (type: string) => {
    const base = "border-2 border-black px-2 py-0.5 text-[10px] font-black uppercase";
    switch (type) {
      case 'EARNING': return <span className={`${base} bg-emerald-100 text-black`}>THU NHẬP</span>;
      case 'WITHDRAWAL': return <span className={`${base} bg-rose-100 text-black`}>RÚT TIỀN</span>;
      case 'REFUND': return <span className={`${base} bg-yellow-100 text-black`}>HOÀN TIỀN</span>;
      case 'PURCHASE': return <span className={`${base} bg-blue-100 text-black`}>MUA HÀNG</span>;
      case 'PLATFORM_FEE': return <span className={`${base} bg-purple-100 text-black`}>PHÍ SÀN</span>;
      default: return <span className={`${base} bg-zinc-100 text-black`}>{type}</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    const base = "border-2 border-black px-2 py-0.5 text-[10px] font-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)]";
    switch (status) {
      case 'LOCKED': return <span className={`${base} bg-zinc-200 text-black`}>LOCKED (KHÓA)</span>;
      case 'AVAILABLE': return <span className={`${base} bg-emerald-400 text-black font-black`}>AVAILABLE</span>;
      case 'RELEASED': return <span className={`${base} bg-emerald-100 text-black`}>RELEASED</span>;
      case 'CANCELLED': return <span className={`${base} bg-rose-500 text-white`}>CANCELLED</span>;
      case 'PENDING': return <span className={`${base} bg-amber-400 text-black italic`}>PENDING</span>;
      case 'COMPLETED': return <span className={`${base} bg-emerald-500 text-white`}>COMPLETED</span>;
      default: return <span className={`${base} bg-zinc-100 text-black`}>{status}</span>;
    }
  };

  if ((userLoading && !currentUser) || (loading && !wallet)) {
    return (
      <LoadingScreen 
        title="ĐANG TẢI DỮ LIỆU TÀI CHÍNH..."
        description="STUDYMATE ĐANG KẾT NỐI VỚI HỆ THỐNG GIAO DỊCH."
      />
    );
  }

  return (
    <MainLayout role="INSTRUCTOR" allowedRoles={['INSTRUCTOR']}>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12 pb-32 font-bold">
        
        {/* Header Section */}
        <div className="bg-black text-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(34,197,94,1)] p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
           <div>
              <span className="bg-emerald-400 text-black border-2 border-black px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4 inline-block">
                Instructor Wallet
              </span>
              <h1 className="text-6xl font-black uppercase tracking-tighter italic leading-none text-white">
                Ví của tôi
              </h1>
           </div>
           <div className="bg-white text-black border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-2">
              <p className="text-[10px] font-black uppercase text-black">Số dư khả dụng</p>
              <p className="text-4xl font-black tabular-nums">
                {new Intl.NumberFormat('vi-VN').format(wallet?.balance_available || 0)}
              </p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           {/* Left Sidebar: Detailed Balances */}
           <div className="lg:col-span-4 space-y-6">
              <div className="bg-zinc-50 border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-4">
                 <div className="bg-white border-2 border-black p-4">
                    <p className="text-[11px] font-black uppercase text-black mb-1 italic">Đang đóng băng (30 ngày)</p>
                    <p className="text-2xl font-black text-black">{new Intl.NumberFormat('vi-VN').format(wallet?.balance_pending || 0)}</p>
                 </div>
                 <div className="bg-white border-2 border-black p-4">
                    <p className="text-[11px] font-black uppercase text-black mb-1 italic">Tổng thu nhập tích lũy</p>
                    <p className="text-2xl font-black text-black">{new Intl.NumberFormat('vi-VN').format(wallet?.total_earned || 0)}</p>
                 </div>
                 <button 
                   onClick={() => setIsModalOpen(true)}
                   className="w-full bg-yellow-400 text-black border-4 border-black py-4 font-black uppercase italic shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all hover:bg-yellow-300"
                 >
                   Yêu cầu rút tiền →
                 </button>
              </div>

              <div className="bg-black text-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                 <h3 className="text-sm font-black uppercase italic mb-4 border-b-2 border-white/20 pb-2">Trạng thái rút tiền gần đây</h3>
                 {payouts.length === 0 ? (
                    <p className="text-[11px] uppercase font-black text-white italic tracking-widest">Chưa có yêu cầu nào</p>
                 ) : (
                    <div className="space-y-4">
                       {payouts.slice(0, 3).map(p => (
                          <div key={p.id} className="border-l-4 border-emerald-400 pl-4 py-2 bg-zinc-900">
                             <p className="text-xl font-black tracking-tighter tabular-nums text-white">
                                {new Intl.NumberFormat('vi-VN').format(p.amount)}
                             </p>
                             <div className="flex justify-between items-center mt-1">
                                <span className="text-[10px] font-black text-white italic">ID: {p.id}</span>
                                {getStatusBadge(p.status)}
                             </div>
                          </div>
                       ))}
                    </div>
                 )}
              </div>

              <div className="flex justify-between items-center bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                 <span className="text-[10px] font-black uppercase">Sổ cái chi tiết</span>
                 <Activity size={16} />
              </div>
           </div>

           {/* Right Main Content: Transaction List (Compact) */}
           <div className="lg:col-span-8 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-4 border-black pb-4">
                 <h2 className="text-4xl font-black uppercase italic tracking-tighter text-black">Lịch sử dòng tiền</h2>
                 <div className="flex items-center gap-2">
                    <input 
                      type="date" 
                      value={startDate} 
                      onChange={(e) => setStartDate(e.target.value)}
                      className="border-4 border-black p-3 text-xs font-black uppercase outline-none bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-grow text-black"
                    />
                    <span className="font-black text-black">→</span>
                    <input 
                      type="date" 
                      value={endDate} 
                      onChange={(e) => setEndDate(e.target.value)}
                      className="border-4 border-black p-3 text-xs font-black uppercase outline-none bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-grow text-black"
                    />
                 </div>
              </div>

              <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                 <table className="w-full border-collapse text-left">
                    <thead>
                       <tr className="bg-black text-white text-[11px] font-black uppercase tracking-widest italic border-b-4 border-black">
                          <th className="p-4 border-r-2 border-white/20 uppercase">TX-ID / Ngày</th>
                          <th className="p-4 border-r-2 border-white/20 uppercase">Mô tả giao dịch</th>
                          <th className="p-4 border-r-2 border-white/20 text-right uppercase">Số tiền (VND)</th>
                          <th className="p-4 border-r-2 border-white/20 text-center uppercase">Trạng thái</th>
                          <th className="p-4 text-center w-20 uppercase italic">Chi tiết</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y-4 divide-black text-[11px]">
                       {filteredTransactions.length === 0 ? (
                          <tr>
                             <td colSpan={5} className="p-24 text-center font-black text-black uppercase italic text-2xl">Không có dữ liệu GD</td>
                          </tr>
                       ) : (
                          paginatedTransactions.map(tx => (
                             <tr key={tx.id} className="hover:bg-zinc-50 transition-colors group">
                                <td className="p-4 border-r-4 border-black font-mono font-black text-black">
                                   TX-{tx.id}
                                   <p className="text-[11px] font-black text-black/70 italic tracking-tighter mt-1">{new Date(tx.created_at).toLocaleDateString('vi-VN')}</p>
                                </td>
                                <td className="p-4 border-r-4 border-black">
                                   <p className="font-black text-black uppercase text-xs line-clamp-2 leading-tight">
                                      {tx.transaction_type === 'EARNING' 
                                         ? `BÁN KHÓA HỌC: ${tx.order_item?.course?.title || 'KHÓA HỌC'}` 
                                         : tx.transaction_type === 'WITHDRAWAL'
                                         ? 'YÊU CẦU RÚT TIỀN'
                                         : tx.transaction_type === 'REFUND'
                                         ? 'HOÀN TIỀN GIAO DỊCH'
                                         : tx.transaction_type}
                                   </p>
                                   <div className="mt-2">
                                      {getTypeBadge(tx.transaction_type)}
                                   </div>
                                </td>
                                <td className="p-4 border-r-4 border-black text-right font-black italic text-base tabular-nums whitespace-nowrap">
                                   <div className={`flex flex-col items-end ${tx.amount > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                                      <span>{tx.amount > 0 ? '+' : ''}{new Intl.NumberFormat('vi-VN').format(tx.amount)}</span>
                                      {tx.transaction_type === 'EARNING' && tx.order_item && (
                                        <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 px-1 mt-1 not-italic">
                                          {(1 - tx.order_item.commission_rate) * 100}% SHARE
                                        </span>
                                      )}
                                   </div>
                                </td>
                                <td className="p-4 border-r-4 border-black text-center whitespace-nowrap">
                                   {getStatusBadge(tx.status)}
                                </td>
                                <td className="p-4 text-center">
                                   <button 
                                     onClick={() => { setSelectedTransaction(tx); setIsDetailModalOpen(true); }}
                                     className="mx-auto w-10 h-10 bg-black text-white hover:bg-yellow-400 hover:text-black border-2 border-black flex items-center justify-center transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
                                   >
                                      <HelpCircle size={18} />
                                   </button>
                                </td>
                             </tr>
                          ))
                       )}
                    </tbody>
                 </table>
              </div>

              {/* Pagination Section */}
              {totalPages > 1 && (
                <div className="flex justify-center">
                  <Pagination 
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={(newPage) => {
                      setPage(newPage);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                </div>
              )}
           </div>
        </div>

        <WithdrawalModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          wallet={wallet}
          currentUser={currentUser}
          onSuccess={() => fetchWallet()}
        />

        <TransactionDetailModal 
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          transaction={selectedTransaction}
        />
      </div>
    </MainLayout>
  );
}