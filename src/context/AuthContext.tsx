import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { apiClient, type User } from '../lib/apiClient';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isGuest: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<{ message: string; reset_token?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  loginAsGuest: () => void;
  logout: () => void;
}

const GUEST_USER: User = {
  id: 0,
  full_name: 'Local User (Offline)',
  email: 'offline@device.local',
  created_at: new Date().toISOString(),
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState<boolean>(localStorage.getItem('is_guest_mode') === 'true');

  useEffect(() => {
    const initAuth = async () => {
      const storedGuest = localStorage.getItem('is_guest_mode');
      if (storedGuest === 'true') {
        setUser(GUEST_USER);
        setIsGuest(true);
        setLoading(false);
        return;
      }

      const storedToken = localStorage.getItem('auth_token');
      if (storedToken) {
        try {
          const userData = await apiClient.getMe();
          setUser(userData);
          setToken(storedToken);
        } catch (error) {
          console.error('Backend server unreachable or session expired:', error);
          localStorage.removeItem('auth_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiClient.login(email, password);
    localStorage.removeItem('is_guest_mode');
    setIsGuest(false);
    localStorage.setItem('auth_token', res.access_token);
    setToken(res.access_token);
    setUser(res.user);
  };

  const register = async (fullName: string, email: string, password: string) => {
    const res = await apiClient.register(fullName, email, password);
    localStorage.removeItem('is_guest_mode');
    setIsGuest(false);
    localStorage.setItem('auth_token', res.access_token);
    setToken(res.access_token);
    setUser(res.user);
  };

  const loginAsGuest = () => {
    localStorage.setItem('is_guest_mode', 'true');
    localStorage.removeItem('auth_token');
    setIsGuest(true);
    setToken(null);
    setUser(GUEST_USER);
  };

  const forgotPassword = async (email: string) => {
    return await apiClient.forgotPassword(email);
  };

  const resetPassword = async (token: string, newPassword: string) => {
    await apiClient.resetPassword(token, newPassword);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('is_guest_mode');
    setToken(null);
    setIsGuest(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isGuest,
        login,
        register,
        forgotPassword,
        resetPassword,
        loginAsGuest,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

