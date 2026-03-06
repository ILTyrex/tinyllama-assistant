import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Crear instancia de axios
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a cada request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y refrescar token si es necesario
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 y no es un reintentu
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });

          const newAccessToken = response.data.access;
          localStorage.setItem('accessToken', newAccessToken);

          // Reintentar la request original con el nuevo token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Si falla el refresh, limpiar tokens y redirigir a login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

interface LoginPayload {
  identification: string;
  password: string;
}

interface RegisterPayload {
  identification: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  password: string;
  password_confirm: string;
}

interface AuthResponse {
  message: string;
  access: string;
  refresh: string;
  user: {
    id: number;
    identification: string;
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    is_active: boolean;
    role?: string;
    role_display?: string;
  };
}

interface UserProfile {
  id: number;
  identification: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  role: string;
  role_display: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface UpdateProfilePayload {
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
}

interface UpdateProfileResponse {
  message: string;
  user: UserProfile;
}

interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

class AuthAPI {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/auth/login/', payload);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error en login');
    }
  }

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/auth/register/', payload);
      return response.data;
    } catch (error: any) {
      const errorMsg = error.response?.data?.identification?.[0] || 
                       error.response?.data?.password?.[0] || 
                       'Error en registro';
      throw new Error(errorMsg);
    }
  }

  async refreshToken(refreshToken: string): Promise<{ access: string }> {
    try {
      const response = await apiClient.post('/auth/refresh/', {
        refresh: refreshToken,
      });
      return response.data;
    } catch (error: any) {
      throw new Error('Error refrescando token');
    }
  }

  async getProfile(): Promise<UserProfile> {
    try {
      const response = await apiClient.get('/auth/me/');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error obteniendo perfil');
    }
  }

  async updateProfile(payload: UpdateProfilePayload): Promise<UpdateProfileResponse> {
    try {
      const response = await apiClient.put('/auth/me/update/', payload);
      return response.data;
    } catch (error: any) {
      const errorMsg = error.response?.data?.email?.[0] || 
                       error.response?.data?.error || 
                       'Error actualizando perfil';
      throw new Error(errorMsg);
    }
  }

  async changePassword(payload: ChangePasswordPayload): Promise<{ message: string }> {
    try {
      const response = await apiClient.post('/auth/me/change-password/', payload);
      return response.data;
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 
                       error.response?.data?.new_password || 
                       'Error cambiando contraseña';
      throw new Error(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
    }
  }
}

export default new AuthAPI();
export { apiClient };
