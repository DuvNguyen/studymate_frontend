'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@clerk/nextjs';
import MainLayout from '@/components/MainLayout';

import { RefundRequestModal } from '@/components/RefundRequestModal';
import LoadingScreen from '@/components/LoadingScreen';
import { HelpCircle } from 'lucide-react';
import { FinancialDetailModal } from '@/components/FinancialDetailModal';
import { Pagination } from '@/components/Pagination';

export default function PurchasesPage() {
  const { getToken, isLoaded } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);

  const fetchPurchases = useCallback(async () => {
    if (!isLoaded) return;
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/enrollments/my-purchases?page=${page}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await res.json();
      if (res.ok) {
        setPurchases(result.data);
      } else {
        setError(result.message || 'Lỗi tải dữ liệu');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [getToken, isLoaded, page, limit]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  const filteredPurchases = useMemo(() => {
    return purchases.filter(p => {
      const matchesSearch = p.course.title.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesStatus = true;
      if (statusFilter === 'ACTIVE') {
        matchesStatus = p.is_active && !p.refund_request;
      } else if (statusFilter === 'REFUND_PENDING') {
        matchesStatus = p.refund_request?.status === 'PENDING';
      } else if (statusFilter === 'REFUND_REJECTED') {
        matchesStatus = p.refund_request?.status === 'REJECTED';
      } else if (statusFilter === 'REFUND_DONE') {
        matchesStatus = !p.is_active && (p.refund_request?.status === 'APPROVED' || !p.refund_request); // !is_active covers processed refunds
      }
      
      return matchesSearch && matchesStatus;
    });
  }, [purchases, searchQuery, statusFilter]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const canRefund = (enrollment: any) => {
    if (!enrollment.is_active || enrollment.refund_request) return { eligible: false };
    const now = new Date();
    const enrolledAt = new Date(enrollment.enrolled_at);
    const diffTime = Math.abs(now.getTime() - enrolledAt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 30) return { eligible: false, reason: 'Quá thời hạn 30 ngày' };
    if (enrollment.progress_percent > 30) return { eligible: false, reason: 'Tiến độ học tập > 30%' };
    
    return { eligible: true };
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getStatusBadge = (enrollment: any) => {
    const base = "border-2 border-black px-2 py-1 text-[9px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] inline-block min-w-[120px] leading-tight";
    
    if (enrollment.refund_request) {
      if (enrollment.refund_request.status === 'PENDING') {
        return <span className={`${base} bg-amber-400 text-black animate-pulse`}>ĐANG CHỜ HOÀN TIỀN</span>;
      }
      if (enrollment.refund_request.status === 'REJECTED') {
        return <span className={`${base} bg-zinc-400 text-white`}>BỊ TỪ CHỐI HOÀN TIỀN</span>;
      }
    }

    if (enrollment.is_active) {
      return (
        <span className={`${base} bg-emerald-400 text-black`}>
          HOẠT ĐỘNG
        </span>
      );
    }
    return (
      <span className={`${base} bg-rose-500 text-white`}>
        ĐÃ HOÀN TIỀN
      </span>
    );
  };

  return (
    <MainLayout role="STUDENT">
      {loading ? (
        <LoadingScreen 
          title="ĐANG TẢI LỊCH SỬ..."
          description="STUDYMATE ĐANG TRÍCH XUẤT DỮ LIỆU THANH TOÁN CỦA BẠN."
        />
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-12 font-bold text-black">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b-8 border-black pb-8">
          <div>
            <span className="bg-yellow-400 border-2 border-black px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4 inline-block">
              Finance & Orders
            </span>
            <h1 className="text-6xl font-black uppercase text-black tracking-tighter leading-none italic">
              Lịch sử mua hàng
            </h1>
          </div>
          <p className="text-sm font-black text-black uppercase tracking-widest border-l-8 border-black pl-6 max-w-sm italic">
            Theo dõi hóa đơn, trạng thái hoàn tiền và quản lý quyền lợi học tập của bạn.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative group">
                <input 
                    type="text" 
                    placeholder="TÌM KIẾM KHÓA HỌC..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-14 bg-white border-4 border-black px-6 font-black uppercase text-xs shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all outline-none"
                />
            </div>
            <div className="w-full md:w-72 relative">
                <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full h-14 bg-white border-4 border-black px-6 font-black uppercase text-xs shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] outline-none appearance-none cursor-pointer"
                >
                    <option value="ALL">TẤT CẢ TRẠNG THÁI</option>
                    <option value="ACTIVE"> HOẠT ĐỘNG</option>
                    <option value="REFUND_PENDING"> ĐANG CHỜ HOÀN TIỀN</option>
                    <option value="REFUND_DONE"> ĐÃ HOÀN TIỀN</option>
                    <option value="REFUND_REJECTED"> BỊ TỪ CHỐI HOÀN</option>
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none font-black text-xs">▼</div>
            </div>
        </div>

        {error && (
          <div className="bg-red-100 border-4 border-black p-6 mb-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-black font-black uppercase text-xs">
            {error}
          </div>
        )}

        <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] mb-12 overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-black text-white border-b-4 border-black font-black uppercase text-[11px] tracking-widest italic">
                <th className="p-4 text-left border-r-2 border-white/20 w-36 uppercase">Mã Đơn / Ngày</th>
                <th className="p-4 text-left border-r-2 border-white/20 uppercase">Thông tin khóa học</th>
                <th className="p-4 text-right border-r-2 border-white/20 w-44 uppercase">Số Tiền (VND)</th>
                <th className="p-4 text-center border-r-2 border-white/20 w-44 uppercase">Trạng Thái</th>
                <th className="p-4 text-center w-24 uppercase italic">Info</th>
              </tr>
            </thead>
            <tbody className="divide-y-4 divide-black text-[11px]">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-24 text-center font-black text-black uppercase italic text-3xl">
                    Không tìm thấy dữ liệu phù hợp
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-zinc-50 transition-colors group">
                    <td className="p-4 border-r-4 border-black font-mono font-black text-xs text-black">
                      #{purchase.order_item?.order?.order_number?.split('-').slice(-1)[0] || purchase.id}
                      <p className="text-[10px] font-black text-black/70 italic tracking-tighter mt-1">
                        {new Date(purchase.enrolled_at).toLocaleDateString('vi-VN')}
                      </p>
                    </td>
                    <td className="p-4 border-r-4 border-black">
                      <p className="font-black text-black uppercase text-xs line-clamp-2 leading-tight">
                        {purchase.course.title}
                      </p>
                      <p className="text-[10px] font-black text-black/60 uppercase mt-1.5 italic tracking-tighter tabular-nums">
                        ID: {purchase.course_id} • {purchase.course.instructor_name || 'STUDYMATE'}
                      </p>
                    </td>
                    <td className="p-4 border-r-4 border-black text-right font-black text-black italic text-base tabular-nums whitespace-nowrap">
                      {new Intl.NumberFormat('vi-VN').format(purchase.order_item?.final_price || 0)} Đ
                    </td>
                    <td className="p-4 border-r-4 border-black text-center">
                      {getStatusBadge(purchase)}
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => {
                          setSelectedEnrollment(purchase);
                          setIsDetailModalOpen(true);
                        }}
                        className="mx-auto w-10 h-10 bg-black text-white hover:bg-yellow-400 hover:text-black border-2 border-black flex items-center justify-center transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
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

        <Pagination 
          currentPage={page}
          totalPages={Math.ceil(purchases.length / limit) + (purchases.length === limit ? 1 : 0) || 1} 
          onPageChange={setPage}
        />

        {/* Modals */}
        {selectedEnrollment && (
          <FinancialDetailModal 
            isOpen={isDetailModalOpen}
            onClose={() => setIsDetailModalOpen(false)}
            data={{
              id: selectedEnrollment.id,
              type: 'PURCHASE',
              title: selectedEnrollment.course.title,
              instructor: selectedEnrollment.course.instructor_name || 'Giảng viên StudyMate',
              date: selectedEnrollment.enrolled_at,
              amount: selectedEnrollment.order_item?.final_price || 0,
              status: selectedEnrollment.is_active ? 'COMPLETED' : 'REFUNDED',
              progress: selectedEnrollment.progress_percent,
              orderNumber: selectedEnrollment.order_item?.order?.order_number,
              canRefund: canRefund(selectedEnrollment).eligible,
              refundReason: canRefund(selectedEnrollment).reason,
              onRefund: () => {
                setIsDetailModalOpen(false);
                setIsRefundModalOpen(true);
              }
            }}
          />
        )}

        {selectedEnrollment && (
          <RefundRequestModal 
            isOpen={isRefundModalOpen}
            onClose={() => setIsRefundModalOpen(false)}
            enrollment={selectedEnrollment}
            onSuccess={() => {
              setIsRefundModalOpen(false);
              fetchPurchases();
            }}
          />
        )}
      </div>
      )}
    </MainLayout>
  );
}
