import api from "./config";

export interface Course {
  id: number;
  code: string;
  name: string;
  description: string;
  credits: number;
  semester: number;
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
  slots: number;
  occupied_slots?: number;
  status?: "open" | "closed";
}

export const CourseAPI = {
  async getCourses(params?: Record<string, any>) {
    const response = await api.get<Course[]>("/courses/", { params });
    return response.data;
  },

  async getCourse(id: number) {
    const response = await api.get<Course>(`/courses/${id}/`);
    return response.data;
  },

  async createCourse(payload: CreateCoursePayload) {
    const response = await api.post<Course>("/courses/", payload);
    return response.data;
  },

  async updateCourse(id: number, payload: Partial<CreateCoursePayload>) {
    const response = await api.patch<Course>(`/courses/${id}/`, payload);
    return response.data;
  },

  async deleteCourse(id: number) {
    await api.delete(`/courses/${id}/`);
  },

  async enrollCourse(id: number) {
    const response = await api.post<Course>(`/courses/${id}/enroll/`);
    return response.data;
  },

  async getAvailableCourses() {
    const response = await api.get<Course[]>("/courses/available/");
    return response.data;
  },

  async getMyCourses() {
    const response = await api.get<Course[]>("/courses/my/");
    return response.data;
  },
};

export default CourseAPI;
