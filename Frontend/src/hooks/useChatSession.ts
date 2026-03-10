import { useCallback, useState } from "react";
import { Message } from "@/lib/mock-data";
import ChatAPI, { ChatProxyRequestMessage } from "@/api/chat.api";

export function useChatSession() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startSession = useCallback(async () => {
    setError(null);
    setMessages([]);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
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
        const payload: ChatProxyRequestMessage[] = [
          ...messages.map((m) => ({ role: m.role, content: m.content })),
          { role: "user", content: text },
        ];

        const response = await ChatAPI.chat(payload);

        const assistantMsg: Message = {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: response.response,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMsg]);
        return assistantMsg;
      } catch (err: any) {
        setError(err?.message || "Error al enviar el mensaje");
        throw err;
      } finally {
        setIsTyping(false);
        setIsSending(false);
      }
    },
    [messages],
  );

  const resetConversation = useCallback(async () => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isTyping,
    isSending,
    error,
    startSession,
    sendMessage,
    resetConversation,
  };
}
