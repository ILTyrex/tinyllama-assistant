import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Message } from "@/lib/mock-data";
import { TypingIndicator } from "@/components/TypingIndicator";

interface ChatMessagesProps {
  messages: Message[];
  isTyping: boolean;
}

export function ChatMessages({ messages, isTyping }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20">
            <Bot className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-display font-semibold text-foreground">
              ¿En qué puedo ayudarte?
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Escribe un mensaje para comenzar la conversación
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
      {messages.map((msg, i) => (
        <motion.div
          key={msg.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
          className={cn(
            "flex gap-3",
            msg.role === "user" ? "justify-end" : "justify-start",
          )}
        >
          {msg.role === "assistant" && (
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mt-1">
              <Bot className="w-4 h-4 text-primary" />
            </div>
          )}
          <div
            className={cn(
              "max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
              msg.role === "user"
                ? "bg-user-bubble text-foreground rounded-br-md"
                : "bg-assistant-bubble text-foreground rounded-bl-md",
            )}
          >
            <div className="whitespace-pre-wrap">{msg.content}</div>
            <p className="text-[10px] text-muted-foreground mt-2">
              {msg.timestamp.toLocaleTimeString("es", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          {msg.role === "user" && (
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-secondary flex items-center justify-center mt-1">
              <User className="w-4 h-4 text-secondary-foreground" />
            </div>
          )}
        </motion.div>
      ))}

      {isTyping && (
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <div className="bg-assistant-bubble rounded-2xl rounded-bl-md">
            <TypingIndicator />
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
