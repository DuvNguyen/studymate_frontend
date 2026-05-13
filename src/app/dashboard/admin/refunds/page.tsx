'use client';

import { useEffect, useState } from 'react';
import MainLayout from '@/components/MainLayout';
import LoadingScreen from '@/components/LoadingScreen';
import { useRefund, RefundRequest } from '@/hooks/useRefund';
import { toast } from 'react-hot-toast';
import { X, ArrowRightCircle } from 'lucide-react';

import { Pagination } from '@/components/Pagination';

interface RefundDetailModalProps {
   isOpen: boolean;
   onClose: () => void;
   request: RefundRequest | null;
   onApprove: (id: number) => void;
   onReject: (id: number) => void;
   processingId: number | null;
}

function RefundDetailModal({ isOpen, onClose, request, onApprove, onReject, processingId }: RefundDetailModalProps) {
   if (!isOpen || !request) return null;

   const generateVietQR = (req: RefundRequest) => {
      const bankId = req.bank_name.toUpperCase().replace(/\s/g, '');
      const amount = Math.round(req.amount);
      const description = `Refund Studymate Order ${req.id}`;
      return `https://img.vietqr.io/image/${bankId}-${req.bank_account_number}-compact.png?amount=${amount}&addInfo=${description}&accountName=${encodeURIComponent(req.bank_account_name)}`;
   };

   return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
         <div 
            className="w-full max-w-2xl bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
         >
            <div className="bg-black text-white p-6 border-b-4 border-black flex items-center justify-between sticky top-0 z-10">
               <h3 className="text-xl font-black uppercase tracking-tighter italic">Xử lý Hoàn tiền #{request.id}</h3>
               <button onClick={onClose} className="hover:rotate-90 transition-transform"><X size={24} /></button>
            </div>

            <div className="p-8 space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left: Info */}
                  <div className="space-y-6">
                     <div className="border-4 border-black p-4 bg-zinc-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <p className="text-[10px] font-black uppercase opacity-40 mb-2 italic">Khóa học</p>
                        <p className="font-black text-black uppercase leading-tight">{request.course?.title}</p>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className="border-2 border-black p-3 bg-white">
                           <p className="text-[8px] font-black uppercase opacity-40">Học viên</p>
                           <p className="text-[11px] font-black">{request.student?.full_name}</p>
                        </div>
                        <div className="border-2 border-black p-3 bg-white">
                           <p className="text-[8px] font-black uppercase opacity-40">Tiến độ</p>
                           <p className="text-[11px] font-black text-emerald-600">{request.enrollment?.progress_percent}%</p>
                        </div>
                     </div>

                     <div className="border-2 border-black p-4 bg-white space-y-3 shadow-[4px_4px_0px_0px_rgba(168,85,247,1)]">
                        <p className="text-[10px] font-black uppercase italic border-b border-black pb-1">Lý do hoàn tiền</p>
                        <p className="text-xs font-black italic">&quot;{request.reason}&quot;</p>
                     </div>

                     <div className="border-2 border-black p-4 bg-white/50 space-y-2">
                        <p className="text-[10px] font-black uppercase opacity-40">Thông tin nhận tiền</p>
                        <p className="text-[10px] font-black uppercase">{request.bank_name}</p>
                        <p className="text-sm font-black underline decoration-2">{request.bank_account_number}</p>
                        <p className="text-[10px] font-bold uppercase">{request.bank_account_name}</p>
                     </div>
                  </div>

                  {/* Right: VietQR */}
                  <div className="flex flex-col items-center justify-center p-6 border-4 border-black bg-zinc-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-1">
                     <p className="text-[10px] font-black uppercase bg-black text-white px-3 py-1 mb-4">Quét QR Chuyển nhanh</p>
                     <div className="bg-white border-4 border-black p-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative">
                        <img 
                           src={generateVietQR(request)} 
                           alt="VietQR" 
                           className="w-48 h-48 object-contain"
                           onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=QR+Error'; }}
                        />
                     </div>
                     <p className="text-[8px] font-black uppercase text-black/40 mt-6 tracking-widest italic">Powered by Studymate PayOS Connect</p>
                  </div>
               </div>

               {/* Action Area */}
               <div className="pt-6 border-t-8 border-black border-double flex flex-col md:flex-row gap-4">
                  <button 
                     disabled={processingId === request.id}
                     onClick={() => onApprove(request.id)}
                     className="flex-1 bg-emerald-400 text-black border-4 border-black p-5 font-black uppercase italic shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all hover:bg-emerald-300"
                  >
                     Chấp nhận & Hoàn tất →
                  </button>
                  <button 
                     disabled={processingId === request.id}
                     onClick={() => onReject(request.id)}
                     className="flex-1 bg-white text-rose-600 border-4 border-black p-5 font-black uppercase text-xs tracking-widest hover:bg-rose-50"
                  >
                     Từ chối yêu cầu
                  </button>
               </div>
            </div>
         </div>
      </div>
   );
}

