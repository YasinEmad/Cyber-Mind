import axios from 'axios';
import { auth } from '@/firebase';

// Use a local backend in development and production API when built for deploy.
const baseURL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8080/api' : 'https://cyber-mind.onrender.com/api');
const instance = axios.create({
  baseURL,
  withCredentials: true,
});

// Refresh Firebase ID token for each request
instance.interceptors.request.use(
  async (config) => {
    try {
      // If user is authenticated, get a fresh ID token
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const freshToken = await currentUser.getIdToken();
          config.headers.Authorization = `Bearer ${freshToken}`;
        } catch (tokenError) {
          // Token refresh failed - log and continue without token
          console.debug('Token refresh failed:', tokenError);
        }
      }
    } catch (error) {
      // Any other error - log and continue
      console.debug('Auth check failed:', error);
    }

    if (import.meta.env.DEV) {
      try {
        const data = (config as any).data;
        if (data && Object.prototype.hasOwnProperty.call(data, 'level')) {
          try { console.debug('axios.request:', config.url, 'level (raw):', data.level, 'typeof:', typeof data.level); } catch (e) {}
        }
      } catch (e) {}
    }
    
    return config;
  },
  (error) => {
    // Request config error
    console.debug('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Inspect responses that include puzzles
instance.interceptors.response.use((response) => {
  if (import.meta.env.DEV) {
    try {
      const data = response.data;
      if (Array.isArray(data)) {
        data.forEach((item) => {
          if (item && Object.prototype.hasOwnProperty.call(item, 'level')) {
            try { console.debug('axios.response: item', item._id, 'level:', item.level, 'typeof:', typeof item.level); } catch (e) {}
          }
        });
      } else if (data && Object.prototype.hasOwnProperty.call(data, 'level')) {
        try { console.debug('axios.response (single):', response.config.url, 'level:', data.level, 'typeof:', typeof data.level); } catch (e) {}
      }
    } catch (e) {}
  }
  return response;
});

export default instance;
