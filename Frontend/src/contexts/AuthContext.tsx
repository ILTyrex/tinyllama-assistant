import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AuthAPI from '@/api/users.api';

interface User {
  id: number;
  identification: string;
  first_name: string;
  last_name: string;
  phone: string;
  gmail: string;
  role?: string;
  role_display?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (identification: string, password: string) => Promise<void>;
  register: (identification: string, first_name: string, last_name: string, phone: string, gmail: string, password: string, password_confirm: string) => Promise<void>;
  logout: () => void;
  setAccessToken: (token: string) => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar tokens desde localStorage al montar
  useEffect(() => {
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refreshToken');
    const storedUser = localStorage.getItem('user');

    if (storedAccessToken && storedUser) {
      setAccessToken(storedAccessToken);
      setRefreshToken(storedRefreshToken);
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  const login = async (identification: string, password: string) => {
    setLoading(true);
    try {
      const response = await AuthAPI.login({ identification, password });
      
      setAccessToken(response.access);
      setRefreshToken(response.refresh);
      setUser(response.user);

      localStorage.setItem('accessToken', response.access);
      localStorage.setItem('refreshToken', response.refresh);
      localStorage.setItem('user', JSON.stringify(response.user));
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    identification: string,
    first_name: string,
    last_name: string,
    phone: string,
    gmail: string,
    password: string,
    password_confirm: string
  ) => {
    setLoading(true);
    try {
      const response = await AuthAPI.register({
        identification,
        first_name,
        last_name,
        phone,
        gmail,
        password,
        password_confirm,
      });

      setAccessToken(response.access);
      setRefreshToken(response.refresh);
      setUser(response.user);

      localStorage.setItem('accessToken', response.access);
      localStorage.setItem('refreshToken', response.refresh);
      localStorage.setItem('user', JSON.stringify(response.user));
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  };

  const handleSetAccessToken = (token: string) => {
    setAccessToken(token);
    localStorage.setItem('accessToken', token);
  };

  const handleSetUser = (newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('user');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        loading,
        isAuthenticated: !!user && !!accessToken,
        login,
        register,
        logout,
        setAccessToken: handleSetAccessToken,
        setUser: handleSetUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
