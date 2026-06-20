'use client';

import { API_BASE } from '@/constants/api';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import MainLayout from '@/components/MainLayout';
import LoadingScreen from '@/components/LoadingScreen';
import { toast } from 'react-hot-toast';
import { Search, HelpCircle, ArrowRight } from 'lucide-react';
import { TransactionDetailModal } from '@/components/TransactionDetailModal';
import { Pagination } from '@/components/Pagination';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { LedgerTransaction, LedgerStats } from '@/types';

export default function AdminLedgerPage() {
  const { getToken, isLoaded } = useAuth();
  const [items, setItems] = useState<LedgerTransaction[]>([]);
  const [stats, setStats] = useState<LedgerStats | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const [selectedTx, setSelectedTx] = useState<LedgerTransaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const statusTabs = [
    { value: '', label: 'Tất cả' },
    { value: 'AVAILABLE', label: 'Đã duyệt' },
    { value: 'COMPLETED', label: 'Hoàn tất' },
    { value: 'LOCKED', label: 'Chờ xử lý' },
    { value: 'CANCELLED', label: 'Từ chối' },
  ];

  const fetchLedger = useCallback(async () => {
    if (!isLoaded) return;
    setLoading(true);
    try {
      const pageSize = isMobile ? 5 : 15;
      const token = await getToken();
      const params = new URLSearchParams({
        status,
        type,
        search,
        page: page.toString(),
        limit: pageSize.toString(),
      });
      const res = await fetch(`${API_BASE}/wallets/ledger?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      const content = json.data || json;
      setItems(content.items || []);
      setStats(content.stats || null);
      setTotal(content.total || 0);
    } catch {
      toast.error('Không thể tải dữ liệu sổ cái');
    } finally {
      setLoading(false);
    }
  }, [isLoaded, getToken, status, type, search, page, isMobile]);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [isMobile]);

  const getStatusBadge = (status: string) => {
    const base = "inline-block max-w-full truncate border-2 border-black px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)]";
    switch (status) {
      case 'LOCKED': return <span className={`${base} bg-zinc-200 text-black`}>LOCKED</span>;
      case 'AVAILABLE': return <span className={`${base} bg-emerald-400 text-black font-bold tracking-widest`}>AVAILABLE</span>;
      case 'CANCELLED': return <span className={`${base} bg-rose-500 text-white`}>CANCELLED</span>;
      case 'COMPLETED': return <span className={`${base} bg-blue-400 text-black`}>COMPLETED</span>;
      default: return <span className={`${base} bg-zinc-100 text-black`}>{status}</span>;
    }
  };

  const getTransactionSource = (tx: LedgerTransaction) => {
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

  const getTransactionDest = (tx: LedgerTransaction) => {
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

  const getTypeBadge = (type: string) => {
    const base = "border-2 border-black px-2 py-0.5 text-[10px] font-black uppercase";
    switch (type) {
      case 'PURCHASE': return <span className={`${base} bg-emerald-100 text-black`}>PURCHASE</span>;
      case 'EARNING': return <span className={`${base} bg-emerald-100 text-black`}>EARNING</span>;
      case 'WITHDRAWAL': return <span className={`${base} bg-rose-100 text-black`}>PAYOUT</span>;
      case 'REFUND': return <span className={`${base} bg-yellow-100 text-black`}>REFUND</span>;
      case 'PLATFORM_FEE': return <span className={`${base} bg-violet-100 text-black`}>COMMISSION</span>;
      default: return <span className={`${base} text-black`}>{type}</span>;
    }
  };

  if (loading && items.length === 0) return (
    <LoadingScreen 
      title="ĐANG TRUY XUẤT SỔ CÁI..."
      description="STUDYMATE ĐANG TỔNG HỢP TOÀN BỘ GIAO DỊCH TRÊN HỆ THỐNG."
    />
  );

  return (
    <MainLayout role="ADMIN" allowedRoles={['ADMIN', 'STAFF']}>
      <div className="w-[calc(100%-12px)] sm:w-full max-w-7xl mx-auto px-2.5 sm:px-4 py-6 sm:py-8 space-y-6 sm:space-y-8 pb-24 sm:pb-32 font-bold text-black">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b-8 border-black pb-6 md:pb-8">
           <div>
              <span className="bg-violet-400 text-black border-2 border-black px-3 py-1 text-[10px] font-black uppercase tracking-widest mb-4 inline-block shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                Master Ledger & Auditing
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter italic leading-none text-black">
                Sổ Cái Tổng
              </h1>
           </div>
           
           <button
             type="button"
             onClick={() => setShowSummary((prev) => !prev)}
             className="md:hidden text-[11px] font-black uppercase underline underline-offset-2 hover:text-zinc-700"
           >
             {showSummary ? 'Ẩn thông tin nhanh' : 'Hiện thông tin nhanh'}
           </button>

           <div className={`${showSummary ? 'grid' : 'hidden'} md:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 w-full md:w-auto`}>
              <div className="bg-white border-4 border-black p-3 shadow-[4px_4px_0px_0px_rgba(34,197,94,1)] min-w-0">
                 <p className="text-[10px] font-black uppercase text-black mb-1">Gross Revenue</p>
                 <p className="text-lg sm:text-xl font-black tabular-nums leading-none">{new Intl.NumberFormat('vi-VN').format(stats?.gross_revenue || 0)}</p>
              </div>
              <div className="bg-white border-4 border-black p-3 shadow-[4px_4px_0px_0px_rgba(239,68,68,1)] min-w-0">
                 <p className="text-[10px] font-black uppercase text-black mb-1">Total Payouts</p>
                 <p className="text-lg sm:text-xl font-black tabular-nums text-rose-600 leading-none">{new Intl.NumberFormat('vi-VN').format(stats?.total_payouts || 0)}</p>
              </div>
              <div className="bg-white border-4 border-black p-3 shadow-[4px_4px_0px_0px_rgba(168,85,247,1)] sm:col-span-2 md:col-span-1 min-w-0">
                 <p className="text-[10px] font-black uppercase text-black mb-1">Profit/Comm</p>
                 <p className="text-lg sm:text-xl font-black tabular-nums text-violet-700 leading-none">{new Intl.NumberFormat('vi-VN').format(stats?.total_commissions || 0)}</p>
              </div>
           </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-zinc-50 border-4 border-black p-3 sm:p-4 flex flex-col md:flex-row gap-3 sm:gap-4 items-stretch md:items-center min-w-0">
           <div className="relative flex-grow w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black" size={18} />
              <input 
                type="text"
                placeholder="TX-ID / MÃ ĐƠN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-4 border-black font-black uppercase text-[11px] sm:text-xs outline-none focus:bg-white transition-colors bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black"
              />
           </div>
           <div className="w-full md:w-auto">
              <select 
                value={type} 
                onChange={(e) => setType(e.target.value)}
                className="w-full md:w-40 border-4 border-black p-3 font-black uppercase text-[11px] outline-none bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <option value="">CÁC LOẠI GD</option>
                <option value="PURCHASE">PURCHASE</option>
                <option value="EARNING">EARNING</option>
                <option value="WITHDRAWAL">PAYOUT</option>
                <option value="REFUND">REFUND</option>
                <option value="PLATFORM_FEE">COMMISSION</option>
              </select>
           </div>
        </div>

        <div className="flex overflow-x-auto bg-white border-4 border-black p-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full">
          {statusTabs.map((tab) => (
            <button
              key={tab.value || 'ALL'}
              onClick={() => {
                setStatus(tab.value);
                setPage(1);
              }}
              className={`px-3 sm:px-4 py-2 text-[10px] sm:text-[11px] font-black uppercase whitespace-nowrap transition-all ${
                status === tab.value ? 'bg-black text-white' : 'hover:bg-zinc-100 text-black'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Ledger Table - Compact (desktop) */}
        <div className="hidden md:block bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden relative">
           {loading && items.length > 0 && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-20 flex flex-col items-center justify-center animate-in fade-in duration-200">
                 <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center gap-4">
                    <LoadingSpinner size="lg" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-black">Đang cập nhật sổ cái...</p>
                 </div>
              </div>
           )}
           <table className="w-full border-collapse">
              <thead>
                 <tr className="bg-black text-white text-[11px] font-black uppercase tracking-widest italic border-b-4 border-black">
                    <th className="p-3 text-left border-r-2 border-white/20 uppercase">TX-ID / Ngày</th>
                    <th className="p-3 text-left border-r-2 border-white/20 uppercase">DÒNG TIỀN (TỪ ➜ ĐẾN)</th>
                    <th className="p-3 text-center border-r-2 border-white/20 uppercase">Loại GD</th>
                    <th className="p-3 text-right border-r-2 border-white/20 uppercase">Giá trị</th>
                    <th className="p-3 text-right border-r-2 border-white/20 uppercase">Số dư sau</th>
                    <th className="p-4 text-center border-r-2 border-white/20 uppercase">Trạng thái</th>
                    <th className="p-4 text-center w-20 uppercase">Chi tiết</th>
                 </tr>
              </thead>
              <tbody className="divide-y-4 divide-black text-[11px]">
                 {items.length === 0 ? (
                    <tr>
                       <td colSpan={7} className="p-24 text-center text-3xl font-black uppercase italic text-black">Không tìm thấy dữ liệu</td>
                    </tr>
                 ) : (
                    items.map((tx) => (
                       <tr key={tx.id} className="hover:bg-zinc-50 transition-colors group">
                          <td className="p-3 border-r-4 border-black font-mono font-black text-black">
                             TX-{tx.id}
                             <p className="text-[11px] font-black text-black/70 italic tracking-tighter mt-1">{new Date(tx.created_at).toLocaleDateString('vi-VN')}</p>
                          </td>
                          <td className="p-3 border-r-4 border-black">
                              <div className="flex items-center gap-2">
                                 <div className="flex flex-col">
                                    <span className="text-[9px] font-black uppercase text-black/50 leading-none mb-1">Từ (Nguồn)</span>
                                    <span className="font-black text-black uppercase text-[10px] leading-tight">
                                       {getTransactionSource(tx)}
                                    </span>
                                 </div>
                                 <ArrowRight size={12} className="text-black/40 flex-shrink-0" />
                                 <div className="flex flex-col">
                                    <span className="text-[9px] font-black uppercase text-black/50 leading-none mb-1">Đến (Đích)</span>
                                    <span className="font-black text-black uppercase text-[10px] leading-tight">
                                       {getTransactionDest(tx)}
                                    </span>
                                 </div>
                              </div>
                              <div className="mt-2 pt-2 border-t border-black/5 flex items-center gap-2">
                                 <span className="text-[8px] font-black bg-black text-white px-1 py-0.5">OWNER</span>
                                 <span className="text-[9px] font-black text-black/70">
                                    {tx.wallet?.user?.profile?.fullName || (tx.wallet?.user_id === 1 ? 'SYSTEM' : `USER ${tx.wallet?.user_id}`)}
                                 </span>
                                 <span className="text-[9px] font-black text-black/40 italic">
                                    UID: {String(tx.wallet?.user_id).padStart(4, '0')}
                                 </span>
                              </div>
                           </td>
                          <td className="p-3 border-r-4 border-black text-center whitespace-nowrap">
                             {getTypeBadge(tx.transaction_type)}
                          </td>
                          <td className="p-3 border-r-4 border-black text-right whitespace-nowrap">
                             <p className={`text-base font-black italic tracking-tighter ${tx.amount > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                               {tx.amount > 0 ? '+' : ''}{new Intl.NumberFormat('vi-VN').format(tx.amount)}
                             </p>
                          </td>
                          <td className="p-3 border-r-4 border-black text-right font-black text-black tabular-nums whitespace-nowrap text-xs">
                             {new Intl.NumberFormat('vi-VN').format(tx.balance_after || 0)}
                          </td>
                          <td className="p-4 border-r-4 border-black text-center whitespace-nowrap">
                             {getStatusBadge(tx.status)}
                          </td>
                          <td className="p-4 text-center">
                             <button 
                               onClick={() => { setSelectedTx(tx); setIsModalOpen(true); }}
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

        {/* Ledger Cards (mobile) */}
        <div className="md:hidden space-y-3 relative">
          {loading && items.length > 0 && (
            <div className="absolute inset-0 bg-white/70 z-20 flex items-center justify-center">
              <div className="bg-white border-4 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center gap-3">
                <LoadingSpinner size="md" />
                <p className="text-[10px] font-black uppercase tracking-widest text-black">Đang cập nhật...</p>
              </div>
            </div>
          )}
          {items.length === 0 ? (
            <div className="bg-white border-4 border-black p-8 text-center text-xl font-black uppercase italic text-black">
              Không tìm thấy dữ liệu
            </div>
          ) : (
            items.map((tx) => (
              <div key={tx.id} className="bg-white border-4 border-black p-3.5 space-y-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-mono font-black text-black text-sm">TX-{tx.id}</p>
                    <p className="text-[10px] font-black text-black/70 italic mt-1">{new Date(tx.created_at).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div className="shrink-0 max-w-[42%]">{getStatusBadge(tx.status)}</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase text-black/60">Từ</span>
                    <span className="text-[11px] font-black uppercase truncate">{getTransactionSource(tx)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowRight size={12} className="text-black/40" />
                    <span className="text-[9px] font-black uppercase text-black/60">Đến</span>
                    <span className="text-[11px] font-black uppercase truncate">{getTransactionDest(tx)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 min-w-0">
                  {getTypeBadge(tx.transaction_type)}
                  <p className={`text-sm font-black italic tracking-tight text-right truncate max-w-[48vw] ${tx.amount > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {tx.amount > 0 ? '+' : ''}{new Intl.NumberFormat('vi-VN').format(tx.amount)}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase text-black/60">Số dư sau</p>
                  <p className="text-xs font-black tabular-nums text-black">
                    {new Intl.NumberFormat('vi-VN').format(tx.balance_after || 0)}
                  </p>
                </div>
                <button
                  onClick={() => { setSelectedTx(tx); setIsModalOpen(true); }}
                  className="w-full h-10 bg-black text-white hover:bg-yellow-400 hover:text-black border-2 border-black flex items-center justify-center gap-2 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 text-xs font-black uppercase"
                >
                  <HelpCircle size={16} />
                  Chi tiết
                </button>
              </div>
            ))
          )}
        </div>

        <Pagination 
           currentPage={page}
           totalPages={Math.ceil(total / (isMobile ? 5 : 15)) || 1}
           onPageChange={setPage}
        />

        {/* Detail Modal */}
        <TransactionDetailModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          transaction={selectedTx}
        />
      </div>
    </MainLayout>
  );
}
