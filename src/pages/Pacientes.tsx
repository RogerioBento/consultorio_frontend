import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { pacienteService } from '../services/pacienteService';
import type { Paciente } from '../types';
import { formatCPF, formatPhone, formatDate, calcularIdade } from '../utils/formatters';
import PacienteModal from '../components/pacientes/PacienteModal';
import PacienteDetalhesModal from '../components/pacientes/PacienteDetalhesModal';
import axios from 'axios';

const Pacientes: React.FC = () => {
    const [pacientes, setPacientes] = useState<Paciente[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetalhesModalOpen, setIsDetalhesModalOpen] = useState(false);
    const [pacienteSelecionado, setPacienteSelecionado] = useState<Paciente | undefined>(undefined);

    useEffect(() => {
        carregarPacientes();
    }, []);

    const carregarPacientes = async () => {
        try {
            const data = await pacienteService.getAll();
            setPacientes(data);
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response) {
                console.error('Erro ao carregar pacientes:', error.response.data);
            } else {
                console.error('Erro ao carregar pacientes:', error);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleExcluir = async (id: number) => {
        if (!window.confirm('Tem certeza que deseja excluir este paciente?')) {
            return;
        }
        try {
            await pacienteService.delete(id);
            carregarPacientes();
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response) {
                console.error('Erro ao excluir paciente:', error.response.data);
                alert(error.response.data?.message || 'Erro ao excluir paciente');
            } else {
                console.error('Erro ao excluir paciente:', error);
                alert('Erro ao excluir paciente');
            }
        }
    };

    const handleEditar = (paciente: Paciente) => {
        setPacienteSelecionado(paciente);
        setIsModalOpen(true);
    };

    const handleVisualizarDetalhes = (paciente: Paciente) => { // ✅ FUNÇÃO DEFINIDA AQUI
        setPacienteSelecionado(paciente);
        setIsDetalhesModalOpen(true);
    };

    const handleNovoPaciente = () => {
        setPacienteSelecionado(undefined);
        setIsModalOpen(true);
    };

    const handleFecharModal = () => {
        setIsModalOpen(false);
        setPacienteSelecionado(undefined);
    };

    const handleFecharDetalhesModal = () => {
        setIsDetalhesModalOpen(false);
        setPacienteSelecionado(undefined);
    };

    const pacientesFiltrados = pacientes.filter((paciente) =>
        paciente.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-xl text-gray-600">Carregando...</div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Pacientes</h1>
                <button
                    onClick={handleNovoPaciente}
                    className="btn-primary flex items-center space-x-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>Novo Paciente</span>
                </button>
            </div>

            <div className="card mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar paciente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field pl-10"
                    />
                </div>
            </div>

            <div className="card">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                Nome
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                Idade
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                CPF
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                Telefone
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                Data Nascimento
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                Ações
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {pacientesFiltrados.map((paciente) => (
                            <tr
                                key={paciente.id}
                                className="border-b border-gray-100 hover:bg-gray-50"
                            >
                                <td className="py-3 px-4 font-medium">{paciente.nome}</td>
                                <td className="py-3 px-4">{calcularIdade(paciente.dataNascimento)} anos</td>
                                <td className="py-3 px-4">{paciente.cpf ? formatCPF(paciente.cpf) : '-'}</td>
                                <td className="py-3 px-4">{paciente.telefone ? formatPhone(paciente.telefone) : '-'}</td>
                                <td className="py-3 px-4">{formatDate(paciente.dataNascimento)}</td>
                                <td className="py-3 px-4">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEditar(paciente)}
                                            className="text-blue-600 hover:text-blue-800 transition-colors"
                                            title="Editar"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleExcluir(paciente.id)}
                                            className="text-red-600 hover:text-red-800 transition-colors"
                                            title="Excluir"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleVisualizarDetalhes(paciente)}
                                            className="text-gray-600 hover:text-gray-800 transition-colors"
                                            title="Ver Detalhes"
                                        >
                                            <Search className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    {pacientesFiltrados.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            Nenhum paciente encontrado
                        </div>
                    )}
                </div>
            </div>

            <PacienteModal
                isOpen={isModalOpen}
                onClose={handleFecharModal}
                onSuccess={carregarPacientes}
                paciente={pacienteSelecionado}
            />
            <PacienteDetalhesModal
                isOpen={isDetalhesModalOpen}
                onClose={handleFecharDetalhesModal}
                paciente={pacienteSelecionado}
            />
        </div>
    );
};

export default Pacientes;
