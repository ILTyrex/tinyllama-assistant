import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { X, Maximize2, Minimize2 } from "lucide-react";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { RightPanel } from "@/components/chat/RightPanel";
import { mockConversations, Conversation, Message } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatWidgetProps {
  open: boolean;
  onClose: () => void;
}

export function ChatWidget({ open, onClose }: ChatWidgetProps) {
  const [conversations, setConversations] =
    useState<Conversation[]>(mockConversations);
  const [activeId, setActiveId] = useState<string | null>(
    mockConversations[0]?.id ?? null,
  );
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useLayoutEffect(() => {
    if (open) {
      setExpanded(false);
    }
  }, [open]);

  const active = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId],
  );

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

      await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1000));

      const assistantMsg: Message = {
        id: `m-${Date.now() + 1}`,
        role: "assistant",
        content: `Gracias por tu mensaje. He procesado tu consulta sobre "${text.slice(0, 50)}..."`,
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

  const handleReset = () => {
    if (!activeId) return;
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId ? { ...c, messages: [], messageCount: 0 } : c,
      ),
    );
  };

  const handleNewConversation = () => {
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

  if (!open) return null;

  if (expanded) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="relative flex h-[min(90vh,calc(100vh-4rem))] w-[min(1100px,calc(100vw-4rem))] overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => setExpanded(false)}
              title="Minimizar"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              onClick={onClose}
              title="Cerrar"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex h-full w-full">
            <ChatSidebar
              conversations={conversations}
              activeId={activeId}
              onSelect={setActiveId}
              onNew={handleNewConversation}
            />

            <div className="flex-1 flex flex-col min-w-0">
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
              <ChatMessages
                messages={active?.messages ?? []}
                isTyping={isTyping}
              />
              <ChatInput
                onSend={handleSend}
                onReset={handleReset}
                disabled={isSending}
                loading={isSending}
              />
            </div>

            <RightPanel conversation={active} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[min(520px,calc(100vw-2rem))] max-h-[80vh] rounded-2xl border border-border bg-card shadow-lg overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border">
        <div>
          <p className="text-sm font-semibold text-foreground">Chat IA</p>
          <p className="text-xs text-muted-foreground">Solo mensajes</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => setExpanded(true)}
            title="Abrir chat completo"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={onClose}
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex h-[calc(80vh-72px)] min-h-0">
        <div className="w-44 border-r border-border flex flex-col">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <p className="text-xs font-medium text-muted-foreground">
              Conversaciones
            </p>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              onClick={handleNewConversation}
              title="Nueva conversación"
            >
              +
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                className={cn(
                  "w-full px-3 py-2 text-left text-xs font-medium transition-colors",
                  conv.id === activeId
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary/30",
                )}
                onClick={() => setActiveId(conv.id)}
                title={conv.title}
              >
                {conv.title}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-medium text-foreground">
              {active?.title ?? "NexusChat"}
            </h3>
            <span className="text-xs text-muted-foreground">
              {active?.messageCount ?? 0} mensajes
            </span>
          </div>

          <ChatMessages messages={active?.messages ?? []} isTyping={isTyping} />
          <ChatInput
            onSend={handleSend}
            onReset={handleReset}
            disabled={isSending}
            loading={isSending}
          />
        </div>
      </div>
    </div>
  );
}
