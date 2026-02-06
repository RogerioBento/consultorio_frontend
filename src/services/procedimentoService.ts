import api from './api';
import type { Procedimento } from '../types';

export const procedimentoService = {
    getAll: async (): Promise<Procedimento[]> => {
        const response = await api.get<Procedimento[]>('/procedimentos');
        return response.data;
    },

    getPorAtendimento: async (atendimentoId: number): Promise<Procedimento[]> => {
        const response = await api.get<Procedimento[]>(`/procedimentos/atendimento/${atendimentoId}`);
        return response.data;
    },

    getById: async (id: number): Promise<Procedimento> => {
        const response = await api.get<Procedimento>(`/procedimentos/${id}`);
        return response.data;
    },

    create: async (data: {
        atendimentoId: number;
        descricao: string;
        dente?: number;
        face?: string;
        valor?: number;
    }): Promise<Procedimento> => {
        const response = await api.post<Procedimento>('/procedimentos', data);
        return response.data;
    },

    update: async (id: number, data: Partial<Procedimento>): Promise<Procedimento> => {
        const response = await api.put<Procedimento>(`/procedimentos/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/procedimentos/${id}`);
    },
};
