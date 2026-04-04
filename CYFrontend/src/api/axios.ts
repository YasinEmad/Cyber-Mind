import axios from 'axios';
import { auth } from '@/firebase';

// Set your backend URL directly here
const baseURL = 'http://localhost:8080/api'; // ضع البورت الصحيح للسيرفر

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
          const freshToken = await currentUser.getIdToken(true); // true = force refresh
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

    // Log outgoing requests that include a `level` field
    try {
      const data = (config as any).data;
      if (data && Object.prototype.hasOwnProperty.call(data, 'level')) {
        try { console.debug('axios.request:', config.url, 'level (raw):', data.level, 'typeof:', typeof data.level); } catch (e) {}
      }
    } catch (e) {}
    
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
  return response;
});

export default instance;
