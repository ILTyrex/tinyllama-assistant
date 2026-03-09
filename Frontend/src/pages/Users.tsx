import { AppLayout } from "@/components/AppLayout";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { CreateUserDialog } from "@/components/CreateUserDialog";
import { useToast } from "@/hooks/use-toast";
import AuthAPI from "@/api/users.api";

interface User {
  id: number;
  identification: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  role_display: string;
  is_active: boolean;
  phone?: string;
  semester?: number;
  created_at?: string;
  updated_at?: string;
}

const mockUsers: User[] = [
  {
    id: 1,
    identification: "123456789",
    first_name: "Juan",
    last_name: "Pérez",
    email: "juan@example.com",
    role: "student",
    role_display: "Estudiante",
    is_active: true,
  },
  {
    id: 2,
    identification: "987654321",
    first_name: "María",
    last_name: "García",
    email: "maria@example.com",
    role: "admin",
    role_display: "Administrador",
    is_active: true,
  },
  {
    id: 3,
    identification: "456789123",
    first_name: "Carlos",
    last_name: "López",
    email: "carlos@example.com",
    role: "student",
    role_display: "Estudiante",
    is_active: false,
  },
];

export default function Users() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // Cargar usuarios al montar el componente
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await AuthAPI.getUsers();
      setUsers(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserDialogOpenChange = (open: boolean) => {
    if (!open) setEditUser(null);
    setShowCreateUser(open);
  };

  const handleUserCreated = async (user: User) => {
    await loadUsers();
    toast({ title: "Usuario creado", description: `${user.first_name} ha sido creado` });
  };

  const handleUserUpdated = async (updated: User) => {
    await loadUsers();
    toast({ title: "Usuario actualizado", description: `${updated.first_name} ha sido actualizado` });
  };

  const handleDelete = async (userId: number, userName: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar a ${userName}?`)) return;

    try {
      setLoading(true);
      await AuthAPI.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast({ title: "Usuario eliminado", description: `${userName} ha sido eliminado` });
    } catch (error) {
      toast({ title: "Error", description: "No se pudo eliminar el usuario" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="px-6 pt-6 pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Gestión de usuarios
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Administración de cuentas de usuario
            </p>
          </div>
          <Button
            onClick={() => {
              setEditUser(null);
              setShowCreateUser(true);
            }}
            disabled={loading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Crear usuario
          </Button>
        </div>
        <div className="px-6 pb-6">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Identificación</TableHead>
                <TableHead className="text-muted-foreground">Nombre</TableHead>
                <TableHead className="text-muted-foreground">Email</TableHead>
                <TableHead className="text-muted-foreground">Rol</TableHead>
                <TableHead className="text-muted-foreground">Estado</TableHead>
                <TableHead className="text-muted-foreground w-24">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} className="border-border hover:bg-secondary/30">
                  <TableCell className="font-mono text-sm text-foreground">{u.identification}</TableCell>
                  <TableCell className="text-sm text-foreground">{u.first_name} {u.last_name}</TableCell>
                  <TableCell className="text-sm text-foreground">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">
                      {u.role_display}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`text-[10px] ${u.is_active ? "bg-green-500/10 text-green-600" : "bg-destructive/10 text-destructive"}`}>
                      {u.is_active ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          setEditUser(u);
                          setShowCreateUser(true);
                        }}
                        disabled={loading}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          if (confirm(`¿Estás seguro de que deseas eliminar a ${u.first_name}?`)) {
                            setUsers((prev) => prev.filter((user) => user.id !== u.id));
                          }
                        }}
                        disabled={loading}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <CreateUserDialog
        open={showCreateUser}
        onOpenChange={handleUserDialogOpenChange}
        userToEdit={editUser}
        onCreated={handleUserCreated}
        onUpdated={handleUserUpdated}
      />
    </AppLayout>
  );
}
