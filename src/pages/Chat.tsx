import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useChatMessages, useSendMessage, useGetOrCreateConversation } from "@/hooks/useMessages";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, ArrowLeft, Smile } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Database } from "@/integrations/supabase/types";

type MessageWithProfile = Database["public"]["Tables"]["messages"]["Row"] & {
  sender_profile: {
    user_id: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
  } | null;
};

const Chat = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const { data: otherProfile } = useProfile(userId);
  const getOrCreateConversation = useGetOrCreateConversation();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const { data: messages } = useChatMessages(conversationId || undefined);
  const sendMessage = useSendMessage();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (userId) {
      getOrCreateConversation.mutateAsync(userId).then((conv) => {
        setConversationId(conv.id);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId || !userId) return;
    sendMessage.mutate({ conversationId, receiverId: userId, content: newMessage.trim() });
    setNewMessage("");
  };

  return (
    <Layout>
      <div className="flex flex-col" style={{ height: "calc(100vh - 140px)" }}>
        {/* Chat Header */}
        <div className="flex items-center gap-3 border-b border-border pb-3">
          <Link to="/messages">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <Avatar className="h-9 w-9">
            <AvatarImage src={otherProfile?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {otherProfile?.username?.[0]?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm">{otherProfile?.username}</p>
            <p className="text-xs text-muted-foreground">{otherProfile?.full_name}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {messages?.map((msg: MessageWithProfile) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div
                  className={`group relative max-w-[75%] rounded-2xl px-4 py-2 ${
                    isMe
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className={`mt-1 text-xs ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="flex gap-2 border-t border-border pt-3">
          <Button type="button" variant="ghost" size="icon">
            <Smile className="h-5 w-5" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </Layout>
  );
};

export default Chat;
