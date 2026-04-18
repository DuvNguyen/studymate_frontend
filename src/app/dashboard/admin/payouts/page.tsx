'use client';

import { useEffect, useState } from 'react';
import { useWallet, Payout } from '@/hooks/useWallet';
import { Button } from '@/components/Button';
import MainLayout from '@/components/MainLayout';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useRouter } from 'next/navigation';

export default function AdminPayoutsPage() {
  const { user: currentUser, loading: userLoading } = useCurrentUser();
  const router = useRouter();
  const { payouts, loading, fetchAllPayouts, processPayout, exportPayouts } = useWallet();
  const [filterStatus, setFilterStatus] = useState<string>('PENDING');
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [exporting, setExporting] = useState(false);

  // Action modal state
  const [actionModal, setActionModal] = useState<{
    open: boolean;
    payoutId: number | null;
    action: 'COMPLETED' | 'REJECTED' | null;
    instructor: string;
    amount: number;
  }>({ open: false, payoutId: null, action: null, instructor: '', amount: 0 });

  useEffect(() => {
    fetchAllPayouts(filterStatus || undefined);
  }, [fetchAllPayouts, filterStatus]);

  // Reset selection when filter changes
  useEffect(() => {
    setSelectedIds(new Set());
  }, [filterStatus]);

  const handleProcess = async (id: number, status: 'COMPLETED' | 'REJECTED') => {
    setProcessingId(id);
    try {
      await processPayout(id, status, adminNote);
      setAdminNote('');
      setActionModal({ open: false, payoutId: null, action: null, instructor: '', amount: 0 });
      fetchAllPayouts(filterStatus || undefined);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === payouts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(payouts.map(p => p.id)));
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportPayouts(Array.from(selectedIds));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setExporting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const base = "px-3 py-1 border-2 border-black text-[9px] font-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)]";
    switch (status) {
      case 'PENDING':
        return <span className={`${base} bg-amber-400 text-black`}>Chờ duyệt</span>;
      case 'COMPLETED':
        return <span className={`${base} bg-emerald-400 text-black`}>Đã duyệt</span>;
      case 'REJECTED':
        return <span className={`${base} bg-red-500 text-black`}>Từ chối</span>;
      default:
        return <span className={`${base} bg-black text-white`}>{status}</span>;
    }
  };

  const tabs = [
    { value: 'PENDING', label: 'Chờ duyệt' },
    { value: 'COMPLETED', label: 'Đã duyệt' },
    { value: 'REJECTED', label: 'Từ chối' },
    { value: '', label: 'Tất cả' },
  ];

  if (userLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="animate-spin rounded-none h-10 w-10 border-4 border-black border-t-transparent"></div>
      </div>
    );
  }

  if ((currentUser?.role !== 'ADMIN' && currentUser?.role !== 'STAFF') && !userLoading) {
    return null;
  }

  return (
    <MainLayout role={currentUser?.role} allowedRoles={['ADMIN', 'STAFF']}>
      <div className="max-w-7xl mx-auto space-y-6 pb-32">
        {/* Header */}
        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-black mb-1">Quản trị hệ thống</p>
          <h1 className="text-2xl font-black text-black uppercase">Quản lý Chi trả Giảng viên</h1>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {tabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilterStatus(tab.value)}
              className={`py-2 px-6 font-black text-xs uppercase tracking-widest border-2 border-black transition-all ${
                filterStatus === tab.value
                  ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-y-[-2px] translate-x-[-2px]'
                  : 'bg-white text-black hover:bg-yellow-50 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center items-center h-40 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="animate-spin rounded-none h-10 w-10 border-4 border-black border-t-transparent"></div>
          </div>
        ) : payouts.length === 0 ? (
          <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-16 text-center">
            <h3 className="text-xl font-black uppercase text-black tracking-widest">Không có yêu cầu nào</h3>
          </div>
        ) : (
          <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black text-white border-b-2 border-black">
                    <th className="p-4 w-12">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === payouts.length && payouts.length > 0}
                        onChange={toggleSelectAll}
                        className="w-5 h-5 accent-emerald-400 cursor-pointer"
                      />
                    </th>
                    <th className="p-4 font-black uppercase text-[10px] tracking-widest">Payout ID</th>
                    <th className="p-4 font-black uppercase text-[10px] tracking-widest">Giảng viên</th>
                    <th className="p-4 font-black uppercase text-[10px] tracking-widest">Ngân hàng</th>
                    <th className="p-4 font-black uppercase text-[10px] tracking-widest">STK</th>
                    <th className="p-4 font-black uppercase text-[10px] tracking-widest">Chủ TK</th>
                    <th className="p-4 font-black uppercase text-[10px] tracking-widest">Số tiền</th>
                    <th className="p-4 font-black uppercase text-[10px] tracking-widest">Ngày yêu cầu</th>
                    <th className="p-4 font-black uppercase text-[10px] tracking-widest">Trạng thái</th>
                    {filterStatus === 'PENDING' && (
                      <th className="p-4 font-black uppercase text-[10px] tracking-widest text-center">Hành động</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-black">
                  {payouts.map((po) => (
                    <tr key={po.id} className={`hover:bg-yellow-50 transition-colors ${selectedIds.has(po.id) ? 'bg-emerald-50' : ''}`}>
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(po.id)}
                          onChange={() => toggleSelect(po.id)}
                          className="w-5 h-5 accent-emerald-400 cursor-pointer"
                        />
                      </td>
                      <td className="p-4">
                        <span className="font-mono font-black text-black text-xs bg-yellow-100 border border-black px-2 py-0.5">
                          PO-{po.id}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-black text-black uppercase">
                          {po.instructor?.fullName || 'N/A'}
                        </div>
                        <div className="text-[10px] font-bold text-black italic">{po.instructor?.email}</div>
                      </td>
                      <td className="p-4 text-xs font-black text-black uppercase">{po.bankName}</td>
                      <td className="p-4 text-xs font-mono font-black text-black tracking-wider">{po.bankAccountNumber}</td>
                      <td className="p-4 text-xs font-black text-black uppercase">{po.bankAccountName}</td>
                      <td className="p-4">
                        <span className="text-lg font-black text-emerald-600 tracking-tighter">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(po.amount)}
                        </span>
                      </td>
                      <td className="p-4 text-xs font-black text-black uppercase">
                        {new Date(po.requestedAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="p-4">{getStatusBadge(po.status)}</td>
                      {filterStatus === 'PENDING' && (
                        <td className="p-4 flex gap-2 justify-center items-center">
                          <button
                            onClick={() => setActionModal({
                              open: true,
                              payoutId: po.id,
                              action: 'COMPLETED',
                              instructor: po.instructor?.fullName || po.bankAccountName,
                              amount: po.amount,
                            })}
                            disabled={processingId === po.id}
                            className="px-3 py-1.5 border border-black font-bold text-xs uppercase tracking-tight bg-emerald-400 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                          >
                            Duyệt
                          </button>
                          <button
                            onClick={() => setActionModal({
                              open: true,
                              payoutId: po.id,
                              action: 'REJECTED',
                              instructor: po.instructor?.fullName || po.bankAccountName,
                              amount: po.amount,
                            })}
                            disabled={processingId === po.id}
                            className="px-3 py-1.5 border border-black font-bold text-xs uppercase tracking-tight bg-red-400 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                          >
                            Từ chối
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Action Bar — Fixed Bottom */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-black border-t-4 border-emerald-400 p-4 flex items-center justify-between shadow-[0_-8px_20px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-4">
            <span className="bg-emerald-400 text-black border-2 border-black px-4 py-2 font-black text-sm shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]">
              {selectedIds.size} đã chọn
            </span>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-white text-xs font-black uppercase hover:text-emerald-400 transition-colors underline"
            >
              Bỏ chọn tất cả
            </button>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="bg-emerald-400 text-black border-4 border-black px-8 py-3 font-black text-sm uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:bg-yellow-400 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50"
          >
            {exporting ? 'ĐANG XUẤT...' : `XUẤT DANH SÁCH CHI TRẢ (${selectedIds.size} yêu cầu)`}
          </button>
        </div>
      )}

      {/* Action Modal */}
      {actionModal.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 w-full max-w-md mx-4">
            <h2 className="text-2xl font-black text-black mb-4 uppercase tracking-tighter">
              {actionModal.action === 'COMPLETED' ? 'Phê duyệt' : 'Từ chối'} yêu cầu
            </h2>
            <div className="space-y-4 mb-6">
              <div className="bg-yellow-50 border-2 border-black p-4">
                <p className="text-[10px] font-black uppercase text-black mb-1">Giảng viên</p>
                <p className="text-sm font-black text-black">{actionModal.instructor}</p>
              </div>
              <div className="bg-emerald-50 border-2 border-black p-4">
                <p className="text-[10px] font-black uppercase text-black mb-1">Số tiền</p>
                <p className="text-xl font-black text-emerald-600">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(actionModal.amount)}
                </p>
              </div>
            </div>

            <textarea
              className="w-full border-2 border-black p-4 text-sm text-black font-black focus:outline-none focus:bg-yellow-50 resize-none placeholder-black/40 min-h-[80px]"
              placeholder="Nhập ghi chú cho giảng viên..."
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
            />

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => {
                  setActionModal({ open: false, payoutId: null, action: null, instructor: '', amount: 0 });
                  setAdminNote('');
                }}
                className="flex-1 px-6 py-3 text-xs font-black uppercase border-2 border-black bg-white text-black hover:bg-yellow-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
              >
                Hủy
              </button>
              <button
                onClick={() => actionModal.payoutId && actionModal.action && handleProcess(actionModal.payoutId, actionModal.action)}
                disabled={processingId !== null}
                className={`flex-1 px-6 py-3 text-xs font-black uppercase border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50 ${
                  actionModal.action === 'COMPLETED'
                    ? 'bg-emerald-400 text-black'
                    : 'bg-red-400 text-black'
                }`}
              >
                {processingId !== null ? '...' : actionModal.action === 'COMPLETED' ? 'Xác nhận Duyệt' : 'Xác nhận Từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
