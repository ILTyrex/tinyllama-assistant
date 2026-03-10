import { useCallback, useEffect, useState } from "react";
import { Message } from "@/lib/mock-data";
import ChatAPI, { ChatSessionDTO, ChatMessageDTO } from "@/api/chat.api";

function toMessage(dto: ChatMessageDTO): Message {
  return {
    id: String(dto.id),
    role: dto.role,
    content: dto.content,
    timestamp: new Date(dto.created_at),
  };
}

function sessionToConversation(session: ChatSessionDTO) {
  const lastMessage = session.messages[session.messages.length - 1];
  const snippet = lastMessage?.content ?? "No hay mensajes todavía";
  const date = lastMessage
    ? new Date(lastMessage.created_at)
    : new Date(session.started_at);

  return {
    id: String(session.id),
    title: `Chat #${session.id}`,
    snippet,
    date,
    tags: [],
    messageCount: session.messages.length,
    messages: session.messages.map(toMessage),
  };
}

const SESSION_STORAGE_KEY = "chatSessionId";

export function useChatSession() {
  const [session, setSession] = useState<ChatSessionDTO | null>(null);
  const [sessions, setSessions] = useState<ChatSessionDTO[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    try {
      const data = await ChatAPI.listSessions();
      setSessions(data);
      return data;
    } catch (err: any) {
      setError(err?.message || "No se pudieron cargar las sesiones");
      throw err;
    }
  }, []);

  const loadSession = useCallback(async (sessionId: number) => {
    setError(null);
    try {
      const data = await ChatAPI.getSessionHistory(sessionId);
      setSession(data);
      setMessages(data.messages.map(toMessage));
      localStorage.setItem(SESSION_STORAGE_KEY, String(data.id));

      setSessions((prev) => {
        const found = prev.find((s) => s.id === data.id);
        if (found) {
          return prev.map((s) => (s.id === data.id ? data : s));
        }
        return [...prev, data];
      });

      return data;
    } catch (err: any) {
      setError(err?.message || "No se pudo cargar la sesión");
      throw err;
    }
  }, []);

  const startSession = useCallback(async () => {
    setError(null);
    try {
      const data = await ChatAPI.startSession();
      setSession(data);
      setMessages(data.messages.map(toMessage));
      localStorage.setItem(SESSION_STORAGE_KEY, String(data.id));
      await loadSessions();
      return data;
    } catch (err: any) {
      setError(err?.message || "No se pudo iniciar la sesión");
      throw err;
    }
  }, [loadSessions]);

  const endSession = useCallback(async () => {
    if (!session) return;
    try {
      await ChatAPI.endSession(session.id);
    } catch {
      // no-op
    }
    setSession(null);
    setMessages([]);
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }, [session]);

  const deleteLocalSession = useCallback((sessionId: string) => {
    setSessions((prev) => prev.filter((s) => String(s.id) !== sessionId));

    if (String(session?.id) === String(sessionId)) {
      setSession(null);
      setMessages([]);
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, [session]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!session) {
        throw new Error("No hay sesión activa");
      }

      setError(null);
      const userMsg: Message = {
        id: `u-${Date.now()}`,
        role: "user",
        content: text,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsSending(true);
      setIsTyping(true);

      try {
        const response = await ChatAPI.sendMessage(session.id, text);
        const assistantMsg = toMessage(response.assistant_message);
        setMessages((prev) => [...prev, assistantMsg]);

        // Mantener el historial actualizado
        await loadSessions();

        return assistantMsg;
      } catch (err: any) {
        setError(err?.message || "Error al enviar el mensaje");
        throw err;
      } finally {
        setIsTyping(false);
        setIsSending(false);
      }
    },
    [loadSessions, session],
  );

  const selectSession = useCallback(
    async (sessionId: string) => {
      const id = Number(sessionId);
      if (Number.isNaN(id)) return;
      await loadSession(id);
    },
    [loadSession],
  );

  const resetConversation = useCallback(async () => {
    if (session) {
      await endSession();
    }
    await startSession();
  }, [endSession, startSession, session]);

  useEffect(() => {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);

    const initialize = async () => {
      await loadSessions();

      if (stored) {
        const id = Number(stored);
        if (!Number.isNaN(id)) {
          try {
            await loadSession(id);
            return;
          } catch {
            // fall back to creating a new session
          }
        }
      }

      await startSession();
    };

    initialize();
  }, [loadSession, loadSessions, startSession]);

  return {
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
    endSession,
    resetConversation,
    deleteLocalSession,
  };
}
