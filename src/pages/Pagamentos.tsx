import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Search, Filter, CheckCircle, Clock, AlertCircle, Eye, Trash2 } from 'lucide-react';
import { pagamentoService } from '../services/pagamentoService';
import { useAuth } from '../hooks/useAuth';
import type { Pagamento } from '../types';
import { formatCurrency, formatDate, formatMetodoPagamento } from '../utils/formatters';
import PagamentoModal from '../components/pagamentos/PagamentoModal';
import ParcelasModal from '../components/pagamentos/ParcelasModal';

const Pagamentos: React.FC = () => {
    const { user } = useAuth();
    const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
    const [filteredPagamentos, setFilteredPagamentos] = useState<Pagamento[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showParcelasModal, setShowParcelasModal] = useState(false);
    const [pagamentoSelecionado, setPagamentoSelecionado] = useState<Pagamento | null>(null);
    const [filterMetodo, setFilterMetodo] = useState('');
    const [filterParcelado, setFilterParcelado] = useState('');
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');

    const carregarPagamentos = async () => {
        try {
            setLoading(true);
            let data: Pagamento[];
            
            // Se for dentista, mostrar apenas seus pagamentos
            if (user?.cargo === 'DENTISTA' && user.id) {
                data = await pagamentoService.getByDentista(user.id);
            } else {
                // Admin e recepcionista veem todos
                data = await pagamentoService.getAll();
            }
            
            setPagamentos(data);
            setFilteredPagamentos(data);
        } catch (error) {
            console.error('Erro ao carregar pagamentos:', error);
        } finally {
            setLoading(false);
        }
    };

    const aplicarFiltroPeriodo = async () => {
        if (!dataInicio || !dataFim) {
            carregarPagamentos();
            return;
        }

        try {
            setLoading(true);
            const inicio = new Date(dataInicio).toISOString();
            const fim = new Date(dataFim + 'T23:59:59').toISOString();
            const data = await pagamentoService.getByPeriodo(inicio, fim);
            setPagamentos(data);
            setFilteredPagamentos(data);
        } catch (error) {
            console.error('Erro ao filtrar por período:', error);
        } finally {
            setLoading(false);
        }
    };

    const limparFiltroPeriodo = () => {
        setDataInicio('');
        setDataFim('');
        carregarPagamentos();
    };

    useEffect(() => {
        carregarPagamentos();
    }, [user]);

    // Filtro em tempo real
    useEffect(() => {
        let filtered = pagamentos;

        // Filtro por nome do paciente
        if (searchTerm) {
            filtered = filtered.filter((p) =>
                p.paciente.nome.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filtro por método de pagamento
        if (filterMetodo) {
            filtered = filtered.filter((p) => p.metodoPagamento === filterMetodo);
        }

        // Filtro por parcelado
        if (filterParcelado) {
            const isParcelado = filterParcelado === 'true';
            filtered = filtered.filter((p) => p.parcelado === isParcelado);
        }

        setFilteredPagamentos(filtered);
    }, [searchTerm, filterMetodo, filterParcelado, pagamentos]);

    const calcularTotalPagamentos = () => {
        return filteredPagamentos.reduce((acc, p) => acc + Number(p.valorTotal), 0);
    };

    const calcularTotalPago = () => {
        return filteredPagamentos.reduce((acc, pagamento) => {
            if (!pagamento.parcelado || !pagamento.parcelas || pagamento.parcelas.length === 0) {
                // Pagamento à vista ou sem parcelas - considera como pago
                return acc + Number(pagamento.valorTotal);
            }
            // Soma apenas parcelas pagas
            const totalParcelasPagas = pagamento.parcelas
                .filter(p => p.status === 'PAGO')
                .reduce((sum, p) => sum + Number(p.valorParcela), 0);
            return acc + totalParcelasPagas;
        }, 0);
    };

    const calcularTotalPendente = () => {
        return filteredPagamentos.reduce((acc, pagamento) => {
            if (!pagamento.parcelado || !pagamento.parcelas || pagamento.parcelas.length === 0) {
                // Pagamento à vista - não tem pendência
                return acc;
            }
            // Soma apenas parcelas pendentes, atrasadas ou estornadas
            const totalParcelasPendentes = pagamento.parcelas
                .filter(p => p.status === 'PENDENTE' || p.status === 'ATRASADO' || p.status === 'ESTORNADO')
                .reduce((sum, p) => sum + Number(p.valorParcela), 0);
            return acc + totalParcelasPendentes;
        }, 0);
    };

    const getStatusBadge = (pagamento: Pagamento) => {
        const temParcelas = pagamento.parcelas && pagamento.parcelas.length > 0;
        
        if (!temParcelas || !pagamento.parcelado) {
            return (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    À Vista
                </span>
            );
        }

        const parcelasPendentes = pagamento.parcelas.filter(
            (p) => p.status === 'PENDENTE' || p.status === 'ATRASADO' || p.status === 'ESTORNADO'
        ).length;

        if (parcelasPendentes === 0) {
            return (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Pago
                </span>
            );
        }

        const parcelasAtrasadas = pagamento.parcelas.filter((p) => p.status === 'ATRASADO').length;

        if (parcelasAtrasadas > 0) {
            return (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {parcelasAtrasadas} Atrasada{parcelasAtrasadas > 1 ? 's' : ''}
                </span>
            );
        }

        return (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <Clock className="w-3 h-3 mr-1" />
                {parcelasPendentes} Pendente{parcelasPendentes > 1 ? 's' : ''}
            </span>
        );
    };

    const abrirModalParcelas = (pagamento: Pagamento) => {
        setPagamentoSelecionado(pagamento);
        setShowParcelasModal(true);
    };

    const deletarPagamento = async (id: number, nomePaciente: string) => {
        if (window.confirm(`Tem certeza que deseja excluir o pagamento do paciente "${nomePaciente}"?\n\nEsta ação não pode ser desfeita e todas as parcelas serão removidas.`)) {
            try {
                await pagamentoService.delete(id);
                await carregarPagamentos();
            } catch (error) {
                console.error('Erro ao deletar pagamento:', error);
                alert('Erro ao deletar pagamento. Tente novamente.');
            }
        }
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Pagamentos</h1>
                    <p className="text-gray-600 mt-1">Gerencie os pagamentos e parcelas</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary flex items-center space-x-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>Novo Pagamento</span>
                </button>
            </div>

            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total de Pagamentos</p>
                            <p className="text-2xl font-bold text-gray-900">{filteredPagamentos.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Pago</p>
                            <p className="text-2xl font-bold text-green-600">
                                {formatCurrency(calcularTotalPago())}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Pendente</p>
                            <p className="text-2xl font-bold text-yellow-600">
                                {formatCurrency(calcularTotalPendente())}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <Clock className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Parcelados</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {pagamentos.filter((p) => p.parcelado).length}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="card">
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Busca por paciente */}
                        <div className="md:col-span-2">
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
                        </div>

                        {/* Filtro por método */}
                        <div>
                            <select
                                value={filterMetodo}
                                onChange={(e) => setFilterMetodo(e.target.value)}
                                className="input-field"
                            >
                                <option value="">Todos os métodos</option>
                                <option value="DINHEIRO">Dinheiro</option>
                                <option value="CARTAO_DEBITO">Cartão Débito</option>
                                <option value="CARTAO_CREDITO">Cartão Crédito</option>
                                <option value="PIX">PIX</option>
                                <option value="TRANSFERENCIA">Transferência</option>
                            </select>
                        </div>

                        {/* Filtro por parcelado */}
                        <div>
                            <select
                                value={filterParcelado}
                                onChange={(e) => setFilterParcelado(e.target.value)}
                                className="input-field"
                            >
                                <option value="">Todos</option>
                                <option value="false">À Vista</option>
                                <option value="true">Parcelado</option>
                            </select>
                        </div>
                    </div>

                    {/* Filtro por Período */}
                    <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Data Início
                                </label>
                                <input
                                    type="date"
                                    value={dataInicio}
                                    onChange={(e) => setDataInicio(e.target.value)}
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Data Fim
                                </label>
                                <input
                                    type="date"
                                    value={dataFim}
                                    onChange={(e) => setDataFim(e.target.value)}
                                    className="input-field"
                                />
                            </div>
                            <div className="flex items-end space-x-2">
                                <button
                                    onClick={aplicarFiltroPeriodo}
                                    className="btn-primary flex-1"
                                    disabled={!dataInicio || !dataFim}
                                >
                                    Filtrar
                                </button>
                                <button
                                    onClick={limparFiltroPeriodo}
                                    className="btn-secondary"
                                >
                                    Limpar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lista de Pagamentos */}
            <div className="card overflow-hidden">
                {filteredPagamentos.length === 0 ? (
                    <div className="text-center py-12">
                        <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">Nenhum pagamento encontrado</p>
                        <p className="text-gray-400 text-sm mt-2">
                            Clique em "Novo Pagamento" para começar
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Paciente
                                    </th>
                                    {user?.cargo !== 'DENTISTA' && (
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Dentista
                                        </th>
                                    )}
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Valor
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Método
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Parcelas
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Data
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredPagamentos.map((pagamento) => (
                                    <tr key={pagamento.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {pagamento.paciente.nome}
                                            </div>
                                        </td>
                                        {user?.cargo !== 'DENTISTA' && (
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {pagamento.dentista.nome}
                                                </div>
                                            </td>
                                        )}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-green-600">
                                                {formatCurrency(Number(pagamento.valorTotal))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {formatMetodoPagamento(pagamento.metodoPagamento)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {pagamento.parcelado
                                                    ? `${pagamento.numeroParcelas}x`
                                                    : 'À Vista'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(pagamento)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">
                                                {formatDate(pagamento.dataLancamento)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-3">
                                                {pagamento.parcelado && (
                                                    <button
                                                        onClick={() => abrirModalParcelas(pagamento)}
                                                        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
                                                    >
                                                        <Eye className="w-4 h-4 mr-1" />
                                                        Ver Parcelas
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deletarPagamento(pagamento.id, pagamento.paciente.nome)}
                                                    className="inline-flex items-center text-red-600 hover:text-red-800 font-medium text-sm"
                                                    title="Excluir pagamento"
                                                >
                                                    <Trash2 className="w-4 h-4" />
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

            {/* Modal de Novo Pagamento */}
            {showModal && (
                <PagamentoModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false);
                        carregarPagamentos();
                    }}
                />
            )}

            {/* Modal de Parcelas */}
            {showParcelasModal && pagamentoSelecionado && (
                <ParcelasModal
                    isOpen={showParcelasModal}
                    onClose={() => {
                        setShowParcelasModal(false);
                        setPagamentoSelecionado(null);
                    }}
                    pagamento={pagamentoSelecionado}
                    onParcelaAtualizada={carregarPagamentos}
                />
            )}
        </div>
    );
};

export default Pagamentos;

