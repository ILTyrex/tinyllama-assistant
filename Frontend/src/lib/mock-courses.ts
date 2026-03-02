export interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
  teacher: string;
  schedule: string;
  requirements: string[];
  totalSlots: number;
  enrolledCount: number;
  status: "open" | "closed" | "full";
  category: string;
  startDate: Date;
  endDate: Date;
  credits: number;
}

export interface Enrollment {
  id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  studentName: string;
  studentEmail: string;
  enrolledAt: Date;
  status: "active" | "completed" | "cancelled";
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  phone: string;
  department: string;
  joinedAt: Date;
}

export interface ActivityLog {
  id: string;
  action: string;
  detail: string;
  timestamp: Date;
  user: string;
}

export const mockCourses: Course[] = [
  {
    id: "c1",
    name: "Inteligencia Artificial Aplicada",
    code: "IA-401",
    description: "Curso avanzado que cubre redes neuronales, aprendizaje profundo, procesamiento de lenguaje natural y visión por computadora. Los estudiantes desarrollarán proyectos prácticos con TensorFlow y PyTorch.",
    teacher: "Dra. María González",
    schedule: "Lunes y Miércoles 10:00 - 12:00",
    requirements: ["Programación III", "Estadística II", "Álgebra Lineal"],
    totalSlots: 35,
    enrolledCount: 33,
    status: "open",
    category: "Tecnología",
    startDate: new Date("2026-03-15"),
    endDate: new Date("2026-07-15"),
    credits: 4,
  },
  {
    id: "c2",
    name: "Diseño UX/UI Avanzado",
    code: "DUX-302",
    description: "Metodologías de investigación de usuarios, prototipado de alta fidelidad, sistemas de diseño y pruebas de usabilidad. Se trabajará con Figma y herramientas de análisis.",
    teacher: "Prof. Carlos Ruiz",
    schedule: "Martes y Jueves 14:00 - 16:00",
    requirements: ["Diseño Gráfico I", "HCI Fundamentos"],
    totalSlots: 30,
    enrolledCount: 18,
    status: "open",
    category: "Diseño",
    startDate: new Date("2026-03-15"),
    endDate: new Date("2026-07-15"),
    credits: 3,
  },
  {
    id: "c3",
    name: "Ciberseguridad Empresarial",
    code: "CSE-405",
    description: "Auditoría de seguridad, pentesting, criptografía aplicada, gestión de incidentes y cumplimiento normativo (ISO 27001, GDPR).",
    teacher: "Ing. Roberto Méndez",
    schedule: "Viernes 08:00 - 12:00",
    requirements: ["Redes II", "Sistemas Operativos"],
    totalSlots: 25,
    enrolledCount: 25,
    status: "full",
    category: "Tecnología",
    startDate: new Date("2026-03-15"),
    endDate: new Date("2026-07-15"),
    credits: 4,
  },
  {
    id: "c4",
    name: "Marketing Digital y Analytics",
    code: "MKD-201",
    description: "Estrategias de marketing digital, SEO/SEM, analítica web con Google Analytics, publicidad programática y gestión de redes sociales.",
    teacher: "Lic. Ana Torres",
    schedule: "Lunes y Miércoles 16:00 - 18:00",
    requirements: ["Fundamentos de Marketing"],
    totalSlots: 40,
    enrolledCount: 12,
    status: "open",
    category: "Negocios",
    startDate: new Date("2026-04-01"),
    endDate: new Date("2026-07-30"),
    credits: 3,
  },
  {
    id: "c5",
    name: "Desarrollo Mobile con Flutter",
    code: "MOB-303",
    description: "Desarrollo de aplicaciones multiplataforma con Flutter y Dart. Incluye integración con APIs, bases de datos locales y publicación en stores.",
    teacher: "Ing. Luis Vargas",
    schedule: "Martes y Jueves 10:00 - 12:00",
    requirements: ["Programación II", "Bases de Datos I"],
    totalSlots: 30,
    enrolledCount: 27,
    status: "open",
    category: "Tecnología",
    startDate: new Date("2026-03-15"),
    endDate: new Date("2026-07-15"),
    credits: 4,
  },
  {
    id: "c6",
    name: "Gestión Ágil de Proyectos",
    code: "GAP-202",
    description: "Scrum, Kanban, SAFe y herramientas de gestión. Certificación preparatoria para Scrum Master.",
    teacher: "MBA. Patricia López",
    schedule: "Sábado 09:00 - 13:00",
    requirements: [],
    totalSlots: 45,
    enrolledCount: 8,
    status: "open",
    category: "Negocios",
    startDate: new Date("2026-04-05"),
    endDate: new Date("2026-08-05"),
    credits: 2,
  },
];

