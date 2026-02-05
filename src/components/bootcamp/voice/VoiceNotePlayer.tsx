import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceNotePlayerProps {
  url: string;
  duration: number;
  className?: string;
  variant?: "sent" | "received";
}

const VoiceNotePlayer = ({ url, duration, className, variant = "received" }: VoiceNotePlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const cyclePlaybackRate = () => {
    const rates = [1, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Generate waveform bars (visual representation)
  const waveformBars = Array.from({ length: 24 }, (_, i) => {
    const height = 20 + Math.sin(i * 0.8) * 15 + Math.random() * 10;
    const isActive = (i / 24) * 100 < progress;
    return { height, isActive };
  });

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-2xl px-3 py-2 min-w-[180px] max-w-[260px]",
        variant === "sent" 
          ? "bg-primary text-primary-foreground" 
          : "bg-muted",
        className
      )}
    >
      <audio ref={audioRef} src={url} preload="metadata" />
      
      {/* Play/Pause Button */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-8 w-8 shrink-0 rounded-full",
          variant === "sent" 
            ? "bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground" 
            : "bg-background hover:bg-background/80"
        )}
        onClick={togglePlay}
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4 ml-0.5" />
        )}
      </Button>

      {/* Waveform */}
      <div className="flex-1 flex items-center gap-[2px] h-8">
        {waveformBars.map((bar, i) => (
          <div
            key={i}
            className={cn(
              "w-[2px] rounded-full transition-colors",
              bar.isActive
                ? variant === "sent"
                  ? "bg-primary-foreground"
                  : "bg-primary"
                : variant === "sent"
                ? "bg-primary-foreground/40"
                : "bg-muted-foreground/40"
            )}
            style={{ height: `${bar.height}%` }}
          />
        ))}
      </div>

      {/* Time & Speed */}
      <div className="flex flex-col items-end gap-0.5 shrink-0">
        <span className={cn(
          "text-[10px] font-medium",
          variant === "sent" ? "text-primary-foreground/80" : "text-muted-foreground"
        )}>
          {formatTime(isPlaying ? currentTime : duration)}
        </span>
        <button
          onClick={cyclePlaybackRate}
          className={cn(
            "text-[9px] font-bold px-1.5 rounded",
            variant === "sent"
              ? "bg-primary-foreground/20 text-primary-foreground"
              : "bg-muted-foreground/20 text-muted-foreground"
          )}
        >
          {playbackRate}x
        </button>
      </div>
    </div>
  );
};

export default VoiceNotePlayer;
