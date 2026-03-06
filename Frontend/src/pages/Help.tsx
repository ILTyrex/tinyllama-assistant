import { motion } from "framer-motion";
import {
  HelpCircle,
  BookOpen,
  Mail,
  MessageSquare,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AppLayout } from "@/components/AppLayout";

const faqs = [
  {
    q: "¿Cómo me inscribo en un curso electivo?",
    a: "Ve a la sección 'Inscripción' desde el menú lateral. Selecciona el curso deseado del dropdown, revisa los detalles y confirma tu inscripción en el modal de confirmación.",
  },
  {
    q: "¿Puedo cancelar una inscripción?",
    a: "Sí, puedes cancelar desde tu perfil en la pestaña 'Inscripciones'. La cancelación debe hacerse antes de la fecha límite establecida por la administración.",
  },
  {
    q: "¿Qué pasa si el curso está lleno?",
    a: "Si un curso alcanzó su capacidad máxima, aparecerá como 'Sin cupos'. Puedes contactar a la administración para solicitar cupos adicionales o esperar a que se libere un lugar.",
  },
  {
    q: "¿Cómo veo los requisitos de un curso?",
    a: "Entra a 'Cursos Electivos' y selecciona el curso. En la vista detallada encontrarás los requisitos previos, horario, docente y toda la información relevante.",
  },
  {
    q: "¿Puedo exportar mis reportes?",
    a: "Sí, desde la sección 'Reportes' puedes exportar los listados en formato CSV o PDF usando los botones de exportación en la parte superior.",
  },
  {
    q: "¿Cómo cambio mi contraseña?",
    a: "Ve a 'Perfil' → pestaña 'Seguridad'. Ingresa tu contraseña actual, la nueva contraseña y confírmala para actualizar.",
  },
];

const steps = [
  {
    n: 1,
    title: "Explora cursos",
    desc: "Navega a 'Cursos Electivos' para ver todos los cursos disponibles con sus detalles.",
  },
  {
    n: 2,
    title: "Revisa detalles",
    desc: "Haz clic en un curso para ver descripción, docente, horario, requisitos y disponibilidad.",
  },
  {
    n: 3,
    title: "Inscríbete",
    desc: "Ve a 'Inscripción', selecciona tu curso y confirma. Recibirás una confirmación inmediata.",
  },
  {
    n: 4,
    title: "Gestiona",
    desc: "Desde tu perfil puedes ver tus inscripciones activas, historial y actividad reciente.",
  },
];

export default function Help() {
  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="px-6 pt-6 pb-4">
          <h1 className="text-2xl font-display font-bold text-foreground">
            Centro de Ayuda
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Guías, FAQ y soporte
          </p>
        </div>

        <div className="px-6 pb-6 space-y-6 max-w-4xl">
          {/* Onboarding */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-surface p-6"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <div className="flex items-center gap-2 mb-5">
              <BookOpen className="w-5 h-5 text-primary" />
              <h2 className="font-display font-semibold text-foreground">
                Guía rápida
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {steps.map((step, i) => (
                <motion.div
                  key={step.n}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 rounded-xl bg-secondary/50 border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-display font-bold text-primary mb-3">
                    {step.n}
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">
                    {step.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* FAQ */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-surface p-6"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <div className="flex items-center gap-2 mb-5">
              <HelpCircle className="w-5 h-5 text-primary" />
              <h2 className="font-display font-semibold text-foreground">
                Preguntas frecuentes
              </h2>
            </div>
            <Accordion type="single" collapsible className="space-y-2">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="border-border rounded-lg bg-secondary/30 px-4"
                >
                  <AccordionTrigger className="text-sm text-foreground hover:text-primary py-4 hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pb-4 leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>

          {/* Support contact */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-surface p-6"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-5 h-5 text-primary" />
              <h2 className="font-display font-semibold text-foreground">
                Contacto de soporte
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                <p className="text-sm font-medium text-foreground mb-1">
                  Correo electrónico
                </p>
                <p className="text-sm text-primary">soporte@academiapro.edu</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Respuesta en máximo 24 horas
                </p>
              </div>
              <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                <p className="text-sm font-medium text-foreground mb-1">
                  Chat en vivo
                </p>
                <p className="text-sm text-muted-foreground">
                  Lunes a Viernes, 8:00 - 18:00
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 border-border text-foreground hover:bg-secondary gap-1"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Iniciar chat
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
