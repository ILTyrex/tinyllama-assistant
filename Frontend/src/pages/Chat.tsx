import { useEffect, useMemo } from "react";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { ChatInput } from "@/components/chat/ChatInput";
import { RightPanel } from "@/components/chat/RightPanel";
import { AppLayout } from "@/components/AppLayout";
import { Conversation } from "@/lib/mock-data";
import { useChatSession } from "@/hooks/useChatSession";

export default function Chat() {
  const {
    messages,
    isTyping,
    isSending,
    error,
    startSession,
    sendMessage,
    resetConversation,
  } = useChatSession();

  const conversation: Conversation = useMemo(
    () => ({
      id: "chat",
      title: "NexusChat",
      snippet:
        messages[messages.length - 1]?.content ?? "Empieza a escribir...",
      date: new Date(),
      tags: [],
      messageCount: messages.length,
      messages,
    }),
    [messages],
  );

  const conversations = useMemo(() => [conversation], [conversation]);

  useEffect(() => {
    startSession().catch(() => {
      // error handled in hook
    });
  }, [startSession]);

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
          activeId="chat"
          onSelect={() => {
            /* Only one session */
          }}
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

        <RightPanel conversation={conversation} />
      </div>
    </AppLayout>
  );
}
