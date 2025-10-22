import axios, { AxiosError } from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    if (error.response) {
      const message = error.response.data?.message || 'Ein Fehler ist aufgetreten';
      
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        if (window.location.pathname !== '/login') {
          toast.error('Sitzung abgelaufen. Bitte melden Sie sich erneut an.');
          window.location.href = '/login';
        }
      } else if (error.response.status === 403) {
        toast.error('Keine Berechtigung für diese Aktion');
      } else if (error.response.status >= 500) {
        toast.error('Serverfehler. Bitte versuchen Sie es später erneut.');
      } else {
        toast.error(message);
      }
    } else if (error.request) {
      toast.error('Netzwerkfehler. Bitte überprüfen Sie Ihre Verbindung.');
    }
    
    return Promise.reject(error);
  }
);

export default api;
