import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || '';

    if (
      status === 401 &&
      (message.includes('ACCOUNT_DEACTIVATED') || message.includes('deactivated or deleted'))
    ) {
      localStorage.clear();
      sessionStorage.clear();

      alert('Your account has been deleted. Please register a new profile.');
      window.location.href = '/sign-up';
    }

    return Promise.reject(error);
  }
);

export default api;
