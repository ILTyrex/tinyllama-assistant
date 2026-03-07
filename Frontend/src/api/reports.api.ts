import api from './config';

export interface EnrollmentReport {
  id: number;
  studentName: string;
  studentEmail: string;
  courseCode: string;
  courseName: string;
  enrolledAt: string;
  status: string;
}

export interface ReportsFilters {
  status?: string;
  courseCode?: string;
  courseName?: string;
  studentEmail?: string;
  semesterTaken?: number;
  ordering?: string;
}

export const ReportsAPI = {
  async getEnrollments(filters?: ReportsFilters): Promise<EnrollmentReport[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    const response = await api.get(`/reports/enrollments/?${params.toString()}`);
    return response.data;
  },
};