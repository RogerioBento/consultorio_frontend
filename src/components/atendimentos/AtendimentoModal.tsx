import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { atendimentoService } from '../../services/atendimentoService';
import { pacienteService } from '../../services/pacienteService';
import { usuarioService } from '../../services/usuarioService';
import { useAuth } from '../../hooks/useAuth';
import type { AtendimentoDTO, TipoAtendimento, Paciente, Usuario } from '../../types';
import SearchableSelect from '../common/SearchableSelect';

interface AtendimentoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AtendimentoModal: React.FC<AtendimentoModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { user } = useAuth();
    const [pacientes, setPacientes] = useState<Paciente[]>([]);
    const [dentistas, setDentistas] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState<AtendimentoDTO>({
        pacienteId: 0,
        dentistaId: user?.id || 0,
        tipoAtendimento: 'CONSULTA',
        isAgendado: false,
        motivoConsulta: '',
        observacoesIniciais: '',
    });

    useEffect(() => {
        if (isOpen) {
            carregarDados();
        }
    }, [isOpen]);

    const carregarDados = async () => {
        try {
            const [pacientesData, dentistasData] = await Promise.all([
                pacienteService.getAll(),
                usuarioService.getAllDentistas(),
            ]);
            setPacientes(pacientesData);
            setDentistas(dentistasData);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.pacienteId || formData.pacienteId === 0) {
            alert('Selecione um paciente');
            return;
        }
        
        if (!formData.dentistaId || formData.dentistaId === 0) {
            alert('Selecione um dentista');
            return;
        }

        try {
            setLoading(true);
            const dto: AtendimentoDTO = {
                pacienteId: formData.pacienteId,
                dentistaId: formData.dentistaId,
                tipoAtendimento: formData.tipoAtendimento,
                isAgendado: formData.isAgendado,
                dataHoraAgendamento: formData.isAgendado ? formData.dataHoraAgendamento : undefined,
                motivoConsulta: formData.motivoConsulta,
                observacoesIniciais: formData.observacoesIniciais,
            };
            await atendimentoService.create(dto);
            onSuccess();
        } catch (error: any) {
            console.error('Erro ao criar atendimento:', error);
            alert(error.response?.data?.message || 'Erro ao criar atendimento');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-900">Novo Atendimento</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Paciente */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Paciente *
                        </label>
                        <SearchableSelect
                            options={pacientes.map(p => ({ value: p.id, label: p.nome }))}
                            value={formData.pacienteId}
                            onChange={(value) => setFormData({ ...formData, pacienteId: value })}
                            placeholder="Selecione o paciente"
                        />
                    </div>

                    {/* Dentista */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Dentista *
                        </label>
                        <SearchableSelect
                            options={dentistas.map(d => ({ value: d.id, label: d.nome }))}
                            value={formData.dentistaId}
                            onChange={(value) => setFormData({ ...formData, dentistaId: value })}
                            placeholder="Selecione o dentista"
                        />
                    </div>

                    {/* Tipo de Atendimento */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tipo de Atendimento *
                        </label>
                        <select
                            value={formData.tipoAtendimento}
                            onChange={(e) => setFormData({ ...formData, tipoAtendimento: e.target.value as TipoAtendimento })}
                            className="input-field"
                            required
                        >
                            <option value="CONSULTA">Consulta</option>
                            <option value="URGENCIA">Urgência</option>
                            <option value="RETORNO">Retorno</option>
                            <option value="MANUTENCAO">Manutenção</option>
                            <option value="CHECKUP">Check-up</option>
                            <option value="AVALIACAO">Avaliação</option>
                        </select>
                    </div>

                    {/* Agendar? */}
                    <div>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={formData.isAgendado}
                                onChange={(e) => setFormData({ ...formData, isAgendado: e.target.checked })}
                                className="rounded border-gray-300"
                            />
                            <span className="text-sm font-medium text-gray-700">Agendar para data/hora específica</span>
                        </label>
                    </div>

                    {/* Data/Hora Agendamento */}
                    {formData.isAgendado && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Data e Hora do Agendamento *
                            </label>
                            <input
                                type="datetime-local"
                                value={formData.dataHoraAgendamento || ''}
                                onChange={(e) => setFormData({ ...formData, dataHoraAgendamento: e.target.value })}
                                className="input-field"
                                required={formData.isAgendado}
                            />
                        </div>
                    )}

                    {/* Motivo da Consulta */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Motivo da Consulta
                        </label>
                        <input
                            type="text"
                            value={formData.motivoConsulta}
                            onChange={(e) => setFormData({ ...formData, motivoConsulta: e.target.value })}
                            className="input-field"
                            placeholder="Ex: Dor de dente, limpeza, canal..."
                        />
                    </div>

                    {/* Observações Iniciais */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Observações Iniciais
                        </label>
                        <textarea
                            value={formData.observacoesIniciais}
                            onChange={(e) => setFormData({ ...formData, observacoesIniciais: e.target.value })}
                            className="input-field"
                            rows={3}
                            placeholder="Observações sobre o paciente ou atendimento..."
                        />
                    </div>

                    {/* Botões */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Salvando...' : 'Criar Atendimento'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AtendimentoModal;

