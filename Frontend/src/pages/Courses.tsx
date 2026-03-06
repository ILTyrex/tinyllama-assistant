import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  Search,
  Users,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { AppLayout } from "@/components/AppLayout";
import { Course } from "@/api/courses.api";
import CourseAPI from "@/api/courses.api";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";

function CourseDetail({
  course,
  onBack,
  onEnroll,
}: {
  course: Course;
  onBack: () => void;
  onEnroll: (course: Course) => void;
}) {
  const pct = Math.round((course.occupied_slots / course.slots) * 100);
  const remaining = course.slots - course.occupied_slots;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <Button
        variant="ghost"
        onClick={onBack}
        className="text-muted-foreground hover:text-foreground"
      >
        ← Volver a cursos
      </Button>

      <div
        className="glass-surface p-6"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary text-xs"
              >
                {course.code}
              </Badge>
              <Badge
                variant="secondary"
                className={`text-xs ${
                  course.status === "closed"
                    ? "bg-destructive/10 text-destructive"
                    : "bg-primary/10 text-primary"
                }`}
              >
                {course.status === "closed" ? "Cerrado" : "Abierto"}
              </Badge>
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground">
              {course.name}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {course.credits} créditos
            </p>
          </div>
          <Button
            onClick={() => onEnroll(course)}
            disabled={course.status === "closed"}
            className="bg-primary text-primary-foreground hover:bg-primary/90 glow-border"
          >
            {course.status === "closed" ? "Cerrado" : "Inscribirse"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Description */}
          <div
            className="glass-surface p-5"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <h3 className="font-display font-semibold text-foreground mb-3">
              Descripción
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {course.description}
            </p>
          </div>

          {/* Requisitos previos */}
          <div
            className="glass-surface p-5"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <h3 className="font-display font-semibold text-foreground mb-3">
              Requisitos previos
            </h3>
            <p className="text-sm text-muted-foreground">
              No disponibles en la versión actual
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Teacher & Schedule */}
          <div
            className="glass-surface p-5 space-y-4"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Créditos</p>
                <p className="text-sm font-medium text-foreground">
                  {course.credits} créditos
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Semestre</p>
                <p className="text-sm font-medium text-foreground">
                  Semestre {course.semester}
                </p>
              </div>
            </div>
          </div>

          {/* Capacity */}
          <div
            className="glass-surface p-5"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <h3 className="font-display font-semibold text-foreground mb-3">
              Cupos
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Inscritos</span>
                <span className="text-foreground font-medium">
                  {course.occupied_slots} / {course.slots}
                </span>
              </div>
              <Progress value={pct} className="h-3" />
              <p className="text-xs text-muted-foreground">
                {remaining > 0 ? (
                  <span>{remaining} cupos disponibles</span>
                ) : (
                  <span className="text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Sin cupos disponibles
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Courses() {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selected, setSelected] = useState<Course | null>(null);
  const [search, setSearch] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedForEnroll, setSelectedForEnroll] = useState<Course | null>(
    null,
  );
  const [enrolling, setEnrolling] = useState(false);
  const [loading, setLoading] = useState(false);

  // Cargar cursos al montar
  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await CourseAPI.getCourses();
      setCourses(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los cursos",
      });
    } finally {
      setLoading(false);
    }
  };

  // Get unique semesters from courses
  const semesters = Array.from(
    new Set(courses.map((c) => c.semester || 1)),
  ).sort((a, b) => a - b);

  const filtered = courses.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase());
    const matchSemester =
      semesterFilter === "all" || c.semester === parseInt(semesterFilter);
    const matchAvailability =
      availabilityFilter === "all" ||
      (availabilityFilter === "available" && c.status === "open") ||
      (availabilityFilter === "unavailable" && c.status === "closed");
    return matchSearch && matchSemester && matchAvailability;
  });

  const handleEnroll = (course: Course) => {
    setSelectedForEnroll(course);
    setShowConfirm(true);
  };

  const handleConfirmEnroll = async () => {
    setEnrolling(true);
    await new Promise((r) => setTimeout(r, 1500));
    if (selectedForEnroll) {
      toast({
        title: "¡Inscripción exitosa!",
        description: `Te has inscrito en ${selectedForEnroll.name}`,
      });
    }
    setEnrolling(false);
    setShowConfirm(false);
    setSelectedForEnroll(null);
    setSelected(null);
  };

  if (selected) {
    return (
      <AppLayout>
        <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-6">
          <CourseDetail
            course={selected}
            onBack={() => setSelected(null)}
            onEnroll={handleEnroll}
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="px-6 pt-6 pb-4">
          <h1 className="text-2xl font-display font-bold text-foreground">
            Cursos Electivos
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Explora y inscríbete en tus cursos electivos
          </p>
        </div>

        <div className="px-6 pb-6 space-y-5">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar curso..."
                className="pl-10 bg-card border-border"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={semesterFilter} onValueChange={setSemesterFilter}>
              <SelectTrigger className="w-48 bg-card border-border">
                <SelectValue placeholder="Semestre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los semestres</SelectItem>
                {semesters.map((sem) => (
                  <SelectItem key={sem} value={sem.toString()}>
                    Semestre {sem}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={availabilityFilter}
              onValueChange={setAvailabilityFilter}
            >
              <SelectTrigger className="w-48 bg-card border-border">
                <SelectValue placeholder="Disponibilidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los cursos</SelectItem>
                <SelectItem value="available">Con cupos disponibles</SelectItem>
                <SelectItem value="unavailable">
                  Sin cupos / Cerrados
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Course grid */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((course, i) => {
                const pct = Math.round(
                  (course.occupied_slots / course.slots) * 100,
                );
                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <button
                      onClick={() => setSelected(course)}
                      className="w-full text-left glass-surface p-5 hover:border-primary/30 transition-all group"
                      style={{ boxShadow: "var(--shadow-card)" }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Badge
                          variant="secondary"
                          className="bg-primary/10 text-primary text-[10px]"
                        >
                          {course.code}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="bg-secondary text-secondary-foreground text-[10px]"
                        >
                          Sem. {course.semester}
                        </Badge>
                      </div>
                      <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
                        {course.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-3">
                        {course.credits} créditos
                      </p>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">
                            {course.occupied_slots}/{course.slots} inscritos
                          </span>
                          <span
                            className={
                              pct >= 90 ? "text-destructive" : "text-primary"
                            }
                          >
                            {pct}%
                          </span>
                        </div>
                        <Progress value={pct} className="h-1.5" />
                      </div>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Confirm Enrollment Modal */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground font-display">
              Confirmar inscripción
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              ¿Estás seguro de inscribirte en este curso?
            </DialogDescription>
          </DialogHeader>
          {selectedForEnroll && (
            <div className="p-4 rounded-lg bg-secondary/50 space-y-3">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {selectedForEnroll.name}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedForEnroll.code} · Sem. {selectedForEnroll.semester}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle className="w-3 h-3" />
                <span>{selectedForEnroll.credits} créditos</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="w-3 h-3" />
                <span>
                  {selectedForEnroll.slots - selectedForEnroll.occupied_slots}{" "}
                  cupos disponibles
                </span>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirm(false)}
              className="border-border text-foreground hover:bg-secondary"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmEnroll}
              disabled={enrolling}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {enrolling ? (
                <Spinner
                  size="sm"
                  className="border-primary-foreground/30 border-t-primary-foreground"
                />
              ) : (
                "Confirmar inscripción"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
