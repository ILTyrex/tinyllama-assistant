import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { ChatInput } from "@/components/chat/ChatInput";
import { AppLayout } from "@/components/AppLayout";
import { Conversation } from "@/lib/mock-data";
import { useChatSession } from "@/hooks/useChatSession";

export default function Chat() {
  const {
    session,
    sessions,
    messages,
    isTyping,
    isSending,
    error,
    startSession,
    loadSession,
    selectSession,
    sendMessage,
    resetConversation,
  } = useChatSession();

  const location = useLocation();

  useEffect(() => {
    const sessionId = (location.state as any)?.sessionId;
    if (!sessionId) return;

    // Load a session when coming from the history list (or direct link)
    loadSession(Number(sessionId)).catch(() => {
      /* ignore */
    });
  }, [location.state, loadSession]);

  const activeId = session ? String(session.id) : null;

  const conversations = useMemo(() => {
    return sessions.map((s) => {
      const lastMessage = s.messages[s.messages.length - 1];
      const snippet = lastMessage?.content ?? "No hay mensajes todavía";
      const date = lastMessage
        ? new Date(lastMessage.created_at)
        : new Date(s.started_at);

      return {
        id: String(s.id),
        title: `Chat #${s.id}`,
        snippet,
        date,
        tags: [],
        messageCount: s.messages.length,
        messages: s.messages.map((m) => ({
          id: String(m.id),
          role: m.role,
          content: m.content,
          timestamp: new Date(m.created_at),
        })),
      };
    });
  }, [sessions]);

  const conversation: Conversation = useMemo(() => {
    if (!session) {
      return {
        id: "chat",
        title: "NexusChat",
        snippet: "Empieza a escribir...",
        date: new Date(),
        tags: [],
        messageCount: messages.length,
        messages,
      };
    }

    const lastMessage = session.messages[session.messages.length - 1];
    const snippet = lastMessage?.content ?? "Empieza a escribir...";
    const date = lastMessage
      ? new Date(lastMessage.created_at)
      : new Date(session.started_at);

    return {
      id: String(session.id),
      title: `Chat #${session.id}`,
      snippet,
      date,
      tags: [],
      messageCount: messages.length,
      messages,
    };
  }, [messages, session]);

  const handleSend = async (text: string) => {
    try {
      await sendMessage(text);
    } catch {
      // no-op, error handled in hook
    }
  };

  const handleReset = async () => {
    await resetConversation();
  };

  return (
    <AppLayout>
      <div className="flex-1 flex h-full">
        <ChatSidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={selectSession}
          onNew={handleReset}
        />

        {/* Chat central */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="h-14 border-b border-border flex items-center px-4">
            <h2 className="font-display font-semibold text-foreground truncate">
              {conversation.title}
            </h2>
            <span className="ml-3 text-xs text-muted-foreground">
              {conversation.messageCount} mensajes
            </span>
          </div>

          {error ? (
            <div className="p-6 text-sm text-red-500">{error}</div>
          ) : (
            <ChatMessages messages={messages} isTyping={isTyping} />
          )}
          <ChatInput
            onSend={handleSend}
            onReset={handleReset}
            disabled={isSending}
            loading={isSending}
          />
        </div>
      </div>
    </AppLayout>
  );
}
