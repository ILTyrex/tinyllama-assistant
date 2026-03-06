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
import CourseAPI, { Course, CreateCoursePayload } from "@/api/courses.api";

interface CreateCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (course: Course) => void;
  onUpdated?: (course: Course) => void;
  courseToEdit?: Course | null;
}

type CourseFormState = Omit<
  CreateCoursePayload,
  "credits" | "semester" | "slots" | "occupied_slots" | "status"
> & {
  credits: string;
  semester: string;
  slots: string;
  occupied_slots: string;
  status: "" | "open" | "closed";
};

const makeFormState = (course?: Course | null): CourseFormState => ({
  name: course?.name ?? "",
  code: course?.code ?? "",
  description: course?.description ?? "",
  credits: course?.credits.toString() ?? "",
  semester: course?.semester.toString() ?? "",
  prerequisites: course?.prerequisites ?? [],
  slots: course?.slots.toString() ?? "",
  occupied_slots: course?.occupied_slots.toString() ?? "",
  status: course?.status ?? "",
});

export function CreateCourseDialog({
  open,
  onOpenChange,
  onCreated,
  onUpdated,
  courseToEdit,
}: CreateCourseDialogProps) {
  const { toast } = useToast();
  const [course, setCourse] = useState<CourseFormState>(makeFormState());
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  const isEditMode = Boolean(courseToEdit);

  useEffect(() => {
    if (!open) {
      setCourse(makeFormState());
      return;
    }

    setCourse(makeFormState(courseToEdit));

    const loadCourses = async () => {
      try {
        const list = await CourseAPI.getCourses();
        setAvailableCourses(list);
      } catch {
        // ignore, we still want to allow creating/editing without prereqs
      }
    };

    loadCourses();
  }, [open, courseToEdit]);

  const handleSubmit = async () => {
    if (!course.name || !course.code || !course.description) {
      toast({
        title: "Error",
        description: "Nombre, código y descripción son obligatorios",
      });
      return;
    }

    if (!course.credits || Number(course.credits) <= 0) {
      toast({
        title: "Error",
        description: "Créditos debe ser un número mayor a 0",
      });
      return;
    }

    if (!course.semester || Number(course.semester) <= 0) {
      toast({
        title: "Error",
        description: "Semestre debe ser un número mayor a 0",
      });
      return;
    }

    if (!course.slots || Number(course.slots) <= 0) {
      toast({
        title: "Error",
        description: "Cupos totales debe ser un número mayor a 0",
      });
      return;
    }

    if (!course.status) {
      toast({ title: "Error", description: "Selecciona el estado del curso" });
      return;
    }

    try {
      setLoading(true);
      const payload: CreateCoursePayload = {
        ...course,
        credits: Number(course.credits) || 0,
        semester: Number(course.semester) || 0,
        slots: Number(course.slots) || 0,
        occupied_slots: Number(course.occupied_slots) || 0,
        status: course.status || "open",
      };

      if (isEditMode && courseToEdit) {
        const updated = await CourseAPI.updateCourse(courseToEdit.id, payload);
        toast({ title: "Curso actualizado", description: updated.name });
        onUpdated?.(updated);
      } else {
        const created = await CourseAPI.createCourse(payload);
        toast({ title: "Curso creado", description: created.name });
        onCreated?.(created);
      }

      onOpenChange(false);
    } catch (error: any) {
      if (error.status === 401) {
        toast({
          title: "No autorizado",
          description: "Inicia sesión para crear cursos",
        });
        return;
      }

      const errors = error.errors || {};
      const firstError =
        typeof errors === "string"
          ? errors
          : Array.isArray(errors)
            ? errors[0]
            : Object.values(errors).flat()[0];
      const message =
        firstError ||
        error.message ||
        (isEditMode
          ? "Error al actualizar el curso"
          : "Error al crear el curso");
      toast({ title: "Error", description: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-h-[80vh] w-[min(95vw,900px)] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-foreground font-display">
            {isEditMode ? "Editar curso" : "Crear nuevo curso"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isEditMode
              ? "Modifica los datos del curso y guarda los cambios."
              : "Completa los datos para añadir un nuevo curso al sistema."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-2">
          {[
            { key: "code", label: "Código del curso", type: "text" },
            { key: "name", label: "Nombre del curso", type: "text" },
            { key: "description", label: "Descripción", type: "text" },
            { key: "credits", label: "Créditos", type: "number" },
            { key: "semester", label: "Semestre", type: "number" },
            { key: "slots", label: "Cupos totales", type: "number" },
            {
              key: "occupied_slots",
              label: "Ocupados iniciales",
              type: "number",
            },
          ].map((f) => (
            <div key={f.key} className="space-y-2">
              <Label className="text-foreground">{f.label}</Label>
              <Input
                type={f.type}
                className="bg-input border-border"
                value={course[f.key as keyof CourseFormState] as string}
                onChange={(e) => {
                  setCourse((prev) => ({
                    ...prev,
                    [f.key]: e.target.value,
                  }));
                }}
                disabled={loading}
              />
            </div>
          ))}

          <div className="space-y-2">
            <Label className="text-foreground">
              Prerrequisitos (IDs separados por coma)
            </Label>
            <Input
              type="text"
              className="bg-input border-border"
              value={course.prerequisites?.join(",") ?? ""}
              onChange={(e) =>
                setCourse((prev) => ({
                  ...prev,
                  prerequisites: e.target.value
                    .split(",")
                    .map((v) => Number(v.trim()))
                    .filter((n) => !Number.isNaN(n)),
                }))
              }
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Estado</Label>
            <Select
              value={course.status}
              onValueChange={(value) =>
                setCourse((prev) => ({
                  ...prev,
                  status: value as "open" | "closed",
                }))
              }
            >
              <SelectTrigger className="bg-input border-border">
                <SelectValue placeholder="Seleccione el estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Abierto</SelectItem>
                <SelectItem value="closed">Cerrado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-border text-foreground"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            {isEditMode ? "Guardar cambios" : "Crear curso"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
