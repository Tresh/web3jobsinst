import { useState, useCallback } from "react";
import { Mic, X, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceRecordButtonProps {
  isRecording: boolean;
  isUploading: boolean;
  formattedDuration: string;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onCancelRecording: () => void;
}

const VoiceRecordButton = ({
  isRecording,
  isUploading,
  formattedDuration,
  onStartRecording,
  onStopRecording,
  onCancelRecording,
}: VoiceRecordButtonProps) => {
  const [isHolding, setIsHolding] = useState(false);

  const handleMouseDown = useCallback(() => {
    setIsHolding(true);
    onStartRecording();
  }, [onStartRecording]);

  const handleMouseUp = useCallback(() => {
    if (isHolding && isRecording) {
      setIsHolding(false);
      onStopRecording();
    }
  }, [isHolding, isRecording, onStopRecording]);

  const handleMouseLeave = useCallback(() => {
    // If user drags away while holding, cancel
    if (isHolding && isRecording) {
      setIsHolding(false);
      onCancelRecording();
    }
  }, [isHolding, isRecording, onCancelRecording]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsHolding(true);
    onStartRecording();
  }, [onStartRecording]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (isHolding && isRecording) {
      setIsHolding(false);
      onStopRecording();
    }
  }, [isHolding, isRecording, onStopRecording]);

  if (isUploading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-full">
        <Loader2 className="w-4 h-4 animate-spin text-primary" />
        <span className="text-xs text-primary">Sending...</span>
      </div>
    );
  }

  if (isRecording) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 bg-destructive/10 rounded-full animate-pulse">
        <button
          onClick={onCancelRecording}
          className="p-1.5 rounded-full bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
          <span className="text-sm font-medium text-destructive tabular-nums">
            {formattedDuration}
          </span>
        </div>
        
        <button
          onClick={onStopRecording}
          className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary-hover transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={cn(
        "p-2.5 rounded-full transition-all touch-none select-none",
        "bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground",
        "active:scale-110 active:bg-primary active:text-primary-foreground"
      )}
      title="Hold to record voice note"
    >
      <Mic className="w-5 h-5" />
    </button>
  );
};

export default VoiceRecordButton;