export default function AdminRefundsPage() {
  const { refundRequests, fetchAllRefundRequests, processRefund, loading } = useRefund();
  const [filterStatus, setFilterStatus] = useState<string>('PENDING');
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<RefundRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  useEffect(() => {
    fetchAllRefundRequests(filterStatus);
    setPage(1); // Reset page on filter change
  }, [fetchAllRefundRequests, filterStatus]);

  const paginatedRequests = refundRequests.slice((page - 1) * limit, page * limit);

  const handleProcess = async (id: number, status: 'APPROVED' | 'REJECTED', note?: string) => {
    setProcessingId(id);
    try {
      await processRefund(id, status, note || (status === 'APPROVED' ? 'Yêu cầu hoàn tiền đã được duyệt.' : 'Rất tiếc, yêu cầu hoàn tiền của bạn bị từ chối.'));
      toast.success(status === 'APPROVED' ? 'Đã duyệt hoàn tiền!' : 'Đã từ chối yêu cầu.');
      setIsModalOpen(false);
      fetchAllRefundRequests(filterStatus);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi xảy ra');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading && refundRequests.length === 0) return (
    <LoadingScreen 
      title="ĐANG TẢI DỮ LIỆU..."
      description="HỆ THỐNG ĐANG LIỆT KÊ CÁC YÊU CẦU HOÀN TIỀN CẦN XỬ LÝ."
    />
  );

  return (
    <MainLayout role="ADMIN" allowedRoles={['ADMIN', 'STAFF']}>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b-8 border-black pb-8">
          <div>
            <span className="bg-rose-500 text-white border-2 border-black px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4 inline-block">
              Refund Management
            </span>
            <h1 className="text-6xl font-black uppercase text-black tracking-tighter leading-none italic">
              Quản lý Hoàn tiền
            </h1>
          </div>
          <div className="flex bg-white border-4 border-black p-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            {['PENDING', 'APPROVED', 'REJECTED'].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-6 py-2 text-xs font-black uppercase transition-all ${filterStatus === s ? 'bg-black text-white' : 'hover:bg-zinc-100'}`}
              >
                {s === 'PENDING' ? 'Mới' : s === 'APPROVED' ? 'Đã duyệt' : 'Từ chối'}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border-8 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] overflow-hidden relative">
           {loading && refundRequests.length > 0 && (
             <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-50 flex items-center justify-center animate-in fade-in duration-200">
               <div className="bg-black text-white px-6 py-3 border-4 border-black font-black uppercase italic tracking-widest shadow-[8px_8px_0px_0px_rgba(244,63,94,1)] animate-pulse">
                 ĐANG CẬP NHẬT...
               </div>
             </div>
           )}
           <table className="w-full border-collapse">
              <thead>
                 <tr className="bg-black text-white text-xs font-black uppercase tracking-widest italic border-b-4 border-black">
                    <th className="p-5 text-left border-r-2 border-white/20 w-20">ID</th>
                    <th className="p-5 text-left border-r-2 border-white/20 min-w-[200px]">Học viên</th>
                    <th className="p-5 text-left border-r-2 border-white/20">Khóa học</th>
                    <th className="p-5 text-right border-r-2 border-white/20 w-40">Số tiền</th>
                    <th className="p-5 text-center border-r-2 border-white/20 w-32">Tiến độ</th>
                    <th className="p-5 text-center border-r-2 border-white/20 w-36">Ngày gửi</th>
                    <th className="p-5 text-center w-24">Xử lý</th>
                 </tr>
              </thead>
              <tbody className="divide-y-4 divide-black">
                 {refundRequests.length === 0 ? (
                    <tr>
                       <td colSpan={7} className="p-24 text-center font-black text-black/20 uppercase italic text-2xl">Không có yêu cầu nào</td>
                    </tr>
                 ) : (
                    paginatedRequests.map((request) => (
                       <tr key={request.id} className="hover:bg-zinc-50 transition-colors group">
                          <td className="p-5 border-r-4 border-black font-black text-xs text-black whitespace-nowrap">#{request.id}</td>
                          <td className="p-5 border-r-4 border-black">
                             <p className="font-black text-black uppercase text-xs leading-tight mb-1">{request.student?.full_name}</p>
                             <p className="text-[10px] font-black uppercase truncate text-black">{request.student?.email}</p>
                          </td>
                          <td className="p-5 border-r-4 border-black">
                             <p className="font-black text-black uppercase text-xs line-clamp-2 italic tracking-tighter leading-tight">{request.course?.title}</p>
                          </td>
                          <td className="p-5 border-r-4 border-black text-right font-black italic text-black whitespace-nowrap text-sm">
                             {new Intl.NumberFormat('vi-VN').format(request.amount)}
                          </td>
                          <td className="p-5 border-r-4 border-black text-center">
                             <span className="bg-emerald-100 border-2 border-black px-4 py-1 text-[11px] font-black uppercase shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                                {request.enrollment?.progress_percent || 0}%
                             </span>
                          </td>
                          <td className="p-5 border-r-4 border-black text-center font-black text-black italic text-xs">
                             {new Date(request.created_at).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="p-5 text-center">
                             <button 
                               onClick={() => { setSelectedRequest(request); setIsModalOpen(true); }}
                               className="mx-auto w-10 h-10 bg-black text-white hover:bg-rose-500 hover:text-white border-2 border-black flex items-center justify-center transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
                             >
                                <ArrowRightCircle size={18} />
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
           totalPages={Math.ceil(refundRequests.length / limit) + (refundRequests.length === limit ? 1 : 0)}
           onPageChange={setPage}
        />

        <RefundDetailModal 
           isOpen={isModalOpen}
           onClose={() => setIsModalOpen(false)}
           request={selectedRequest}
           onApprove={(id) => handleProcess(id, 'APPROVED')}
           onReject={(id) => {
              const reason = prompt('Lý do từ chối:');
              if (reason) handleProcess(id, 'REJECTED', reason);
           }}
           processingId={processingId}
        />
      </div>
    </MainLayout>
  );
}
