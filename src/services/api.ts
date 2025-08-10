import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token and loading indicators
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Show loading indicator for non-GET requests
    if (config.method !== 'get') {
      // You can add loading state management here
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token management
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    
    // Show error toast for network errors
    if (!error.response) {
      toast.error('Network error. Please check your connection.');
    } else {
      const message = error.response.data?.message || 'An error occurred';
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

// TTS API functions
export const ttsApi = {
  convert: async (data: any) => {
    const response = await api.post('/tts/convert', data);
    return response.data;
  },
  
  stream: async (data: any) => {
    const response = await api.post('/tts/stream', data);
    return response.data;
  },
  
  getVoices: async (provider = 'openai') => {
    const response = await api.get(`/tts/voices?provider=${provider}`);
    return response.data;
  },
  
  getLanguages: async () => {
    const response = await api.get('/tts/languages');
    return response.data;
  },
  
  batchConvert: async (data: any) => {
    const response = await api.post('/tts/batch', data);
    return response.data;
  },
  
  getHistory: async (page = 1, limit = 20) => {
    const response = await api.get(`/tts/history?page=${page}&limit=${limit}`);
    return response.data;
  },
  
  deleteHistoryItem: async (id: number) => {
    const response = await api.delete(`/tts/history/${id}`);
    return response.data;
  },
  
  getStats: async () => {
    const response = await api.get('/tts/stats');
    return response.data;
  },
};

// Authentication API functions
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (email: string, password: string, name: string) => {
    const response = await api.post('/auth/register', { email, password, name });
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
  
  updateProfile: async (userData: any) => {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  },
  
  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.put('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  },
  
  deleteAccount: async (password: string) => {
    const response = await api.delete('/auth/account', { data: { password } });
    return response.data;
  },
};

// User management API functions
export const userApi = {
  getSettings: async () => {
    const response = await api.get('/users/settings');
    return response.data;
  },
  
  updateSettings: async (settings: any) => {
    const response = await api.put('/users/settings', settings);
    return response.data;
  },
  
  getUsage: async () => {
    const response = await api.get('/users/usage');
    return response.data;
  },
  
  getApiKeys: async () => {
    const response = await api.get('/users/api-keys');
    return response.data;
  },
  
  createApiKey: async (name: string) => {
    const response = await api.post('/users/api-keys', { name });
    return response.data;
  },
  
  deleteApiKey: async (id: number) => {
    const response = await api.delete(`/users/api-keys/${id}`);
    return response.data;
  },
  
  toggleApiKey: async (id: number) => {
    const response = await api.patch(`/users/api-keys/${id}/toggle`);
    return response.data;
  },
};

// Utility API functions
export const apiUtils = {
  downloadFile: async (url: string, filename: string) => {
    const response = await api.get(url, { responseType: 'blob' });
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },
  
  uploadFile: async (file: File, endpoint: string) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(endpoint, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;