export const mockEnrollments: Enrollment[] = [
  { id: "e1", courseId: "c1", courseName: "Inteligencia Artificial Aplicada", courseCode: "IA-401", studentName: "Juan Pérez", studentEmail: "juan@uni.edu", enrolledAt: new Date("2026-02-20"), status: "active" },
  { id: "e2", courseId: "c2", courseName: "Diseño UX/UI Avanzado", courseCode: "DUX-302", studentName: "Juan Pérez", studentEmail: "juan@uni.edu", enrolledAt: new Date("2026-02-22"), status: "active" },
  { id: "e3", courseId: "c5", courseName: "Desarrollo Mobile con Flutter", courseCode: "MOB-303", studentName: "Juan Pérez", studentEmail: "juan@uni.edu", enrolledAt: new Date("2026-01-15"), status: "completed" },
  { id: "e4", courseId: "c4", courseName: "Marketing Digital y Analytics", courseCode: "MKD-201", studentName: "María López", studentEmail: "maria@uni.edu", enrolledAt: new Date("2026-02-25"), status: "active" },
  { id: "e5", courseId: "c3", courseName: "Ciberseguridad Empresarial", courseCode: "CSE-405", studentName: "Carlos Gómez", studentEmail: "carlos@uni.edu", enrolledAt: new Date("2026-02-18"), status: "active" },
  { id: "e6", courseId: "c6", courseName: "Gestión Ágil de Proyectos", courseCode: "GAP-202", studentName: "Ana Martínez", studentEmail: "ana@uni.edu", enrolledAt: new Date("2026-03-01"), status: "cancelled" },
];

export const mockUser: UserProfile = {
  id: "u1",
  name: "Juan Pérez García",
  email: "juan.perez@universidad.edu",
  role: "Estudiante",
  avatar: "",
  phone: "+52 555 123 4567",
  department: "Ingeniería en Sistemas",
  joinedAt: new Date("2024-08-15"),
};

export const mockActivityLogs: ActivityLog[] = [
  { id: "l1", action: "Inscripción", detail: "Se inscribió en IA-401 Inteligencia Artificial Aplicada", timestamp: new Date("2026-02-20T10:30:00"), user: "Juan Pérez" },
  { id: "l2", action: "Inscripción", detail: "Se inscribió en DUX-302 Diseño UX/UI Avanzado", timestamp: new Date("2026-02-22T14:15:00"), user: "Juan Pérez" },
  { id: "l3", action: "Curso editado", detail: "Se actualizaron cupos de CSE-405", timestamp: new Date("2026-02-25T09:00:00"), user: "Admin" },
  { id: "l4", action: "Cancelación", detail: "Ana Martínez canceló inscripción en GAP-202", timestamp: new Date("2026-03-01T11:45:00"), user: "Ana Martínez" },
  { id: "l5", action: "Curso creado", detail: "Se creó nuevo curso MKD-201 Marketing Digital", timestamp: new Date("2026-01-10T08:00:00"), user: "Admin" },
  { id: "l6", action: "Perfil actualizado", detail: "Juan Pérez actualizó su número de teléfono", timestamp: new Date("2026-02-28T16:30:00"), user: "Juan Pérez" },
];
