/**
 * Video related types.
 */

export interface VideoItem {
  id: number;
  title: string;
  youtubeVideoId?: string;
  cdnUrl?: string | null;
  duration?: number;
  durationSecs?: number;
  status?: string;
  createdAt?: string;
}
