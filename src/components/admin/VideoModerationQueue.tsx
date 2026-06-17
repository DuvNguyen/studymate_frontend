'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePendingVideos, useReviewVideo } from '@/hooks/useVideos';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { Button } from '@/components/Button';
import { Pagination } from '@/components/Pagination';
import AdminStatusTabs from '@/components/admin/AdminStatusTabs';

interface VideoModerationQueueProps {
  uploaderId?: number;
}

export default function VideoModerationQueue({ uploaderId }: VideoModerationQueueProps = {}) {
  const { videos, meta, loading, refetch } = usePendingVideos();
  const { review, reviewing } = useReviewVideo();
  const { users: instructors, fetchUsers: fetchInstructors, fetchUserById } = useAdminUsers();
  const [instructorInfo, setInstructorInfo] = useState<any | null>(null);

  const [rejectReason, setRejectReason] = useState('');
  const [activeVideoId, setActiveVideoId] = useState<number | null>(null);
  const [reasonViewerVideoId, setReasonViewerVideoId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Helpers to retrieve active modal video details
  const reasonVideo = videos.find((v) => v.id === reasonViewerVideoId);
  const rejectVideo = videos.find((v) => v.id === activeVideoId);

  // Filters
  const [page, setPage] = useState(1);
  const [filterUploaderId, setFilterUploaderId] = useState<number | ''>('');
  const [filterVideoId, setFilterVideoId] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    if (uploaderId) {
      fetchUserById(uploaderId).then((data) => {
        if (data) setInstructorInfo(data);
      });
    } else {
      fetchInstructors({ role: 'INSTRUCTOR', limit: 100 });
    }
  }, [uploaderId, fetchInstructors, fetchUserById]);

  useEffect(() => {
    refetch({
      page,
      limit: 5,
      uploaderId: uploaderId || filterUploaderId || undefined,
      id: filterVideoId ? Number(filterVideoId) : undefined,
      status: filterStatus || undefined,
    });
  }, [page, filterUploaderId, filterVideoId, filterStatus, refetch, uploaderId]);

  const handleFilter = () => {
    setPage(1);
    // Values are already synced with state, so refetch will trigger via useEffect
  };

  const handleApprove = async (id: number) => {
    if (!window.confirm("Xác nhận phê duyệt video này?")) return;
    try {
      await review(id, 'APPROVED');
      refetch();
    } catch {
      alert('Lỗi khi duyệt video');
    }
  };

  const handleReject = async (id: number) => {
    if (!rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }
    try {
      await review(id, 'REJECTED', rejectReason);
      setRejectReason('');
      setActiveVideoId(null);
      refetch();
    } catch {
      alert('Lỗi khi từ chối video');
    }
  };

  const formatDuration = (secs: number | null) => {
    if (!secs) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const statusTabs = [
    { value: '', label: 'Tất cả' },
    { value: 'APPROVED', label: 'Đã duyệt' },
    { value: 'PENDING_REVIEW', label: 'Chờ duyệt' },
    { value: 'REJECTED', label: 'Từ chối' },
  ];

  const statusBadgeMap: Record<string, { label: string; cls: string }> = {
    PENDING_REVIEW: { label: 'Chờ duyệt', cls: 'bg-amber-300 text-black' },
    APPROVED: { label: 'Đã duyệt', cls: 'bg-emerald-300 text-black' },
    REJECTED: { label: 'Từ chối', cls: 'bg-red-300 text-black' },
  };

  return (
    <div className="w-[calc(100%-12px)] sm:w-full max-w-7xl mx-auto space-y-6">
      {/* Sticky Header Style from KYC Page */}
      <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-2 sm:gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-black/70 mb-1">Kiểm duyệt nội dung</p>
          <h1 className="text-xl sm:text-3xl font-black text-black uppercase tracking-tight leading-none">
            {uploaderId 
              ? `Video: ${instructorInfo?.fullName || instructorInfo?.email || 'Đang tải...'}`
              : 'Hàng đợi Video'}
          </h1>
        </div>
        <div className="flex gap-2">
          {uploaderId && (
            <Link href="/dashboard/admin/videos">
              <Button variant="outline" size="sm">
                ← Quay lại
              </Button>
            </Link>
          )}
          <Button onClick={() => refetch()} variant="outline" size="sm">
            Làm mới ↻
          </Button>
        </div>
      </div>

      <AdminStatusTabs
        items={statusTabs}
        value={filterStatus}
        onChange={(next) => {
          setFilterStatus(next);
          setPage(1);
        }}
      />

      {/* Filter Bar */}
      <div className="bg-yellow-50 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-4 flex flex-col md:flex-row gap-3 sm:gap-4 items-end min-w-0">
        {!uploaderId && (
          <div className="w-full md:w-64">
            <label className="block text-[10px] font-black text-black uppercase mb-1">Giảng viên</label>
            <select 
              value={filterUploaderId}
              onChange={(e) => setFilterUploaderId(e.target.value ? Number(e.target.value) : '')}
              className="w-full bg-white border-2 border-black px-4 py-2 font-black text-xs text-black outline-none focus:bg-yellow-100"
            >
              <option value="">-- TẤT CẢ GIẢNG VIÊN --</option>
              {instructors.map((ins) => (
                <option key={ins.id} value={ins.id}>
                  {ins.fullName || ins.email} (ID: {ins.id})
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="w-full md:w-48">
          <label className="block text-[10px] font-black text-black uppercase mb-1">Mã Video (Hệ thống)</label>
          <input 
            type="text" 
            value={filterVideoId}
            onChange={(e) => setFilterVideoId(e.target.value)}
            placeholder="VD: 123"
            className="w-full bg-white border-2 border-black px-4 py-2 font-black text-xs text-black outline-none focus:bg-yellow-100 placeholder:text-black/30"
          />
        </div>
        <Button 
          onClick={handleFilter}
          className="bg-black text-white px-8 py-2 text-xs shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]"
        >
          LỌC
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-none animate-spin" />
        </div>
      ) : videos.length === 0 ? (
        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-16 text-center">
          <p className="text-xl font-black uppercase tracking-widest text-black/40 leading-none">
            Không có video nào phù hợp bộ lọc hiện tại.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-8">
          {videos.map((vid) => (
            <div key={vid.id} className="relative z-0">
              {/* Item Card */}
              <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3.5 sm:p-8 flex flex-col md:flex-row gap-3 sm:gap-8 relative z-10">
                <div className="flex-1">
                  <div className="flex justify-between items-start gap-3 mb-1.5 sm:mb-2 min-w-0 overflow-hidden">
                    <h3
                      className="flex-1 min-w-0 w-0 overflow-hidden text-ellipsis whitespace-nowrap text-base sm:text-lg font-black text-black uppercase leading-tight"
                      title={vid.title || 'Video chưa đặt tên'}
                    >
                      {vid.title || 'Video chưa đặt tên'}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 sm:px-3 py-1 sm:py-1.5 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] whitespace-nowrap ${statusBadgeMap[vid.status]?.cls || 'bg-zinc-200 text-black'}`}>
                        {statusBadgeMap[vid.status]?.label || vid.status}
                      </span>
                      {vid.status === 'REJECTED' && vid.rejectReason && (
                        <button
                          type="button"
                          onClick={() => setReasonViewerVideoId(vid.id)}
                          className="w-6 h-6 rounded-full bg-red-400 border-2 border-black text-black text-[10px] font-black leading-none flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-red-500"
                          title="Xem lý do từ chối"
                          aria-label="Xem lý do từ chối"
                        >
                          !
                        </button>
                      )}
                    </div>
                  </div>
                  <p
                    className="text-[11px] sm:text-xs font-black text-black/70 mb-3 sm:mb-6 uppercase tracking-wide sm:tracking-widest truncate"
                    title={`Mã Video: V-${vid.id} • Tải lên: ${new Date(vid.uploadedAt).toLocaleString('vi-VN')}`}
                  >
                    Mã Video: V-{vid.id} • Tải lên: {new Date(vid.uploadedAt).toLocaleString('vi-VN')}
                  </p>
                  
                  {/* Summary Grid */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-6 text-[10px] sm:text-sm mb-3 sm:mb-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-yellow-50 p-2.5 sm:p-6">
                    <div>
                      <span className="text-[8px] font-black uppercase tracking-wide sm:tracking-[0.2em] text-black/80 block mb-0.5 sm:mb-1">Thời lượng</span>
                      <strong className="text-sm sm:text-base font-black text-black underline decoration-2">{formatDuration(vid.durationSecs)}</strong>
                    </div>
                    <div>
                      <span className="text-[8px] font-black uppercase tracking-wide sm:tracking-[0.2em] text-black/80 block mb-0.5 sm:mb-1">Chất lượng</span>
                      <strong className="text-sm sm:text-base font-black text-black uppercase italic">{vid.definition || 'ĐANG CẬP NHẬT'}</strong>
                    </div>
                    <div>
                      <span className="text-[8px] font-black uppercase tracking-wide sm:tracking-[0.2em] text-black/80 block mb-0.5 sm:mb-1">Dung lượng</span>
                      <strong className="text-sm sm:text-base font-black text-black">{vid.fileSizeKb ? `${(vid.fileSizeKb / 1024).toFixed(1)} MB` : 'ĐANG CẬP NHẬT'}</strong>
                    </div>
                  </div>

                  <Button 
                    onClick={() => setExpandedId(expandedId === vid.id ? null : vid.id)} 
                    variant={expandedId === vid.id ? 'primary' : 'outline'}
                    size="sm"
                    className="text-[9px] sm:text-[10px] py-1.5 sm:py-2"
                  >
                    {expandedId === vid.id ? 'Đóng trình xem ∧' : 'Xem video chi tiết ∨'}
                  </Button>
                </div>

                {/* Vertical Actions Column */}
                {vid.status === 'PENDING_REVIEW' && (
                  <div className="flex flex-col justify-center gap-2 sm:gap-4 w-full md:w-48 border-t-2 sm:border-t-4 border-black md:border-t-0 md:border-l-4 md:pl-8 pt-3 sm:pt-6 md:pt-0">
                    <Button
                      onClick={() => handleApprove(vid.id)}
                      disabled={reviewing}
                      className="bg-emerald-400 py-2.5 sm:py-4 text-xs sm:text-sm hover:bg-emerald-500"
                    >
                      Phê Duyệt
                    </Button>
                    <Button
                      onClick={() => setActiveVideoId(vid.id)}
                      disabled={reviewing}
                      variant="danger"
                      className="py-2.5 sm:py-4 text-xs sm:text-sm bg-red-400 text-black hover:bg-red-500"
                    >
                      Từ chối
                    </Button>
                  </div>
                )}
              </div>

              {/* Expanded Video Preview */}
              {expandedId === vid.id && (
                <div className="bg-white border-x-2 border-b-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-8 sm:pt-10 mt-2 space-y-4 sm:space-y-8 relative z-20 pointer-events-auto animate-in slide-in-from-top-4 fade-in duration-300">
                  <div className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] aspect-video bg-black overflow-hidden relative z-30 pointer-events-auto">
                    <iframe
                      src={`https://www.youtube.com/embed/${vid.youtubeVideoId}`}
                      title={vid.title || 'Video Preview'}
                      className="absolute inset-0 w-full h-full z-40 pointer-events-auto"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4">
                    <div className="space-y-4">
                      <h4 className="font-black text-xs uppercase tracking-[0.3em] border-b-4 border-black pb-2 inline-block text-black">Quy tắc tự động</h4>
                      <div className="bg-white border-2 border-black p-4 text-xs font-black space-y-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <p className="flex justify-between items-center bg-emerald-50 p-3 border-2 border-black">
                          <span className="text-emerald-950 font-black">Giới hạn 5p - 120p:</span>
                          <span className="bg-emerald-400 px-3 py-1 text-[10px] border-2 border-black font-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">HỢP LỆ</span>
                        </p>
                        <p className="flex justify-between items-center bg-gray-100 p-3 border-2 border-black">
                          <span className="text-black font-black">Định dạng YouTube:</span>
                          <span className="uppercase font-black italic underline decoration-2 text-black">{vid.definition || 'HD'}</span>
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-black text-xs uppercase tracking-[0.3em] border-b-4 border-black pb-2 inline-block text-black">Ghi chú hệ thống</h4>
                      <p className="text-xs font-black text-black italic leading-relaxed bg-yellow-50 p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        &quot;Nội dung video này sau khi phê duyệt sẽ được ánh xạ trực tiếp vào khóa học của Giảng viên. 
                        Vui lòng kiểm tra tính sư phạm và chất lượng âm thanh kỹ thuật.&quot;
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && (
        <Pagination
          currentPage={page}
          totalPages={meta.totalPages}
          onPageChange={(p) => setPage(p)}
        />
      )}

      {/* Modals outside the list to prevent stacking context clipping */}
      {reasonVideo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-6">
          <div className="bg-white border-4 border-black p-6 sm:p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] w-full max-w-lg">
            <div className="flex items-center justify-between mb-4 border-b-2 border-black pb-3">
              <h3 className="text-xl font-black uppercase tracking-tight">Lý do từ chối</h3>
              <button
                type="button"
                onClick={() => setReasonViewerVideoId(null)}
                className="text-xl font-black"
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-black/60 mb-2">
              Video: {reasonVideo.title || `V-${reasonVideo.id}`}
            </p>
            <div className="bg-red-50 border-2 border-black p-4">
              <p className="text-sm font-black text-black leading-relaxed">
                {reasonVideo.rejectReason || 'Không có lý do cụ thể.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {rejectVideo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <div className="bg-white border-4 border-black p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-xl w-full">
            <h2 className="text-3xl font-black uppercase mb-6 tracking-tighter leading-none text-black">Từ chối Video</h2>
            <p className="text-xs font-black text-black uppercase tracking-[0.2em] mb-6">Video: {rejectVideo.title}</p>
            
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập lý do chi tiết để giảng viên sửa đổi..."
              className="w-full border-4 border-black p-6 font-black text-lg bg-gray-50 focus:bg-yellow-50 outline-none placeholder:text-black/50 min-h-[160px] mb-8 shadow-inner transition-colors text-black"
            />

            <div className="flex gap-6">
              <Button 
                onClick={() => handleReject(rejectVideo.id)}
                className="flex-1 bg-red-400 text-black py-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-red-500"
              >
                Xác nhận loại bỏ
              </Button>
              <Button 
                onClick={() => { setActiveVideoId(null); setRejectReason(''); }}
                variant="outline"
                className="px-10 py-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100"
              >
                Hủy
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
