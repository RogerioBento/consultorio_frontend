import React from 'react';
import { X, User, Clock, Calendar, FileText, Activity } from 'lucide-react';
import type { Atendimento } from '../../types';
import { formatDate, formatTime } from '../../utils/formatters';

interface AtendimentoDetalhesModalProps {
    isOpen: boolean;
    atendimento: Atendimento;
    onClose: () => void;
}

const AtendimentoDetalhesModal: React.FC<AtendimentoDetalhesModalProps> = ({
    isOpen,
    atendimento,
    onClose
}) => {
    if (!isOpen) return null;

    const calcularDuracao = () => {
        const inicio = new Date(atendimento.dataHoraInicio);
        const fim = atendimento.dataHoraFim ? new Date(atendimento.dataHoraFim) : new Date();
        const diffMs = fim.getTime() - inicio.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 60) {
            return `${diffMins} minutos`;
        }
        const horas = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        return `${horas}h ${mins}min`;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-900">Detalhes do Atendimento</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Informações Gerais */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-600 flex items-center">
                                <User className="w-4 h-4 mr-2" />
                                Paciente
                            </label>
                            <p className="text-lg font-semibold text-gray-900">{atendimento.paciente.nome}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-600 flex items-center">
                                <User className="w-4 h-4 mr-2" />
                                Dentista
                            </label>
                            <p className="text-lg font-semibold text-gray-900">{atendimento.dentista.nome}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-600 flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                Data
                            </label>
                            <p className="text-gray-900">{formatDate(atendimento.dataHoraInicio)}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-600 flex items-center">
                                <Clock className="w-4 h-4 mr-2" />
                                Horário
                            </label>
                            <p className="text-gray-900">
                                {formatTime(atendimento.dataHoraInicio)}
                                {atendimento.dataHoraFim && ` - ${formatTime(atendimento.dataHoraFim)}`}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-600">
                                Duração
                            </label>
                            <p className="text-gray-900">{calcularDuracao()}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-600">
                                Tipo
                            </label>
                            <p className="text-gray-900">{atendimento.tipoAtendimento}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-600">
                                Status
                            </label>
                            <p className="text-gray-900 font-semibold">{atendimento.status}</p>
                        </div>
                        {atendimento.isAgendado && atendimento.dataHoraAgendamento && (
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-600">
                                    Agendamento
                                </label>
                                <p className="text-gray-900">
                                    {formatDate(atendimento.dataHoraAgendamento)} às {formatTime(atendimento.dataHoraAgendamento)}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Motivo da Consulta */}
                    {atendimento.motivoConsulta && (
                        <div className="border-t pt-4">
                            <label className="text-sm font-medium text-gray-600 flex items-center mb-2">
                                <FileText className="w-4 h-4 mr-2" />
                                Motivo da Consulta
                            </label>
                            <p className="text-gray-900">{atendimento.motivoConsulta}</p>
                        </div>
                    )}

                    {/* Observações Iniciais */}
                    {atendimento.observacoesIniciais && (
                        <div className="border-t pt-4">
                            <label className="text-sm font-medium text-gray-600 mb-2 block">
                                Observações Iniciais
                            </label>
                            <p className="text-gray-900 whitespace-pre-wrap">{atendimento.observacoesIniciais}</p>
                        </div>
                    )}

                    {/* Diagnóstico */}
                    {atendimento.diagnostico && (
                        <div className="border-t pt-4">
                            <label className="text-sm font-medium text-gray-600 mb-2 block">
                                Diagnóstico
                            </label>
                            <p className="text-gray-900 whitespace-pre-wrap">{atendimento.diagnostico}</p>
                        </div>
                    )}

                    {/* Prescrição */}
                    {atendimento.prescricao && (
                        <div className="border-t pt-4">
                            <label className="text-sm font-medium text-gray-600 mb-2 block">
                                Prescrição / Receita
                            </label>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-900 whitespace-pre-wrap font-mono text-sm">{atendimento.prescricao}</p>
                            </div>
                        </div>
                    )}

                    {/* Procedimentos Realizados */}
                    {atendimento.procedimentos && atendimento.procedimentos.length > 0 && (
                        <div className="border-t pt-4">
                            <label className="text-sm font-medium text-gray-600 flex items-center mb-2">
                                <Activity className="w-4 h-4 mr-2" />
                                Procedimentos Realizados
                            </label>
                            <div className="space-y-2">
                                {atendimento.procedimentos.map((proc, index) => (
                                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {proc.procedimento.nome}
                                                </p>
                                                {proc.denteNumero && (
                                                    <p className="text-sm text-gray-600">
                                                        Dente: {proc.denteNumero}
                                                    </p>
                                                )}
                                                {proc.observacoes && (
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {proc.observacoes}
                                                    </p>
                                                )}
                                            </div>
                                            <span className="text-sm font-semibold text-primary-600">
                                                R$ {proc.procedimento.preco.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Data de Retorno */}
                    {atendimento.dataRetornoSugerida && (
                        <div className="border-t pt-4">
                            <label className="text-sm font-medium text-gray-600 mb-2 block">
                                Data de Retorno Sugerida
                            </label>
                            <p className="text-gray-900">{formatDate(atendimento.dataRetornoSugerida)}</p>
                        </div>
                    )}

                    {/* Observações Finais */}
                    {atendimento.observacoesFinais && (
                        <div className="border-t pt-4">
                            <label className="text-sm font-medium text-gray-600 mb-2 block">
                                Observações Finais
                            </label>
                            <p className="text-gray-900 whitespace-pre-wrap">{atendimento.observacoesFinais}</p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end p-6 border-t">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AtendimentoDetalhesModal;

