import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { pagamentoService } from '../../services/pagamentoService';
import { pacienteService } from '../../services/pacienteService';
import { usuarioService } from '../../services/usuarioService';
import type { Paciente, MetodoPagamento, CriarPagamentoDTO, Usuario } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import SearchableSelect from '../common/SearchableSelect';
import axios from 'axios'; // Importar axios para tipagem de erro

interface PagamentoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    pacienteId?: number; // Pode ser opcional se o modal for aberto de outro lugar
    dentistaId?: number; // Pode ser opcional para pré-selecionar o dentista
}

const PagamentoModal: React.FC<PagamentoModalProps> = ({
                                                           isOpen,
                                                           onClose,
                                                           onSuccess,
                                                           pacienteId,
                                                           dentistaId,
                                                       }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [pacientes, setPacientes] = useState<Paciente[]>([]);
    const [dentistas, setDentistas] = useState<Usuario[]>([]);

    const [formData, setFormData] = useState({
        pacienteId: pacienteId || 0, // Inicializa com pacienteId se fornecido, senão 0
        dentistaId: 0, // Dentista agora é selecionado manualmente
        valorTotal: '',
        metodoPagamento: 'DINHEIRO' as MetodoPagamento,
        parcelado: false,
        numeroParcelas: 1,
        observacoes: '',
    });

    useEffect(() => {
        if (isOpen) {
            carregarPacientes();
            carregarDentistas();
            // Se um pacienteId for passado, pré-seleciona no formulário
            if (pacienteId) {
                setFormData(prev => ({ ...prev, pacienteId }));
            }
            // Se um dentistaId for passado, pré-seleciona no formulário
            if (dentistaId) {
                setFormData(prev => ({ ...prev, dentistaId }));
            } else {
                // Se não houver pacienteId, reseta o formulário para um novo pagamento
                setFormData({
                    pacienteId: 0,
                    dentistaId: 0,
                    valorTotal: '',
                    metodoPagamento: 'DINHEIRO',
                    parcelado: false,
                    numeroParcelas: 1,
                    observacoes: '',
                });
            }
            setError(''); // Limpa erros ao abrir o modal
        }
    }, [isOpen, pacienteId]); // Dependências para re-executar o efeito

    const carregarPacientes = async () => {
        try {
            const data = await pacienteService.getAll();
            setPacientes(data);
        } catch (err: unknown) { // Usando unknown para tratamento de erro seguro
            if (axios.isAxiosError(err) && err.response) {
                console.error('Erro ao carregar pacientes:', err.response.data);
            } else {
                console.error('Erro ao carregar pacientes:', err);
            }
            setError('Erro ao carregar lista de pacientes.');
        }
    };

    const carregarDentistas = async () => {
        try {
            const data = await usuarioService.getAllDentistas();
            setDentistas(data);
        } catch (err: unknown) {
            if (axios.isAxiosError(err) && err.response) {
                console.error('Erro ao carregar dentistas:', err.response.data);
            } else {
                console.error('Erro ao carregar dentistas:', err);
            }
            setError('Erro ao carregar lista de dentistas.');
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData({
                ...formData,
                [name]: checked,
            });
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validações básicas
        if (formData.pacienteId === 0) {
            setError('Selecione um paciente.');
            setLoading(false);
            return;
        }
        if (formData.dentistaId === 0) {
            setError('Selecione um dentista responsável.');
            setLoading(false);
            return;
        }
        if (Number(formData.valorTotal) <= 0) {
            setError('O valor total deve ser maior que zero.');
            setLoading(false);
            return;
        }
        if (formData.parcelado && Number(formData.numeroParcelas) < 2) {
            setError('Para pagamentos parcelados, o número de parcelas deve ser no mínimo 2.');
            setLoading(false);
            return;
        }

        try {
            const pagamentoDTO: CriarPagamentoDTO = {
                pacienteId: Number(formData.pacienteId),
                dentistaId: Number(formData.dentistaId), // Dentista selecionado manualmente
                valorTotal: Number(formData.valorTotal),
                metodoPagamento: formData.metodoPagamento,
                parcelado: formData.parcelado,
                numeroParcelas: formData.parcelado ? Number(formData.numeroParcelas) : undefined,
                observacoes: formData.observacoes || undefined,
            };

            await pagamentoService.create(pagamentoDTO);
            onSuccess(); // Notifica o componente pai que a operação foi bem-sucedida
            onClose(); // Fecha o modal

            // Reseta o formulário após o sucesso
            setFormData({
                pacienteId: 0,
                dentistaId: 0,
                valorTotal: '',
                metodoPagamento: 'DINHEIRO',
                parcelado: false,
                numeroParcelas: 1,
                observacoes: '',
            });
        } catch (err: unknown) { // Usando unknown para tratamento de erro seguro
            if (axios.isAxiosError(err) && err.response) {
                console.error('Erro ao criar pagamento:', err.response.data);
                setError(err.response.data?.message || 'Erro ao criar pagamento.');
            } else {
                console.error('Erro ao criar pagamento:', err);
                setError('Erro inesperado ao criar pagamento.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">Novo Pagamento</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-red-600">{error}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Paciente *
                            </label>
                            <select
                                name="pacienteId"
                                value={formData.pacienteId}
                                onChange={handleChange}
                                className="input-field"
                                required
                                disabled={!!pacienteId || loading} // Desabilita se pacienteId for passado via prop
                            >
                                <option value="">Selecione um paciente</option>
                                {pacientes.map((paciente) => (
                                    <option key={paciente.id} value={paciente.id}>
                                        {paciente.nome}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Dentista Responsável *
                            </label>
                            <SearchableSelect
                                options={dentistas.map(d => ({ value: d.id, label: d.nome }))}
                                value={formData.dentistaId}
                                onChange={(value) => setFormData({ ...formData, dentistaId: value })}
                                placeholder="Selecione o dentista responsável"
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Valor Total *
                            </label>
                            <input
                                type="number"
                                name="valorTotal"
                                value={formData.valorTotal}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Método de Pagamento *
                            </label>
                            <select
                                name="metodoPagamento"
                                value={formData.metodoPagamento}
                                onChange={handleChange}
                                className="input-field"
                                required
                                disabled={loading}
                            >
                                <option value="DINHEIRO">Dinheiro</option>
                                <option value="CARTAO_DEBITO">Cartão de Débito</option>
                                <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                                <option value="PIX">PIX</option>
                                <option value="TRANSFERENCIA">Transferência</option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    name="parcelado"
                                    checked={formData.parcelado}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                    disabled={loading}
                                />
                                <span className="text-sm font-medium text-gray-700">
                  Pagamento Parcelado
                </span>
                            </label>
                        </div>

                        {formData.parcelado && (
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Número de Parcelas *
                                </label>
                                <input
                                    type="number"
                                    name="numeroParcelas"
                                    value={formData.numeroParcelas}
                                    onChange={handleChange}
                                    className="input-field"
                                    min="2"
                                    max="12"
                                    required
                                    disabled={loading}
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Valor da parcela: R¨D{' '}
                                    {formData.valorTotal
                                        ? (Number(formData.valorTotal) / formData.numeroParcelas).toFixed(2)
                                        : '0.00'}
                                </p>
                            </div>
                        )}

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Observações
                            </label>
                            <textarea
                                name="observacoes"
                                value={formData.observacoes}
                                onChange={handleChange}
                                className="input-field"
                                rows={3}
                                placeholder="Informações adicionais sobre o pagamento"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Salvando...' : 'Salvar Pagamento'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PagamentoModal;
