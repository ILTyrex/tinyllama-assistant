import api from "./config";

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

interface User {
  id: number;
  identification: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  role_display: string;
  is_active: boolean;
  phone?: string;
  semester?: number;
  created_at?: string;
  updated_at?: string;
}

interface CreateUserPayload {
  identification: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  password: string;
  role: string;
  semester?: number;
}

interface UpdateUserPayload {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  role?: string;
  semester?: number;
  is_active?: boolean;
}

class AuthAPI {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    try {
      const response = await api.post("/auth/login/", payload);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Error en login");
    }
  }

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    try {
      const response = await api.post("/auth/register/", payload);
      return response.data;
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.identification?.[0] ||
        error.response?.data?.password?.[0] ||
        "Error en registro";
      throw new Error(errorMsg);
    }
  }

  async refreshToken(refreshToken: string): Promise<{ access: string }> {
    try {
      const response = await api.post("/auth/refresh/", {
        refresh: refreshToken,
      });
      return response.data;
    } catch (error: any) {
      throw new Error("Error refrescando token");
    }
  }

  async getProfile(): Promise<UserProfile> {
    try {
      const response = await api.get("/auth/me/");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Error obteniendo perfil");
    }
  }

  async updateProfile(
    payload: UpdateProfilePayload,
  ): Promise<UpdateProfileResponse> {
    try {
      const response = await api.put("/auth/me/update/", payload);
      return response.data;
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.email?.[0] ||
        error.response?.data?.error ||
        "Error actualizando perfil";
      throw new Error(errorMsg);
    }
  }

  async changePassword(
    payload: ChangePasswordPayload,
  ): Promise<{ message: string }> {
    try {
      const response = await api.post("/auth/me/change-password/", payload);
      return response.data;
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.new_password ||
        "Error cambiando contraseña";
      throw new Error(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
    }
  }

  // Gestión de usuarios (solo admin)
  async getUsers(): Promise<User[]> {
    try {
      const response = await api.get("/auth/");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Error obteniendo usuarios");
    }
  }

  async createUser(payload: CreateUserPayload): Promise<{ message: string; user: User }> {
    try {
      const response = await api.post("/auth/create/", payload);
      return response.data;
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.identification?.[0] ||
        error.response?.data?.email?.[0] ||
        error.response?.data?.error ||
        "Error creando usuario";
      throw new Error(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
    }
  }

  async updateUser(userId: number, payload: UpdateUserPayload): Promise<{ message: string; user: User }> {
    try {
      const response = await api.put(`/auth/${userId}/update/`, payload);
      return response.data;
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.email?.[0] ||
        error.response?.data?.error ||
        "Error actualizando usuario";
      throw new Error(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
    }
  }

  async deleteUser(userId: number): Promise<{ message: string }> {
    try {
      const response = await api.delete(`/auth/${userId}/delete/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Error eliminando usuario");
    }
  }
}

export default new AuthAPI();
