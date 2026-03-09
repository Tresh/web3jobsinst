import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useConversations, useChat, type Conversation, type Message } from "@/hooks/useMessages";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MessageSquare, Send, ArrowLeft, Loader2, CreditCard, Smile, X, CornerUpLeft, Settings } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import ComingSoonDialog from "@/components/ComingSoonDialog";
import UserProfileModal from "@/components/messages/UserProfileModal";
import MessageSettingsDialog from "@/components/messages/MessageSettingsDialog";

const EMOJI_LIST = [
  "😀","😂","😍","🥰","😊","😎","🤔","😢","😡","🤩",
  "👍","👎","❤️","🔥","✅","⭐","🎉","💯","🙏","👏",
  "💪","🚀","💡","📌","📢","💬","✨","🎯","💰","🌍",
  "😅","🤣","😭","😤","🥳","🤝","👀","💀","🫡","🫂",
  "1️⃣","2️⃣","3️⃣","💎","🏆","📈","⚡","🌟","🎓","🛠️",
];

const DashboardMessages = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { conversations, loading, clearConversationUnread, refetch } = useConversations();
  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Auto-open conversation passed from talent contact button
  useEffect(() => {
    const openId = (location.state as { openConversationId?: string })?.openConversationId;
    if (openId && conversations.length > 0 && !activeConvo) {
      const match = conversations.find((c) => c.id === openId);
      if (match) {
        setActiveConvo(match);
        clearConversationUnread(match.id);
      }
    }
  }, [conversations, location.state, activeConvo, clearConversationUnread]);

  const handleSelectConvo = (convo: Conversation) => {
    setActiveConvo(convo);
    clearConversationUnread(convo.id);
  };

  return (
    <div className="h-[calc(100vh-64px)] lg:h-screen flex flex-col">
      {/* Header - hidden on mobile when chat is active */}
      <div className={cn(
        "p-6 border-b border-border flex items-center justify-between",
        activeConvo ? "hidden md:flex" : "flex"
      )}>
        <div>
          <h1 className="text-2xl font-bold">Messages</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)}>
          <Settings className="w-5 h-5" />
        </Button>
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
              const name = convo.other_user?.full_name || "Unknown";
              const initials = name
                .split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
              return (
                <button
                  key={convo.id}
                  onClick={() => handleSelectConvo(convo)}
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
                      <p className="font-medium text-sm truncate">{name}</p>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(convo.last_message_at), "MMM d")}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {convo.last_message || "No messages yet"}
                    </p>
                  </div>
                  {(convo.unread_count || 0) > 0 && (
                    <span className="bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
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
              onConversationUpdated={refetch}
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

      <MessageSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
};

interface ChatPanelProps {
  conversation: Conversation;
  onBack: () => void;
  currentUserId: string;
  onConversationUpdated?: () => void;
}

const ChatPanel = ({ conversation, onBack, currentUserId, onConversationUpdated }: ChatPanelProps) => {
  const { messages, loading, sendMessage, markAsRead } = useChat(conversation.id);
  const { settings: otherUserSettings } = useOtherUserMessageSettings(conversation.other_user?.user_id || null);
  const [input, setInput] = useState("");
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [payComingSoon, setPayComingSoon] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark messages as read when conversation is opened
  useEffect(() => {
    markAsRead();
  }, [markAsRead]);

  const handleSend = async () => {
    if (!input.trim()) return;
    let text = input.trim();
    if (replyingTo) {
      // Pick only the last non-quoted part of the message to avoid nesting
      const parts = replyingTo.content.split("\n\n");
      const lastBody = parts.filter(p => !p.startsWith("> ")).pop() || replyingTo.content;
      const preview = lastBody.length > 60 ? lastBody.slice(0, 60) + "…" : lastBody;
      text = `> ${preview}\n\n${text}`;
    }
    setInput("");
    setReplyingTo(null);
    await sendMessage(text);
    onConversationUpdated?.();
  };

  const handleEmojiSelect = (emoji: string) => {
    setInput((prev) => prev + emoji);
    setEmojiOpen(false);
    inputRef.current?.focus();
  };

  const otherUser = conversation.other_user;
  const name = otherUser?.full_name || "Unknown";
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <>
      {/* Chat Header */}
      <div className="p-4 border-b border-border flex items-center gap-3">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <button
          onClick={() => setProfileModalOpen(true)}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <Avatar className="w-9 h-9">
            <AvatarImage src={otherUser?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
          <p className="font-semibold hover:text-primary transition-colors">{name}</p>
        </button>
        <div className="flex-1" />
        <Button size="sm" variant="outline" onClick={() => setPayComingSoon(true)} className="gap-2">
          <CreditCard className="w-4 h-4" />
          <span className="hidden sm:inline">Pay for Service</span>
        </Button>
      </div>

      {/* Disclaimer from other user */}
      {otherUserSettings?.disclaimer_text && (
        <div className="px-4 py-2 bg-muted/50 border-b border-border">
          <p className="text-xs text-muted-foreground italic">
            ℹ️ {otherUserSettings.disclaimer_text}
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        )}
        {messages.map((msg) => {
          const isMine = msg.sender_id === currentUserId;
          const parts = msg.content.split("\n\n");
          const hasReply = parts.length >= 2 && parts[0].startsWith("> ");
          const quotedText = hasReply ? parts[0].slice(2) : null;
          const bodyText = hasReply ? parts.slice(1).join("\n\n") : msg.content;

          return (
            <div key={msg.id}
              className={cn("flex group items-end gap-1", isMine ? "justify-end" : "justify-start")}>
              {!isMine && (
                <button
                  onClick={() => { setReplyingTo(msg); inputRef.current?.focus(); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-secondary mb-1 order-last"
                  title="Reply"
                >
                  <CornerUpLeft className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              )}
              <div className={cn(
                "max-w-[75%] px-4 py-2 rounded-2xl text-sm",
                isMine
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-secondary text-foreground rounded-bl-md"
              )}>
                {quotedText && (
                  <div className={cn(
                    "text-xs border-l-2 pl-2 mb-2 opacity-70 line-clamp-2",
                    isMine ? "border-primary-foreground/50" : "border-primary/50"
                  )}>
                    {quotedText}
                  </div>
                )}
                <p className="whitespace-pre-wrap break-words">{bodyText}</p>
                <p className={cn(
                  "text-[10px] mt-1",
                  isMine ? "text-primary-foreground/70" : "text-muted-foreground"
                )}>
                  {format(new Date(msg.created_at), "h:mm a")}
                </p>
              </div>
              {isMine && (
                <button
                  onClick={() => { setReplyingTo(msg); inputRef.current?.focus(); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-secondary mb-1"
                  title="Reply"
                >
                  <CornerUpLeft className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Reply preview bar */}
      {replyingTo && (
        <div className="px-4 py-2 border-t border-border flex items-center gap-2 bg-secondary/40">
          <CornerUpLeft className="w-4 h-4 text-primary flex-shrink-0" />
          <p className="text-xs text-muted-foreground truncate flex-1">
            {replyingTo.content.length > 80
              ? replyingTo.content.slice(0, 80) + "…"
              : replyingTo.content}
          </p>
          <button onClick={() => setReplyingTo(null)}>
            <X className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
          </button>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex items-center gap-2">
          <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
            <PopoverTrigger asChild>
              <Button type="button" variant="ghost" size="icon" className="flex-shrink-0 text-muted-foreground">
                <Smile className="w-5 h-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent side="top" align="start" className="w-64 p-2">
              <div className="grid grid-cols-10 gap-0.5">
                {EMOJI_LIST.map((emoji) => (
                  <button key={emoji} type="button" onClick={() => handleEmojiSelect(emoji)}
                    className="text-lg p-1 rounded hover:bg-secondary transition-colors leading-none">
                    {emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <Input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..." className="flex-1" />
          <Button type="submit" size="icon" disabled={!input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>

      <ComingSoonDialog open={payComingSoon} onOpenChange={setPayComingSoon}
        title="Pay for Service — Coming Soon" />

      <UserProfileModal open={profileModalOpen} onOpenChange={setProfileModalOpen}
        userId={otherUser?.user_id || null}
        onBackToChat={() => setProfileModalOpen(false)} />
    </>
  );
};

// Hook to fetch another user's message settings (disclaimer, auto-reply)
const useOtherUserMessageSettings = (userId: string | null) => {
  const [settings, setSettings] = useState<{
    disclaimer_text: string | null;
    auto_reply_message: string | null;
    allow_messages_from: string;
  } | null>(null);

  useEffect(() => {
    if (!userId) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("message_settings")
        .select("disclaimer_text, auto_reply_message, allow_messages_from")
        .eq("user_id", userId)
        .maybeSingle();
      setSettings(data as typeof settings);
    };
    fetch();
  }, [userId]);

  return { settings };
};

export default DashboardMessages;
