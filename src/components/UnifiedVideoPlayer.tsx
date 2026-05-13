'use client';

import React from 'react';
import { YouTubePlayer } from './YouTubePlayer';

interface UnifiedVideoPlayerProps {
  youtubeVideoId?: string | null;
  cdnUrl?: string | null;
  title?: string;
  className?: string;
}

export const UnifiedVideoPlayer: React.FC<UnifiedVideoPlayerProps> = ({
  youtubeVideoId,
  cdnUrl,
  className = '',
}) => {
  if (youtubeVideoId) {
    return (
      <div className={`w-full aspect-video ${className}`}>
        <YouTubePlayer 
          videoId={youtubeVideoId} 
          className="w-full h-full"
        />
      </div>
    );
  }

  if (cdnUrl) {
    return (
      <div className={`w-full aspect-video bg-black flex items-center justify-center border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${className}`}>
        <video 
          controls
          className="w-full h-full"
          poster="/video-poster.png" // Optional: placeholder for video before it plays
        >
          <source src={cdnUrl} type="video/mp4" />
          Trình duyệt của bạn không hỗ trợ xem video trực tiếp.
        </video>
      </div>
    );
  }

  return (
    <div className={`w-full aspect-video bg-gray-200 flex flex-col items-center justify-center border-4 border-black border-dashed ${className}`}>
      <div className="w-12 h-12 bg-black/10 rounded-full flex items-center justify-center mb-4">
        <svg className="w-6 h-6 text-black/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </div>
      <p className="text-xs font-black uppercase tracking-widest text-black/40">Không có dữ liệu video</p>
    </div>
  );
};
