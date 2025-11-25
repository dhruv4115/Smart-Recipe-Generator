import axiosInstance from './axiosInstance';
import { API_ENDPOINTS } from './endpoints';
import { AuthUser } from '@/store/authStore';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await axiosInstance.post(API_ENDPOINTS.LOGIN, credentials);
    return data;
  },

  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const { data } = await axiosInstance.post(API_ENDPOINTS.REGISTER, userData);
    return data;
  },

  getMe: async (): Promise<AuthUser> => {
    const { data } = await axiosInstance.get(API_ENDPOINTS.ME);
    return data;
  },

  // refresh: async () => {
  //   const { data } = await axiosInstance.post(API_ENDPOINTS.REFRESH);
  //   return data;
  // },
};
