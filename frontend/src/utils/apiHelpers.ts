import { AxiosError } from 'axios';

export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  code?: string;
  timestamp: string;
  path: string;
}

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const errorData = error.response?.data as ApiErrorResponse;
    
    if (errorData?.message) {
      return Array.isArray(errorData.message)
        ? errorData.message.join(', ')
        : errorData.message;
    }
    
    if (error.response?.status === 401) {
      return 'Session expired. Please login again.';
    }
    
    if (error.response?.status === 429) {
      return 'Too many requests. Please try again later.';
    }
    
    if (error.response?.status === 500) {
      return 'Server error. Please try again later.';
    }
    
    if (error.code === 'ECONNABORTED') {
      return 'Request timeout. Please try again.';
    }
    
    if (error.code === 'ERR_NETWORK') {
      return 'Network error. Please check your connection.';
    }
  }
  
  return 'An unexpected error occurred';
};

export const isAuthError = (error: unknown): boolean => {
  if (error instanceof AxiosError) {
    return error.response?.status === 401;
  }
  return false;
};

export const isRateLimitError = (error: unknown): boolean => {
  if (error instanceof AxiosError) {
    return error.response?.status === 429;
  }
  return false;
};
