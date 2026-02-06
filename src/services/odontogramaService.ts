import api from './api';
import type { Odontograma, OdontogramaDTO } from '../types/odontograma';

export const odontogramaService = {
    // Buscar estado atual do odontograma de um paciente
    getEstadoAtual: async (pacienteId: number): Promise<Odontograma[]> => {
        const response = await api.get(`/odontograma/paciente/${pacienteId}/estado-atual`);
        return response.data;
    },

    // Buscar histórico completo de um paciente
    getHistorico: async (pacienteId: number): Promise<Odontograma[]> => {
        const response = await api.get(`/odontograma/paciente/${pacienteId}/historico`);
        return response.data;
    },

    // Buscar histórico de um dente específico
    getHistoricoDente: async (pacienteId: number, numeroDente: number): Promise<Odontograma[]> => {
        const response = await api.get(`/odontograma/paciente/${pacienteId}/dente/${numeroDente}`);
        return response.data;
    },

    // Buscar por ID
    getById: async (id: number): Promise<Odontograma> => {
        const response = await api.get(`/odontograma/${id}`);
        return response.data;
    },

    // Registrar alteração
    registrar: async (dto: OdontogramaDTO): Promise<Odontograma> => {
        const response = await api.post('/odontograma', dto);
        return response.data;
    },

    // Atualizar registro
    atualizar: async (id: number, dto: Partial<OdontogramaDTO>): Promise<Odontograma> => {
        const response = await api.put(`/odontograma/${id}`, dto);
        return response.data;
    },

    // Deletar registro
    deletar: async (id: number): Promise<void> => {
        await api.delete(`/odontograma/${id}`);
    },
};

