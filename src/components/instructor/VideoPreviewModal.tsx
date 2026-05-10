'use client';

import React from 'react';
import { Modal } from '@/components/Modal';
import { UnifiedVideoPlayer } from '@/components/UnifiedVideoPlayer';
import { Video } from '@/hooks/useVideos';

interface VideoPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: Video | null;
}

export const VideoPreviewModal: React.FC<VideoPreviewModalProps> = ({
  isOpen,
  onClose,
  video,
}) => {
  if (!video) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={video.title || 'Xem thử Video'}
      maxWidth="max-w-6xl"
    >
      <div className="space-y-6">
        <UnifiedVideoPlayer
          youtubeVideoId={video.youtubeVideoId}
          cdnUrl={video.cdnUrl}
          title={video.title || ''}
        />
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase text-black/50 tracking-widest leading-none">Trạng thái</span>
            <span className="text-xs font-black uppercase text-black">{video.status}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase text-black/50 tracking-widest leading-none">Thời lượng</span>
            <span className="text-xs font-black uppercase text-black">
              {video.durationSecs ? `${Math.floor(video.durationSecs / 60)}:${(video.durationSecs % 60).toString().padStart(2, '0')}` : '—'}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase text-black/50 tracking-widest leading-none">Định dạng</span>
            <span className="text-xs font-black uppercase text-black">{video.definition || '—'}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase text-black/50 tracking-widest leading-none">Tải lên lúc</span>
            <span className="text-xs font-black uppercase text-black">
              {new Date(video.uploadedAt).toLocaleDateString('vi-VN')}
            </span>
          </div>
        </div>

        {video.status === 'PROCESSING' && (
          <div className="bg-amber-100 border-2 border-black p-4 flex items-center gap-4 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
             <div className="w-6 h-6 border-4 border-black border-t-transparent animate-spin rounded-none shrink-0" />
             <p className="text-xs font-black uppercase tracking-tight text-black">Video đang trong quá trình xử lý kỹ thuật. Một số tính năng có thể chưa hiển thị đầy đủ.</p>
          </div>
        )}
      </div>
    </Modal>
  );
};
