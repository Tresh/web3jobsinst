import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UseVoiceRecorderOptions {
  bootcampId: string;
  onRecordingComplete?: (url: string, duration: number) => void;
}

export const useVoiceRecorder = ({ bootcampId, onRecordingComplete }: UseVoiceRecorderOptions) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4",
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      startTimeRef.current = Date.now();
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRecordingDuration(0);
      
      // Update duration counter
      intervalRef.current = setInterval(() => {
        setRecordingDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 100);
      
    } catch (error) {
      console.error("Failed to start recording:", error);
      toast.error("Could not access microphone");
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (!mediaRecorderRef.current) return;
    
    const mediaRecorder = mediaRecorderRef.current;
    
    return new Promise<void>((resolve) => {
      mediaRecorder.onstop = async () => {
        // Clear interval
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        
        // Stop all tracks
        mediaRecorder.stream.getTracks().forEach((track) => track.stop());
        
        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
        
        // Minimum 1 second recording
        if (duration < 1) {
          setIsRecording(false);
          setRecordingDuration(0);
          toast.error("Recording too short");
          resolve();
          return;
        }
        
        setIsUploading(true);
        
        try {
          const blob = new Blob(chunksRef.current, { 
            type: mediaRecorder.mimeType || "audio/webm" 
          });
          
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Not authenticated");
          
          const fileName = `${user.id}/${bootcampId}/${Date.now()}.webm`;
          
          const { data, error } = await supabase.storage
            .from("bootcamp-voice-notes")
            .upload(fileName, blob, {
              contentType: "audio/webm",
              upsert: false,
            });
          
          if (error) throw error;
          
          const { data: urlData } = supabase.storage
            .from("bootcamp-voice-notes")
            .getPublicUrl(data.path);
          
          onRecordingComplete?.(urlData.publicUrl, duration);
          
        } catch (error) {
          console.error("Failed to upload voice note:", error);
          toast.error("Failed to send voice note");
        } finally {
          setIsRecording(false);
          setIsUploading(false);
          setRecordingDuration(0);
        }
        
        resolve();
      };
      
      mediaRecorder.stop();
    });
  }, [bootcampId, onRecordingComplete]);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      mediaRecorderRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    chunksRef.current = [];
    setIsRecording(false);
    setRecordingDuration(0);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return {
    isRecording,
    recordingDuration,
    formattedDuration: formatDuration(recordingDuration),
    isUploading,
    startRecording,
    stopRecording,
    cancelRecording,
  };
};
