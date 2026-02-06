import React, { useState } from 'react';
import { 
    FileText, 
    Download, 
    Calendar, 
    TrendingDown,
    DollarSign,
    AlertTriangle,
    FileSpreadsheet,
    Clock
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { relatorioService, downloadBlob } from '../services/relatorioService';
import { estatisticasService } from '../services/estatisticasService';
import type { EstatisticasPagamento } from '../types/estatisticas';
import { formatCurrency } from '../utils/formatters';

const Relatorios: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    const [anoFluxo, setAnoFluxo] = useState(new Date().getFullYear());
    
    // Estados para comparação
    const [mesAtual, setMesAtual] = useState<EstatisticasPagamento | null>(null);
    const [mesAnterior, setMesAnterior] = useState<EstatisticasPagamento | null>(null);
    const [loadingComparacao, setLoadingComparacao] = useState(false);

    const exportarPagamentos = async () => {
        if (!user || !dataInicio || !dataFim) {
            alert('Selecione o período (início e fim)');
            return;
        }

        try {
            setLoading(true);
            const blob = await relatorioService.exportarPagamentosCSV(user.id, dataInicio, dataFim);
            downloadBlob(blob, `pagamentos_${dataInicio}_${dataFim}.csv`);
            alert('✅ Relatório exportado com sucesso!');
        } catch (error) {
            console.error('Erro ao exportar:', error);
            alert('❌ Erro ao exportar relatório');
        } finally {
            setLoading(false);
        }
    };

    const exportarParcelasPendentes = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const blob = await relatorioService.exportarParcelasPendentesCSV(user.id);
            downloadBlob(blob, 'parcelas_pendentes.csv');
            alert('✅ Relatório exportado com sucesso!');
        } catch (error) {
            console.error('Erro ao exportar:', error);
            alert('❌ Erro ao exportar relatório');
        } finally {
            setLoading(false);
        }
    };

    const exportarInadimplencia = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const blob = await relatorioService.exportarInadimplenciaCSV(user.id);
            downloadBlob(blob, 'inadimplencia.csv');
            alert('✅ Relatório exportado com sucesso!');
        } catch (error) {
            console.error('Erro ao exportar:', error);
            alert('❌ Erro ao exportar relatório');
        } finally {
            setLoading(false);
        }
    };

    const exportarFluxoCaixa = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const blob = await relatorioService.exportarFluxoCaixaCSV(user.id, anoFluxo);
            downloadBlob(blob, `fluxo_caixa_${anoFluxo}.csv`);
            alert('✅ Relatório exportado com sucesso!');
        } catch (error) {
            console.error('Erro ao exportar:', error);
            alert('❌ Erro ao exportar relatório');
        } finally {
            setLoading(false);
        }
    };

    const compararMeses = async () => {
        if (!user) return;

        try {
            setLoadingComparacao(true);
            
            // Buscar mês atual
            const atual = await estatisticasService.getMes(user.id);
            setMesAtual(atual);
            
            // Calcular mês anterior
            const hoje = new Date();
            const mesPassado = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
            const inicioMesAnterior = new Date(mesPassado.getFullYear(), mesPassado.getMonth(), 1);
            const fimMesAnterior = new Date(mesPassado.getFullYear(), mesPassado.getMonth() + 1, 0, 23, 59, 59);
            
            const anterior = await estatisticasService.getPorPeriodo(
                user.id,
                inicioMesAnterior.toISOString(),
                fimMesAnterior.toISOString()
            );
            setMesAnterior(anterior);
            
        } catch (error) {
            console.error('Erro ao comparar:', error);
            alert('❌ Erro ao carregar comparação');
        } finally {
            setLoadingComparacao(false);
        }
    };

    const calcularVariacao = (atual: number, anterior: number): { valor: number; positivo: boolean } => {
        if (anterior === 0) return { valor: 100, positivo: atual > 0 };
        const variacao = ((atual - anterior) / anterior) * 100;
        return { valor: Math.abs(variacao), positivo: variacao >= 0 };
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Relatórios e Estatísticas</h1>
                        <p className="text-gray-600">Exporte dados e compare períodos</p>
                    </div>
                    <FileText className="w-12 h-12 text-primary-600" />
                </div>
            </div>

            {/* Comparação de Períodos */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                        <TrendingDown className="w-6 h-6 text-primary-600" />
                        <span>Comparação: Mês Atual vs Mês Anterior</span>
                    </h2>
                    <button
                        onClick={compararMeses}
                        disabled={loadingComparacao}
                        className="btn-primary flex items-center space-x-2"
                    >
                        {loadingComparacao ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                            <Calendar className="w-4 h-4" />
                        )}
                        <span>{loadingComparacao ? 'Carregando...' : 'Atualizar Comparação'}</span>
                    </button>
                </div>

                {mesAtual && mesAnterior ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Total Recebido */}
                        <div className="border rounded-lg p-4">
                            <h3 className="text-sm text-gray-600 mb-2">Total Recebido</h3>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-xs text-gray-500">Mês Atual</p>
                                    <p className="text-xl font-bold text-green-600">
                                        {formatCurrency(mesAtual.totalRecebido)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Mês Anterior</p>
                                    <p className="text-lg text-gray-700">
                                        {formatCurrency(mesAnterior.totalRecebido)}
                                    </p>
                                </div>
                                <div className="pt-2 border-t">
                                    {(() => {
                                        const { valor, positivo } = calcularVariacao(
                                            mesAtual.totalRecebido,
                                            mesAnterior.totalRecebido
                                        );
                                        return (
                                            <p className={`text-sm font-semibold ${positivo ? 'text-green-600' : 'text-red-600'}`}>
                                                {positivo ? '▲' : '▼'} {valor.toFixed(1)}%
                                            </p>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>

                        {/* Total Pendente */}
                        <div className="border rounded-lg p-4">
                            <h3 className="text-sm text-gray-600 mb-2">Total Pendente</h3>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-xs text-gray-500">Mês Atual</p>
                                    <p className="text-xl font-bold text-yellow-600">
                                        {formatCurrency(mesAtual.totalPendente)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Mês Anterior</p>
                                    <p className="text-lg text-gray-700">
                                        {formatCurrency(mesAnterior.totalPendente)}
                                    </p>
                                </div>
                                <div className="pt-2 border-t">
                                    {(() => {
                                        const { valor, positivo } = calcularVariacao(
                                            mesAtual.totalPendente,
                                            mesAnterior.totalPendente
                                        );
                                        return (
                                            <p className={`text-sm font-semibold ${!positivo ? 'text-green-600' : 'text-red-600'}`}>
                                                {positivo ? '▲' : '▼'} {valor.toFixed(1)}%
                                            </p>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>

                        {/* Ticket Médio */}
                        <div className="border rounded-lg p-4">
                            <h3 className="text-sm text-gray-600 mb-2">Ticket Médio</h3>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-xs text-gray-500">Mês Atual</p>
                                    <p className="text-xl font-bold text-purple-600">
                                        {formatCurrency(mesAtual.ticketMedio)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Mês Anterior</p>
                                    <p className="text-lg text-gray-700">
                                        {formatCurrency(mesAnterior.ticketMedio)}
                                    </p>
                                </div>
                                <div className="pt-2 border-t">
                                    {(() => {
                                        const { valor, positivo } = calcularVariacao(
                                            mesAtual.ticketMedio,
                                            mesAnterior.ticketMedio
                                        );
                                        return (
                                            <p className={`text-sm font-semibold ${positivo ? 'text-green-600' : 'text-red-600'}`}>
                                                {positivo ? '▲' : '▼'} {valor.toFixed(1)}%
                                            </p>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p>Clique em "Atualizar Comparação" para ver os dados</p>
                    </div>
                )}
            </div>

            {/* Exportação de Relatórios */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                    <Download className="w-6 h-6 text-primary-600" />
                    <span>Exportar Relatórios (CSV)</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Relatório de Pagamentos */}
                    <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <DollarSign className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 mb-2">Pagamentos por Período</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Lista completa de pagamentos com detalhes de método, parcelamento e status.
                                </p>
                                
                                <div className="space-y-2 mb-4">
                                    <input
                                        type="datetime-local"
                                        value={dataInicio}
                                        onChange={(e) => setDataInicio(e.target.value)}
                                        className="input-field text-sm w-full"
                                        placeholder="Data início"
                                    />
                                    <input
                                        type="datetime-local"
                                        value={dataFim}
                                        onChange={(e) => setDataFim(e.target.value)}
                                        className="input-field text-sm w-full"
                                        placeholder="Data fim"
                                    />
                                </div>

                                <button
                                    onClick={exportarPagamentos}
                                    disabled={loading || !dataInicio || !dataFim}
                                    className="btn-primary w-full text-sm flex items-center justify-center space-x-2"
                                >
                                    <FileSpreadsheet className="w-4 h-4" />
                                    <span>Exportar CSV</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Relatório de Parcelas Pendentes */}
                    <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Clock className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 mb-2">Parcelas Pendentes</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Todas as parcelas não pagas com datas de vencimento e dias de atraso.
                                </p>

                                <button
                                    onClick={exportarParcelasPendentes}
                                    disabled={loading}
                                    className="btn-primary w-full text-sm flex items-center justify-center space-x-2 mt-auto"
                                >
                                    <FileSpreadsheet className="w-4 h-4" />
                                    <span>Exportar CSV</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Relatório de Inadimplência */}
                    <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 mb-2">Relatório de Inadimplência</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Pacientes com parcelas atrasadas, total devido e informações de contato.
                                </p>

                                <button
                                    onClick={exportarInadimplencia}
                                    disabled={loading}
                                    className="btn-primary w-full text-sm flex items-center justify-center space-x-2"
                                >
                                    <FileSpreadsheet className="w-4 h-4" />
                                    <span>Exportar CSV</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Fluxo de Caixa */}
                    <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <TrendingDown className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 mb-2">Fluxo de Caixa Mensal</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Resumo mês a mês com totais recebidos, pendentes e quantidade de pagamentos.
                                </p>

                                <div className="mb-4">
                                    <input
                                        type="number"
                                        value={anoFluxo}
                                        onChange={(e) => setAnoFluxo(parseInt(e.target.value))}
                                        min="2020"
                                        max="2030"
                                        className="input-field text-sm w-full"
                                        placeholder="Ano"
                                    />
                                </div>

                                <button
                                    onClick={exportarFluxoCaixa}
                                    disabled={loading}
                                    className="btn-primary w-full text-sm flex items-center justify-center space-x-2"
                                >
                                    <FileSpreadsheet className="w-4 h-4" />
                                    <span>Exportar CSV</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Informações */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                    <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <h4 className="font-semibold text-blue-900 mb-1">Sobre os Relatórios</h4>
                        <p className="text-sm text-blue-800">
                            Os relatórios são exportados no formato CSV (compatível com Excel e Google Sheets).
                            Os dados são filtrados automaticamente para exibir apenas seus pagamentos.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Relatorios;

