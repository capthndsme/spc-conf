import axios from 'axios';

// Base instance for our primary API
export const baseApi = axios.create({
  //baseURL: 'http://localhost:8000/',
  baseURL: 'https://parcel-be.hyprhost.online/',
  timeout: 5000,
  headers: {
    ... (localStorage.getItem("_SPC_SSN_HASH") ? { 'Authorization': `Bearer ${localStorage.getItem("_SPC_SSN_HASH")}` } : {}),
    "X-user-id": localStorage.getItem("_SPC_USER_ID") ?? "NA",
    'Content-Type': 'application/json'
  },


});


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