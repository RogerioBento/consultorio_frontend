import React, { useState, useEffect } from 'react';
import { AlertTriangle, Phone, Mail, Eye, Search, Calendar } from 'lucide-react';
import { parcelaService } from '../services/parcelaService';
import { pacienteService } from '../services/pacienteService';
import type { Parcela, Paciente } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import PacienteDetalhesModal from '../components/pacientes/PacienteDetalhesModal';

interface InadimplenteInfo {
    paciente: Paciente;
    parcelas: Parcela[];
    valorTotal: number;
    parcelasVencidas: number;
    diasAtraso: number;
}

const Inadimplentes: React.FC = () => {
    const [inadimplentes, setInadimplentes] = useState<InadimplenteInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtroAtraso, setFiltroAtraso] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [pacienteSelecionado, setPacienteSelecionado] = useState<Paciente | null>(null);
    const [showDetalhesModal, setShowDetalhesModal] = useState(false);

    useEffect(() => {
        carregarInadimplentes();
    }, []);

    const carregarInadimplentes = async () => {
        try {
            setLoading(true);
            
            // Buscar todas as parcelas vencidas
            const hoje = new Date();
            const todasParcelas = await parcelaService.getAll();
            
            // Filtrar parcelas vencidas e pendentes
            const parcelasVencidas = todasParcelas.filter((parcela) => {
                if (parcela.status !== 'PENDENTE' && parcela.status !== 'ATRASADO') {
                    return false;
                }
                const dataVencimento = new Date(parcela.dataVencimento);
                return dataVencimento < hoje;
            });

            // Agrupar por paciente
            const inadimplentesMap = new Map<number, InadimplenteInfo>();

            for (const parcela of parcelasVencidas) {
                const pacienteId = parcela.pagamento.paciente.id;
                
                if (!inadimplentesMap.has(pacienteId)) {
                    inadimplentesMap.set(pacienteId, {
                        paciente: parcela.pagamento.paciente,
                        parcelas: [],
                        valorTotal: 0,
                        parcelasVencidas: 0,
                        diasAtraso: 0,
                    });
                }

                const info = inadimplentesMap.get(pacienteId)!;
                info.parcelas.push(parcela);
                info.valorTotal += Number(parcela.valorParcela);
                info.parcelasVencidas += 1;

                // Calcular dias de atraso (pegar o maior)
                const dataVencimento = new Date(parcela.dataVencimento);
                const diasAtrasoAtual = Math.floor((hoje.getTime() - dataVencimento.getTime()) / (1000 * 60 * 60 * 24));
                if (diasAtrasoAtual > info.diasAtraso) {
                    info.diasAtraso = diasAtrasoAtual;
                }
            }

            setInadimplentes(Array.from(inadimplentesMap.values()));
        } catch (error) {
            console.error('Erro ao carregar inadimplentes:', error);
        } finally {
            setLoading(false);
        }
    };

    const inadimplentesFiltrados = inadimplentes.filter((info) => {
        // Filtro por busca
        if (searchTerm && !info.paciente.nome.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false;
        }

        // Filtro por tempo de atraso
        if (filtroAtraso) {
            const dias = info.diasAtraso;
            switch (filtroAtraso) {
                case '7':
                    return dias <= 7;
                case '15':
                    return dias > 7 && dias <= 15;
                case '30':
                    return dias > 15 && dias <= 30;
                case '60':
                    return dias > 30 && dias <= 60;
                case '60+':
                    return dias > 60;
                default:
                    return true;
            }
        }

        return true;
    });

    const calcularTotalEmAtraso = () => {
        return inadimplentesFiltrados.reduce((acc, info) => acc + info.valorTotal, 0);
    };

    const getGravidadeBadge = (diasAtraso: number) => {
        if (diasAtraso <= 30) {
            return (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Calendar className="w-3 h-3 mr-1" />
                    {diasAtraso} dias
                </span>
            );
        } else if (diasAtraso <= 60) {
            return (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {diasAtraso} dias
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {diasAtraso} dias
                </span>
            );
        }
    };

    const abrirDetalhes = (paciente: Paciente) => {
        setPacienteSelecionado(paciente);
        setShowDetalhesModal(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-xl text-gray-600">Carregando...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Inadimplentes</h1>
                <p className="text-gray-600 mt-1">Pacientes com parcelas vencidas e pendentes</p>
            </div>

            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card bg-red-50 border-red-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-red-600">Total de Inadimplentes</p>
                            <p className="text-3xl font-bold text-red-700 mt-1">
                                {inadimplentesFiltrados.length}
                            </p>
                        </div>
                        <div className="p-3 bg-red-100 rounded-full">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>
                    </div>
                </div>

                <div className="card bg-orange-50 border-orange-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-orange-600">Total em Atraso</p>
                            <p className="text-3xl font-bold text-orange-700 mt-1">
                                {formatCurrency(calcularTotalEmAtraso())}
                            </p>
                        </div>
                        <div className="p-3 bg-orange-100 rounded-full">
                            <Calendar className="w-8 h-8 text-orange-600" />
                        </div>
                    </div>
                </div>

                <div className="card bg-yellow-50 border-yellow-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-yellow-600">Parcelas Vencidas</p>
                            <p className="text-3xl font-bold text-yellow-700 mt-1">
                                {inadimplentesFiltrados.reduce((acc, info) => acc + info.parcelasVencidas, 0)}
                            </p>
                        </div>
                        <div className="p-3 bg-yellow-100 rounded-full">
                            <AlertTriangle className="w-8 h-8 text-yellow-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="card">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Busca */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por paciente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field pl-10"
                        />
                    </div>

                    {/* Filtro por tempo de atraso */}
                    <div>
                        <select
                            value={filtroAtraso}
                            onChange={(e) => setFiltroAtraso(e.target.value)}
                            className="input-field"
                        >
                            <option value="">Todos os períodos</option>
                            <option value="7">Até 7 dias</option>
                            <option value="15">8 a 15 dias</option>
                            <option value="30">16 a 30 dias</option>
                            <option value="60">31 a 60 dias</option>
                            <option value="60+">Mais de 60 dias</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Tabela de Inadimplentes */}
            {inadimplentesFiltrados.length === 0 ? (
                <div className="card text-center py-12">
                    <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum inadimplente encontrado</h3>
                    <p className="text-gray-500">
                        {searchTerm || filtroAtraso
                            ? 'Tente ajustar os filtros de busca'
                            : 'Todos os pagamentos estão em dia!'}
                    </p>
                </div>
            ) : (
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Paciente
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Contato
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Parcelas Vencidas
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Valor em Atraso
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Atraso
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {inadimplentesFiltrados.map((info) => (
                                    <tr key={info.paciente.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {info.paciente.nome}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    CPF: {info.paciente.cpf}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                <div className="flex items-center space-x-2">
                                                    <Phone className="w-4 h-4 text-gray-400" />
                                                    <span>{info.paciente.telefone}</span>
                                                </div>
                                                {info.paciente.email && (
                                                    <div className="flex items-center space-x-2 mt-1">
                                                        <Mail className="w-4 h-4 text-gray-400" />
                                                        <span className="text-xs">{info.paciente.email}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {info.parcelasVencidas} {info.parcelasVencidas === 1 ? 'parcela' : 'parcelas'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-red-600">
                                                {formatCurrency(info.valorTotal)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getGravidadeBadge(info.diasAtraso)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => abrirDetalhes(info.paciente)}
                                                className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                                            >
                                                <Eye className="w-4 h-4" />
                                                <span>Ver Detalhes</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal de Detalhes do Paciente */}
            {showDetalhesModal && pacienteSelecionado && (
                <PacienteDetalhesModal
                    paciente={pacienteSelecionado}
                    onClose={() => {
                        setShowDetalhesModal(false);
                        setPacienteSelecionado(null);
                        carregarInadimplentes(); // Recarregar após fechar
                    }}
                />
            )}
        </div>
    );
};

export default Inadimplentes;

