import api from './api';
import type { Usuario } from '../types';

export interface CriarUsuarioDTO {
    nome: string;
    email: string;
    senha: string;
    cargo: 'DENTISTA' | 'RECEPCIONISTA' | 'ADMIN';
}

export interface AtualizarUsuarioDTO {
    nome: string;
    email: string;
    senha?: string; // Opcional - só envia se quiser alterar
    cargo: 'DENTISTA' | 'RECEPCIONISTA' | 'ADMIN';
}

export const usuarioService = {
    // Listar apenas usuários ativos
    getAll: async (): Promise<Usuario[]> => {
        const response = await api.get('/usuarios');
        return response.data;
    },

    // Listar todos (incluindo inativos)
    getAllIncludingInactive: async (): Promise<Usuario[]> => {
        const response = await api.get('/usuarios/todos');
        return response.data;
    },

    // Buscar por ID
    getById: async (id: number): Promise<Usuario> => {
        const response = await api.get(`/usuarios/${id}`);
        return response.data;
    },

    // Listar dentistas
    getAllDentistas: async (): Promise<Usuario[]> => {
        const response = await api.get('/usuarios/dentistas');
        return response.data;
    },

    // Listar recepcionistas
    getAllRecepcionistas: async (): Promise<Usuario[]> => {
        const response = await api.get('/usuarios/recepcionistas');
        return response.data;
    },

    // Criar usuário
    create: async (usuario: CriarUsuarioDTO): Promise<Usuario> => {
        const response = await api.post('/usuarios', usuario);
        return response.data;
    },

    // Atualizar usuário
    update: async (id: number, usuario: AtualizarUsuarioDTO): Promise<Usuario> => {
        const response = await api.put(`/usuarios/${id}`, usuario);
        return response.data;
    },

    // Ativar/Desativar usuário
    toggleAtivo: async (id: number): Promise<Usuario> => {
        const response = await api.patch(`/usuarios/${id}/toggle-ativo`);
        return response.data;
    },

    // Deletar usuário (desativa)
    delete: async (id: number): Promise<void> => {
        await api.delete(`/usuarios/${id}`);
    },
};
