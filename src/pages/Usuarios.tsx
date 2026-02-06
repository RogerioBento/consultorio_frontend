import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, UserCheck, UserX, Edit2, Shield } from 'lucide-react';
import { usuarioService } from '../services/usuarioService';
import { useAuth } from '../hooks/useAuth';
import type { Usuario } from '../types';
import { formatDate } from '../utils/formatters';
import UsuarioModal from '../components/usuarios/UsuarioModal';

const Usuarios: React.FC = () => {
    const { user } = useAuth();
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [filteredUsuarios, setFilteredUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [usuarioSelecionado, setUsuarioSelecionado] = useState<Usuario | undefined>(undefined);
    const [filterCargo, setFilterCargo] = useState('');
    const [filterAtivo, setFilterAtivo] = useState('true'); // Mostrar apenas ativos por padrão

    const carregarUsuarios = async () => {
        try {
            setLoading(true);
            const data = await usuarioService.getAllIncludingInactive();
            setUsuarios(data);
            setFilteredUsuarios(data);
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        carregarUsuarios();
    }, []);

    // Filtro em tempo real
    useEffect(() => {
        let filtered = usuarios;

        // Filtro por nome ou email
        if (searchTerm) {
            filtered = filtered.filter((u) =>
                u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filtro por cargo
        if (filterCargo) {
            filtered = filtered.filter((u) => u.cargo === filterCargo);
        }

        // Filtro por status ativo
        if (filterAtivo) {
            const isAtivo = filterAtivo === 'true';
            filtered = filtered.filter((u) => u.ativo === isAtivo);
        }

        setFilteredUsuarios(filtered);
    }, [searchTerm, filterCargo, filterAtivo, usuarios]);

    const abrirModalNovo = () => {
        setUsuarioSelecionado(undefined);
        setShowModal(true);
    };

    const abrirModalEditar = (usuario: Usuario) => {
        setUsuarioSelecionado(usuario);
        setShowModal(true);
    };

    const toggleAtivo = async (id: number, nomeUsuario: string, statusAtual: boolean) => {
        const acao = statusAtual ? 'desativar' : 'ativar';
        if (window.confirm(`Tem certeza que deseja ${acao} o usuário "${nomeUsuario}"?`)) {
            try {
                await usuarioService.toggleAtivo(id);
                await carregarUsuarios();
            } catch (error) {
                console.error(`Erro ao ${acao} usuário:`, error);
                alert(`Erro ao ${acao} usuário. Tente novamente.`);
            }
        }
    };

    const getCargoColor = (cargo: string) => {
        switch (cargo) {
            case 'ADMIN':
                return 'bg-purple-100 text-purple-800';
            case 'DENTISTA':
                return 'bg-blue-100 text-blue-800';
            case 'RECEPCIONISTA':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getCargoLabel = (cargo: string) => {
        switch (cargo) {
            case 'ADMIN':
                return 'Administrador';
            case 'DENTISTA':
                return 'Dentista';
            case 'RECEPCIONISTA':
                return 'Recepcionista';
            default:
                return cargo;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-xl text-gray-600">Carregando...</div>
            </div>
        );
    }

    // Verificar se o usuário tem permissão (apenas ADMIN)
    if (user?.cargo !== 'ADMIN') {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <p className="text-xl text-gray-600">Acesso Negado</p>
                    <p className="text-gray-500 mt-2">Apenas administradores podem gerenciar usuários.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Usuários</h1>
                    <p className="text-gray-600 mt-1">Gerencie os usuários do sistema</p>
                </div>
                <button
                    onClick={abrirModalNovo}
                    className="btn-primary flex items-center space-x-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>Novo Usuário</span>
                </button>
            </div>

            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total de Usuários</p>
                            <p className="text-2xl font-bold text-gray-900">{usuarios.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Ativos</p>
                            <p className="text-2xl font-bold text-green-600">
                                {usuarios.filter((u) => u.ativo).length}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <UserCheck className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Dentistas</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {usuarios.filter((u) => u.cargo === 'DENTISTA').length}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Recepcionistas</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {usuarios.filter((u) => u.cargo === 'RECEPCIONISTA').length}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="card">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Busca por nome/email */}
                    <div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por nome ou email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input-field pl-10"
                            />
                        </div>
                    </div>

                    {/* Filtro por cargo */}
                    <div>
                        <select
                            value={filterCargo}
                            onChange={(e) => setFilterCargo(e.target.value)}
                            className="input-field"
                        >
                            <option value="">Todos os cargos</option>
                            <option value="ADMIN">Administrador</option>
                            <option value="DENTISTA">Dentista</option>
                            <option value="RECEPCIONISTA">Recepcionista</option>
                        </select>
                    </div>

                    {/* Filtro por status */}
                    <div>
                        <select
                            value={filterAtivo}
                            onChange={(e) => setFilterAtivo(e.target.value)}
                            className="input-field"
                        >
                            <option value="">Todos</option>
                            <option value="true">Ativos</option>
                            <option value="false">Inativos</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Lista de Usuários */}
            <div className="card overflow-hidden">
                {filteredUsuarios.length === 0 ? (
                    <div className="text-center py-12">
                        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">Nenhum usuário encontrado</p>
                        <p className="text-gray-400 text-sm mt-2">
                            Clique em "Novo Usuário" para começar
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nome
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Cargo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Data de Criação
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredUsuarios.map((usuario) => (
                                    <tr key={usuario.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {usuario.nome}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{usuario.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCargoColor(usuario.cargo)}`}>
                                                {getCargoLabel(usuario.cargo)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">
                                                {usuario.dataCriacao ? formatDate(usuario.dataCriacao) : '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {usuario.ativo ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    <UserCheck className="w-3 h-3 mr-1" />
                                                    Ativo
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    <UserX className="w-3 h-3 mr-1" />
                                                    Inativo
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-3">
                                                <button
                                                    onClick={() => abrirModalEditar(usuario)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                    title="Editar"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => toggleAtivo(usuario.id, usuario.nome, usuario.ativo)}
                                                    className={usuario.ativo ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}
                                                    title={usuario.ativo ? 'Desativar' : 'Ativar'}
                                                >
                                                    {usuario.ativo ? (
                                                        <UserX className="w-4 h-4" />
                                                    ) : (
                                                        <UserCheck className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal de Novo/Editar Usuário */}
            {showModal && (
                <UsuarioModal
                    isOpen={showModal}
                    onClose={() => {
                        setShowModal(false);
                        setUsuarioSelecionado(undefined);
                    }}
                    onSuccess={() => {
                        setShowModal(false);
                        setUsuarioSelecionado(undefined);
                        carregarUsuarios();
                    }}
                    usuario={usuarioSelecionado}
                />
            )}
        </div>
    );
};

export default Usuarios;

