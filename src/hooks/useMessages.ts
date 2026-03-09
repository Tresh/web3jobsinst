import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Conversation {
  id: string;
  participant_one: string;
  participant_two: string;
  last_message_at: string;
  created_at: string;
  other_user?: {
    user_id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  last_message?: string;
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export const useConversations = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const clearedIds = useRef<Set<string>>(new Set());
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const clearConversationUnread = useCallback((conversationId: string) => {
    clearedIds.current.add(conversationId);
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unread_count: 0 } : c))
    );
  }, []);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    
    const { data: convos, error } = await supabase
      .from("conversations")
      .select("*")
      .or(`participant_one.eq.${user.id},participant_two.eq.${user.id}`)
      .order("last_message_at", { ascending: false });

    if (error || !convos) { setLoading(false); return; }

    const convoIds = convos.map(c => c.id);
    if (convoIds.length === 0) { setConversations([]); setLoading(false); return; }

    const { data: messageCounts } = await supabase
      .from("messages")
      .select("conversation_id")
      .in("conversation_id", convoIds);

    const convoIdsWithMessages = new Set((messageCounts || []).map(m => m.conversation_id));
    const nonEmptyConvos = convos.filter(c => convoIdsWithMessages.has(c.id));

    const otherUserIds = nonEmptyConvos.map(c => 
      c.participant_one === user.id ? c.participant_two : c.participant_one
    );

    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name, avatar_url")
      .in("user_id", otherUserIds);

    const enriched = await Promise.all(nonEmptyConvos.map(async (c) => {
      const otherUserId = c.participant_one === user.id ? c.participant_two : c.participant_one;
      const otherProfile = profiles?.find(p => p.user_id === otherUserId);

      const { data: lastMsg } = await supabase
        .from("messages")
        .select("content")
        .eq("conversation_id", c.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      // If this conversation was recently cleared, keep unread at 0
      if (clearedIds.current.has(c.id)) {
        return {
          ...c,
          other_user: otherProfile ? {
            user_id: otherProfile.user_id,
            full_name: otherProfile.full_name,
            avatar_url: otherProfile.avatar_url,
          } : { user_id: otherUserId, full_name: null, avatar_url: null },
          last_message: lastMsg?.content || "",
          unread_count: 0,
        };
      }

      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("conversation_id", c.id)
        .eq("is_read", false)
        .neq("sender_id", user.id);

      return {
        ...c,
        other_user: otherProfile ? {
          user_id: otherProfile.user_id,
          full_name: otherProfile.full_name,
          avatar_url: otherProfile.avatar_url,
        } : { user_id: otherUserId, full_name: null, avatar_url: null },
        last_message: lastMsg?.content || "",
        unread_count: count || 0,
      };
    }));

    setConversations(enriched);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  // Real-time with debounce to prevent race conditions with markAsRead
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("conversations-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
          fetchConversations();
        }, 800);
      })
      .subscribe();

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      supabase.removeChannel(channel);
    };
  }, [user, fetchConversations]);

  return { conversations, loading, refetch: fetchConversations, clearConversationUnread };
};

export const useChat = (conversationId: string | null) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    setLoading(true);
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    setMessages((data || []) as Message[]);
    setLoading(false);
  }, [conversationId]);

  const markAsRead = useCallback(async () => {
    if (!user || !conversationId) return;
    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("conversation_id", conversationId)
      .neq("sender_id", user.id)
      .eq("is_read", false);
  }, [conversationId, user]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  // Mark as read on mount and when messages change
  useEffect(() => {
    if (conversationId && user) {
      // Small delay to ensure DB is ready
      const timer = setTimeout(() => markAsRead(), 300);
      return () => clearTimeout(timer);
    }
  }, [conversationId, user, messages.length, markAsRead]);

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        const newMsg = payload.new as Message;
        setMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        // Mark incoming messages as read immediately
        if (user && newMsg.sender_id !== user.id) {
          supabase.from("messages").update({ is_read: true }).eq("id", newMsg.id);
        }
      })
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        const updatedMsg = payload.new as Message;
        setMessages(prev => prev.map(m => (m.id === updatedMsg.id ? updatedMsg : m)));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId, user]);

  const sendMessage = async (content: string) => {
    if (!user || !conversationId || !content.trim()) return;
    await supabase.from("messages").insert({
      conversation_id: conversationId, sender_id: user.id, content: content.trim(),
    });
    await supabase.from("conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", conversationId);
  };

  return { messages, loading, sendMessage, markAsRead };
};

export const useStartConversation = () => {
  const { user } = useAuth();

  const startConversation = async (otherUserId: string): Promise<string | null> => {
    if (!user) return null;
    const [p1, p2] = [user.id, otherUserId].sort();
    const { data: existing } = await supabase
      .from("conversations").select("id")
      .eq("participant_one", p1).eq("participant_two", p2).maybeSingle();
    if (existing) return existing.id;
    const { data: newConvo, error } = await supabase
      .from("conversations").insert({ participant_one: p1, participant_two: p2 })
      .select("id").single();
    if (error) return null;
    return newConvo.id;
  };

  return { startConversation };
};

export const useTotalUnreadCount = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) { setUnreadCount(0); return; }

    const { data: convos } = await supabase
      .from("conversations").select("id")
      .or(`participant_one.eq.${user.id},participant_two.eq.${user.id}`);

    if (!convos || convos.length === 0) { setUnreadCount(0); return; }

    const { count } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .in("conversation_id", convos.map(c => c.id))
      .eq("is_read", false)
      .neq("sender_id", user.id);

    setUnreadCount(count || 0);
  }, [user]);

  useEffect(() => { fetchUnreadCount(); }, [fetchUnreadCount]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("unread-count-global")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => fetchUnreadCount(), 1000);
      })
      .subscribe();

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      supabase.removeChannel(channel);
    };
  }, [user, fetchUnreadCount]);

  return { unreadCount, refetch: fetchUnreadCount };
};
