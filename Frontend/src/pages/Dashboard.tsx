import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AppLayout } from "@/components/AppLayout";
import CourseAPI, { Course } from "@/api/courses.api";

export default function Dashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await CourseAPI.getCourses();
      setCourses(data);
    } catch (error) {
      console.error("Error loading courses", error);
    } finally {
      setLoading(false);
    }
  };

  const lowCapacity = courses.filter(
    (c) => c.status === "open" && (c.slots - c.occupied_slots) <= 5
  );

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Resumen general de cursos electivos</p>
        </div>

        <div className="px-6 pb-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Low capacity alerts */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-surface p-5"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  Cursos con cupos bajos
                </h2>
                <div className="space-y-3">
                  {lowCapacity.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Todos los cursos tienen cupos disponibles</p>
                  ) : (
                    lowCapacity.map((course) => {
                      const remaining = course.slots - course.occupied_slots;
                      const pct = Math.round((course.occupied_slots / course.slots) * 100);
                      return (
                        <div key={course.id} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-foreground truncate">{course.name}</p>
                              <Badge variant="secondary" className="text-[10px] bg-warning/10 text-warning border-warning/20">
                                {remaining} cupos
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{course.code} · Sem. {course.semester}</p>
                          </div>
                          <div className="w-32 flex-shrink-0">
                            <Progress value={pct} className="h-2" />
                            <p className="text-[10px] text-muted-foreground mt-1 text-right">{pct}%</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>

              {/* All courses quick list */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-surface p-5"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <h2 className="font-display font-semibold text-foreground mb-4">Todos los cursos</h2>
                <div className="space-y-2">
                  {courses.map((course) => {
                    const pct = Math.round((course.occupied_slots / course.slots) * 100);
                    return (
                      <div key={course.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/30 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{course.name}</p>
                          <p className="text-xs text-muted-foreground">{course.code} · Sem. {course.semester}</p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] ${
                        course.status === "closed"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {course.status === "closed" ? "Cerrado" : `${course.occupied_slots}/${course.slots}`}
                    </Badge>
                    <div className="w-20 flex-shrink-0">
                      <Progress value={pct} className="h-1.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
