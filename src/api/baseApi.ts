import axios from 'axios';

// Base instance for our primary API
export const baseApi = axios.create({
  //baseURL: 'http://localhost:8000/',
  baseURL: 'https://parcel-be.hyprhost.online/',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  },
});

// Request interceptor to dynamically add auth headers
baseApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("_SPC_SSN_HASH");
    const userId = localStorage.getItem("_SPC_USER_ID");
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    config.headers["X-user-id"] = userId ?? "NA";
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
baseApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      try {
        const event = new CustomEvent('session-expired');
        window.dispatchEvent(event);
      } catch {}
      return Promise.reject(new Error('Unauthorized'));
    }
    throw error
  }
);