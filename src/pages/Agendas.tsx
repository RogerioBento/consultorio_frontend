import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Calendar as CalendarIcon, Clock, User, Edit2, Eye } from 'lucide-react';
import { atendimentoService } from '../services/atendimentoService';
import { usuarioService } from '../services/usuarioService';
import { useAuth } from '../hooks/useAuth';
import type { Atendimento, Usuario } from '../types';
import { formatTime } from '../utils/formatters';
import AtendimentoDetalhesModal from '../components/atendimentos/AtendimentoDetalhesModal';
import PacienteDetalhesModal from '../components/pacientes/PacienteDetalhesModal';

const locales = {
    'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

interface CalendarEvent {
    id: number;
    title: string;
    start: Date;
    end: Date;
    resource: Atendimento;
}

const Agendas: React.FC = () => {
    const { user } = useAuth();
    const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
    const [dentistas, setDentistas] = useState<Usuario[]>([]);
    const [dentistaSelecionado, setDentistaSelecionado] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<typeof Views[keyof typeof Views]>(Views.MONTH);
    const [date, setDate] = useState(new Date());
    const [atendimentoSelecionado, setAtendimentoSelecionado] = useState<Atendimento | null>(null);
    const [showDetalhesModal, setShowDetalhesModal] = useState(false);
    const [showPacienteModal, setShowPacienteModal] = useState(false);
    const [showReagendarModal, setShowReagendarModal] = useState(false);
    const [novaDataHora, setNovaDataHora] = useState('');

    useEffect(() => {
        carregarDentistas();
    }, []);

    useEffect(() => {
        if (dentistaSelecionado) {
            carregarAgenda();
        }
    }, [dentistaSelecionado, date, view]);

    const carregarDentistas = async () => {
        try {
            const data = await usuarioService.getAllDentistas();
            setDentistas(data);
            
            // Se for dentista, seleciona automaticamente
            if (user?.cargo === 'DENTISTA' && user.id) {
                setDentistaSelecionado(user.id);
            } else if (data.length > 0) {
                setDentistaSelecionado(data[0].id);
            }
        } catch (error) {
            console.error('Erro ao carregar dentistas:', error);
        }
    };

    const carregarAgenda = async () => {
        if (!dentistaSelecionado) return;

        try {
            setLoading(true);
            const inicio = getStartDate();
            const fim = getEndDate();

            const data = await atendimentoService.getAgendaDentista(
                dentistaSelecionado,
                inicio.toISOString().split('T')[0],
                fim.toISOString().split('T')[0]
            );

            setAtendimentos(data);
        } catch (error) {
            console.error('Erro ao carregar agenda:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStartDate = () => {
        const start = new Date(date);
        if (view === Views.MONTH) {
            start.setDate(1);
        } else if (view === Views.WEEK) {
            start.setDate(start.getDate() - start.getDay());
        }
        return start;
    };

    const getEndDate = () => {
        const end = new Date(date);
        if (view === Views.MONTH) {
            end.setMonth(end.getMonth() + 1);
            end.setDate(0);
        } else if (view === Views.WEEK) {
            end.setDate(end.getDate() - end.getDay() + 6);
        } else {
            end.setDate(end.getDate() + 1);
        }
        return end;
    };

    const events: CalendarEvent[] = useMemo(() => {
        return atendimentos.map((atendimento) => {
            const dataHora = atendimento.isAgendado && atendimento.dataHoraAgendamento
                ? new Date(atendimento.dataHoraAgendamento)
                : new Date(atendimento.dataHoraInicio);

            const end = new Date(dataHora);
            end.setMinutes(end.getMinutes() + (atendimento.duracaoMinutos || 30));

            return {
                id: atendimento.id,
                title: `${formatTime(dataHora.toISOString())} - ${atendimento.paciente.nome}`,
                start: dataHora,
                end: end,
                resource: atendimento,
            };
        });
    }, [atendimentos]);

    const eventStyleGetter = (event: CalendarEvent) => {
        const atendimento = event.resource;
        let backgroundColor = '#3b82f6'; // azul padrão

        if (atendimento.status === 'FINALIZADO') {
            backgroundColor = '#10b981'; // verde
        } else if (atendimento.status === 'CANCELADO') {
            backgroundColor = '#ef4444'; // vermelho
        } else if (atendimento.status === 'EM_ATENDIMENTO') {
            backgroundColor = '#f59e0b'; // laranja
        }

        return {
            style: {
                backgroundColor,
                borderRadius: '5px',
                opacity: 0.8,
                color: 'white',
                border: '0px',
                display: 'block',
            },
        };
    };

    const handleSelectEvent = (event: CalendarEvent) => {
        setAtendimentoSelecionado(event.resource);
        setShowDetalhesModal(true);
    };

    const handleReagendar = async () => {
        if (!atendimentoSelecionado || !novaDataHora) return;

        try {
            await atendimentoService.reagendar(atendimentoSelecionado.id, novaDataHora);
            setShowReagendarModal(false);
            setNovaDataHora('');
            carregarAgenda();
            alert('Atendimento reagendado com sucesso!');
        } catch (error) {
            console.error('Erro ao reagendar:', error);
            alert('Erro ao reagendar atendimento');
        }
    };

    const abrirPaciente = () => {
        if (atendimentoSelecionado) {
            setShowDetalhesModal(false);
            setShowPacienteModal(true);
        }
    };

    const messages = {
        allDay: 'Dia inteiro',
        previous: 'Anterior',
        next: 'Próximo',
        today: 'Hoje',
        month: 'Mês',
        week: 'Semana',
        day: 'Dia',
        agenda: 'Agenda',
        date: 'Data',
        time: 'Hora',
        event: 'Evento',
        noEventsInRange: 'Não há eventos neste período',
        showMore: (total: number) => `+ Ver mais (${total})`,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Agenda</h1>
                    <p className="text-gray-600 mt-1">Visualize e gerencie os agendamentos</p>
                </div>
            </div>

            {/* Filtros */}
            <div className="card">
                <div className="flex items-center space-x-4">
                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Dentista
                        </label>
                        <select
                            value={dentistaSelecionado || ''}
                            onChange={(e) => setDentistaSelecionado(Number(e.target.value))}
                            className="input-field"
                            disabled={user?.cargo === 'DENTISTA'}
                        >
                            {dentistas.map((dentista) => (
                                <option key={dentista.id} value={dentista.id}>
                                    {dentista.nome}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Calendário */}
            <div className="card" style={{ height: '700px' }}>
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-xl text-gray-600">Carregando agenda...</div>
                    </div>
                ) : (
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: '100%' }}
                        onSelectEvent={handleSelectEvent}
                        eventPropGetter={eventStyleGetter}
                        view={view}
                        onView={setView}
                        date={date}
                        onNavigate={setDate}
                        messages={messages}
                        culture="pt-BR"
                        views={[Views.MONTH, Views.WEEK, Views.DAY]}
                    />
                )}
            </div>

            {/* Lista de Consultas do Dia */}
            {view === Views.DAY && (
                <div className="card">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Consultas de {format(date, 'dd/MM/yyyy', { locale: ptBR })}
                    </h2>
                    
                    {atendimentos.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">
                            Nenhuma consulta agendada para este dia
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {atendimentos
                                .filter((a) => {
                                    const dataAtendimento = new Date(
                                        a.isAgendado && a.dataHoraAgendamento
                                            ? a.dataHoraAgendamento
                                            : a.dataHoraInicio
                                    );
                                    return (
                                        dataAtendimento.toDateString() === date.toDateString()
                                    );
                                })
                                .map((atendimento) => {
                                    const dataHora = atendimento.isAgendado && atendimento.dataHoraAgendamento
                                        ? atendimento.dataHoraAgendamento
                                        : atendimento.dataHoraInicio;

                                    return (
                                        <div
                                            key={atendimento.id}
                                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="flex flex-col items-center">
                                                    <Clock className="w-5 h-5 text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {formatTime(dataHora)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {atendimento.paciente.nome}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {atendimento.tipoAtendimento}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {atendimento.status === 'AGUARDANDO' && (
                                                    <button
                                                        onClick={() => {
                                                            setAtendimentoSelecionado(atendimento);
                                                            setShowReagendarModal(true);
                                                        }}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                        title="Reagendar"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => abrirPaciente()}
                                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                                    title="Ver Paciente"
                                                >
                                                    <User className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setAtendimentoSelecionado(atendimento);
                                                        setShowDetalhesModal(true);
                                                    }}
                                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                                    title="Ver Detalhes"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    )}
                </div>
            )}

            {/* Modal Detalhes Atendimento */}
            {showDetalhesModal && atendimentoSelecionado && (
                <AtendimentoDetalhesModal
                    atendimento={atendimentoSelecionado}
                    onClose={() => {
                        setShowDetalhesModal(false);
                        setAtendimentoSelecionado(null);
                        carregarAgenda();
                    }}
                />
            )}

            {/* Modal Detalhes Paciente */}
            {showPacienteModal && atendimentoSelecionado && (
                <PacienteDetalhesModal
                    paciente={atendimentoSelecionado.paciente}
                    onClose={() => {
                        setShowPacienteModal(false);
                    }}
                />
            )}

            {/* Modal Reagendar */}
            {showReagendarModal && atendimentoSelecionado && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            Reagendar Atendimento
                        </h2>
                        
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600">
                                    Paciente: <span className="font-medium">{atendimentoSelecionado.paciente.nome}</span>
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nova Data e Hora
                                </label>
                                <input
                                    type="datetime-local"
                                    value={novaDataHora}
                                    onChange={(e) => setNovaDataHora(e.target.value)}
                                    className="input-field"
                                />
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    onClick={() => {
                                        setShowReagendarModal(false);
                                        setNovaDataHora('');
                                    }}
                                    className="btn-secondary"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleReagendar}
                                    disabled={!novaDataHora}
                                    className="btn-primary"
                                >
                                    Reagendar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Agendas;

