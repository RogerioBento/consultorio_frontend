import React, { useState, useEffect } from 'react';
import { Clock, User, Calendar, Plus, PlayCircle, CheckCircle, XCircle, Eye, AlertTriangle } from 'lucide-react';
import { atendimentoService } from '../services/atendimentoService';
import { useAuth } from '../hooks/useAuth';
import type { Atendimento, StatusAtendimento, TipoAtendimento } from '../types';
import { formatDate, formatTime } from '../utils/formatters';
import AtendimentoModal from '../components/atendimentos/AtendimentoModal';
import FinalizarAtendimentoModal from '../components/atendimentos/FinalizarAtendimentoModal';
import AtendimentoDetalhesModal from '../components/atendimentos/AtendimentoDetalhesModal';

const Atendimentos: React.FC = () => {
    const { user } = useAuth();
    const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showFinalizarModal, setShowFinalizarModal] = useState(false);
    const [showDetalhesModal, setShowDetalhesModal] = useState(false);
    const [atendimentoSelecionado, setAtendimentoSelecionado] = useState<Atendimento | null>(null);
    const [filtroStatus, setFiltroStatus] = useState<StatusAtendimento | 'TODOS'>('TODOS');
    const [mostrarTodos, setMostrarTodos] = useState(false); // Novo estado para alternar entre Hoje/Todos

    useEffect(() => {
        carregarAtendimentos();
        // Atualizar a cada 60 segundos para evitar flickering
        const interval = setInterval(carregarAtendimentos, 60000);
        return () => clearInterval(interval);
    }, [user, mostrarTodos]); // Adicionar mostrarTodos como dependência

    const carregarAtendimentos = async () => {
        try {
            setLoading(true);
            let data: Atendimento[];
            
            if (mostrarTodos) {
                // Buscar TODOS os atendimentos (incluindo agendamentos futuros)
                if (user?.cargo === 'DENTISTA' && user.id) {
                    data = await atendimentoService.getByDentista(user.id);
                } else {
                    data = await atendimentoService.getAll();
                }
            } else {
                // Buscar apenas atendimentos de HOJE
                if (user?.cargo === 'DENTISTA' && user.id) {
                    data = await atendimentoService.getHojePorDentista(user.id);
                } else {
                    data = await atendimentoService.getHoje();
                }
            }
            
            setAtendimentos(data);
        } catch (error) {
            console.error('Erro ao carregar atendimentos:', error);
        } finally {
            setLoading(false);
        }
    };

    const iniciarAtendimento = async (id: number) => {
        try {
            await atendimentoService.iniciar(id);
            await carregarAtendimentos();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Erro ao iniciar atendimento');
        }
    };

    const abrirFinalizarModal = (atendimento: Atendimento) => {
        setAtendimentoSelecionado(atendimento);
        setShowFinalizarModal(true);
    };

    const abrirDetalhesModal = (atendimento: Atendimento) => {
        setAtendimentoSelecionado(atendimento);
        setShowDetalhesModal(true);
    };

    const cancelarAtendimento = async (id: number) => {
        if (window.confirm('Tem certeza que deseja cancelar este atendimento?')) {
            try {
                await atendimentoService.cancelar(id);
                await carregarAtendimentos();
            } catch (error: any) {
                alert(error.response?.data?.message || 'Erro ao cancelar atendimento');
            }
        }
    };

    const getStatusBadge = (status: StatusAtendimento) => {
        const badges = {
            AGUARDANDO: { color: 'yellow', icon: Clock, label: 'Aguardando' },
            EM_ATENDIMENTO: { color: 'blue', icon: PlayCircle, label: 'Em Atendimento' },
            FINALIZADO: { color: 'green', icon: CheckCircle, label: 'Finalizado' },
            CANCELADO: { color: 'gray', icon: XCircle, label: 'Cancelado' }
        };
        
        const badge = badges[status];
        const Icon = badge.icon;
        
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${badge.color}-100 text-${badge.color}-800`}>
                <Icon className="w-4 h-4 mr-1" />
                {badge.label}
            </span>
        );
    };

    const calcularDuracao = (dataInicio: string, dataFim?: string) => {
        const inicio = new Date(dataInicio);
        const fim = dataFim ? new Date(dataFim) : new Date();
        const diffMs = fim.getTime() - inicio.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 60) {
            return `${diffMins}min`;
        }
        const horas = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        return `${horas}h ${mins}min`;
    };

    const atendimentosFiltrados = filtroStatus === 'TODOS' 
        ? atendimentos 
        : atendimentos.filter(a => a.status === filtroStatus);

    const stats = {
        total: atendimentos.length,
        aguardando: atendimentos.filter(a => a.status === 'AGUARDANDO').length,
        emAtendimento: atendimentos.filter(a => a.status === 'EM_ATENDIMENTO').length,
        finalizados: atendimentos.filter(a => a.status === 'FINALIZADO').length,
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
                    <h1 className="text-3xl font-bold text-gray-900">Atendimentos</h1>
                    <p className="text-gray-600 mt-1">
                        {mostrarTodos ? 'Todos os atendimentos' : 'Atendimentos de hoje'}
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setMostrarTodos(!mostrarTodos)}
                        className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                            mostrarTodos 
                                ? 'bg-gray-600 text-white hover:bg-gray-700' 
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                    >
                        <Calendar className="w-5 h-5" />
                        <span>{mostrarTodos ? 'Ver Hoje' : 'Ver Todos'}</span>
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="btn-primary flex items-center space-x-2"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Novo Atendimento</span>
                    </button>
                </div>
            </div>

            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <Calendar className="w-8 h-8 text-gray-400" />
                    </div>
                </div>
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-yellow-600">Aguardando</p>
                            <p className="text-2xl font-bold text-yellow-900">{stats.aguardando}</p>
                        </div>
                        <Clock className="w-8 h-8 text-yellow-500" />
                    </div>
                </div>
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-600">Em Atendimento</p>
                            <p className="text-2xl font-bold text-blue-900">{stats.emAtendimento}</p>
                        </div>
                        <PlayCircle className="w-8 h-8 text-blue-500" />
                    </div>
                </div>
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-600">Finalizados</p>
                            <p className="text-2xl font-bold text-green-900">{stats.finalizados}</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="card">
                <div className="flex gap-2">
                    <button
                        onClick={() => setFiltroStatus('TODOS')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            filtroStatus === 'TODOS' 
                                ? 'bg-primary-600 text-white' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setFiltroStatus('AGUARDANDO')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            filtroStatus === 'AGUARDANDO' 
                                ? 'bg-yellow-600 text-white' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Aguardando
                    </button>
                    <button
                        onClick={() => setFiltroStatus('EM_ATENDIMENTO')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            filtroStatus === 'EM_ATENDIMENTO' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Em Atendimento
                    </button>
                    <button
                        onClick={() => setFiltroStatus('FINALIZADO')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            filtroStatus === 'FINALIZADO' 
                                ? 'bg-green-600 text-white' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Finalizados
                    </button>
                    <button
                        onClick={() => setFiltroStatus('CANCELADO')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            filtroStatus === 'CANCELADO' 
                                ? 'bg-red-600 text-white' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Cancelados
                    </button>
                </div>
            </div>

            {/* Lista de Atendimentos */}
            <div className="space-y-4">
                {atendimentosFiltrados.length === 0 ? (
                    <div className="card text-center py-12">
                        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">Nenhum atendimento encontrado</p>
                    </div>
                ) : (
                    atendimentosFiltrados.map((atendimento) => {
                        const duracao = calcularDuracao(atendimento.dataHoraInicio, atendimento.dataHoraFim);
                        const duracaoMinutos = parseInt(duracao);
                        const alerta = atendimento.status === 'EM_ATENDIMENTO' && duracaoMinutos > 45;
                        
                        // Labels de tempo baseadas no status
                        let tempoLabel = '';
                        if (atendimento.status === 'AGUARDANDO') {
                            tempoLabel = 'Na sala de espera:';
                        } else if (atendimento.status === 'EM_ATENDIMENTO') {
                            tempoLabel = 'Tempo em atendimento:';
                        } else {
                            tempoLabel = 'Duração total:';
                        }
                        
                        return (
                            <div key={atendimento.id} className={`card hover:shadow-lg transition ${alerta ? 'border-l-4 border-orange-500' : ''}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-2">
                                            {atendimento.status !== 'CANCELADO' && getStatusBadge(atendimento.status)}
                                            <span className="text-sm text-gray-600">
                                                {formatTime(atendimento.dataHoraInicio)}
                                            </span>
                                            <span className="text-sm font-semibold text-gray-700">
                                                {tempoLabel} {duracao}
                                            </span>
                                            {alerta && (
                                                <span className="flex items-center text-sm text-orange-600">
                                                    <AlertTriangle className="w-4 h-4 mr-1" />
                                                    Tempo acima do normal
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-lg font-bold text-gray-900">
                                                {atendimento.paciente.nome}
                                            </h3>
                                            {atendimento.status === 'CANCELADO' && (
                                                <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-semibold rounded-full">
                                                    CANCELADO
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <span className="flex items-center">
                                                <User className="w-4 h-4 mr-1" />
                                                {atendimento.dentista.nome}
                                            </span>
                                            <span>{atendimento.tipoAtendimento}</span>
                                            {atendimento.motivoConsulta && (
                                                <span>• {atendimento.motivoConsulta}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {atendimento.status === 'AGUARDANDO' && (
                                            <button
                                                onClick={() => iniciarAtendimento(atendimento.id)}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                                            >
                                                <PlayCircle className="w-4 h-4" />
                                                Iniciar
                                            </button>
                                        )}
                                        {atendimento.status === 'EM_ATENDIMENTO' && (
                                            <button
                                                onClick={() => abrirFinalizarModal(atendimento)}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                Finalizar
                                            </button>
                                        )}
                                        {atendimento.status === 'FINALIZADO' && (
                                            <button
                                                onClick={() => abrirFinalizarModal(atendimento)}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                Editar
                                            </button>
                                        )}
                                        <button
                                            onClick={() => abrirDetalhesModal(atendimento)}
                                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        {atendimento.status !== 'FINALIZADO' && (
                                            <button
                                                onClick={() => cancelarAtendimento(atendimento.id)}
                                                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                                            >
                                                <XCircle className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Modais */}
            {showModal && (
                <AtendimentoModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false);
                        carregarAtendimentos();
                    }}
                />
            )}

            {showFinalizarModal && atendimentoSelecionado && (
                <FinalizarAtendimentoModal
                    isOpen={showFinalizarModal}
                    atendimento={atendimentoSelecionado}
                    onClose={() => {
                        setShowFinalizarModal(false);
                        setAtendimentoSelecionado(null);
                    }}
                    onSuccess={() => {
                        setShowFinalizarModal(false);
                        setAtendimentoSelecionado(null);
                        carregarAtendimentos();
                    }}
                />
            )}

            {showDetalhesModal && atendimentoSelecionado && (
                <AtendimentoDetalhesModal
                    isOpen={showDetalhesModal}
                    atendimento={atendimentoSelecionado}
                    onClose={() => {
                        setShowDetalhesModal(false);
                        setAtendimentoSelecionado(null);
                    }}
                />
            )}
        </div>
    );
};

export default Atendimentos;
