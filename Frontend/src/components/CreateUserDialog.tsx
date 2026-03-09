import { useEffect, useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
}

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (user: User) => void;
  onUpdated?: (user: User) => void;
  userToEdit?: User | null;
}

type UserFormState = {
  identification: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  is_active: boolean;
};

const makeFormState = (user?: User | null): UserFormState => ({
  identification: user?.identification ?? "",
  first_name: user?.first_name ?? "",
  last_name: user?.last_name ?? "",
  email: user?.email ?? "",
  password: "",
  confirmPassword: "",
  role: user?.role ?? "student",
  is_active: user?.is_active ?? true,
});

export function CreateUserDialog({
  open,
  onOpenChange,
  onCreated,
  onUpdated,
  userToEdit,
}: CreateUserDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formState, setFormState] = useState<UserFormState>(makeFormState());

  useEffect(() => {
    setFormState(makeFormState(userToEdit));
  }, [userToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formState.identification || !formState.first_name || !formState.last_name || !formState.email) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
      });
      return;
    }

    if (!userToEdit && (!formState.password || formState.password.length < 6)) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
      });
      return;
    }

    if (!userToEdit && formState.password !== formState.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
      });
      return;
    }

    setLoading(true);

    try {
      if (userToEdit) {
        // Actualizar usuario existente
        const payload: any = {
          first_name: formState.first_name,
          last_name: formState.last_name,
          email: formState.email,
          role: formState.role,
          is_active: formState.is_active,
        };
        
        // Solo incluir contraseña si se proporcionó una nueva
        if (formState.password) {
          if (formState.password.length < 6) {
            toast({
              title: "Error",
              description: "La contraseña debe tener al menos 6 caracteres",
            });
            return;
          }
          if (formState.password !== formState.confirmPassword) {
            toast({
              title: "Error",
              description: "Las contraseñas no coinciden",
            });
            return;
          }
          payload.password = formState.password;
        }

        const response = await AuthAPI.updateUser(userToEdit.id, payload);
        onUpdated?.(response.user);
      } else {
        // Crear nuevo usuario
        const payload = {
          identification: formState.identification,
          first_name: formState.first_name,
          last_name: formState.last_name,
          email: formState.email,
          password: formState.password,
          role: formState.role,
        };
        const response = await AuthAPI.createUser(payload);
        onCreated?.(response.user);
      }

      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el usuario",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {userToEdit ? "Editar usuario" : "Crear nuevo usuario"}
          </DialogTitle>
          <DialogDescription>
            {userToEdit
              ? "Modifica los datos del usuario seleccionado."
              : "Ingresa los datos para crear un nuevo usuario en el sistema."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="identification" className="text-right">
                Identificación
              </Label>
              <Input
                id="identification"
                value={formState.identification}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, identification: e.target.value }))
                }
                className="col-span-3"
                placeholder="123456789"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="first_name" className="text-right">
                Nombre
              </Label>
              <Input
                id="first_name"
                value={formState.first_name}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, first_name: e.target.value }))
                }
                className="col-span-3"
                placeholder="Juan"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="last_name" className="text-right">
                Apellido
              </Label>
              <Input
                id="last_name"
                value={formState.last_name}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, last_name: e.target.value }))
                }
                className="col-span-3"
                placeholder="Pérez"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formState.email}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, email: e.target.value }))
                }
                className="col-span-3"
                placeholder="juan@example.com"
                required
              />
            </div>
            {!userToEdit && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">
                    Contraseña
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formState.password}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, password: e.target.value }))
                    }
                    className="col-span-3"
                    placeholder="Mínimo 6 caracteres"
                    required={!userToEdit}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="confirmPassword" className="text-right">
                    Confirmar
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formState.confirmPassword}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, confirmPassword: e.target.value }))
                    }
                    className="col-span-3"
                    placeholder="Repite la contraseña"
                    required={!userToEdit}
                  />
                </div>
              </>
            )}
            {userToEdit && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  Nueva Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formState.password}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, password: e.target.value }))
                  }
                  className="col-span-3"
                  placeholder="Deja vacío para mantener la actual"
                />
              </div>
            )}
            {userToEdit && formState.password && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="confirmPassword" className="text-right">
                  Confirmar
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formState.confirmPassword}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, confirmPassword: e.target.value }))
                  }
                  className="col-span-3"
                  placeholder="Confirma la nueva contraseña"
                />
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Rol
              </Label>
              <Select
                value={formState.role}
                onValueChange={(value) =>
                  setFormState((prev) => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Estudiante</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="is_active" className="text-right">
                Estado
              </Label>
              <Select
                value={formState.is_active ? "active" : "inactive"}
                onValueChange={(value) =>
                  setFormState((prev) => ({ ...prev, is_active: value === "active" }))
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecciona el estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              {userToEdit ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}