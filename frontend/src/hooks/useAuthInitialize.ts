import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authAPI } from '@/api/auth';

export const useAuthInitialize = () => {
  const { token, setAuth, logout, setLoadingUser, hydrateFromStorage } = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      // First, hydrate from storage
      hydrateFromStorage();
      
      const storedToken = localStorage.getItem('token');
      
      if (storedToken) {
        setLoadingUser(true);
        
        try {
          // Validate token by fetching user data
          const userData = await authAPI.getMe();
          setAuth(userData, storedToken);
        } catch (error: any) {
          // Token is invalid or expired
          if (error.response?.status === 401) {
            logout();
          }
        } finally {
          setLoadingUser(false);
        }
      } else {
        setLoadingUser(false);
      }
    };

    initializeAuth();
  }, []);
};
