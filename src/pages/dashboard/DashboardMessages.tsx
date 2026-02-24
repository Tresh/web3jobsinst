import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useConversations, useChat, type Conversation } from "@/hooks/useMessages";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, ArrowLeft, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const DashboardMessages = () => {
  const { user } = useAuth();
  const { conversations, loading } = useConversations();
  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null);

  return (
    <div className="h-[calc(100vh-64px)] lg:h-screen flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Chat with talents and interns
        </p>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Conversation List */}
        <div className={cn(
          "w-full md:w-80 border-r border-border flex-shrink-0 overflow-y-auto",
          activeConvo ? "hidden md:block" : "block"
        )}>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-16 px-4">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="font-medium text-muted-foreground">No conversations yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Contact a talent or intern to start chatting
              </p>
            </div>
          ) : (
            conversations.map((convo) => {
              const initials = (convo.other_user?.full_name || "?")
                .split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
              return (
                <button
                  key={convo.id}
                  onClick={() => setActiveConvo(convo)}
                  className={cn(
                    "w-full p-4 text-left flex items-center gap-3 hover:bg-secondary/50 transition-colors border-b border-border",
                    activeConvo?.id === convo.id && "bg-secondary"
                  )}
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={convo.other_user?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm truncate">
                        {convo.other_user?.full_name || "User"}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(convo.last_message_at), "MMM d")}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {convo.last_message || "No messages yet"}
                    </p>
                  </div>
                  {(convo.unread_count || 0) > 0 && (
                    <span className="bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {convo.unread_count}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Chat Area */}
        <div className={cn(
          "flex-1 flex flex-col",
          !activeConvo ? "hidden md:flex" : "flex"
        )}>
          {activeConvo ? (
            <ChatPanel
              conversation={activeConvo}
              onBack={() => setActiveConvo(null)}
              currentUserId={user?.id || ""}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="font-medium">Select a conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface ChatPanelProps {
  conversation: Conversation;
  onBack: () => void;
  currentUserId: string;
}

const ChatPanel = ({ conversation, onBack, currentUserId }: ChatPanelProps) => {
  const { messages, loading, sendMessage } = useChat(conversation.id);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const text = input;
    setInput("");
    await sendMessage(text);
  };

  const initials = (conversation.other_user?.full_name || "?")
    .split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <>
      {/* Chat Header */}
      <div className="p-4 border-b border-border flex items-center gap-3">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Avatar className="w-9 h-9">
          <AvatarImage src={conversation.other_user?.avatar_url || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>
        <p className="font-semibold">{conversation.other_user?.full_name || "User"}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        )}
        {messages.map((msg) => {
          const isMine = msg.sender_id === currentUserId;
          return (
            <div key={msg.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[75%] px-4 py-2 rounded-2xl text-sm",
                isMine
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-secondary text-foreground rounded-bl-md"
              )}>
                <p>{msg.content}</p>
                <p className={cn(
                  "text-[10px] mt-1",
                  isMine ? "text-primary-foreground/70" : "text-muted-foreground"
                )}>
                  {format(new Date(msg.created_at), "h:mm a")}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex items-center gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </>
  );
};

export default DashboardMessages;
