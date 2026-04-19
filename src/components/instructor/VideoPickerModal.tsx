'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';

interface VideoPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (videoId: number, videoData: any) => void;
}

export default function VideoPickerModal({ isOpen, onClose, onSelect }: VideoPickerModalProps) {
  const { getToken } = useAuth();
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchVideos();
    }
  }, [isOpen]);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      // Fetch from instructor endpoint and filter approved
      const res = await fetch('http://localhost:3001/api/v1/videos/instructor?status=APPROVED', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setVideos(data.data || data); // handle both paginated and flat response
      }
    } catch (e) {
      toast.error('Lỗi tải danh sách video');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-3xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b-4 border-black flex justify-between items-center bg-yellow-400">
          <h2 className="text-xl font-black uppercase text-black">Thư viện Video đã duyệt</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-white border-2 border-black hover:bg-black hover:text-white transition-colors font-black"
          >
            X
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="w-8 h-8 border-4 border-black border-t-transparent animate-spin" />
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center p-12 text-black font-black uppercase tracking-widest text-xl border-4 border-black border-dashed bg-white">
              KHÔNG CÓ VIDEO NÀO ĐƯỢC DUYỆT TRÊN HỆ THỐNG.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {videos.map((video) => (
                <div 
                  key={video.id} 
                  className="bg-white border-2 border-black p-4 flex flex-col hover:border-blue-500 hover:shadow-[4px_4px_0px_0px_rgba(59,130,246,1)] transition-all cursor-pointer group"
                  onClick={() => onSelect(video.id, video)}
                >
                  <div className="aspect-video bg-gray-100 border-2 border-black mb-3 overflow-hidden">
                    {video.cdnUrl && video.status === 'APPROVED' ? (
                      <iframe
                        src={video.cdnUrl}
                        title={video.title || "Video player"}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full pointer-events-none"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-black text-black bg-gray-200">SIGNAL LOST: NO PREVIEW</div>
                    )}
                  </div>
                  <h3 className="font-black text-black line-clamp-2 leading-tight uppercase tracking-tighter group-hover:text-yellow-600 transition-colors">
                    {video.title || `Video #${video.id}`}
                  </h3>
                  <div className="mt-3 flex gap-2">
                    <span className="text-xs bg-emerald-400 border-2 border-black font-black px-2 py-0.5 uppercase text-black italic">ĐÃ DUYỆT</span>
                    <span className="text-xs bg-black text-white border-2 border-black font-black px-2 py-0.5 italic">{Math.floor((video.durationSecs || 0)/60)}:{(video.durationSecs || 0)%60}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
