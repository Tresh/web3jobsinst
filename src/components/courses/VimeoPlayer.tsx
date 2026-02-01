import { useEffect, useRef, useState, useCallback } from 'react';
import { getVimeoPlayerUrl } from '@/types/strapi';
import { cn } from '@/lib/utils';
import { Loader2, Play, Lock } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface VimeoPlayerProps {
  videoId: string;
  title?: string;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  className?: string;
  aspectRatio?: number;
  isLocked?: boolean;
  onLockedClick?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: (seconds: number, duration: number) => void;
}

/**
 * Vimeo Video Player Component
 * 
 * Uses iframe embed for Vimeo videos with configurable options.
 * Supports locked state for paid/cohort-only content.
 */
const VimeoPlayer = ({
  videoId,
  title,
  autoplay = false,
  muted = false,
  loop = false,
  controls = true,
  className,
  aspectRatio = 16 / 9,
  isLocked = false,
  onLockedClick,
  onPlay,
  onPause,
  onEnded,
  onTimeUpdate,
}: VimeoPlayerProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Generate the embed URL with options
  const embedUrl = getVimeoPlayerUrl(videoId, {
    autoplay,
    muted,
    loop,
    controls,
  });

  // Handle iframe load
  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  // Handle iframe error
  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  // Listen for Vimeo player events via postMessage
  useEffect(() => {
    if (!iframeRef.current) return;

    const handleMessage = (event: MessageEvent) => {
      // Verify origin is Vimeo
      if (!event.origin.includes('vimeo.com')) return;

      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        
        if (data.event === 'play') {
          onPlay?.();
        } else if (data.event === 'pause') {
          onPause?.();
        } else if (data.event === 'ended') {
          onEnded?.();
        } else if (data.event === 'timeupdate' && data.data) {
          onTimeUpdate?.(data.data.seconds, data.data.duration);
        }
      } catch {
        // Ignore non-JSON messages
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onPlay, onPause, onEnded, onTimeUpdate]);

  // Locked state overlay
  if (isLocked) {
    return (
      <div className={cn('relative overflow-hidden rounded-lg bg-muted', className)}>
        <AspectRatio ratio={aspectRatio}>
          <div 
            className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm cursor-pointer hover:bg-background/70 transition-colors"
            onClick={onLockedClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onLockedClick?.()}
          >
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">This lesson is locked</p>
            <p className="text-xs text-muted-foreground mt-1">Enroll to access</p>
          </div>
        </AspectRatio>
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden rounded-lg bg-muted', className)}>
      <AspectRatio ratio={aspectRatio}>
        {/* Loading state */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Error state */}
        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted z-10">
            <Play className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Failed to load video</p>
          </div>
        )}

        {/* Vimeo iframe */}
        <iframe
          ref={iframeRef}
          src={embedUrl}
          title={title || 'Video player'}
          className="absolute inset-0 w-full h-full"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
          allowFullScreen
          onLoad={handleLoad}
          onError={handleError}
        />
      </AspectRatio>
    </div>
  );
};

export default VimeoPlayer;
