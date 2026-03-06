import { useState, useCallback } from "react";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { ChatInput } from "@/components/chat/ChatInput";
import { RightPanel } from "@/components/chat/RightPanel";
import { AppLayout } from "@/components/AppLayout";
import { mockConversations, Message, Conversation } from "@/lib/mock-data";

export default function Chat() {
  const [conversations, setConversations] =
    useState<Conversation[]>(mockConversations);
  const [activeId, setActiveId] = useState<string | null>(
    mockConversations[0]?.id ?? null,
  );
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const active = conversations.find((c) => c.id === activeId) ?? null;

  const handleSend = useCallback(
    async (text: string) => {
      if (!activeId) return;
      const userMsg: Message = {
        id: `m-${Date.now()}`,
        role: "user",
        content: text,
        timestamp: new Date(),
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeId
            ? {
                ...c,
                messages: [...c.messages, userMsg],
                messageCount: c.messageCount + 1,
              }
            : c,
        ),
      );

      setIsSending(true);
      setIsTyping(true);

      // Simulate response
      await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1000));

      const assistantMsg: Message = {
        id: `m-${Date.now() + 1}`,
        role: "assistant",
        content: `Gracias por tu mensaje. He procesado tu consulta sobre "${text.slice(0, 50)}..."\n\nAquí tienes mi respuesta detallada basada en el análisis del contexto proporcionado.`,
        timestamp: new Date(),
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeId
            ? {
                ...c,
                messages: [...c.messages, assistantMsg],
                messageCount: c.messageCount + 1,
              }
            : c,
        ),
      );

      setIsTyping(false);
      setIsSending(false);
    },
    [activeId],
  );

  const handleNew = () => {
    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      title: "Nueva conversación",
      snippet: "Empieza a escribir...",
      date: new Date(),
      tags: [],
      messageCount: 0,
      messages: [],
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveId(newConv.id);
  };

  const handleReset = () => {
    if (!activeId) return;
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId ? { ...c, messages: [], messageCount: 0 } : c,
      ),
    );
  };

  return (
    <AppLayout>
      <div className="flex-1 flex h-full">
        <ChatSidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={setActiveId}
          onNew={handleNew}
        />

        {/* Chat central */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="h-14 border-b border-border flex items-center px-4">
            <h2 className="font-display font-semibold text-foreground truncate">
              {active?.title ?? "NexusChat"}
            </h2>
            {active && (
              <span className="ml-3 text-xs text-muted-foreground">
                {active.messageCount} mensajes
              </span>
            )}
          </div>

          <ChatMessages messages={active?.messages ?? []} isTyping={isTyping} />
          <ChatInput
            onSend={handleSend}
            onReset={handleReset}
            disabled={isSending}
            loading={isSending}
          />
        </div>

        <RightPanel conversation={active} />
      </div>
    </AppLayout>
  );
}
