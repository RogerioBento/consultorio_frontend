import api from './api';
import type {Paciente} from '../types';

export const pacienteService = {
    getAll: async (): Promise<Paciente[]> => {
        const response = await api.get<Paciente[]>('/pacientes');
        return response.data;
    },

    getById: async (id: number): Promise<Paciente> => {
        const response = await api.get<Paciente>(`/pacientes/${id}`);
        return response.data;
    },

    create: async (data: Omit<Paciente, 'id' | 'ativo'>): Promise<Paciente> => {
        const response = await api.post<Paciente>('/pacientes', data);
        return response.data;
    },

    update: async (id: number, data: Partial<Paciente>): Promise<Paciente> => {
        const response = await api.put<Paciente>(`/pacientes/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/pacientes/${id}`);
    },
};
