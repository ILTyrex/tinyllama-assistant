import { FileText, Tag, Download, Settings2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Conversation } from "@/lib/mock-data";

interface RightPanelProps {
  conversation: Conversation | null;
}

export function RightPanel({ conversation }: RightPanelProps) {
  if (!conversation) {
    return (
      <div className="w-72 h-full border-l border-border bg-card/50 flex items-center justify-center p-6">
        <p className="text-muted-foreground text-sm text-center">Selecciona una conversación para ver detalles</p>
      </div>
    );
  }

  return (
    <div className="w-72 h-full border-l border-border bg-card/50 flex flex-col overflow-y-auto scrollbar-thin">
      {/* Summary */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <FileText className="w-4 h-4 text-primary" />
          Resumen
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Conversación sobre "{conversation.title}" con {conversation.messageCount} mensajes intercambiados.
          Temas principales abordados en la discusión.
        </p>
      </div>

      <Separator />

      {/* Tags */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Tag className="w-4 h-4 text-primary" />
          Etiquetas
        </div>
        <div className="flex flex-wrap gap-1.5">
          {conversation.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs bg-secondary text-secondary-foreground">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <Separator />

      {/* Model params */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Settings2 className="w-4 h-4 text-primary" />
          Parámetros del modelo
        </div>
        <div className="space-y-2 text-xs">
          {[
            ["Modelo", "gemini-3-flash"],
            ["Temperatura", "0.7"],
            ["Max tokens", "4096"],
            ["Top-p", "0.9"],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between">
              <span className="text-muted-foreground">{label}</span>
              <span className="text-foreground font-mono">{val}</span>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Metadata */}
      <div className="p-4 space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Mensajes</span>
          <span className="text-foreground">{conversation.messageCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Fecha</span>
          <span className="text-foreground">{conversation.date.toLocaleDateString("es")}</span>
        </div>
      </div>

      <div className="mt-auto p-4">
        <Button variant="outline" className="w-full gap-2 text-sm border-border text-foreground hover:bg-secondary">
          <Download className="w-4 h-4" />
          Exportar
        </Button>
      </div>
    </div>
  );
}
