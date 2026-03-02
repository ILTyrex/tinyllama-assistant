import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Calendar, BookOpen, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AppLayout } from "@/components/AppLayout";
import { mockCourses, mockEnrollments, Enrollment } from "@/lib/mock-courses";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";

export default function EnrollmentPage() {
  const { toast } = useToast();
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollments, setEnrollments] = useState<Enrollment[]>(mockEnrollments.filter((e) => e.studentEmail === "juan@uni.edu"));

  const selectedCourse = mockCourses.find((c) => c.id === selectedCourseId);
  const availableCourses = mockCourses.filter((c) => c.status !== "full");

  const handleEnroll = async () => {
    setEnrolling(true);
    await new Promise((r) => setTimeout(r, 1500));
    if (selectedCourse) {
      const newEnrollment: Enrollment = {
        id: `e-${Date.now()}`,
        courseId: selectedCourse.id,
        courseName: selectedCourse.name,
        courseCode: selectedCourse.code,
        studentName: "Juan Pérez",
        studentEmail: "juan@uni.edu",
        enrolledAt: new Date(),
        status: "active",
      };
      setEnrollments((prev) => [newEnrollment, ...prev]);
      toast({ title: "¡Inscripción exitosa!", description: `Te has inscrito en ${selectedCourse.name}` });
    }
    setEnrolling(false);
    setShowConfirm(false);
    setSelectedCourseId("");
  };

  const statusColors: Record<string, string> = {
    active: "bg-primary/10 text-primary",
    completed: "bg-success/20 text-success",
    cancelled: "bg-destructive/10 text-destructive",
  };
  const statusLabels: Record<string, string> = {
    active: "Activa",
    completed: "Completada",
    cancelled: "Cancelada",
  };

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="px-6 pt-6 pb-4">
          <h1 className="text-2xl font-display font-bold text-foreground">Inscripción</h1>
          <p className="text-sm text-muted-foreground mt-1">Inscríbete en cursos electivos</p>
        </div>

        <div className="px-6 pb-6 space-y-6">
          {/* Enrollment form */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-surface p-6"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <h2 className="font-display font-semibold text-foreground mb-4">Seleccionar curso</h2>
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[250px]">
                <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="Elige un curso electivo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCourses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.code} — {c.name} ({c.totalSlots - c.enrolledCount} cupos)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                disabled={!selectedCourseId}
                onClick={() => setShowConfirm(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 glow-border"
              >
                Inscribirse
              </Button>
            </div>

            {selectedCourse && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-4 p-4 rounded-lg bg-secondary/50 space-y-2"
              >
                <p className="text-sm font-medium text-foreground">{selectedCourse.name}</p>
                <p className="text-xs text-muted-foreground">{selectedCourse.teacher} · {selectedCourse.schedule}</p>
                <p className="text-xs text-muted-foreground">{selectedCourse.credits} créditos · {selectedCourse.totalSlots - selectedCourse.enrolledCount} cupos disponibles</p>
              </motion.div>
            )}
          </motion.div>

          {/* Enrollment history */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-surface p-6"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <h2 className="font-display font-semibold text-foreground mb-4">Mis inscripciones</h2>
            <div className="space-y-3">
              {enrollments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tienes inscripciones aún</p>
              ) : (
                enrollments.map((enr) => (
                  <div key={enr.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{enr.courseName}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{enr.courseCode}</span>
                          <span>·</span>
                          <Calendar className="w-3 h-3" />
                          <span>{enr.enrolledAt.toLocaleDateString("es")}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className={`text-[10px] ${statusColors[enr.status]}`}>
                      {statusLabels[enr.status]}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Confirm Modal */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground font-display">Confirmar inscripción</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              ¿Estás seguro de inscribirte en este curso?
            </DialogDescription>
          </DialogHeader>
          {selectedCourse && (
            <div className="p-4 rounded-lg bg-secondary/50 space-y-2">
              <p className="text-sm font-semibold text-foreground">{selectedCourse.name}</p>
              <p className="text-xs text-muted-foreground">{selectedCourse.code} · {selectedCourse.teacher}</p>
              <p className="text-xs text-muted-foreground">{selectedCourse.schedule}</p>
              <p className="text-xs text-muted-foreground">{selectedCourse.credits} créditos</p>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowConfirm(false)} className="border-border text-foreground hover:bg-secondary">
              Cancelar
            </Button>
            <Button onClick={handleEnroll} disabled={enrolling} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {enrolling ? <Spinner size="sm" className="border-primary-foreground/30 border-t-primary-foreground" /> : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
