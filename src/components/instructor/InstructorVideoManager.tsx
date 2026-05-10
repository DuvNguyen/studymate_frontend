'use client';

import { useState } from 'react';
import { useInstructorVideos, useUploadVideo, useDeleteVideo, Video } from '@/hooks/useVideos';
import { Button } from '@/components/Button';
import { VideoPreviewModal } from './VideoPreviewModal';
import { Play } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InstructorVideoManager() {
  const { videos, loading, error, refetch } = useInstructorVideos();
  const { upload, uploading } = useUploadVideo();
  const { remove, deleting } = useDeleteVideo();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const openPreview = (video: Video) => {
    setSelectedVideo(video);
    setIsPreviewOpen(true);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      setUploadError(null);
      await upload(file, title || undefined);
      setFile(null);
      setTitle('');
      toast.success('Đã tải video lên thành công!');
      refetch();
    } catch (err: any) {
      setUploadError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa video này không? Thao tác này không thể hoàn tác.')) {
      return;
    }

    try {
      setDeletingId(id);
      await remove(id);
      toast.success('Đã xóa nội dung thành công!');
      refetch();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi xóa video');
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status: Video['status']) => {
    switch (status) {
      case 'PROCESSING':
        return (
          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 bg-amber-300 text-black border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
            Đang xử lý
          </span>
        );
      case 'PENDING_REVIEW':
        return (
          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 bg-indigo-400 text-white border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
            Chờ duyệt
          </span>
        );
      case 'APPROVED':
        return (
          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 bg-emerald-400 text-black border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
            Đã duyệt
          </span>
        );
      case 'REJECTED':
        return (
          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 bg-red-400 text-black border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
            Từ chối
          </span>
        );
      default:
        return null;
    }
  };

  const formatDuration = (secs: number | null) => {
    if (!secs) return 'N/A';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 flex justify-between items-center">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-black/60 mb-1 leading-none">Giảng viên / Content</p>
          <h1 className="text-3xl font-black text-black uppercase leading-none tracking-tight">Thư viện Video</h1>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm" className="h-fit">
          Làm mới ↻
        </Button>
      </div>

      {/* Upload Form Card */}
      <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-8">
        <h2 className="text-xl font-black uppercase mb-8 flex items-center gap-4 text-black">
          <span className="w-8 h-8 bg-black text-white flex items-center justify-center text-sm border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">+</span>
          Tải lên nội dung mới
        </h2>
        
        <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
          <div className="md:col-span-4 space-y-3">
            <label className="text-[11px] font-black uppercase tracking-widest text-black block">Tiêu đề (Tùy chọn)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border-2 border-black p-4 font-black text-sm bg-white focus:bg-yellow-50 outline-none placeholder:text-black/40 text-black transition-colors shadow-[4px_4px_0px_rgba(0,0,0,1)]"
              placeholder="NHẬP TIÊU ĐỀ VIDEO..."
            />
          </div>

          <div className="md:col-span-1 space-y-3 hidden md:block" />

          <div className="md:col-span-4 space-y-3">
            <label className="text-[11px] font-black uppercase tracking-widest text-black block">Chọn file video</label>
            <div className="relative border-4 border-dashed border-black p-4 bg-white hover:bg-gray-100 transition-colors shadow-[4px_4px_0px_rgba(0,0,0,1)] group">
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                required
              />
              <p className="text-xs font-black truncate px-2 text-center text-black uppercase tracking-wider">
                {file ? file.name : 'CLICK ĐỂ CHỌN FILE'}
              </p>
            </div>
          </div>

          <div className="md:col-span-3">
            <Button
              type="submit"
              disabled={uploading || !file}
              size="lg"
              className="w-full py-4 text-[11px]"
            >
              {uploading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin mx-auto rounded-none" />
              ) : (
                'Bắt đầu tải lên'
              )}
            </Button>
          </div>
        </form>
        {uploadError && <p className="mt-6 text-xs font-black text-red-600 uppercase border-2 border-black bg-red-50 p-4 shadow-[2px_2px_0px_rgba(0,0,0,1)]">{uploadError}</p>}
      </div>

      {/* Video List */}
      <div className="grid grid-cols-1 gap-8">
        {loading ? (
          <div className="flex items-center justify-center py-24 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="w-12 h-12 border-4 border-black border-t-transparent animate-spin rounded-none" />
          </div>
        ) : videos.length === 0 ? (
          <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-16 text-center">
            <h3 className="text-xl font-black uppercase text-black/20 tracking-widest leading-none mb-4">
              Thư viện đang trống
            </h3>
            <p className="text-xs font-black uppercase tracking-widest text-black/40">
              Hãy bắt đầu bằng việc tải lên video đầu tiên của bạn.
            </p>
          </div>
        ) : (
          videos.map((vid) => (
            <div key={vid.id} className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-8 flex flex-col md:flex-row gap-8 relative transition-all group hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              {/* Thumbnail Placeholder */}
              <button 
                onClick={() => openPreview(vid)}
                className="w-full md:w-64 aspect-video bg-black border-2 border-black flex items-center justify-center relative overflow-hidden group-hover:bg-gray-900 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group/btn"
              >
                 <div className="absolute inset-0 bg-indigo-600/0 group-hover/btn:bg-indigo-600/20 transition-colors" />
                 <div className="z-10 flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-white border-2 border-black rounded-none flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover/btn:scale-110 transition-transform">
                       <Play className="w-6 h-6 text-black fill-black" />
                    </div>
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] opacity-40 group-hover/btn:opacity-100 transition-opacity">Xem thử Video</span>
                 </div>
              </button>

              <div className="flex-1 flex flex-col justify-between py-2">
                <div>
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <h3 className="text-2xl font-black text-black leading-none uppercase tracking-tight group-hover:text-indigo-600 transition-colors">
                      {vid.title || 'Video không tiêu đề'}
                    </h3>
                    <div className="flex-shrink-0">
                      {getStatusBadge(vid.status)}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-6 mb-6">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-black/50">Thời lượng:</span>
                      <span className="text-xs font-black text-black bg-yellow-200 px-2 py-0.5 border border-black">{formatDuration(vid.durationSecs)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-black/50">Chất lượng:</span>
                      <span className="text-xs font-black text-white bg-black px-2 py-0.5 border border-black uppercase italic">{vid.definition || '—'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-black/50">Dung lượng:</span>
                      <span className="text-xs font-black text-black">{vid.fileSizeKb ? `${(vid.fileSizeKb / 1024).toFixed(1)}MB` : '—'}</span>
                    </div>
                  </div>

                  {vid.status === 'REJECTED' && (
                    <div className="bg-red-50 border-2 border-black p-4 mb-6 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                      <p className="text-[10px] font-black uppercase text-red-700 tracking-widest mb-1">Lý do từ chối:</p>
                      <p className="text-sm font-black text-black leading-snug underline decoration-red-200 decoration-4 underline-offset-4">{vid.rejectReason}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between border-t-4 border-black pt-6 mt-auto">
                   <p className="text-[10px] font-mono font-black text-black bg-gray-100 px-2 py-1 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                      LOG: {new Date(vid.uploadedAt).toLocaleString('vi-VN')}
                   </p>
                   <div className="flex gap-4">
                      <button 
                        onClick={() => handleDelete(vid.id)}
                        disabled={deletingId === vid.id}
                        className="text-[11px] font-black uppercase tracking-widest text-red-600 hover:bg-red-100 px-4 py-2 border-2 border-transparent hover:border-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                         {deletingId === vid.id ? (
                           <>
                             <div className="w-3 h-3 border-2 border-red-600 border-t-transparent animate-spin rounded-none" />
                             Đang xử lý...
                           </>
                         ) : (
                           'Xóa nội dung'
                         )}
                      </button>
                   </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <VideoPreviewModal 
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        video={selectedVideo}
      />
    </div>
  );
}
