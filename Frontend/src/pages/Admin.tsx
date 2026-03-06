import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Activity, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AppLayout } from "@/components/AppLayout";
import { mockActivityLogs } from "@/lib/mock-courses";
import { useToast } from "@/hooks/use-toast";
import CourseAPI, { Course } from "@/api/courses.api";
import { CreateCourseDialog } from "@/components/courses/CreateCourseDialog";

export default function Admin() {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(false);

  // Cargar cursos al montar el componente
  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await CourseAPI.getCourses();
      setCourses(data);
    } catch (error) {
      toast({ title: "Error", description: "No se pudieron cargar los cursos" });
    } finally {
      setLoading(false);
    }
  };

  const handleCourseCreated = (course: Course) => {
    setCourses((prev) => [course, ...prev]);
    toast({ title: "Curso creado", description: course.name });
  };

  const handleCourseUpdated = (updated: Course) => {
    setCourses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    toast({ title: "Curso actualizado", description: updated.name });
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      setEditCourse(null);
    }
    setShowCreate(open);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este curso?")) return;

    try {
      setLoading(true);
      await CourseAPI.deleteCourse(id);
      setCourses((prev) => prev.filter((c) => c.id !== id));
      toast({ title: "Curso eliminado" });
    } catch (error) {
      toast({ title: "Error", description: "No se pudo eliminar el curso" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="px-6 pt-6 pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Configuración</h1>
            <p className="text-sm text-muted-foreground mt-1">Administración de cursos y sistema</p>
          </div>
          <Button
            onClick={() => {
              setEditCourse(null);
              setShowCreate(true);
            }}
            disabled={loading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Crear curso
          </Button>
        </div>

        <div className="px-6 pb-6">
          <Tabs defaultValue="cursos" className="space-y-4">
            <TabsList className="bg-secondary border border-border">
              <TabsTrigger value="cursos" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Cursos</TabsTrigger>
              <TabsTrigger value="logs" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="cursos">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-surface overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
                {loading && courses.length === 0 ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-muted-foreground">Código</TableHead>
                        <TableHead className="text-muted-foreground">Nombre</TableHead>
                        <TableHead className="text-muted-foreground">Créditos</TableHead>
                        <TableHead className="text-muted-foreground">Cupos</TableHead>
                        <TableHead className="text-muted-foreground">Ocupados</TableHead>
                        <TableHead className="text-muted-foreground">Estado</TableHead>
                        <TableHead className="text-muted-foreground w-24">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courses.map((c, idx) => (
                        <TableRow key={c.id ?? idx} className="border-border hover:bg-secondary/30">
                          <TableCell className="font-mono text-sm text-foreground">{c.code}</TableCell>
                          <TableCell className="text-sm text-foreground">{c.name}</TableCell>
                          <TableCell className="text-sm text-foreground">{c.credits}</TableCell>
                          <TableCell className="text-sm text-foreground">{c.slots}</TableCell>
                          <TableCell className="text-sm text-foreground">{c.occupied_slots}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={`text-[10px] ${c.status === "closed" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
                              {c.status === "closed" ? "Cerrado" : "Abierto"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={() => {
                                  setEditCourse(c);
                                  setShowCreate(true);
                                }}
                                disabled={loading}
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(c.id)} disabled={loading}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </motion.div>
            </TabsContent>

            <TabsContent value="logs">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-surface p-6" style={{ boxShadow: "var(--shadow-card)" }}>
                <div className="space-y-3">
                  {mockActivityLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                      <Activity className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-secondary text-secondary-foreground text-[10px]">{log.action}</Badge>
                          <span className="text-xs text-muted-foreground">{log.user}</span>
                        </div>
                        <p className="text-sm text-foreground mt-1">{log.detail}</p>
                        <p className="text-xs text-muted-foreground mt-1">{log.timestamp.toLocaleString("es")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>


      <CreateCourseDialog
        open={showCreate}
        onOpenChange={handleDialogOpenChange}
        courseToEdit={editCourse}
        onCreated={handleCourseCreated}
        onUpdated={handleCourseUpdated}
      />
    </AppLayout>
  );
}
