import React, { useState, useEffect } from 'react';
import { 
    DollarSign, 
    TrendingUp, 
    Users, 
    CreditCard, 
    Calendar,
    AlertCircle,
    CheckCircle,
    Clock,
    BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { estatisticasService } from '../services/estatisticasService';
import type { EstatisticasPagamento, PeriodoEstatisticas } from '../types/estatisticas';
import { formatCurrency } from '../utils/formatters';

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [estatisticas, setEstatisticas] = useState<EstatisticasPagamento | null>(null);
    const [periodo, setPeriodo] = useState<PeriodoEstatisticas>('mes');
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');

    // Redirecionar recepcionistas para atendimentos
    useEffect(() => {
        if (user && user.cargo === 'RECEPCIONISTA') {
            navigate('/atendimentos', { replace: true });
        }
    }, [user, navigate]);

    useEffect(() => {
        if (user && user.cargo !== 'RECEPCIONISTA') {
            carregarEstatisticas();
        }
    }, [user, periodo]);

    const carregarEstatisticas = async () => {
        if (!user) return;

        try {
            setLoading(true);
            let data: EstatisticasPagamento;

            switch (periodo) {
                case 'hoje':
                    data = await estatisticasService.getHoje(user.id);
                    break;
                case 'mes':
                    data = await estatisticasService.getMes(user.id);
                    break;
                case 'ano':
                    data = await estatisticasService.getAno(user.id);
                    break;
                case 'personalizado':
                    if (dataInicio && dataFim) {
                        data = await estatisticasService.getPorPeriodo(user.id, dataInicio, dataFim);
                    } else {
                        return;
                    }
                    break;
                default:
                    data = await estatisticasService.getMes(user.id);
            }

            setEstatisticas(data);
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePeriodoPersonalizado = () => {
        if (dataInicio && dataFim) {
            carregarEstatisticas();
        }
    };

    if (loading || !estatisticas) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Dashboard Financeiro</h1>
                        <p className="text-gray-600">Bem-vindo, Dr(a). {user?.nome}</p>
                    </div>
                    <BarChart3 className="w-12 h-12 text-primary-600" />
                </div>
            </div>

            {/* Filtros de Período */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Período:</span>
                    </div>
                    
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setPeriodo('hoje')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                periodo === 'hoje'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Hoje
                        </button>
                        <button
                            onClick={() => setPeriodo('mes')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                periodo === 'mes'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Mês
                        </button>
                        <button
                            onClick={() => setPeriodo('ano')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                periodo === 'ano'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Ano
                        </button>
                        <button
                            onClick={() => setPeriodo('personalizado')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                periodo === 'personalizado'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Personalizado
                        </button>
                    </div>

                    {periodo === 'personalizado' && (
                        <div className="flex items-center space-x-2 ml-4">
                            <input
                                type="datetime-local"
                                value={dataInicio}
                                onChange={(e) => setDataInicio(e.target.value)}
                                className="input-field text-sm"
                            />
                            <span className="text-gray-500">até</span>
                            <input
                                type="datetime-local"
                                value={dataFim}
                                onChange={(e) => setDataFim(e.target.value)}
                                className="input-field text-sm"
                            />
                            <button
                                onClick={handlePeriodoPersonalizado}
                                className="btn-primary text-sm"
                            >
                                Aplicar
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Cards de Métricas Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Geral */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-blue-600" />
                        </div>
                        <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <h3 className="text-sm text-gray-600 mb-1">Total Geral</h3>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(estatisticas.totalGeral)}</p>
                    <p className="text-xs text-gray-500 mt-1">{estatisticas.totalPagamentos} pagamentos</p>
                </div>

                {/* Total Recebido */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                    <h3 className="text-sm text-gray-600 mb-1">Recebido</h3>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(estatisticas.totalRecebido)}</p>
                    <p className="text-xs text-gray-500 mt-1">{estatisticas.parcelasPagas} parcelas pagas</p>
                </div>

                {/* Total Pendente */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <Clock className="w-6 h-6 text-yellow-600" />
                        </div>
                        {estatisticas.parcelasAtrasadas > 0 && (
                            <AlertCircle className="w-5 h-5 text-red-500" />
                        )}
                    </div>
                    <h3 className="text-sm text-gray-600 mb-1">Pendente</h3>
                    <p className="text-2xl font-bold text-yellow-600">{formatCurrency(estatisticas.totalPendente)}</p>
                    <p className="text-xs text-gray-500 mt-1">
                        {estatisticas.parcelasPendentes} pendentes • {estatisticas.parcelasAtrasadas} atrasadas
                    </p>
                </div>

                {/* Ticket Médio */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <BarChart3 className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                    <h3 className="text-sm text-gray-600 mb-1">Ticket Médio</h3>
                    <p className="text-2xl font-bold text-purple-600">{formatCurrency(estatisticas.ticketMedio)}</p>
                    <p className="text-xs text-gray-500 mt-1">{estatisticas.totalPacientes} pacientes únicos</p>
                </div>
            </div>

            {/* Evolução Mensal + Métodos de Pagamento */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Evolução Mensal */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolução Mensal</h3>
                    {Object.keys(estatisticas.evolucaoMensal).length > 0 ? (
                        <div className="space-y-3">
                            {Object.entries(estatisticas.evolucaoMensal)
                                .sort((a, b) => a[0].localeCompare(b[0]))
                                .map(([mes, valor]) => {
                                    const maxValor = Math.max(...Object.values(estatisticas.evolucaoMensal));
                                    const porcentagem = maxValor > 0 ? (valor / maxValor) * 100 : 0;
                                    
                                    return (
                                        <div key={mes}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-600">{mes}</span>
                                                <span className="font-semibold text-gray-900">{formatCurrency(valor)}</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                                                    style={{ width: `${porcentagem}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">Nenhum dado disponível</p>
                    )}
                </div>

                {/* Métodos de Pagamento */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Por Método de Pagamento</h3>
                    {Object.keys(estatisticas.totalPorMetodo).length > 0 ? (
                        <div className="space-y-4">
                            {Object.entries(estatisticas.totalPorMetodo).map(([metodo, valor]) => {
                                const porcentagem = estatisticas.totalGeral > 0 
                                    ? (valor / estatisticas.totalGeral) * 100 
                                    : 0;

                                const cores: Record<string, string> = {
                                    DINHEIRO: 'bg-green-500',
                                    CARTAO_CREDITO: 'bg-blue-500',
                                    CARTAO_DEBITO: 'bg-purple-500',
                                    PIX: 'bg-teal-500',
                                    BOLETO: 'bg-orange-500',
                                    CHEQUE: 'bg-yellow-500',
                                };

                                return (
                                    <div key={metodo} className="flex items-center space-x-4">
                                        <div className="flex-1">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-700 font-medium">{metodo.replace('_', ' ')}</span>
                                                <span className="text-gray-900 font-semibold">{porcentagem.toFixed(1)}%</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full transition-all duration-500 ${cores[metodo] || 'bg-gray-500'}`}
                                                        style={{ width: `${porcentagem}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-semibold text-gray-700">{formatCurrency(valor)}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">Nenhum dado disponível</p>
                    )}
                </div>
            </div>

            {/* Top Pacientes */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <Users className="w-5 h-5 text-primary-600" />
                    <span>Top 5 Pacientes</span>
                </h3>
                {Object.keys(estatisticas.topPacientes).length > 0 ? (
                    <div className="space-y-3">
                        {Object.entries(estatisticas.topPacientes).map(([paciente, valor], index) => (
                            <div key={paciente} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                                }`}>
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">{paciente}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-primary-600">{formatCurrency(valor)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-8">Nenhum dado disponível</p>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
