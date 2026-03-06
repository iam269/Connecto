import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { Database } from "@/integrations/supabase/types";

type MessageWithProfile = Database["public"]["Tables"]["messages"]["Row"] & {
  sender_profile: {
    user_id: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
  } | null;
};

export const useConversations = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order("updated_at", { ascending: false });
      if (error) throw error;

      // Get profiles for the other users
      const otherUserIds = data.map((c) => (c.user1_id === user.id ? c.user2_id : c.user1_id));
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", otherUserIds);

      // Get last message for each conversation
      const conversationIds = data.map((c) => c.id);
      const { data: messages } = await supabase
        .from("messages")
        .select("*")
        .in("conversation_id", conversationIds)
        .order("created_at", { ascending: false });

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]));
      const lastMessageMap = new Map<string, typeof messages extends (infer T)[] ? T : never>();
      messages?.forEach((m) => {
        if (m.conversation_id && !lastMessageMap.has(m.conversation_id)) {
          lastMessageMap.set(m.conversation_id, m);
        }
      });

      return data.map((conv) => {
        const otherUserId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id;
        return {
          ...conv,
          otherUser: profileMap.get(otherUserId),
          lastMessage: lastMessageMap.get(conv.id),
        };
      });
    },
    enabled: !!user,
  });
};

export const useChatMessages = (conversationId?: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["chat-messages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const { data: msgs, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      if (error) throw error;

      const senderIds = [...new Set(msgs?.map((m) => m.sender_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, full_name, avatar_url")
        .in("user_id", senderIds);
      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]));

      return (msgs || []).map((m) => ({
        ...m,
        sender_profile: profileMap.get(m.sender_id) || null,
      }));
    },
    enabled: !!conversationId,
  });

  // Subscribe to realtime messages
  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ["chat-messages", conversationId] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId, queryClient]);

  return query;
};

export const useSendMessage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversationId, receiverId, content }: { conversationId: string; receiverId: string; content: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: user.id,
        receiver_id: receiverId,
        content,
      });
      if (error) throw error;

      // Create notification for the message
      await supabase.from("notifications").insert({
        user_id: receiverId,
        actor_id: user.id,
        type: "message",
        content,
      });
    },
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ["chat-messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};

export const useDeleteMessage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ messageId, conversationId }: { messageId: string; conversationId: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("messages")
        .delete()
        .eq("id", messageId)
        .eq("sender_id", user.id); // Only delete own messages
      if (error) throw error;
    },
    onMutate: async ({ messageId, conversationId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["chat-messages", conversationId] });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData(["chat-messages", conversationId]);

      // Optimistically remove the message
      queryClient.setQueryData<MessageWithProfile[]>(["chat-messages", conversationId], (old) => {
        if (!old) return [];
        return old.filter((msg) => msg.id !== messageId);
      });

      return { previousMessages };
    },
    onError: (_err, { conversationId }, context) => {
      // Rollback on error
      queryClient.setQueryData(["chat-messages", conversationId], context?.previousMessages);
    },
    onSettled: (_data, _err, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ["chat-messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};

export const useGetOrCreateConversation = () => {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (otherUserId: string) => {
      if (!user) throw new Error("Not authenticated");
      // Check existing
      const { data: existing } = await supabase
        .from("conversations")
        .select("*")
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${user.id})`)
        .maybeSingle();

      if (existing) return existing;

      const { data, error } = await supabase
        .from("conversations")
        .insert({ user1_id: user.id, user2_id: otherUserId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
  });
};
