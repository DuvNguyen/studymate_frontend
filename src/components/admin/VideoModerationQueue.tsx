'use client';

import { useState } from 'react';
import { usePendingVideos, useReviewVideo, Video } from '@/hooks/useVideos';
import { Button } from '@/components/Button';

export default function VideoModerationQueue() {
  const { videos, loading, error, refetch } = usePendingVideos();
  const { review, reviewing } = useReviewVideo();
  const [rejectReason, setRejectReason] = useState('');
  const [activeVideoId, setActiveVideoId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleApprove = async (id: number) => {
    if (!window.confirm("Xác nhận phê duyệt video này?")) return;
    try {
      await review(id, 'APPROVED');
      refetch();
    } catch (err) {
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
    } catch (err) {
      alert('Lỗi khi từ chối video');
    }
  };

  const formatDuration = (secs: number | null) => {
    if (!secs) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Sticky Header Style from KYC Page */}
      <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 flex justify-between items-center">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-black/70 mb-1">Kiếm duyệt nội dung</p>
          <h1 className="text-3xl font-black text-black uppercase tracking-tight leading-none">Hàng đợi Video</h1>
        </div>
        <Button onClick={refetch} variant="outline" size="sm">
          Làm mới ↻
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-none animate-spin" />
        </div>
      ) : videos.length === 0 ? (
        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-16 text-center">
          <p className="text-xl font-black uppercase tracking-widest text-black/40 leading-none">
            Không có video nào đang chờ duyệt.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {videos.map((vid) => (
            <div key={vid.id} className="relative z-0">
              {/* Item Card */}
              <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-8 flex flex-col md:flex-row gap-8 relative z-10">
                <div className="flex-1">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <h3 className="text-2xl font-black text-black uppercase leading-tight">
                      {vid.title || 'Video chưa đặt tên'}
                    </h3>
                    <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 bg-amber-300 text-black border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] whitespace-nowrap">
                      Chờ duyệt
                    </span>
                  </div>
                  <p className="text-xs font-black text-black/70 mb-6 uppercase tracking-widest">
                    Mã Video: V-{vid.id} • Tải lên: {new Date(vid.uploadedAt).toLocaleString('vi-VN')}
                  </p>
                  
                  {/* Summary Grid */}
                  <div className="grid grid-cols-3 gap-6 text-sm mb-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-yellow-50 p-6">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black/80 block mb-1">Thời lượng</span>
                      <strong className="text-base font-black text-black underline decoration-2">{formatDuration(vid.durationSecs)}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black/80 block mb-1">Chất lượng</span>
                      <strong className="text-base font-black text-black uppercase italic">{vid.definition || '—'}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black/80 block mb-1">Dung lượng</span>
                      <strong className="text-base font-black text-black">{vid.fileSizeKb ? `${(vid.fileSizeKb / 1024).toFixed(1)} MB` : 'N/A'}</strong>
                    </div>
                  </div>

                  <Button 
                    onClick={() => setExpandedId(expandedId === vid.id ? null : vid.id)} 
                    variant={expandedId === vid.id ? 'primary' : 'outline'}
                    size="sm"
                    className="text-[10px]"
                  >
                    {expandedId === vid.id ? 'Đóng trình xem ∧' : 'Xem video chi tiết ∨'}
                  </Button>
                </div>

                {/* Vertical Actions Column */}
                <div className="flex flex-col justify-center gap-4 w-full md:w-48 border-t-4 border-black md:border-t-0 md:border-l-4 md:pl-8 pt-6 md:pt-0">
                  <Button 
                    onClick={() => handleApprove(vid.id)}
                    disabled={reviewing}
                    className="bg-emerald-400 py-4 hover:bg-emerald-500"
                  >
                    Phê Duyệt
                  </Button>
                  <Button 
                    onClick={() => setActiveVideoId(vid.id)}
                    disabled={reviewing}
                    variant="danger"
                    className="py-4 bg-red-400 text-black hover:bg-red-500"
                  >
                    Từ chối
                  </Button>
                </div>
              </div>

              {/* Expanded Video Preview */}
              {expandedId === vid.id && (
                <div className="bg-white border-x-2 border-b-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-8 pt-12 mt-[-10px] space-y-8 relative z-0 animate-in slide-in-from-top-4 fade-in duration-300">
                  <div className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] aspect-video bg-black overflow-hidden relative">
                    <iframe
                      src={`https://www.youtube.com/embed/${vid.youtubeVideoId}`}
                      title={vid.title || 'Video Preview'}
                      className="absolute inset-0 w-full h-full"
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
                        "Nội dung video này sau khi phê duyệt sẽ được ánh xạ trực tiếp vào khóa học của Giảng viên. 
                        Vui lòng kiểm tra tính sư phạm và chất lượng âm thanh kỹ thuật."
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Rejection Overlay */}
              {activeVideoId === vid.id && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
                  <div className="bg-white border-4 border-black p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-xl w-full">
                    <h2 className="text-3xl font-black uppercase mb-6 tracking-tighter leading-none">Từ chối Video</h2>
                    <p className="text-xs font-black text-black/70 uppercase tracking-[0.2em] mb-6">Video: {vid.title}</p>
                    
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Nhập lý do chi tiết để giảng viên sửa đổi..."
                      className="w-full border-4 border-black p-6 font-black text-lg bg-gray-50 focus:bg-yellow-50 outline-none placeholder:text-black/30 min-h-[160px] mb-8 shadow-inner transition-colors"
                    />

                    <div className="flex gap-6">
                      <Button 
                        onClick={() => handleReject(vid.id)}
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
          ))}
        </div>
      )}
    </div>
  );
}
