import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import {
  Search, Filter, Calendar, Tag, MessageSquare, SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { mockConversations } from "@/lib/mock-data";

export default function History() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");
  const [minMessages, setMinMessages] = useState<number>(0);

  const allTags = useMemo(
    () => Array.from(new Set(mockConversations.flatMap((c) => c.tags))),
    []
  );

  const filtered = useMemo(() => {
    let result = mockConversations.filter((c) => {
      const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.snippet.toLowerCase().includes(search.toLowerCase());
      const matchTag = tagFilter === "all" || c.tags.includes(tagFilter);
      const matchMin = c.messageCount >= minMessages;
      return matchSearch && matchTag && matchMin;
    });

    if (sortBy === "date") result.sort((a, b) => b.date.getTime() - a.date.getTime());
    else if (sortBy === "messages") result.sort((a, b) => b.messageCount - a.messageCount);
    else if (sortBy === "title") result.sort((a, b) => a.title.localeCompare(b.title));

    return result;
  }, [search, tagFilter, sortBy, minMessages]);

  return (
    <AppLayout>
    <div className="flex-1 overflow-y-auto scrollbar-thin bg-background">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-2xl font-display font-bold text-foreground">Mis Conversaciones</h1>
        <p className="text-sm text-muted-foreground mt-1">{filtered.length} conversaciones</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Filters bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar conversaciones..."
              className="pl-10 bg-card border-border"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select value={tagFilter} onValueChange={setTagFilter}>
            <SelectTrigger className="w-40 bg-card border-border">
              <Tag className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Etiqueta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {allTags.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40 bg-card border-border">
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Más reciente</SelectItem>
              <SelectItem value="messages">Más mensajes</SelectItem>
              <SelectItem value="title">Título A-Z</SelectItem>
            </SelectContent>
          </Select>

          {/* Advanced filters */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="border-border text-foreground hover:bg-secondary">
                <SlidersHorizontal className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-card border-border">
              <SheetHeader>
                <SheetTitle className="text-foreground font-display">Filtros avanzados</SheetTitle>
              </SheetHeader>
              <div className="space-y-6 mt-6">
                <div className="space-y-2">
                  <Label className="text-foreground">Mínimo de mensajes</Label>
                  <Input
                    type="number"
                    min={0}
                    value={minMessages}
                    onChange={(e) => setMinMessages(Number(e.target.value))}
                    className="bg-input border-border"
                  />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((conv, i) => (
            <motion.div
              key={conv.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <button
                onClick={() => navigate("/chat")}
                className="w-full text-left glass-surface p-5 hover:border-primary/30 transition-all group"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors">
                    {conv.title}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MessageSquare className="w-3 h-3" />
                    {conv.messageCount}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{conv.snippet}</p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {conv.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px] bg-secondary text-secondary-foreground">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {conv.date.toLocaleDateString("es")}
                  </div>
                </div>
              </button>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Filter className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No se encontraron conversaciones con estos filtros</p>
          </div>
        )}
      </div>
    </div>
    </AppLayout>
  );
}
