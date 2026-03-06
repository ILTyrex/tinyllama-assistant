export interface Course {
  id: number;
  name: string;
  code: string;
  description: string;
  credits: number;
  semester: number;
  slots: number;
  occupied_slots: number;
  status: "open" | "closed";
  created_at: string;
  updated_at: string;
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
