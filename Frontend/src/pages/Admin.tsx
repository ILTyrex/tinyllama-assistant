import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Save, Trash2, Activity, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AppLayout } from "@/components/AppLayout";
import { mockCourses, mockActivityLogs, Course } from "@/lib/mock-courses";
import { useToast } from "@/hooks/use-toast";

export default function Admin() {
  const { toast } = useToast();
  const [courses, setCourses] = useState(mockCourses);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newCourse, setNewCourse] = useState({ name: "", code: "", teacher: "", totalSlots: 30 });

  const handleSaveSlots = (id: string, slots: number) => {
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, totalSlots: slots } : c)));
    toast({ title: "Cupos actualizados" });
  };

  const handleCreate = () => {
    const course: Course = {
      id: `c-${Date.now()}`,
      name: newCourse.name,
      code: newCourse.code,
      description: "Nuevo curso por configurar",
      teacher: newCourse.teacher,
      schedule: "Por definir",
      requirements: [],
      totalSlots: newCourse.totalSlots,
      enrolledCount: 0,
      status: "open",
      category: "General",
      startDate: new Date(),
      endDate: new Date(),
      credits: 3,
    };
    setCourses((prev) => [course, ...prev]);
    setShowCreate(false);
    setNewCourse({ name: "", code: "", teacher: "", totalSlots: 30 });
    toast({ title: "Curso creado", description: course.name });
  };

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="px-6 pt-6 pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Configuración</h1>
            <p className="text-sm text-muted-foreground mt-1">Administración de cursos y sistema</p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            <Plus className="w-4 h-4" /> Crear curso
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
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Código</TableHead>
                      <TableHead className="text-muted-foreground">Nombre</TableHead>
                      <TableHead className="text-muted-foreground">Docente</TableHead>
                      <TableHead className="text-muted-foreground">Cupos</TableHead>
                      <TableHead className="text-muted-foreground">Inscritos</TableHead>
                      <TableHead className="text-muted-foreground">Estado</TableHead>
                      <TableHead className="text-muted-foreground w-24">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.map((c) => (
                      <TableRow key={c.id} className="border-border hover:bg-secondary/30">
                        <TableCell className="font-mono text-sm text-foreground">{c.code}</TableCell>
                        <TableCell className="text-sm text-foreground">{c.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{c.teacher}</TableCell>
                        <TableCell className="text-sm text-foreground">{c.totalSlots}</TableCell>
                        <TableCell className="text-sm text-foreground">{c.enrolledCount}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`text-[10px] ${c.status === "full" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
                            {c.status === "full" ? "Lleno" : "Abierto"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setEditCourse(c)}>
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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

      {/* Edit course modal */}
      <Dialog open={!!editCourse} onOpenChange={() => setEditCourse(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground font-display">Editar cupos — {editCourse?.code}</DialogTitle>
          </DialogHeader>
          {editCourse && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-foreground">Total de cupos</Label>
                <Input
                  type="number"
                  className="bg-input border-border"
                  value={editCourse.totalSlots}
                  onChange={(e) => setEditCourse({ ...editCourse, totalSlots: Number(e.target.value) })}
                />
              </div>
              <p className="text-xs text-muted-foreground">Inscritos actuales: {editCourse.enrolledCount}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCourse(null)} className="border-border text-foreground">Cancelar</Button>
            <Button
              onClick={() => { if (editCourse) { handleSaveSlots(editCourse.id, editCourse.totalSlots); setEditCourse(null); } }}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Save className="w-4 h-4 mr-2" /> Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create course modal */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground font-display">Crear nuevo curso</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {[
              { key: "name", label: "Nombre del curso", type: "text" },
              { key: "code", label: "Código", type: "text" },
              { key: "teacher", label: "Docente", type: "text" },
              { key: "totalSlots", label: "Cupos totales", type: "number" },
            ].map((f) => (
              <div key={f.key} className="space-y-2">
                <Label className="text-foreground">{f.label}</Label>
                <Input
                  type={f.type}
                  className="bg-input border-border"
                  value={newCourse[f.key as keyof typeof newCourse]}
                  onChange={(e) => setNewCourse((p) => ({ ...p, [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value }))}
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)} className="border-border text-foreground">Cancelar</Button>
            <Button onClick={handleCreate} disabled={!newCourse.name || !newCourse.code} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Crear curso
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
