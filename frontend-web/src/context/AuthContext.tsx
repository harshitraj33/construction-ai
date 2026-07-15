import React, { createContext, useContext, useState, useEffect } from 'react';
import axios, { AxiosInstance } from 'axios';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: Record<string, any>) => Promise<void>;
  logout: () => void;
  api: AxiosInstance;
  isMocked: boolean;
  setMockRole: (role: UserRole) => void;
  registerNewUser: (userData: Record<string, any>) => void;
  getRegisteredUsers: () => any[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

const DEFAULT_USERS = [
  { id: 1, username: 'harshit_raj', password: 'password123', role: 'ADMIN' as UserRole, email: 'harshit@construct.ai', phone_number: '+91 99999 99999', company_name: 'Construct.ai Org', first_name: 'Harshit', last_name: 'Raj' },
  { id: 2, username: 'contractor', password: 'password123', role: 'CONTRACTOR' as UserRole, email: 'dave@apex.com', phone_number: '+91 98765 43210', company_name: 'Apex Builders Ltd', first_name: 'Dave', last_name: 'Contractor' },
  { id: 3, username: 'client', password: 'password123', role: 'CLIENT' as UserRole, email: 'contact@horizon.com', phone_number: '+91 88888 88888', company_name: 'Horizon Realty Group', first_name: 'Horizon', last_name: 'Realty', assignedProjectId: null },
  { id: 4, username: 'vendor', password: 'password123', role: 'VENDOR' as UserRole, email: 'supply@elite.com', phone_number: '+91 77777 77777', company_name: 'Elite Supplies Ltd', first_name: 'Elite', last_name: 'Supplies' },
  { id: 5, username: 'labor', password: 'password123', role: 'LABOR' as UserRole, email: 'steve@labor.com', phone_number: '+91 66666 66666', company_name: 'Individual', first_name: 'Steve', last_name: 'Smith' }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isMocked, setIsMocked] = useState<boolean>(false);

  useEffect(() => {
    // Initialise local storage registered users if not present or stale
    const saved = localStorage.getItem('registered_users');
    let list = saved ? JSON.parse(saved) : [];
    const hasHarshit = list.some((u: any) => u.username === 'harshit_raj');
    if (!hasHarshit) {
      const adminIndex = list.findIndex((u: any) => u.username === 'admin');
      if (adminIndex !== -1) {
        list[adminIndex].username = 'harshit_raj';
        list[adminIndex].first_name = 'Harshit';
        list[adminIndex].last_name = 'Raj';
      } else {
        list = [...DEFAULT_USERS];
      }
      localStorage.setItem('registered_users', JSON.stringify(list));
    }

    const savedToken = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user_profile');

    if (savedToken && savedUser) {
      setAccessToken(savedToken);
      setUser(JSON.parse(savedUser));
      if (localStorage.getItem('is_mocked') === 'true') {
        setIsMocked(true);
      }
    }
    setLoading(false);
  }, []);

  const getRegisteredUsers = () => {
    const saved = localStorage.getItem('registered_users');
    if (saved) return JSON.parse(saved);
    return DEFAULT_USERS;
  };

  const registerNewUser = (userData: Record<string, any>) => {
    const list = getRegisteredUsers();
    const newUser = {
      id: list.length + 1,
      username: userData.username.toLowerCase(),
      password: userData.password || 'password123',
      role: userData.role as UserRole,
      email: userData.email || `${userData.username.toLowerCase()}@construct.ai`,
      phone_number: userData.phone_number || '+91 99999 00000',
      company_name: userData.company_name || 'Individual Entity',
      first_name: userData.first_name || userData.username,
      last_name: userData.last_name || 'Member',
      assignedProjectId: userData.assignedProjectId ? Number(userData.assignedProjectId) : null
    };
    list.push(newUser);
    localStorage.setItem('registered_users', JSON.stringify(list));
  };

  const login = async (username: string, password: string) => {
    const queryUsername = username.toLowerCase();
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login/`, {
        username: queryUsername,
        password,
      });

      const { access, refresh, user: profile } = response.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user_profile', JSON.stringify(profile));
      localStorage.setItem('is_mocked', 'false');

      setAccessToken(access);
      setUser(profile);
      setIsMocked(false);
    } catch (error) {
      console.warn("Backend connection failed, looking up user in persistent local store...");
      
      const usersList = getRegisteredUsers();
      const matched = usersList.find((u: any) => u.username === queryUsername && u.password === password);

      if (matched) {
        localStorage.setItem('access_token', 'mock_jwt_token');
        localStorage.setItem('user_profile', JSON.stringify(matched));
        localStorage.setItem('is_mocked', 'true');

        setAccessToken('mock_jwt_token');
        setUser(matched);
        setIsMocked(true);
      } else {
        // Allow fallback for standard fast login buttons if passwords aren't matching or strict
        const mockRole: UserRole = queryUsername === 'admin' || queryUsername === 'harshit_raj' ? 'ADMIN' : 
                                 queryUsername === 'contractor' ? 'CONTRACTOR' :
                                 queryUsername === 'client' ? 'CLIENT' :
                                 queryUsername === 'vendor' ? 'VENDOR' : 'LABOR';
        
        const fallbackUser: User = {
          id: 99,
          username: username,
          email: `${queryUsername}@example.com`,
          role: mockRole,
          company_name: 'Apex Construction Builders',
          phone_number: '+91 98765 00000',
          first_name: username,
          last_name: 'Demo'
        };

        localStorage.setItem('access_token', 'mock_jwt_token');
        localStorage.setItem('user_profile', JSON.stringify(fallbackUser));
        localStorage.setItem('is_mocked', 'true');

        setAccessToken('mock_jwt_token');
        setUser(fallbackUser);
        setIsMocked(true);
      }
    }
  };

  const register = async (userData: Record<string, string>) => {
    try {
      await axios.post(`${API_BASE_URL}/api/auth/register/`, userData);
    } catch (error) {
      console.warn("Backend registration failed, adding to local persistent list.");
      registerNewUser(userData);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_profile');
    localStorage.removeItem('is_mocked');
    setAccessToken(null);
    setUser(null);
    setIsMocked(false);
  };

  const setMockRole = (role: UserRole) => {
    if (user && isMocked) {
      const updatedUser = { ...user, role };
      setUser(updatedUser);
      localStorage.setItem('user_profile', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, login, register, logout, api, isMocked, setMockRole, registerNewUser, getRegisteredUsers }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
