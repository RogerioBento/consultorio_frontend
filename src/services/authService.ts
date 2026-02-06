// frontend/src/services/authService.ts
import api from './api';
import type {LoginRequest, LoginResponse, RegisterRequest} from '../types';

const authService = {
    login: async (credentials: LoginRequest): Promise<LoginResponse> => {
        const response = await api.post<LoginResponse>('/auth/login', credentials);
        // ✅ Importante: O backend retorna { token, tipo, usuario }.
        // Certifique-se de que o tipo LoginResponse em types/index.ts reflete isso.
        // Se o backend retornar 'user' em vez de 'usuario', você precisará ajustar aqui ou no backend.
        return response.data; // Retorna o objeto completo { token, tipo, usuario }
    },

    register: async (userData: RegisterRequest): Promise<void> => {
        await api.post('/auth/register', userData);
    },
};

export { authService };
