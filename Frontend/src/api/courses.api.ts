import axios, { AxiosInstance } from "axios";

const API_BASE_URL = "http://localhost:8000/api";

// Crear instancia de axios reutilizando la configuración
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Interceptor para agregar el token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Interceptor para manejar 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });

          const newAccessToken = response.data.access;
          localStorage.setItem("accessToken", newAccessToken);

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export interface Course {
  id: number;
  code: string;
  name: string;
  description: string;
  credits: number;
  semester: number;
  prerequisites?: number[];
  slots: number;
  occupied_slots: number;
  enrolled_count: number;
  available_slots: number;
  is_enrolled?: boolean;
  status: "open" | "closed";
  created_at: string;
  updated_at: string;
}

export interface CreateCoursePayload {
  code: string;
  name: string;
  description: string;
  credits: number;
  semester: number;
  // Backend now accepts either numeric IDs or course codes for prerequisites.
  prerequisites?: Array<number | string>;
  slots: number;
  occupied_slots?: number;
  status?: "open" | "closed";
}

export const CourseAPI = {
  // Obtener todos los cursos
  async getCourses(params?: Record<string, any>) {
    try {
      const response = await apiClient.get<Course[]>("/courses/", { params });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Obtener un curso específico
  async getCourse(id: number) {
    try {
      const response = await apiClient.get<Course>(`/courses/${id}/`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Crear un curso
  async createCourse(payload: CreateCoursePayload) {
    try {
      const response = await apiClient.post<Course>("/courses/", payload);
      return response.data;
    } catch (error: any) {
      const errors = error.response?.data || {};
      throw {
        message: "Error al crear el curso",
        errors,
        status: error.response?.status,
      };
    }
  },

  // Actualizar un curso
  async updateCourse(id: number, payload: Partial<CreateCoursePayload>) {
    try {
      const response = await apiClient.patch<Course>(
        `/courses/${id}/`,
        payload,
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Eliminar un curso
  async deleteCourse(id: number) {
    try {
      await apiClient.delete(`/courses/${id}/`);
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Inscribir en un curso
  async enrollCourse(id: number) {
    try {
      const response = await apiClient.post<Course>(`/courses/${id}/enroll/`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Obtener cursos disponibles
  async getAvailableCourses() {
    try {
      const response = await apiClient.get<Course[]>("/courses/available/");
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Obtener cursos en los que estoy inscrito
  async getMyCourses() {
    try {
      const response = await apiClient.get<Course[]>("/courses/my/");
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },
};

export default CourseAPI;
