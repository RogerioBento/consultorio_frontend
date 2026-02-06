import api from './api';
import type { Parcela } from '../types';

export const parcelaService = {
    // Listar todas as parcelas
    getAll: async (): Promise<Parcela[]> => {
        const response = await api.get('/parcelas');
        return response.data;
    },

    // Buscar parcela por ID
    getById: async (id: number): Promise<Parcela> => {
        const response = await api.get(`/parcelas/${id}`);
        return response.data;
    },

    // Buscar parcelas por pagamento
    getByPagamento: async (pagamentoId: number): Promise<Parcela[]> => {
        const response = await api.get(`/parcelas/pagamento/${pagamentoId}`);
        return response.data;
    },

    // Buscar parcelas pendentes de um paciente
    getParcelasPendentesByPaciente: async (pacienteId: number): Promise<Parcela[]> => {
        const response = await api.get(`/parcelas/paciente/${pacienteId}/pendentes`);
        return response.data;
    },

    // Marcar parcela como paga
    marcarComoPaga: async (id: number): Promise<Parcela> => {
        const response = await api.patch(`/parcelas/${id}/pagar`);
        return response.data;
    },

    // Marcar parcela como estornada
    marcarComoEstornada: async (id: number): Promise<Parcela> => {
        const response = await api.patch(`/parcelas/${id}/estornar`);
        return response.data;
    },

    // Estornar todas as parcelas de um pagamento
    estornarTodasParcelas: async (pagamentoId: number): Promise<Parcela[]> => {
        const response = await api.patch(`/parcelas/pagamento/${pagamentoId}/estornar-todas`);
        return response.data;
    },

    // Atualizar parcela
    update: async (id: number, parcela: Partial<Parcela>): Promise<Parcela> => {
        const response = await api.put(`/parcelas/${id}`, parcela);
        return response.data;
    },
};
