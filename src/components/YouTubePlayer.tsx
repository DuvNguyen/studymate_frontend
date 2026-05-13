'use client';

import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [apiReady, setApiReady] = useState(false);

  const onProgressRef = useRef(onProgress);
  const onEndRef = useRef(onEnd);

  // Update refs when props change
  useEffect(() => {
    onProgressRef.current = onProgress;
  }, [onProgress]);

  useEffect(() => {
    onEndRef.current = onEnd;
  }, [onEnd]);

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
  function startTracking() {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const currentTime = Math.floor(playerRef.current.getCurrentTime());
        const duration = Math.floor(playerRef.current.getDuration());
        if (duration > 0) {
          onProgressRef.current?.(currentTime, duration);
        }
      }
    }, 10000); // Track every 10 seconds
  }

  function stopTracking() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }
  // Initialize Player
  useEffect(() => {
    if (!apiReady || !videoId || !containerRef.current) return;

    if (playerRef.current && typeof playerRef.current.destroy === 'function') {
      try {
        playerRef.current.destroy();
      } catch (err) {
        console.warn('Error destroying player:', err);
      }
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onReady: (event: any) => {
          if (initialTime > 0) {
            event.target.seekTo(initialTime);
          }
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onStateChange: (event: any) => {
          // 1 is PLAYING
          if (event.data === 1) {
            startTracking();
          } else {
            stopTracking();
          }
          
          // 0 is ENDED
          if (event.data === 0) {
            onEndRef.current?.();
          }
        },
      },
    });

    return () => {
      stopTracking();
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch {
          // Ignore
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiReady, videoId]); // Only re-init if apiReady or videoId changes


  return (
    <div className={`w-full h-full bg-black ${className}`}>
      <div ref={containerRef} />
    </div>
  );
};
