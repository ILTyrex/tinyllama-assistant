import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, User, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/contexts/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  const [form, setForm] = useState({
    identification: "",
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    password: "",
    password_confirm: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const update = (field: string, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.identification.trim())
      e.identification = "La identificación es obligatoria";
    else if (!/^\d+$/.test(form.identification))
      e.identification = "Identificación inválida";
    if (!form.first_name.trim()) e.first_name = "El nombre es obligatorio";
    if (!form.last_name.trim()) e.last_name = "El apellido es obligatorio";
    if (form.phone && !/^\d+$/.test(form.phone)) e.phone = "Teléfono inválido";
    if (form.email && !/\S+@\S+\.\S+/.test(form.email))
      e.email = "Correo inválido";
    if (!form.password) e.password = "La contraseña es obligatoria";
    else if (form.password.length < 6) e.password = "Mínimo 6 caracteres";
    if (form.password !== form.password_confirm)
      e.password_confirm = "Las contraseñas no coinciden";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      await register(
        form.identification,
        form.first_name,
        form.last_name,
        form.phone,
        form.email,
        form.password,
        form.password_confirm,
      );
      navigate("/dashboard");
    } catch (error: any) {
      setErrors({
        general: error.message || "Error al registrarse. Intenta de nuevo.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      key: "identification",
      label: "Identificación",
      icon: User,
      type: "text",
      placeholder: "1234567890",
    },
    {
      key: "first_name",
      label: "Nombre",
      icon: User,
      type: "text",
      placeholder: "Juan",
    },
    {
      key: "last_name",
      label: "Apellido",
      icon: User,
      type: "text",
      placeholder: "Pérez",
    },
    {
      key: "phone",
      label: "Teléfono",
      icon: User,
      type: "text",
      placeholder: "3001234567",
    },
    {
      key: "email",
      label: "Correo electrónico",
      icon: Mail,
      type: "email",
      placeholder: "usuario@example.com",
    },
    {
      key: "password",
      label: "Contraseña",
      icon: Lock,
      type: "password",
      placeholder: "••••••••",
    },
    {
      key: "password_confirm",
      label: "Confirmar contraseña",
      icon: Lock,
      type: "password",
      placeholder: "••••••••",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
            <BookOpen className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold font-display gradient-text">
            Crear cuenta
          </h1>
          <p className="text-muted-foreground mt-1">Únete a AcademiaPro</p>
        </div>

        <div
          className="glass-surface p-8 shadow-lg"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
              >
                {errors.general}
              </motion.div>
            )}
            {fields.map((f) => (
              <div key={f.key} className="space-y-2">
                <Label htmlFor={f.key}>{f.label}</Label>
                <div className="relative">
                  <f.icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id={f.key}
                    type={
                      f.type === "password"
                        ? showPassword
                          ? "text"
                          : "password"
                        : f.type
                    }
                    placeholder={f.placeholder}
                    className="pl-10 bg-input border-border focus:border-primary focus:ring-primary/20"
                    value={form[f.key as keyof typeof form]}
                    onChange={(e) => update(f.key, e.target.value)}
                  />
                  {f.type === "password" && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>
                {errors[f.key] && (
                  <p className="text-destructive text-xs">{errors[f.key]}</p>
                )}
              </div>
            ))}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-11 mt-2 glow-border"
            >
              {loading ? (
                <Spinner
                  size="sm"
                  className="border-primary-foreground/30 border-t-primary-foreground"
                />
              ) : (
                "Registrarse"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{" "}
              <Link
                to="/login"
                className="text-primary hover:underline font-medium"
              >
                Iniciar sesión
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
