import api from './api';
import type { Atendimento, AtendimentoDTO, FinalizarAtendimentoDTO } from '../types';

export const atendimentoService = {
    // Listar todos os atendimentos
    getAll: async (): Promise<Atendimento[]> => {
        const response = await api.get('/atendimentos');
        return response.data;
    },

    // Buscar por ID
    getById: async (id: number): Promise<Atendimento> => {
        const response = await api.get(`/atendimentos/${id}`);
        return response.data;
    },

    // Buscar atendimentos de hoje
    getHoje: async (): Promise<Atendimento[]> => {
        const response = await api.get('/atendimentos/hoje');
        return response.data;
    },

    // Buscar atendimentos de hoje por dentista
    getHojePorDentista: async (dentistaId: number): Promise<Atendimento[]> => {
        const response = await api.get(`/atendimentos/hoje/dentista/${dentistaId}`);
        return response.data;
    },

    // Buscar atendimentos em andamento
    getEmAndamento: async (): Promise<Atendimento[]> => {
        const response = await api.get('/atendimentos/em-andamento');
        return response.data;
    },

    // Buscar atendimentos em andamento por dentista
    getEmAndamentoPorDentista: async (dentistaId: number): Promise<Atendimento[]> => {
        const response = await api.get(`/atendimentos/em-andamento/dentista/${dentistaId}`);
        return response.data;
    },

    // Buscar por dentista
    getByDentista: async (dentistaId: number): Promise<Atendimento[]> => {
        const response = await api.get(`/atendimentos/dentista/${dentistaId}`);
        return response.data;
    },

    // Buscar por paciente
    getByPaciente: async (pacienteId: number): Promise<Atendimento[]> => {
        const response = await api.get(`/atendimentos/paciente/${pacienteId}`);
        return response.data;
    },

    // Buscar histórico de um paciente
    getHistoricoPaciente: async (pacienteId: number): Promise<Atendimento[]> => {
        const response = await api.get(`/atendimentos/paciente/${pacienteId}/historico`);
        return response.data;
    },

    // Buscar por período
    getByPeriodo: async (dataInicio: string, dataFim: string): Promise<Atendimento[]> => {
        const response = await api.get('/atendimentos/periodo', {
            params: { dataInicio, dataFim }
        });
        return response.data;
    },

    // Buscar por período e dentista
    getByPeriodoEDentista: async (dentistaId: number, dataInicio: string, dataFim: string): Promise<Atendimento[]> => {
        const response = await api.get(`/atendimentos/periodo/dentista/${dentistaId}`, {
            params: { dataInicio, dataFim }
        });
        return response.data;
    },

    // Buscar agendamentos futuros
    getAgendamentos: async (): Promise<Atendimento[]> => {
        const response = await api.get('/atendimentos/agendamentos');
        return response.data;
    },

    // Criar novo atendimento
    create: async (dto: AtendimentoDTO): Promise<Atendimento> => {
        const response = await api.post('/atendimentos', dto);
        return response.data;
    },

    // Iniciar atendimento
    iniciar: async (id: number): Promise<Atendimento> => {
        const response = await api.patch(`/atendimentos/${id}/iniciar`);
        return response.data;
    },

    // Finalizar atendimento
    finalizar: async (id: number, dto: FinalizarAtendimentoDTO): Promise<Atendimento> => {
        const response = await api.patch(`/atendimentos/${id}/finalizar`, dto);
        return response.data;
    },

    // Cancelar atendimento
    cancelar: async (id: number): Promise<Atendimento> => {
        const response = await api.patch(`/atendimentos/${id}/cancelar`);
        return response.data;
    },

    // Atualizar atendimento
    update: async (id: number, atendimento: Partial<Atendimento>): Promise<Atendimento> => {
        const response = await api.put(`/atendimentos/${id}`, atendimento);
        return response.data;
    },

    // Deletar atendimento
    delete: async (id: number): Promise<void> => {
        await api.delete(`/atendimentos/${id}`);
    },

    // ===== MÉTODOS DE AGENDA =====

    // Buscar agenda de um dentista por período
    getAgendaDentista: async (
        dentistaId: number,
        dataInicio: string,
        dataFim: string
    ): Promise<Atendimento[]> => {
        const response = await api.get(`/atendimentos/agenda/${dentistaId}`, {
            params: { dataInicio, dataFim },
        });
        return response.data;
    },

    // Contar consultas por dia
    contarConsultasPorDia: async (
        dentistaId: number,
        mes: number,
        ano: number
    ): Promise<Record<string, number>> => {
        const response = await api.get('/atendimentos/agenda/calendario', {
            params: { dentistaId, mes, ano },
        });
        return response.data;
    },

    // Reagendar atendimento
    reagendar: async (id: number, novaDataHora: string): Promise<Atendimento> => {
        const response = await api.patch(`/atendimentos/${id}/reagendar`, null, {
            params: { novaDataHora },
        });
        return response.data;
    },
};
