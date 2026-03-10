import { useMemo, useState, useEffect } from "react";
import { X, Maximize2, Minimize2 } from "lucide-react";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { RightPanel } from "@/components/chat/RightPanel";
import { Conversation } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useChatSession } from "@/hooks/useChatSession";
import ChatAPI from "@/api/chat.api";

interface ChatWidgetProps {
  open: boolean;
  onClose: () => void;
}

export function ChatWidget({ open, onClose }: ChatWidgetProps) {
  const {
    session,
    sessions,
    deleteLocalSession,
    messages,
    isTyping,
    isSending,
    error,
    startSession,
    selectSession,
    sendMessage,
    resetConversation,
  } = useChatSession();

  // Eliminar conversación: primero en backend, luego en estado local
  const handleDeleteConversation = async (id: string) => {
    try {
      await ChatAPI.deleteSession(Number(id));
    } catch (err) {
      // Si falla la eliminación remota, aún intentamos mantener coherencia local
      console.error("Error deleting session on backend:", err);
    }

    if (deleteLocalSession) deleteLocalSession(id);
  };
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (open) {
      setExpanded(false);
    }
  }, [open]);

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

  const conversation = useMemo(() => {
    if (!session) {
      return {
        id: "chat",
        title: "NexusChat",
        snippet: "Empieza a escribir...",
        date: new Date(),
        tags: [],
        messageCount: messages.length,
        messages,
      } as Conversation;
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
      // Error is handled in hook; no-op here
    }
  };

  const handleReset = async () => {
    await resetConversation();
  };

  const handleNewConversation = async () => {
    await resetConversation();
  };

  const handleClose = () => {
    onClose();
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
              onClick={handleClose}
              title="Cerrar"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex h-full w-full">
            <ChatSidebar
              conversations={conversations}
              activeId={activeId}
              onSelect={selectSession}
              onNew={handleNewConversation}
              onDelete={handleDeleteConversation}
            />

            <div className="flex-1 flex flex-col min-w-0">
              <div className="h-14 border-b border-border flex items-center px-4">
                <h2 className="font-display font-semibold text-foreground truncate">
                  {conversation.title}
                </h2>
                <span className="ml-3 text-xs text-muted-foreground">
                  {conversation.messageCount} mensajes
                </span>
                <div className="ml-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={async () => {
                      if (!session) {
                        alert("Selecciona una conversación primero");
                        return;
                      }
                      const email = window.prompt("Enviar reporte a (email):", "");
                      if (!email) return;
                      try {
                        await ChatAPI.reportSession(Number(session.id), email);
                        alert("Reporte enviado correctamente");
                      } catch (err: any) {
                        console.error(err);
                        const detail = err?.response?.data?.detail || err?.response?.data?.error || err?.message || String(err);
                        alert(`Error al enviar el reporte: ${detail}`);
                      }
                    }}
                  >
                    Reporte
                  </Button>
                </div>
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
            onClick={handleClose}
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
              <div key={conv.id} className="flex items-center group">
                <button
                  className={cn(
                    "flex-1 px-3 py-2 text-left text-xs font-medium transition-colors",
                    conv.id === activeId
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary/30",
                  )}
                  onClick={() => selectSession(conv.id)}
                  title={conv.title}
                >
                  {conv.title}
                </button>
                <button
                  className="ml-1 p-1 text-xs text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100"
                  title="Eliminar chat"
                  onClick={() => handleDeleteConversation(conv.id)}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-medium text-foreground">
              {conversation.title}
            </h3>
            <span className="text-xs text-muted-foreground">
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
    </div>
  );
}
