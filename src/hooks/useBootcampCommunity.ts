import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { BootcampCommunityTopic, BootcampMessage } from "@/types/bootcamp";

export function useBootcampCommunityTopics(bootcampId: string | undefined) {
  const [topics, setTopics] = useState<BootcampCommunityTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bootcampId) {
      fetchTopics();
    }
  }, [bootcampId]);

  const fetchTopics = async () => {
    if (!bootcampId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("bootcamp_community_topics")
        .select("*")
        .eq("bootcamp_id", bootcampId)
        .order("order_index", { ascending: true });

      if (error) throw error;
      setTopics((data as BootcampCommunityTopic[]) || []);
    } catch (err) {
      console.error("Failed to fetch topics:", err);
    } finally {
      setLoading(false);
    }
  };

  const createTopic = async (title: string, icon: string, description?: string) => {
    if (!bootcampId) return { success: false };

    try {
      const maxOrder = topics.reduce((max, t) => Math.max(max, t.order_index), 0);
      
      const { error } = await supabase
        .from("bootcamp_community_topics")
        .insert({
          bootcamp_id: bootcampId,
          title,
          icon,
          description,
          order_index: maxOrder + 1,
        });

      if (error) throw error;
      await fetchTopics();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const updateTopic = async (topicId: string, updates: Partial<BootcampCommunityTopic>) => {
    try {
      const { error } = await supabase
        .from("bootcamp_community_topics")
        .update(updates)
        .eq("id", topicId);

      if (error) throw error;
      await fetchTopics();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const deleteTopic = async (topicId: string) => {
    try {
      const { error } = await supabase
        .from("bootcamp_community_topics")
        .delete()
        .eq("id", topicId);

      if (error) throw error;
      await fetchTopics();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  return { topics, loading, refetch: fetchTopics, createTopic, updateTopic, deleteTopic };
}

export function useBootcampTopicMessages(bootcampId: string | undefined, topicId: string | null) {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<BootcampMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bootcampId) return;

    // Initial fetch
    fetchMessages();

    // Set up realtime subscription
    const channel = supabase
      .channel(`bootcamp-topic-messages-${bootcampId}-${topicId || 'all'}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bootcamp_messages",
          filter: `bootcamp_id=eq.${bootcampId}`,
        },
        (payload) => {
          const newMessage = payload.new as BootcampMessage;
          // Only add if matches current topic filter
          if (topicId === null || newMessage.topic_id === topicId) {
            setMessages((prev) => [...prev, newMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bootcampId, topicId]);

  const fetchMessages = async () => {
    if (!bootcampId) return;

    try {
      setLoading(true);
      
      let query = supabase
        .from("bootcamp_messages")
        .select("*")
        .eq("bootcamp_id", bootcampId)
        .order("created_at", { ascending: true })
        .limit(100);

      if (topicId) {
        query = query.eq("topic_id", topicId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMessages((data as BootcampMessage[]) || []);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (message: string, messageType: string = "message") => {
    if (!bootcampId || !user?.id || !topicId) return { success: false };

    try {
      const { error } = await supabase
        .from("bootcamp_messages")
        .insert({
          bootcamp_id: bootcampId,
          topic_id: topicId,
          user_id: user.id,
          user_name: profile?.full_name || "Anonymous",
          user_avatar: profile?.avatar_url,
          message,
          message_type: messageType,
        });

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  return { messages, loading, sendMessage, refetch: fetchMessages };
}
