import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BookOpen, Clock, User, CheckCircle, AlertCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppLayout } from "@/components/AppLayout";
import { mockCourses, Course } from "@/lib/mock-courses";

function CourseDetail({ course, onBack }: { course: Course; onBack: () => void }) {
  const pct = Math.round((course.enrolledCount / course.totalSlots) * 100);
  const remaining = course.totalSlots - course.enrolledCount;
  const navigate = useNavigate();

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="text-muted-foreground hover:text-foreground">
        ← Volver a cursos
      </Button>

      <div className="glass-surface p-6" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">{course.code}</Badge>
              <Badge
                variant="secondary"
                className={`text-xs ${
                  course.status === "full"
                    ? "bg-destructive/10 text-destructive"
                    : "bg-primary/10 text-primary"
                }`}
              >
                {course.status === "full" ? "Sin cupos" : "Abierto"}
              </Badge>
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground">{course.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">{course.credits} créditos · {course.category}</p>
          </div>
          <Button
            onClick={() => navigate("/enrollment")}
            disabled={course.status === "full"}
            className="bg-primary text-primary-foreground hover:bg-primary/90 glow-border"
          >
            {course.status === "full" ? "Sin cupos" : "Inscribirse"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Description */}
          <div className="glass-surface p-5" style={{ boxShadow: "var(--shadow-card)" }}>
            <h3 className="font-display font-semibold text-foreground mb-3">Descripción</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{course.description}</p>
          </div>

          {/* Requirements */}
          <div className="glass-surface p-5" style={{ boxShadow: "var(--shadow-card)" }}>
            <h3 className="font-display font-semibold text-foreground mb-3">Requisitos previos</h3>
            {course.requirements.length > 0 ? (
              <ul className="space-y-2">
                {course.requirements.map((req) => (
                  <li key={req} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    {req}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No tiene requisitos previos</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {/* Teacher & Schedule */}
          <div className="glass-surface p-5 space-y-4" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Docente</p>
                <p className="text-sm font-medium text-foreground">{course.teacher}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Horario</p>
                <p className="text-sm font-medium text-foreground">{course.schedule}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Periodo</p>
              <p className="text-sm text-foreground">
                {course.startDate.toLocaleDateString("es")} - {course.endDate.toLocaleDateString("es")}
              </p>
            </div>
          </div>

          {/* Capacity */}
          <div className="glass-surface p-5" style={{ boxShadow: "var(--shadow-card)" }}>
            <h3 className="font-display font-semibold text-foreground mb-3">Cupos</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Inscritos</span>
                <span className="text-foreground font-medium">{course.enrolledCount} / {course.totalSlots}</span>
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
  const [selected, setSelected] = useState<Course | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const categories = Array.from(new Set(mockCourses.map((c) => c.category)));

  const filtered = mockCourses.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "all" || c.category === category;
    return matchSearch && matchCat;
  });

  if (selected) {
    return (
      <AppLayout>
        <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-6">
          <CourseDetail course={selected} onBack={() => setSelected(null)} />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="px-6 pt-6 pb-4">
          <h1 className="text-2xl font-display font-bold text-foreground">Cursos Electivos</h1>
          <p className="text-sm text-muted-foreground mt-1">Explora y selecciona tus cursos electivos</p>
        </div>

        <div className="px-6 pb-6 space-y-5">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar curso..." className="pl-10 bg-card border-border" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-40 bg-card border-border">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Course grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((course, i) => {
              const pct = Math.round((course.enrolledCount / course.totalSlots) * 100);
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
                      <Badge variant="secondary" className="bg-primary/10 text-primary text-[10px]">{course.code}</Badge>
                      <Badge variant="secondary" className="bg-secondary text-secondary-foreground text-[10px]">{course.category}</Badge>
                    </div>
                    <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
                      {course.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-3">{course.teacher} · {course.credits} créditos</p>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{course.enrolledCount}/{course.totalSlots} inscritos</span>
                        <span className={pct >= 90 ? "text-destructive" : "text-primary"}>{pct}%</span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
