import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        if (config.url?.includes('/auth/login') || config.url?.includes('/auth/register')) {
            return config;
        }

        const token = localStorage.getItem('@ConsultorioOdonto:token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('@ConsultorioOdonto:token');
            localStorage.removeItem('@ConsultorioOdonto:user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
