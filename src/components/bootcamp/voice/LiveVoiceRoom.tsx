import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Hand,
  Check,
  X,
  Radio,
  Users,
  Settings,
  MoreVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBootcampVoiceRoom } from "@/hooks/useBootcampVoiceRoom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LiveVoiceRoomProps {
  bootcampId: string;
  isHost: boolean;
}

const LiveVoiceRoom = ({ bootcampId, isHost }: LiveVoiceRoomProps) => {
  const {
    activeRoom,
    participants,
    speakRequests,
    loading,
    isConnected,
    isMuted,
    canSpeak,
    myParticipation,
    startRoom,
    endRoom,
    joinRoom,
    leaveRoom,
    requestToSpeak,
    approveSpeakRequest,
    rejectSpeakRequest,
    toggleMute,
    muteParticipant,
    removeParticipant,
  } = useBootcampVoiceRoom(bootcampId);

  const [showStartDialog, setShowStartDialog] = useState(false);
  const [roomTitle, setRoomTitle] = useState("Live Voice Chat");
  const [enableRecording, setEnableRecording] = useState(false);

  const handleStartRoom = async () => {
    const result = await startRoom(roomTitle, enableRecording);
    if (result.success) {
      setShowStartDialog(false);
    }
  };

  // Floating pill for active room
  if (activeRoom && !isConnected) {
    return (
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50">
        <button
          onClick={joinRoom}
          className="flex items-center gap-3 px-4 py-2.5 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-all animate-pulse"
        >
          <Radio className="w-4 h-4" />
          <span className="font-medium text-sm">{activeRoom.title}</span>
          <Badge variant="secondary" className="bg-white/20 text-white text-xs">
            {participants.length} listening
          </Badge>
        </button>
      </div>
    );
  }

  // Active room UI
  if (activeRoom && isConnected) {
    const speakers = participants.filter((p) => p.role === "host" || p.role === "speaker");
    const listeners = participants.filter((p) => p.role === "listener");

    return (
      <div className="fixed inset-x-0 bottom-0 z-50 bg-background/95 backdrop-blur border-t shadow-2xl">
        {/* Expanded Room View */}
        <div className="max-w-lg mx-auto px-4 py-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-green-500 animate-pulse" />
              <h3 className="font-semibold text-sm">{activeRoom.title}</h3>
              {activeRoom.is_recording && (
                <Badge variant="destructive" className="text-[10px]">
                  REC
                </Badge>
              )}
            </div>
            <Badge variant="secondary" className="text-xs">
              <Users className="w-3 h-3 mr-1" />
              {participants.length}
            </Badge>
          </div>

          {/* Speakers */}
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">Speaking</p>
            <div className="flex flex-wrap gap-3">
              {speakers.map((p) => (
                <div key={p.id} className="flex flex-col items-center">
                  <div className="relative">
                    <Avatar className={cn(
                      "w-12 h-12 border-2",
                      p.is_muted ? "border-muted" : "border-green-500"
                    )}>
                      <AvatarImage src={p.user_avatar || undefined} />
                      <AvatarFallback className="text-sm">
                        {p.user_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {p.is_muted && (
                      <div className="absolute -bottom-1 -right-1 p-1 bg-destructive rounded-full">
                        <MicOff className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 truncate max-w-[60px]">
                    {p.role === "host" ? "Host" : p.user_name.split(" ")[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Listeners (collapsed) */}
          {listeners.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-2">
                Listening ({listeners.length})
              </p>
              <div className="flex -space-x-2">
                {listeners.slice(0, 8).map((p) => (
                  <Avatar key={p.id} className="w-8 h-8 border-2 border-background">
                    <AvatarImage src={p.user_avatar || undefined} />
                    <AvatarFallback className="text-xs">
                      {p.user_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {listeners.length > 8 && (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                    +{listeners.length - 8}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Speak Requests (Host only) */}
          {isHost && speakRequests.length > 0 && (
            <div className="mb-4 p-3 bg-primary/10 rounded-lg">
              <p className="text-xs font-medium text-primary mb-2">
                <Hand className="w-3 h-3 inline mr-1" />
                Requests to speak
              </p>
              <ScrollArea className="max-h-24">
                <div className="space-y-2">
                  {speakRequests.map((req) => (
                    <div key={req.id} className="flex items-center justify-between">
                      <span className="text-sm">{req.user_name}</span>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => approveSpeakRequest(req.id, req.user_id)}
                        >
                          <Check className="w-3 h-3 text-green-500" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => rejectSpeakRequest(req.id)}
                        >
                          <X className="w-3 h-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            {canSpeak && (
              <Button
                variant={isMuted ? "outline" : "default"}
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={toggleMute}
              >
                {isMuted ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </Button>
            )}

            {!canSpeak && myParticipation?.role === "listener" && (
              <Button
                variant="outline"
                size="sm"
                onClick={requestToSpeak}
                className="gap-2"
              >
                <Hand className="w-4 h-4" />
                Request to speak
              </Button>
            )}

            {isHost ? (
              <Button
                variant="destructive"
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={endRoom}
              >
                <PhoneOff className="w-5 h-5" />
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={leaveRoom}
              >
                <Phone className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Host: Start Room Button
  if (isHost && !activeRoom) {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => setShowStartDialog(true)}
        >
          <Radio className="w-4 h-4" />
          Start Live
        </Button>

        <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Start Live Voice Room</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Room Title</Label>
                <Input
                  value={roomTitle}
                  onChange={(e) => setRoomTitle(e.target.value)}
                  placeholder="e.g., Q&A Session"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="recording">Record session</Label>
                <Switch
                  id="recording"
                  checked={enableRecording}
                  onCheckedChange={setEnableRecording}
                />
              </div>
              <Button onClick={handleStartRoom} className="w-full gap-2">
                <Radio className="w-4 h-4" />
                Go Live
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return null;
};

export default LiveVoiceRoom;
