import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, Building, Calendar, Lock, Eye, EyeOff, BookOpen, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppLayout } from "@/components/AppLayout";
import { mockUser, mockEnrollments, mockActivityLogs } from "@/lib/mock-courses";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";

export default function Profile() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: mockUser.name, email: mockUser.email, phone: mockUser.phone });
  const [passwordForm, setPasswordForm] = useState({ current: "", newPass: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    toast({ title: "Perfil actualizado", description: "Tus datos se han guardado correctamente" });
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPass !== passwordForm.confirm) {
      toast({ title: "Error", description: "Las contraseñas no coinciden", variant: "destructive" });
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    setPasswordForm({ current: "", newPass: "", confirm: "" });
    toast({ title: "Contraseña actualizada" });
  };

  const myEnrollments = mockEnrollments.filter((e) => e.studentEmail === "juan@uni.edu");

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="px-6 pt-6 pb-4">
          <h1 className="text-2xl font-display font-bold text-foreground">Mi Perfil</h1>
          <p className="text-sm text-muted-foreground mt-1">Administra tu información personal</p>
        </div>

        <div className="px-6 pb-6">
          {/* Profile header */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-surface p-6 mb-6 flex items-center gap-5"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-2xl font-display font-bold text-primary">
              {mockUser.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-foreground">{mockUser.name}</h2>
              <p className="text-sm text-muted-foreground">{mockUser.role} · {mockUser.department}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Miembro desde {mockUser.joinedAt.toLocaleDateString("es", { month: "long", year: "numeric" })}
              </p>
            </div>
          </motion.div>

          <Tabs defaultValue="datos" className="space-y-4">
            <TabsList className="bg-secondary border border-border">
              <TabsTrigger value="datos" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Datos</TabsTrigger>
              <TabsTrigger value="inscripciones" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Inscripciones</TabsTrigger>
              <TabsTrigger value="seguridad" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Seguridad</TabsTrigger>
              <TabsTrigger value="actividad" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Actividad</TabsTrigger>
            </TabsList>

            <TabsContent value="datos">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-surface p-6 space-y-4" style={{ boxShadow: "var(--shadow-card)" }}>
                {[
                  { key: "name", label: "Nombre completo", icon: User, type: "text" },
                  { key: "email", label: "Correo electrónico", icon: Mail, type: "email" },
                  { key: "phone", label: "Teléfono", icon: Phone, type: "tel" },
                ].map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label className="text-foreground">{field.label}</Label>
                    <div className="relative">
                      <field.icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={field.type}
                        className="pl-10 bg-input border-border"
                        value={form[field.key as keyof typeof form]}
                        onChange={(e) => setForm((p) => ({ ...p, [field.key]: e.target.value }))}
                      />
                    </div>
                  </div>
                ))}
                <div className="space-y-2">
                  <Label className="text-foreground">Departamento</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-10 bg-input border-border" value={mockUser.department} disabled />
                  </div>
                </div>
                <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  {saving ? <Spinner size="sm" className="border-primary-foreground/30 border-t-primary-foreground" /> : "Guardar cambios"}
                </Button>
              </motion.div>
            </TabsContent>

            <TabsContent value="inscripciones">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-surface p-6" style={{ boxShadow: "var(--shadow-card)" }}>
                <div className="space-y-3">
                  {myEnrollments.map((enr) => (
                    <div key={enr.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-4 h-4 text-primary" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{enr.courseName}</p>
                          <p className="text-xs text-muted-foreground">{enr.courseCode} · {enr.enrolledAt.toLocaleDateString("es")}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className={`text-[10px] ${enr.status === "active" ? "bg-primary/10 text-primary" : enr.status === "completed" ? "bg-success/20 text-success" : "bg-destructive/10 text-destructive"}`}>
                        {enr.status === "active" ? "Activa" : enr.status === "completed" ? "Completada" : "Cancelada"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="seguridad">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-surface p-6 space-y-4" style={{ boxShadow: "var(--shadow-card)" }}>
                <h3 className="font-display font-semibold text-foreground">Cambiar contraseña</h3>
                {["current", "newPass", "confirm"].map((key, i) => (
                  <div key={key} className="space-y-2">
                    <Label className="text-foreground">{["Contraseña actual", "Nueva contraseña", "Confirmar nueva"][i]}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        className="pl-10 pr-10 bg-input border-border"
                        value={passwordForm[key as keyof typeof passwordForm]}
                        onChange={(e) => setPasswordForm((p) => ({ ...p, [key]: e.target.value }))}
                      />
                      {i === 1 && (
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <Button onClick={handleChangePassword} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  {saving ? <Spinner size="sm" className="border-primary-foreground/30 border-t-primary-foreground" /> : "Actualizar contraseña"}
                </Button>
              </motion.div>
            </TabsContent>

            <TabsContent value="actividad">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-surface p-6" style={{ boxShadow: "var(--shadow-card)" }}>
                <div className="space-y-3">
                  {mockActivityLogs.filter((l) => l.user === "Juan Pérez").map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                      <Activity className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-foreground">{log.detail}</p>
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
    </AppLayout>
  );
}
