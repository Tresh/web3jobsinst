import { useState, useEffect, useCallback } from "react";
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

  // Optimistic: immediately zero the unread badge when the user opens a conversation
  const clearConversationUnread = (conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unread_count: 0 } : c))
    );
  };

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    
    const { data: convos, error } = await supabase
      .from("conversations")
      .select("*")
      .or(`participant_one.eq.${user.id},participant_two.eq.${user.id}`)
      .order("last_message_at", { ascending: false });

    if (error || !convos) {
      setLoading(false);
      return;
    }

    // Get other user profiles
    const otherUserIds = convos.map(c => 
      c.participant_one === user.id ? c.participant_two : c.participant_one
    );

    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name, avatar_url")
      .in("user_id", otherUserIds);

    // Get last message and unread count for each conversation
    const enriched = await Promise.all(convos.map(async (c) => {
      const otherUserId = c.participant_one === user.id ? c.participant_two : c.participant_one;
      const otherProfile = profiles?.find(p => p.user_id === otherUserId);

      const { data: lastMsg } = await supabase
        .from("messages")
        .select("content")
        .eq("conversation_id", c.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

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

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Real-time subscription for new messages
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("conversations-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => {
        fetchConversations();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
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

    // Mark as read
    if (user) {
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("conversation_id", conversationId)
        .neq("sender_id", user.id)
        .eq("is_read", false);
    }
  }, [conversationId, user]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Real-time
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        const newMsg = payload.new as Message;
        setMessages(prev => [...prev, newMsg]);
        // Mark as read if not sender
        if (user && newMsg.sender_id !== user.id) {
          supabase
            .from("messages")
            .update({ is_read: true })
            .eq("id", newMsg.id);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId, user]);

  const sendMessage = async (content: string) => {
    if (!user || !conversationId || !content.trim()) return;

    await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: content.trim(),
    });

    // Update conversation last_message_at
    await supabase
      .from("conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", conversationId);
  };

  return { messages, loading, sendMessage };
};

export const useStartConversation = () => {
  const { user } = useAuth();

  const startConversation = async (otherUserId: string): Promise<string | null> => {
    if (!user) return null;

    // Ensure consistent ordering
    const [p1, p2] = [user.id, otherUserId].sort();

    // Check existing
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("participant_one", p1)
      .eq("participant_two", p2)
      .maybeSingle();

    if (existing) return existing.id;

    // Create new
    const { data: newConvo, error } = await supabase
      .from("conversations")
      .insert({ participant_one: p1, participant_two: p2 })
      .select("id")
      .single();

    if (error) {
      console.error("Error creating conversation:", error);
      return null;
    }

    return newConvo.id;
  };

  return { startConversation };
};
