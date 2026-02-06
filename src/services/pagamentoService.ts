import api from './api';
import type { Pagamento, CriarPagamentoDTO } from '../types';

export const pagamentoService = {
  // Listar todos os pagamentos
  getAll: async (): Promise<Pagamento[]> => {
    const response = await api.get('/pagamentos');
    return response.data;
  },

  // Buscar pagamento por ID
  getById: async (id: number): Promise<Pagamento> => {
    const response = await api.get(`/pagamentos/${id}`);
    return response.data;
  },

  // Buscar pagamentos por paciente
  getByPaciente: async (pacienteId: number): Promise<Pagamento[]> => {
    const response = await api.get(`/pagamentos/paciente/${pacienteId}`);
    return response.data;
  },

  // Buscar pagamentos por dentista
  getByDentista: async (dentistaId: number): Promise<Pagamento[]> => {
    const response = await api.get(`/pagamentos/dentista/${dentistaId}`);
    return response.data;
  },

  // Buscar pagamentos por dentista e período
  getByDentistaEPeriodo: async (
    dentistaId: number,
    dataInicio: string,
    dataFim: string
  ): Promise<Pagamento[]> => {
    const response = await api.get(
      `/pagamentos/dentista/${dentistaId}/periodo`,
      {
        params: { dataInicio, dataFim },
      }
    );
    return response.data;
  },

  // Buscar pagamentos por período
  getByPeriodo: async (
    dataInicio: string,
    dataFim: string
  ): Promise<Pagamento[]> => {
    const response = await api.get('/pagamentos/periodo', {
      params: { dataInicio, dataFim },
    });
    return response.data;
  },

  // Criar pagamento
  create: async (pagamento: CriarPagamentoDTO): Promise<Pagamento> => {
    const response = await api.post('/pagamentos', pagamento);
    return response.data;
  },

  // Atualizar pagamento
  update: async (id: number, pagamento: Partial<Pagamento>): Promise<Pagamento> => {
    const response = await api.put(`/pagamentos/${id}`, pagamento);
    return response.data;
  },

// Deletar pagamento
  delete: async (id: number): Promise<void> => {
    await api.delete(`/pagamentos/${id}`);
  },

  // Buscar pagamentos por atendimento
  getByAtendimento: async (atendimentoId: number): Promise<Pagamento[]> => {
    const response = await api.get(`/pagamentos/atendimento/${atendimentoId}`);
    return response.data;
  },
};
