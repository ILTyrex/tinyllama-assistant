import { ReactNode, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  FileBarChart,
  UserCircle,
  Settings,
  HelpCircle,
  MessageSquare,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ChatWidget } from "@/components/chat/ChatWidget";

const navItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
    roles: ["student", "admin"],
  },
  {
    label: "Cursos",
    icon: BookOpen,
    path: "/courses",
    roles: ["student", "admin"],
  },
  { label: "Reportes", icon: FileBarChart, path: "/reports", roles: ["admin"] },
  {
    label: "Perfil",
    icon: UserCircle,
    path: "/profile",
    roles: ["student", "admin"],
  },
  { label: "Configuración", icon: Settings, path: "/admin", roles: ["admin"] },
  {
    label: "Ayuda",
    icon: HelpCircle,
    path: "/help",
    roles: ["student", "admin"],
  },
];

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("sidebarCollapsed") === "true";
  });
  const [showChatWidget, setShowChatWidget] = useState(false);

  // Filtrar items según el rol del usuario
  const visibleItems = navItems.filter((item) => {
    if (!user?.role) return false;
    return item.roles.includes(user.role);
  });

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "h-full flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
          collapsed ? "w-16" : "w-56",
        )}
      >
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b border-sidebar-border gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-4 h-4 text-primary" />
          </div>
          {!collapsed && (
            <span className="font-display font-bold text-foreground text-sm truncate">
              AcademiaPro
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto scrollbar-thin">
          {visibleItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-primary font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground",
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon
                  className={cn(
                    "w-4 h-4 flex-shrink-0",
                    active && "text-primary",
                  )}
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-sidebar-border space-y-1">
          <button
            onClick={() => {
              setCollapsed((prev) => {
                const next = !prev;
                if (typeof window !== "undefined") {
                  localStorage.setItem("sidebarCollapsed", String(next));
                }
                return next;
              });
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
            {!collapsed && <span>Colapsar</span>}
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-hidden flex flex-col min-w-0">
        {children}
      </main>

      {/* Floating Chat Button */}
      {location.pathname !== "/chat" && !showChatWidget && (
        <button
          onClick={() => setShowChatWidget(true)}
          className="fixed bottom-4 right-4 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
          title="Chat IA"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}

      <ChatWidget
        open={showChatWidget}
        onClose={() => setShowChatWidget(false)}
      />
    </div>
  );
}
