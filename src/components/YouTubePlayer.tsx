'use client';

import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

interface YouTubePlayerProps {
  videoId: string;
  initialTime?: number;
  onProgress?: (currentTime: number, duration: number) => void;
  onEnd?: () => void;
  className?: string;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ 
  videoId, 
  initialTime = 0,
  onProgress, 
  onEnd,
  className = ''
}) => {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [apiReady, setApiReady] = useState(false);

  // Load YouTube IFrame API
  useEffect(() => {
    if (window.YT) {
      setApiReady(true);
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      setApiReady(true);
    };
  }, []);

  // Initialize Player
  useEffect(() => {
    if (!apiReady || !videoId || !containerRef.current) return;

    if (playerRef.current) {
      playerRef.current.destroy();
    }

    playerRef.current = new window.YT.Player(containerRef.current, {
      height: '100%',
      width: '100%',
      videoId: videoId,
      playerVars: {
        autoplay: 0,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
      },
      events: {
        onReady: (event: any) => {
          if (initialTime > 0) {
            event.target.seekTo(initialTime);
          }
        },
        onStateChange: (event: any) => {
          // 1 is PLAYING
          if (event.data === 1) {
            startTracking();
          } else {
            stopTracking();
          }
          
          // 0 is ENDED
          if (event.data === 0) {
            onEnd?.();
          }
        },
      },
    });

    return () => {
      stopTracking();
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [apiReady, videoId, onEnd]);

  const startTracking = () => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const currentTime = Math.floor(playerRef.current.getCurrentTime());
        const duration = Math.floor(playerRef.current.getDuration());
        if (duration > 0) {
          onProgress?.(currentTime, duration);
        }
      }
    }, 10000); // Track every 10 seconds
  };

  const stopTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  return (
    <div className={`w-full h-full bg-black ${className}`}>
      <div ref={containerRef} />
    </div>
  );
};
