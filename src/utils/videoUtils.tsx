import React from 'react';
import { ExternalLink, Video, Youtube } from 'lucide-react';

/**
 * Extracts YouTube video ID from any common YouTube URL format:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://www.youtube.com/live/VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 */
export function extractYouTubeId(url: string | undefined | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    // Handle direct 11-character ID if someone pasted just the ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      return trimmed;
    }

    const parsedUrl = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    const hostname = parsedUrl.hostname.toLowerCase();

    if (hostname.includes('youtu.be')) {
      const id = parsedUrl.pathname.slice(1).split('/')[0];
      if (id && id.length >= 10) return id;
    }

    if (hostname.includes('youtube.com') || hostname.includes('youtube-nocookie.com')) {
      const vParam = parsedUrl.searchParams.get('v');
      if (vParam) return vParam;

      const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
      if (pathParts.length >= 2 && ['embed', 'shorts', 'live', 'v'].includes(pathParts[0])) {
        return pathParts[1];
      }
    }
  } catch {
    // Fallback regex matching
  }

  const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i;
  const match = trimmed.match(regex);
  return match ? match[1] : null;
}

export function isYouTubeUrl(url: string | undefined | null): boolean {
  return extractYouTubeId(url) !== null;
}

export function getYouTubeEmbedUrl(url: string | undefined | null): string | null {
  const videoId = extractYouTubeId(url);
  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
}

export function getYouTubeWatchUrl(url: string | undefined | null): string | null {
  const videoId = extractYouTubeId(url);
  if (!videoId) return null;
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function getYouTubeThumbnailUrl(url: string | undefined | null): string | null {
  const videoId = extractYouTubeId(url);
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Checks if URL is Google Drive video link and converts to preview/embed link
 */
export function getGoogleDriveEmbedUrl(url: string | undefined | null): string | null {
  if (!url) return null;
  const match = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/file/d/${match[1]}/preview`;
  }
  return null;
}

/**
 * Checks if URL is Vimeo link and converts to player.vimeo.com/video/ID
 */
export function getVimeoEmbedUrl(url: string | undefined | null): string | null {
  if (!url) return null;
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (match && match[1]) {
    return `https://player.vimeo.com/video/${match[1]}`;
  }
  return null;
}

interface UniversalVideoPlayerProps {
  src: string | undefined | null;
  title?: string;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  onPlay?: () => void;
  onPause?: () => void;
  className?: string;
  emptyMessage?: string;
}

export const UniversalVideoPlayer: React.FC<UniversalVideoPlayerProps> = ({
  src,
  title = 'Eğitim Videosu',
  videoRef,
  onPlay,
  onPause,
  className = 'w-full h-full',
  emptyMessage = 'Video kaynağı bulunamadı.'
}) => {
  if (!src || !src.trim()) {
    return (
      <div className="text-center p-8 text-slate-500 flex flex-col items-center justify-center h-full">
        <Video className="w-12 h-12 mx-auto mb-2 opacity-40" />
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  const ytEmbedUrl = getYouTubeEmbedUrl(src);
  const ytWatchUrl = getYouTubeWatchUrl(src);
  if (ytEmbedUrl) {
    return (
      <div className="relative w-full h-full flex flex-col bg-black">
        <iframe
          src={ytEmbedUrl}
          title={title}
          className="w-full h-full flex-1 border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
        {ytWatchUrl && (
          <div className="bg-slate-900/95 px-3 py-1.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-300">
            <span className="flex items-center gap-1.5 font-medium text-red-400">
              <Youtube className="w-3.5 h-3.5" />
              YouTube Eğitim Videosu Aktif
            </span>
            <a
              href={ytWatchUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold"
            >
              <span>YouTube'da Aç</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>
    );
  }

  const driveEmbedUrl = getGoogleDriveEmbedUrl(src);
  if (driveEmbedUrl) {
    return (
      <iframe
        src={driveEmbedUrl}
        title={title}
        className="w-full h-full border-0"
        allow="autoplay; fullscreen"
        allowFullScreen
      />
    );
  }

  const vimeoEmbedUrl = getVimeoEmbedUrl(src);
  if (vimeoEmbedUrl) {
    return (
      <iframe
        src={vimeoEmbedUrl}
        title={title}
        className="w-full h-full border-0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <video
      ref={videoRef}
      src={src}
      controls
      playsInline
      onPlay={onPlay}
      onPause={onPause}
      className={`${className} object-contain`}
    />
  );
};
