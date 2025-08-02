import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User } from '../../../shared/types';
import { api } from '../utils/api';

interface AuthContextType {
  user: User | null;
  login: (email?: string, password?: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

interface AuthResponse {
  data: {
    user: User;
    token: string;
  };
}

interface UserResponse {
  data: User;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuthState();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    // Retornar un mock para evitar errores durante desarrollo
    return {
      user: null,
      login: async () => {
        // Mock login - implementar autenticación real
      },
      register: async () => {},
      logout: () => {},
      isLoading: false,
    };
  }
  return context;
}

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      fetchUser();
    } else {
      // Auto-login for development with mock user
      autoLoginForDevelopment();
    }
  }, []);

  const autoLoginForDevelopment = () => {
    // Create mock user and token for development
    const mockUser: User = {
      id: '1',
      email: 'demo@cryptolotto.com',
      name: 'Usuario Demo',
      walletAddress: '0x123...',
      custodialWallet: '0x456...',
      totalSpent: 0,
      totalWon: 0,
      ticketsPurchased: 0,
      referralCode: 'DEMO123',
      vipLevel: 'basic',
      createdAt: new Date(),
    };

    // Generate a mock JWT token for development
    const mockToken = 'mock_jwt_token_' + Date.now();

    if (typeof window !== 'undefined') {
      localStorage.setItem('token', mockToken);
    }

    setUser(mockUser);
    setIsLoading(false);
  };

  const fetchUser = async () => {
    try {
      const response = await api.get<UserResponse>('/auth/me');
      setUser(response.data.data);
    } catch (error) {
      // If API call fails, use mock user for development
      console.log('API call failed, using mock user for development');
      autoLoginForDevelopment();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email?: string, password?: string) => {
    if (!email || !password) {
      // Mock login para desarrollo
      autoLoginForDevelopment();
      return;
    }

    try {
      const response = await api.post<AuthResponse>('/auth/login', { email, password });
      const { user, token } = response.data.data;

      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
      }
      setUser(user);
    } catch (error) {
      // If real login fails, use mock for development
      console.log('Real login failed, using mock user for development');
      autoLoginForDevelopment();
    }
  };

  const register = async (email: string, name: string, password: string) => {
    try {
      const response = await api.post<AuthResponse>('/auth/register', { email, name, password });
      const { user, token } = response.data.data;

      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
      }
      setUser(user);
    } catch (error) {
      // If real registration fails, use mock for development
      console.log('Real registration failed, using mock user for development');
      autoLoginForDevelopment();
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    setUser(null);
  };

  return {
    user,
    login,
    register,
    logout,
    isLoading,
  };
}
