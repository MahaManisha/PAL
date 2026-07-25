import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const apiClient = axios.create({
    baseURL: API_BASE
});

// Request interceptor to attach Authorization: Bearer <token> at request time
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Helper checking if a request URL belongs to public authentication endpoints
const isPublicAuthEndpoint = (url = '') => {
    return url.includes('/api/auth/login') ||
           url.includes('/api/auth/register') ||
           url.includes('/api/auth/google');
};

// Response interceptor to handle 401 Unauthorized globally for expired/invalid tokens
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            const requestUrl = error.config?.url || '';
            // Do not redirect or clear storage for public authentication failures (e.g. wrong password on /login)
            if (!isPublicAuthEndpoint(requestUrl)) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');

                if (window.location.pathname !== '/login') {
                    window.location.assign('/login');
                }
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
