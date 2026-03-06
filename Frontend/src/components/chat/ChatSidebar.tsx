import { useState } from "react";
import { Plus, MessageSquare, Search, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Conversation } from "@/lib/mock-data";
import { useNavigate } from "react-router-dom";

interface ChatSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
}

export function ChatSidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
}: ChatSidebarProps) {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="w-72 h-full flex flex-col bg-sidebar border-r border-sidebar-border">
      {/* Header */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <span className="font-display font-semibold text-foreground">
              NexusChat
            </span>
          </div>
        </div>

        <Button
          onClick={onNew}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-9"
        >
          <Plus className="w-4 h-4" />
          Nueva conversación
        </Button>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            className="pl-9 h-8 text-sm bg-sidebar-accent border-sidebar-border"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-2 space-y-0.5">
        {filtered.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={cn(
              "w-full text-left px-3 py-2.5 rounded-lg transition-colors group",
              activeId === conv.id
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50",
            )}
          >
            <p className="text-sm font-medium truncate">{conv.title}</p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {conv.snippet}
            </p>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={() => navigate("/history")}
          className="w-full text-left px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
        >
          📋 Historial completo
        </button>
        <button
          onClick={() => navigate("/")}
          className="w-full text-left px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-sidebar-accent/50 transition-colors flex items-center gap-2"
        >
          <LogOut className="w-3.5 h-3.5" />
          Salir
        </button>
      </div>
    </div>
  );
}
