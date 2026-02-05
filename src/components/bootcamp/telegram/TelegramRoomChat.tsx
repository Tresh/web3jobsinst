import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBootcampTopicMessages } from "@/hooks/useBootcampCommunity";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ArrowLeft, Send, Pin, Lock, MoreVertical, Smile } from "lucide-react";
import { format, isToday, isYesterday, isSameDay } from "date-fns";
import type { Bootcamp, BootcampCommunityTopic } from "@/types/bootcamp";

interface TelegramRoomChatProps {
  bootcamp: Bootcamp;
  topic: BootcampCommunityTopic;
  isCompleted: boolean;
  onBack: () => void;
}

const TelegramRoomChat = ({ bootcamp, topic, isCompleted, onBack }: TelegramRoomChatProps) => {
  const { user } = useAuth();
  const { messages, loading, sendMessage } = useBootcampTopicMessages(bootcamp.id, topic.id);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    if (topic.is_locked) {
      toast.error("This room is locked");
      return;
    }

    setSending(true);
    const result = await sendMessage(newMessage.trim());
    setSending(false);

    if (result.success) {
      setNewMessage("");
      inputRef.current?.focus();
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

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "h:mm a");
  };

  const formatDateSeparator = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMMM d, yyyy");
  };

  const pinnedMessages = messages.filter((m) => m.is_pinned);
  const regularMessages = messages.filter((m) => !m.is_pinned);

  // Group messages by date
  const groupedMessages: { date: string; messages: typeof regularMessages }[] = [];
  regularMessages.forEach((msg) => {
    const dateKey = format(new Date(msg.created_at), "yyyy-MM-dd");
    const lastGroup = groupedMessages[groupedMessages.length - 1];
    if (lastGroup && lastGroup.date === dateKey) {
      lastGroup.messages.push(msg);
    } else {
      groupedMessages.push({ date: dateKey, messages: [msg] });
    }
  });

  return (
    <div className="flex flex-col h-full min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg shrink-0">
              {topic.icon || "💬"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-semibold truncate">{topic.title}</h1>
                {topic.is_locked && <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
                {isCompleted && (
                  <Badge variant="secondary" className="text-xs">
                    <Lock className="w-3 h-3 mr-1" />
                    Archived
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {topic.description || bootcamp.title}
              </p>
            </div>
            <Button variant="ghost" size="icon" className="shrink-0">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Pinned Messages */}
        {pinnedMessages.length > 0 && (
          <div className="px-4 py-2 bg-primary/5 border-t border-primary/10">
            {pinnedMessages.slice(0, 1).map((msg) => (
              <div key={msg.id} className="flex items-start gap-2 text-sm">
                <Pin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="truncate">
                  <span className="font-medium text-primary">{msg.user_name}:</span>{" "}
                  <span className="text-muted-foreground">{msg.message}</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </header>

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4" ref={scrollRef}>
        {loading ? (
          <div className="flex items-center justify-center h-full py-12">
            <p className="text-muted-foreground">Loading messages...</p>
          </div>
        ) : regularMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4 text-3xl">
              {topic.icon || "💬"}
            </div>
            <h3 className="font-medium text-foreground mb-1">{topic.title}</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              {!isCompleted && !topic.is_locked
                ? "Be the first to start the conversation!"
                : topic.is_locked
                ? "This room is locked"
                : "This bootcamp has ended"}
            </p>
          </div>
        ) : (
          <div className="py-4 space-y-4">
            {groupedMessages.map((group) => (
              <div key={group.date}>
                {/* Date Separator */}
                <div className="flex items-center justify-center my-4">
                  <span className="px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground">
                    {formatDateSeparator(group.messages[0].created_at)}
                  </span>
                </div>

                {/* Messages */}
                <div className="space-y-1">
                  {group.messages.map((msg, index) => {
                    const isOwnMessage = msg.user_id === user?.id;
                    const prevMsg = index > 0 ? group.messages[index - 1] : null;
                    const showAvatar = !prevMsg || prevMsg.user_id !== msg.user_id;
                    const showName = showAvatar && !isOwnMessage;

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} ${
                          showAvatar ? "mt-3" : "mt-0.5"
                        }`}
                      >
                        {/* Avatar (left side for others) */}
                        {!isOwnMessage && (
                          <div className="w-8 mr-2 shrink-0">
                            {showAvatar && (
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={msg.user_avatar || undefined} />
                                <AvatarFallback className="text-xs bg-muted">
                                  {msg.user_name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        )}

                        {/* Message Bubble */}
                        <div className={`max-w-[75%] ${isOwnMessage ? "items-end" : "items-start"}`}>
                          {showName && (
                            <p className="text-xs font-medium text-primary mb-1 px-1">
                              {msg.user_name}
                            </p>
                          )}
                          <div
                            className={`inline-block px-3 py-2 rounded-2xl text-sm ${
                              isOwnMessage
                                ? "bg-primary text-primary-foreground rounded-br-md"
                                : "bg-muted rounded-bl-md"
                            }`}
                          >
                            <p className="break-words whitespace-pre-wrap">{msg.message}</p>
                            <p
                              className={`text-[10px] mt-1 ${
                                isOwnMessage ? "text-primary-foreground/70" : "text-muted-foreground"
                              }`}
                            >
                              {formatMessageTime(msg.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      {!isCompleted && !topic.is_locked ? (
        <div className="sticky bottom-0 p-3 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground">
              <Smile className="w-5 h-5" />
            </Button>
            <Input
              ref={inputRef}
              placeholder="Message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={sending}
              className="flex-1 bg-muted/50 border-0 focus-visible:ring-1"
            />
            <Button
              onClick={handleSend}
              disabled={!newMessage.trim() || sending}
              size="icon"
              className={`shrink-0 transition-all ${
                newMessage.trim() ? "bg-primary" : "bg-muted text-muted-foreground"
              }`}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="sticky bottom-0 p-4 border-t bg-muted/50">
          <p className="text-sm text-muted-foreground text-center">
            {isCompleted
              ? "This bootcamp has ended. Chat is now archived."
              : "This room is locked by the host."}
          </p>
        </div>
      )}
    </div>
  );
};

export default TelegramRoomChat;
