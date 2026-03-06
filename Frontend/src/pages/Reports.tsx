import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, FileText, Search, Filter, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AppLayout } from "@/components/AppLayout";
import { mockEnrollments } from "@/lib/mock-courses";
import CourseAPI, { Course } from "@/api/courses.api";
import { useToast } from "@/hooks/use-toast";

export default function Reports() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoadingCourses(true);
      const data = await CourseAPI.getCourses();
      setCourses(data);
    } catch (error) {
      console.error("Error loading courses", error);
    } finally {
      setLoadingCourses(false);
    }
  };

  const filtered = useMemo(() => {
    return mockEnrollments.filter((e) => {
      const matchSearch =
        e.studentName.toLowerCase().includes(search.toLowerCase()) ||
        e.courseCode.toLowerCase().includes(search.toLowerCase());
      const matchCourse = courseFilter === "all" || e.courseId === courseFilter;
      const matchStatus = statusFilter === "all" || e.status === statusFilter;
      return matchSearch && matchCourse && matchStatus;
    });
  }, [search, courseFilter, statusFilter]);

  const handleExport = (format: string) => {
    toast({
      title: `Exportando en ${format.toUpperCase()}`,
      description: `${filtered.length} registros seleccionados`,
    });
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
        <div className="px-6 pt-6 pb-4 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Listados y Reportes
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Exporta y filtra listados de inscripciones
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleExport("csv")}
              className="border-border text-foreground hover:bg-secondary gap-2"
            >
              <Download className="w-4 h-4" /> CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport("pdf")}
              className="border-border text-foreground hover:bg-secondary gap-2"
            >
              <FileText className="w-4 h-4" /> PDF
            </Button>
          </div>
        </div>

        <div className="px-6 pb-6 space-y-5">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar estudiante o código..."
                className="pl-10 bg-card border-border"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              value={courseFilter}
              onValueChange={setCourseFilter}
              disabled={loadingCourses}
            >
              <SelectTrigger className="w-48 bg-card border-border">
                <SelectValue placeholder="Curso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los cursos</SelectItem>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>
                    {c.code} — {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36 bg-card border-border">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activa</SelectItem>
                <SelectItem value="completed">Completada</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Summary */}
          <div className="flex gap-4">
            <div
              className="glass-surface px-4 py-3 flex-1"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <p className="text-xs text-muted-foreground">Total registros</p>
              <p className="text-xl font-display font-bold text-foreground">
                {filtered.length}
              </p>
            </div>
            <div
              className="glass-surface px-4 py-3 flex-1"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <p className="text-xs text-muted-foreground">Activas</p>
              <p className="text-xl font-display font-bold text-primary">
                {filtered.filter((e) => e.status === "active").length}
              </p>
            </div>
            <div
              className="glass-surface px-4 py-3 flex-1"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <p className="text-xs text-muted-foreground">Canceladas</p>
              <p className="text-xl font-display font-bold text-destructive">
                {filtered.filter((e) => e.status === "cancelled").length}
              </p>
            </div>
          </div>

          {/* Table */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-surface overflow-hidden"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">
                    Estudiante
                  </TableHead>
                  <TableHead className="text-muted-foreground">Curso</TableHead>
                  <TableHead className="text-muted-foreground">
                    Código
                  </TableHead>
                  <TableHead className="text-muted-foreground">Fecha</TableHead>
                  <TableHead className="text-muted-foreground">
                    Estado
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((enr) => (
                  <TableRow
                    key={enr.id}
                    className="border-border hover:bg-secondary/30"
                  >
                    <TableCell className="text-foreground text-sm">
                      {enr.studentName}
                    </TableCell>
                    <TableCell className="text-foreground text-sm">
                      {enr.courseName}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm font-mono">
                      {enr.courseCode}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {enr.enrolledAt.toLocaleDateString("es")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] ${statusColors[enr.status]}`}
                      >
                        {statusLabels[enr.status]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground py-8"
                    >
                      <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      No se encontraron registros
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
