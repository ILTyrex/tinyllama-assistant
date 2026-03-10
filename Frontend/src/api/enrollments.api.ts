import api from "./config";

export interface Enrollment {
  id: number;
  course: {
    id: number;
    code: string;
    name: string;
    description: string;
    credits: number;
    semester: number;
    status: "open" | "closed";
    slots: number;
    occupied_slots: number;
    enrolled_count: number;
    available_slots: number;
    created_at: string;
    updated_at: string;
  };
  semester_taken: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export const EnrollmentsAPI = {
  async getMyEnrollments() {
    const response = await api.get<Enrollment[]>("/enrollments/");
    return response.data;
  },

  async cancelEnrollment(id: number) {
    await api.delete(`/enrollments/${id}/`);
  },
};

export default EnrollmentsAPI;
