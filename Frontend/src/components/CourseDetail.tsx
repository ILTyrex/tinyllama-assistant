import { motion } from "framer-motion";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Course } from "@/api/courses.api";

export function CourseDetail({
  course,
  onBack,
  onEnroll,
  isEnrolled,
}: {
  course: Course;
  onBack: () => void;
  onEnroll: (course: Course) => void;
  isEnrolled?: boolean;
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
            disabled={course.status === "closed" || isEnrolled}
            className="bg-primary text-primary-foreground hover:bg-primary/90 glow-border"
          >
            {course.status === "closed"
              ? "Cerrado"
              : isEnrolled
                ? "Ya inscrito"
                : "Inscribirse"}
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
