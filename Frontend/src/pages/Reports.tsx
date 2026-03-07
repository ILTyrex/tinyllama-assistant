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
import CourseAPI, { Course } from "@/api/courses.api";
import { ReportsAPI, EnrollmentReport } from "@/api/reports.api";
import { useToast } from "@/hooks/use-toast";
import Papa from "papaparse";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Reports() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentReport[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);

  useEffect(() => {
    loadCourses();
    loadEnrollments();
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

  const loadEnrollments = async () => {
    try {
      setLoadingEnrollments(true);
      const data = await ReportsAPI.getEnrollments();
      // Map backend status to frontend
      const mappedData = data.map(enr => ({
        ...enr,
        status: mapStatus(enr.status)
      }));
      setEnrollments(mappedData);
    } catch (error) {
      console.error("Error loading enrollments", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los reportes",
        variant: "destructive",
      });
    } finally {
      setLoadingEnrollments(false);
    }
  };

  const mapStatus = (backendStatus: string): string => {
    switch (backendStatus) {
      case "inscrito": return "active";
      case "aprobado": return "completed";
      case "reprobado": return "cancelled";
      case "cancelado": return "cancelled";
      default: return "active";
    }
  };

  const filtered = useMemo(() => {
    return enrollments.filter((e) => {
      const matchSearch =
        e.studentName.toLowerCase().includes(search.toLowerCase()) ||
        e.courseCode.toLowerCase().includes(search.toLowerCase());
      const matchCourse = courseFilter === "all" || e.courseCode === courseFilter;
      const matchStatus = statusFilter === "all" || e.status === statusFilter;
      return matchSearch && matchCourse && matchStatus;
    });
  }, [search, courseFilter, statusFilter, enrollments]);

  const handleExport = (format: string) => {
    if (filtered.length === 0) {
      toast({
        title: "No hay datos",
        description: "No hay registros para exportar",
        variant: "destructive",
      });
      return;
    }

    if (format === "csv") {
      exportToCSV();
    } else if (format === "pdf") {
      exportToPDF();
    }

    toast({
      title: `Exportando en ${format.toUpperCase()}`,
      description: `${filtered.length} registros exportados`,
    });
  };

  const exportToCSV = () => {
    const data = filtered.map(enr => ({
      "Estudiante": enr.studentName,
      "Email": enr.studentEmail,
      "Curso": enr.courseName,
      "Código": enr.courseCode,
      "Fecha de Inscripción": new Date(enr.enrolledAt).toLocaleDateString("es"),
      "Estado": statusLabels[enr.status],
    }));

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `reportes_inscripciones_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text("Reportes de Inscripciones", 14, 22);

    // Summary
    doc.setFontSize(12);
    doc.text(`Total de registros: ${filtered.length}`, 14, 35);
    doc.text(`Activas: ${filtered.filter(e => e.status === "active").length}`, 14, 45);
    doc.text(`Completadas: ${filtered.filter(e => e.status === "completed").length}`, 14, 55);
    doc.text(`Canceladas: ${filtered.filter(e => e.status === "cancelled").length}`, 14, 65);

    // Table
    const tableData = filtered.map(enr => [
      enr.studentName,
      enr.studentEmail,
      enr.courseName,
      enr.courseCode,
      new Date(enr.enrolledAt).toLocaleDateString("es"),
      statusLabels[enr.status],
    ]);

    autoTable(doc, {
      head: [["Estudiante", "Email", "Curso", "Código", "Fecha", "Estado"]],
      body: tableData,
      startY: 75,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    doc.save(`reportes_inscripciones_${new Date().toISOString().split('T')[0]}.pdf`);
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
                  <SelectItem key={c.id} value={c.code}>
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
                {loadingEnrollments ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground py-8"
                    >
                      <Loader2 className="w-8 h-8 mx-auto mb-2 opacity-50 animate-spin" />
                      Cargando reportes...
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
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
                          {new Date(enr.enrolledAt).toLocaleDateString("es")}
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
                    {filtered.length === 0 && !loadingEnrollments && (
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
                  </>
                )}
              </TableBody>
            </Table>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
