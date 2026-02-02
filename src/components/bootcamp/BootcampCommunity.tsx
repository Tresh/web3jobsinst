import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBootcampMessages } from "@/hooks/useBootcamps";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Send, Pin, MessageCircle, Lock } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";

interface BootcampCommunityProps {
  bootcampId: string;
  isCompleted: boolean;
}

const BootcampCommunity = ({ bootcampId, isCompleted }: BootcampCommunityProps) => {
  const { user } = useAuth();
  const { messages, loading, sendMessage } = useBootcampMessages(bootcampId);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

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

  return (
    <div className="space-y-6">
      {/* Pinned Messages */}
      {pinnedMessages.length > 0 && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Pin className="w-4 h-4" />
              Pinned Announcements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pinnedMessages.map((msg) => (
              <div key={msg.id} className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">{msg.user_name}</span>
                  <Badge variant="outline" className="text-xs">Host</Badge>
                </div>
                <p className="text-sm">{msg.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatMessageDate(msg.created_at)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Chat */}
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="py-3 border-b shrink-0">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Community Chat
            {isCompleted && (
              <Badge variant="secondary" className="ml-2">
                <Lock className="w-3 h-3 mr-1" />
                Read Only
              </Badge>
            )}
          </CardTitle>
        </CardHeader>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Loading messages...</p>
            </div>
          ) : regularMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageCircle className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No messages yet.</p>
              {!isCompleted && (
                <p className="text-sm text-muted-foreground">Be the first to say hello!</p>
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
        {!isCompleted ? (
          <div className="p-4 border-t shrink-0">
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
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
              This bootcamp has ended. The community chat is now read-only.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default BootcampCommunity;
