import axios from 'axios';

// Set your backend URL directly here
const baseURL = 'http://localhost:8080/api'; // ضع البورت الصحيح للسيرفر

const instance = axios.create({
  baseURL,
  withCredentials: true,
});

// Log outgoing requests that include a `level` field and coerce/check types
instance.interceptors.request.use((config) => {
  try {
    const data = (config as any).data;
    if (data && Object.prototype.hasOwnProperty.call(data, 'level')) {
      try { console.debug('axios.request:', config.url, 'level (raw):', data.level, 'typeof:', typeof data.level); } catch (e) {}
    }
  } catch (e) {}
  return config;
});

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
