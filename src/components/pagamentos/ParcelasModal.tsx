import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Clock, AlertCircle, DollarSign, Undo2 } from 'lucide-react';
import { parcelaService } from '../../services/parcelaService';
import type { Parcela, Pagamento } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import axios from 'axios';

interface ParcelasModalProps {
    isOpen: boolean;
    onClose: () => void;
    pagamento: Pagamento;
    onParcelaAtualizada: () => void;
}

const ParcelasModal: React.FC<ParcelasModalProps> = ({
    isOpen,
    onClose,
    pagamento,
    onParcelaAtualizada,
}) => {
    const [parcelas, setParcelas] = useState<Parcela[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && pagamento.id) {
            carregarParcelas();
        }
    }, [isOpen, pagamento.id]);

    const carregarParcelas = async () => {
        try {
            setLoading(true);
            const data = await parcelaService.getByPagamento(pagamento.id);
            setParcelas(data);
        } catch (err: unknown) {
            if (axios.isAxiosError(err) && err.response) {
                console.error('Erro ao carregar parcelas:', err.response.data);
            } else {
                console.error('Erro ao carregar parcelas:', err);
            }
            setError('Erro ao carregar parcelas.');
        } finally {
            setLoading(false);
        }
    };

    const marcarComoPaga = async (parcelaId: number) => {
        try {
            setError('');
            await parcelaService.marcarComoPaga(parcelaId);
            await carregarParcelas(); // Recarrega as parcelas
            onParcelaAtualizada(); // Notifica o componente pai para atualizar a lista de pagamentos
        } catch (err: unknown) {
            if (axios.isAxiosError(err) && err.response) {
                console.error('Erro ao marcar parcela como paga:', err.response.data);
                setError(err.response.data?.message || 'Erro ao marcar parcela como paga.');
            } else {
                console.error('Erro ao marcar parcela como paga:', err);
                setError('Erro inesperado ao marcar parcela como paga.');
            }
        }
    };

    const marcarComoEstornada = async (parcelaId: number) => {
        if (window.confirm('Tem certeza que deseja estornar esta parcela?\n\nEsta ação removerá o pagamento da parcela.')) {
            try {
                setError('');
                await parcelaService.marcarComoEstornada(parcelaId);
                await carregarParcelas(); // Recarrega as parcelas
                onParcelaAtualizada(); // Notifica o componente pai para atualizar a lista de pagamentos
            } catch (err: unknown) {
                if (axios.isAxiosError(err) && err.response) {
                    console.error('Erro ao estornar parcela:', err.response.data);
                    setError(err.response.data?.message || 'Erro ao estornar parcela.');
                } else {
                    console.error('Erro ao estornar parcela:', err);
                    setError('Erro inesperado ao estornar parcela.');
                }
            }
        }
    };

    const estornarTodasParcelas = async () => {
        const parcelasPagas = parcelas.filter(p => p.status === 'PAGO');
        
        if (parcelasPagas.length === 0) {
            alert('Não há parcelas pagas para estornar.');
            return;
        }

        if (window.confirm(
            `⚠️ ATENÇÃO: Deseja estornar TODAS as parcelas deste pagamento?\n\n` +
            `Parcelas que serão estornadas: ${parcelasPagas.length}\n` +
            `Valor total: ${formatCurrency(Number(pagamento.valorTotal))}\n\n` +
            `Esta ação não pode ser desfeita!`
        )) {
            try {
                setError('');
                setLoading(true);
                await parcelaService.estornarTodasParcelas(pagamento.id);
                await carregarParcelas();
                onParcelaAtualizada();
                alert('✅ Todas as parcelas foram estornadas com sucesso!');
            } catch (err: unknown) {
                if (axios.isAxiosError(err) && err.response) {
                    console.error('Erro ao estornar parcelas:', err.response.data);
                    setError(err.response.data?.message || 'Erro ao estornar parcelas.');
                } else {
                    console.error('Erro ao estornar parcelas:', err);
                    setError('Erro inesperado ao estornar parcelas.');
                }
            } finally {
                setLoading(false);
            }
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PAGO':
                return (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Pago
                    </span>
                );
            case 'ATRASADO':
                return (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Atrasado
                    </span>
                );
            case 'PENDENTE':
                return (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Clock className="w-3 h-3 mr-1" />
                        Pendente
                    </span>
                );
            case 'ESTORNADO':
                return (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <Undo2 className="w-3 h-3 mr-1" />
                        Estornado
                    </span>
                );
            default:
                return null;
        }
    };

    const calcularTotalPago = () => {
        return parcelas
            .filter((p) => p.status === 'PAGO')
            .reduce((acc, p) => acc + Number(p.valorParcela), 0);
    };

    const calcularTotalPendente = () => {
        return parcelas
            .filter((p) => p.status === 'PENDENTE' || p.status === 'ATRASADO' || p.status === 'ESTORNADO')
            .reduce((acc, p) => acc + Number(p.valorParcela), 0);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Parcelas do Pagamento</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Paciente: <strong>{pagamento.paciente.nome}</strong>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {error && (
                    <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-red-600">{error}</span>
                    </div>
                )}

                {/* Cards de Resumo */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Valor Total</p>
                                <p className="text-xl font-bold text-gray-900">
                                    {formatCurrency(Number(pagamento.valorTotal))}
                                </p>
                            </div>
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Pago</p>
                                <p className="text-xl font-bold text-green-600">
                                    {formatCurrency(calcularTotalPago())}
                                </p>
                            </div>
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Pendente</p>
                                <p className="text-xl font-bold text-yellow-600">
                                    {formatCurrency(calcularTotalPendente())}
                                </p>
                            </div>
                            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <Clock className="w-5 h-5 text-yellow-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lista de Parcelas */}
                <div className="p-6">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="text-lg text-gray-600">Carregando parcelas...</div>
                        </div>
                    ) : parcelas.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">Nenhuma parcela encontrada.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Parcela
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Vencimento
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Valor
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Data Pagamento
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ações
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {parcelas.map((parcela) => (
                                        <tr key={parcela.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {parcela.numeroParcela} / {pagamento.numeroParcelas}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {formatDate(parcela.dataVencimento)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-green-600">
                                                    {formatCurrency(Number(parcela.valorParcela))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(parcela.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">
                                                    {parcela.dataPagamento
                                                        ? formatDate(parcela.dataPagamento)
                                                        : '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-3">
                                                    {parcela.status !== 'PAGO' && parcela.status !== 'ESTORNADO' && (
                                                        <button
                                                            onClick={() => marcarComoPaga(parcela.id)}
                                                            className="text-green-600 hover:text-green-800 font-medium text-sm"
                                                        >
                                                            Marcar como Pago
                                                        </button>
                                                    )}
                                                    {parcela.status === 'PAGO' && (
                                                        <button
                                                            onClick={() => marcarComoEstornada(parcela.id)}
                                                            className="inline-flex items-center text-gray-600 hover:text-gray-800 font-medium text-sm"
                                                        >
                                                            <Undo2 className="w-4 h-4 mr-1" />
                                                            Estornar
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center p-6 border-t border-gray-200">
                    {/* Botão Estornar Todas (discreto, à esquerda) */}
                    {parcelas.some(p => p.status === 'PAGO') && (
                        <button
                            onClick={estornarTodasParcelas}
                            disabled={loading}
                            className="text-xs px-3 py-1.5 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 hover:text-red-600 hover:border-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                            title="Estornar todas as parcelas pagas deste pagamento"
                        >
                            <Undo2 className="w-3 h-3" />
                            <span>Estornar todas</span>
                        </button>
                    )}
                    {!parcelas.some(p => p.status === 'PAGO') && <div></div>}
                    
                    <button onClick={onClose} className="btn-secondary">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ParcelasModal;

