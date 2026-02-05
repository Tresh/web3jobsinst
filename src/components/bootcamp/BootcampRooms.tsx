import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBootcampCommunityTopics, useBootcampTopicMessages } from "@/hooks/useBootcampCommunity";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Send, Pin, MessageCircle, Lock, Hash, Users, ChevronLeft } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import type { BootcampCommunityTopic } from "@/types/bootcamp";

interface BootcampRoomsProps {
  bootcampId: string;
  isCompleted: boolean;
}

const BootcampRooms = ({ bootcampId, isCompleted }: BootcampRoomsProps) => {
  const { user } = useAuth();
  const { topics, loading: loadingTopics } = useBootcampCommunityTopics(bootcampId);
  const [selectedTopic, setSelectedTopic] = useState<BootcampCommunityTopic | null>(null);
  const [showRoomList, setShowRoomList] = useState(true);

  const { messages, loading: loadingMessages, sendMessage } = useBootcampTopicMessages(
    bootcampId,
    selectedTopic?.id || null
  );

  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSelectRoom = (topic: BootcampCommunityTopic) => {
    setSelectedTopic(topic);
    setShowRoomList(false);
  };

  const handleBackToRooms = () => {
    setShowRoomList(true);
    setSelectedTopic(null);
  };

  const handleSend = async () => {
    if (!newMessage.trim() || sending || !selectedTopic) return;

    if (selectedTopic.is_locked) {
      toast.error("This room is locked");
      return;
    }

    setSending(true);
    const result = await sendMessage(newMessage.trim());
    setSending(false);

    if (result.success) {
      setNewMessage("");
    } else {
      toast.error("Failed to send message");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return format(date, "h:mm a");
    }
    if (isYesterday(date)) {
      return `Yesterday ${format(date, "h:mm a")}`;
    }
    return format(date, "MMM d, h:mm a");
  };

  const pinnedMessages = messages.filter((m) => m.is_pinned);
  const regularMessages = messages.filter((m) => !m.is_pinned);

  if (loadingTopics) {
    return (
      <Card className="h-[600px] flex items-center justify-center">
        <p className="text-muted-foreground">Loading rooms...</p>
      </Card>
    );
  }

  if (topics.length === 0) {
    return (
      <Card className="h-[600px] flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Community rooms not yet available</p>
          <p className="text-sm text-muted-foreground">Rooms will be created once the bootcamp is active</p>
        </div>
      </Card>
    );
  }

  // Room List View
  if (showRoomList) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Community Rooms
          </h3>
          <Badge variant="outline">{topics.length} rooms</Badge>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <Card
              key={topic.id}
              className={`cursor-pointer transition-all hover:shadow-md hover:border-primary/50 ${
                topic.is_locked ? "opacity-60" : ""
              }`}
              onClick={() => !topic.is_locked && handleSelectRoom(topic)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{topic.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium truncate">{topic.title}</h4>
                      {topic.is_locked && <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
                    </div>
                    {topic.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {topic.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      {topic.is_default ? (
                        <Badge variant="secondary" className="text-xs">Default</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">Custom</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Chat View
  return (
    <Card className="h-[600px] flex flex-col">
      {/* Header */}
      <CardHeader className="py-3 border-b shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={handleBackToRooms}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xl">{selectedTopic?.icon}</span>
            <CardTitle className="text-lg">{selectedTopic?.title}</CardTitle>
            {isCompleted && (
              <Badge variant="secondary" className="ml-2">
                <Lock className="w-3 h-3 mr-1" />
                Read Only
              </Badge>
            )}
            {selectedTopic?.is_locked && !isCompleted && (
              <Badge variant="secondary" className="ml-2">
                <Lock className="w-3 h-3 mr-1" />
                Locked
              </Badge>
            )}
          </div>
        </div>
        {selectedTopic?.description && (
          <p className="text-sm text-muted-foreground mt-1 ml-12">{selectedTopic.description}</p>
        )}
      </CardHeader>

      {/* Pinned Messages */}
      {pinnedMessages.length > 0 && (
        <div className="px-4 py-2 border-b bg-primary/5 shrink-0">
          {pinnedMessages.map((msg) => (
            <div key={msg.id} className="flex items-start gap-2 text-sm">
              <Pin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-medium">{msg.user_name}:</span>{" "}
                <span className="text-muted-foreground">{msg.message}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {loadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading messages...</p>
          </div>
        ) : regularMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageCircle className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No messages in this room yet.</p>
            {!isCompleted && !selectedTopic?.is_locked && (
              <p className="text-sm text-muted-foreground">Be the first to start the conversation!</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {regularMessages.map((msg) => {
              const isOwnMessage = msg.user_id === user?.id;

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isOwnMessage ? "flex-row-reverse" : ""}`}
                >
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarImage src={msg.user_avatar || undefined} />
                    <AvatarFallback className="text-xs">
                      {msg.user_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`flex-1 max-w-[70%] ${isOwnMessage ? "text-right" : ""}`}>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {!isOwnMessage && (
                        <span className="text-sm font-medium">{msg.user_name}</span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatMessageDate(msg.created_at)}
                      </span>
                    </div>
                    <div
                      className={`inline-block p-3 rounded-lg text-sm ${
                        isOwnMessage
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      {!isCompleted && selectedTopic && !selectedTopic.is_locked ? (
        <div className="p-4 border-t shrink-0">
          <div className="flex gap-2">
            <Input
              placeholder={`Message #${selectedTopic.title.toLowerCase()}...`}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={sending}
            />
            <Button
              onClick={handleSend}
              disabled={!newMessage.trim() || sending}
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-4 border-t shrink-0 bg-muted/50">
          <p className="text-sm text-muted-foreground text-center">
            {isCompleted
              ? "This bootcamp has ended. The community is now read-only."
              : selectedTopic?.is_locked
              ? "This room is locked by the host."
              : "Select a room to start chatting."}
          </p>
        </div>
      )}
    </Card>
  );
};

export default BootcampRooms;
