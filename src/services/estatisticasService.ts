import api from './api';
import type { EstatisticasPagamento } from '../types/estatisticas';

export const estatisticasService = {
    // Estatísticas por período personalizado
    getPorPeriodo: async (
        dentistaId: number,
        dataInicio: string,
        dataFim: string
    ): Promise<EstatisticasPagamento> => {
        const response = await api.get(`/estatisticas/dentista/${dentistaId}`, {
            params: { dataInicio, dataFim }
        });
        return response.data;
    },

    // Estatísticas do dia
    getHoje: async (dentistaId: number): Promise<EstatisticasPagamento> => {
        const response = await api.get(`/estatisticas/dentista/${dentistaId}/hoje`);
        return response.data;
    },

    // Estatísticas do mês
    getMes: async (dentistaId: number): Promise<EstatisticasPagamento> => {
        const response = await api.get(`/estatisticas/dentista/${dentistaId}/mes`);
        return response.data;
    },

    // Estatísticas do ano
    getAno: async (dentistaId: number): Promise<EstatisticasPagamento> => {
        const response = await api.get(`/estatisticas/dentista/${dentistaId}/ano`);
        return response.data;
    },
};

