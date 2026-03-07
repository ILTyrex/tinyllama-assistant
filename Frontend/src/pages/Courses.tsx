import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Clock,
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
import EnrollmentsAPI, { Enrollment } from "@/api/enrollments.api";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { CourseDetail } from "@/components/CourseDetail";

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
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [enrolling, setEnrolling] = useState(false);
  const [loading, setLoading] = useState(false);

  const enrolledIds = useMemo(
    () => new Set(enrollments.map((e) => e.course.id)),
    [enrollments],
  );

  // Cargar cursos e inscripciones al montar
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        const [courseData, enrollmentData] = await Promise.all([
          CourseAPI.getCourses(),
          EnrollmentsAPI.getMyEnrollments(),
        ]);
        setCourses(courseData);
        setEnrollments(enrollmentData);
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudieron cargar los cursos",
        });
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, []);

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
    if (course.is_enrolled || enrolledIds.has(course.id)) {
      toast({
        title: "Ya estás inscrito",
        description: "Ya estás inscrito en este curso.",
      });
      return;
    }

    setSelectedForEnroll(course);
    setShowConfirm(true);
  };

  const handleCancelEnrollment = async (enrollmentId: number) => {
    const enrollment = enrollments.find((e) => e.id === enrollmentId);
    if (!enrollment) return;

    try {
      await EnrollmentsAPI.cancelEnrollment(enrollmentId);

      setEnrollments((prev) => prev.filter((e) => e.id !== enrollmentId));

      setCourses((prev) =>
        prev.map((course) => {
          if (course.id !== enrollment.course.id) return course;
          return {
            ...course,
            occupied_slots: Math.max(0, course.occupied_slots - 1),
            status: "open",
          };
        }),
      );

      toast({
        title: "Inscripción cancelada",
        description: "Ya no estás inscrito en ese curso.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.detail ||
          error?.message ||
          "No se pudo cancelar la inscripción.",
        variant: "destructive",
      });
    }
  };

  const handleConfirmEnroll = async () => {
    if (!selectedForEnroll) return;

    setEnrolling(true);

    try {
      const updatedCourse = await CourseAPI.enrollCourse(selectedForEnroll.id);

      setCourses((prev) =>
        prev.map((c) => (c.id === updatedCourse.id ? updatedCourse : c)),
      );

      setSelected((prev) =>
        prev?.id === updatedCourse.id ? updatedCourse : prev,
      );

      // Refrescar las inscripciones desde el backend para que quede consistente
      const updatedEnrollments = await EnrollmentsAPI.getMyEnrollments();
      setEnrollments(updatedEnrollments);

      toast({
        title: "¡Inscripción exitosa!",
        description: `Te has inscrito en ${updatedCourse.name}`,
      });
    } catch (error: any) {
      toast({
        title: "Error al inscribir",
        description:
          error?.detail ||
          error?.message ||
          "No se pudo procesar la inscripción.",
        variant: "destructive",
      });
    } finally {
      setEnrolling(false);
      setShowConfirm(false);
      setSelectedForEnroll(null);
      setSelected(null);
    }
  };

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-6">
        {selected ? (
          <CourseDetail
            course={selected}
            isEnrolled={
              !!(selected.is_enrolled || enrolledIds.has(selected.id))
            }
            onBack={() => setSelected(null)}
            onEnroll={handleEnroll}
          />
        ) : (
          <>
            <div className="px-6 pt-6 pb-4">
              <h1 className="text-2xl font-display font-bold text-foreground">
                Cursos Electivos
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Explora y inscríbete en tus cursos electivos
              </p>
            </div>

            <div className="px-6 pb-6 space-y-5">
              {enrollments.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">
                        Mis cursos inscritos
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Aquí puedes ver los cursos en los que estás inscrito.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {enrollments.map((enrollment) => (
                      <motion.div
                        key={enrollment.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div
                          className="w-full glass-surface p-5 border border-border transition-all"
                          style={{ boxShadow: "var(--shadow-card)" }}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge
                                  variant="secondary"
                                  className="bg-primary/10 text-primary text-[10px]"
                                >
                                  {enrollment.course.code}
                                </Badge>
                                <Badge
                                  variant="secondary"
                                  className="bg-secondary text-secondary-foreground text-[10px]"
                                >
                                  Inscrito
                                </Badge>
                              </div>
                              <h3 className="font-display font-semibold text-foreground">
                                {enrollment.course.name}
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                {enrollment.course.credits} créditos • Sem.{" "}
                                {enrollment.course.semester}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              onClick={() =>
                                handleCancelEnrollment(enrollment.id)
                              }
                              className="self-start"
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

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
                <Select
                  value={semesterFilter}
                  onValueChange={setSemesterFilter}
                >
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
                    <SelectItem value="available">
                      Con cupos disponibles
                    </SelectItem>
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
                            {(course.is_enrolled ||
                              enrolledIds.has(course.id)) && (
                              <Badge
                                variant="secondary"
                                className="bg-secondary/20 text-secondary text-[10px]"
                              >
                                Inscrito
                              </Badge>
                            )}
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
                                  pct >= 90
                                    ? "text-destructive"
                                    : "text-primary"
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
          </>
        )}
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
