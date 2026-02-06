import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, DollarSign, Printer, Check, Heart } from 'lucide-react';
import { atendimentoService } from '../../services/atendimentoService';
import { procedimentoService } from '../../services/procedimentoService';
import { pagamentoService } from '../../services/pagamentoService';
import type { Atendimento, FinalizarAtendimentoDTO, ProcedimentoAtendimentoDTO, Procedimento } from '../../types';
import PagamentoModal from '../pagamentos/PagamentoModal';
import OdontogramaVisual from '../odontograma/OdontogramaVisual';

interface FinalizarAtendimentoModalProps {
    isOpen: boolean;
    atendimento: Atendimento;
    onClose: () => void;
    onSuccess: () => void;
}

const FinalizarAtendimentoModal: React.FC<FinalizarAtendimentoModalProps> = ({
    isOpen,
    atendimento,
    onClose,
    onSuccess
}) => {
    const [procedimentos, setProcedimentos] = useState<Procedimento[]>([]);
    const [loading, setLoading] = useState(false);
    const [jaCobrado, setJaCobrado] = useState(false);
    const [showPagamentoModal, setShowPagamentoModal] = useState(false);
    const [showOdontogramaModal, setShowOdontogramaModal] = useState(false);
    const [pagamentoInfo, setPagamentoInfo] = useState<{
        existe: boolean;
        valor?: number;
        metodo?: string;
        status?: string;
    }>({ existe: false });
    
    const [formData, setFormData] = useState<FinalizarAtendimentoDTO>({
        diagnostico: '',
        prescricao: '',
        observacoesFinais: '',
        dataRetornoSugerida: '',
        procedimentos: [],
    });

    useEffect(() => {
        if (isOpen) {
            carregarProcedimentos();
            verificarPagamentoExistente();
            // Resetar estado ao abrir
            setJaCobrado(false);
            // Pré-preencher dados se o atendimento já foi finalizado
            if (atendimento.status === 'FINALIZADO') {
                setFormData({
                    diagnostico: atendimento.diagnostico || '',
                    prescricao: atendimento.prescricao || '',
                    observacoesFinais: atendimento.observacoesFinais || '',
                    dataRetornoSugerida: atendimento.dataRetornoSugerida || '',
                    procedimentos: [],
                });
            } else {
                // Se não está finalizado, limpar formulário
                setFormData({
                    diagnostico: '',
                    prescricao: '',
                    observacoesFinais: '',
                    dataRetornoSugerida: '',
                    procedimentos: [],
                });
            }
        }
    }, [isOpen, atendimento]);

    const carregarProcedimentos = async () => {
        try {
            const data = await procedimentoService.getAll();
            setProcedimentos(data);
        } catch (error) {
            console.error('Erro ao carregar procedimentos:', error);
        }
    };

    const verificarPagamentoExistente = async () => {
        try {
            // Buscar pagamentos vinculados a este atendimento
            const pagamentos = await pagamentoService.getByAtendimento(atendimento.id);
            
            if (pagamentos && pagamentos.length > 0) {
                // Pega o primeiro pagamento (geralmente só haverá um por atendimento)
                const pagamento = pagamentos[0];
                
                setPagamentoInfo({
                    existe: true,
                    valor: pagamento.valorTotal,
                    metodo: pagamento.metodoPagamento,
                    status: pagamento.parcelas ? 
                        (pagamento.parcelas.some(p => p.status === 'PENDENTE') ? 'Pendente' : 
                         pagamento.parcelas.some(p => p.status === 'ATRASADO') ? 'Atrasado' : 'Pago') : 
                        'Pago'
                });
                setJaCobrado(true);
            } else {
                setPagamentoInfo({ existe: false });
                setJaCobrado(false);
            }
        } catch (error) {
            console.error('Erro ao verificar pagamento:', error);
            setPagamentoInfo({ existe: false });
            setJaCobrado(false);
        }
    };

    const adicionarProcedimento = () => {
        setFormData({
            ...formData,
            procedimentos: [
                ...(formData.procedimentos || []),
                { procedimentoId: 0, denteNumero: undefined, observacoes: '' },
            ],
        });
    };

    const removerProcedimento = (index: number) => {
        const novosProcedimentos = formData.procedimentos?.filter((_, i) => i !== index);
        setFormData({ ...formData, procedimentos: novosProcedimentos });
    };

    const atualizarProcedimento = (index: number, campo: keyof ProcedimentoAtendimentoDTO, valor: any) => {
        const novosProcedimentos = [...(formData.procedimentos || [])];
        novosProcedimentos[index] = {
            ...novosProcedimentos[index],
            [campo]: valor,
        };
        setFormData({ ...formData, procedimentos: novosProcedimentos });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            setLoading(true);
            await atendimentoService.finalizar(atendimento.id, formData);
            onSuccess();
        } catch (error: any) {
            console.error('Erro ao finalizar atendimento:', error);
            alert(error.response?.data?.message || 'Erro ao finalizar atendimento');
        } finally {
            setLoading(false);
        }
    };

    const irParaPagamento = () => {
        setShowPagamentoModal(true);
    };

    const irParaOdontograma = () => {
        setShowOdontogramaModal(true);
    };

    const imprimirDocumento = (tipo: 'receita' | 'atestado' | 'recibo') => {
        // Esta função será implementada com o componente de impressão
        alert(`Impressão de ${tipo} em desenvolvimento`);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {atendimento.status === 'FINALIZADO' ? 'Editar Atendimento' : 'Finalizar Atendimento'}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Paciente: {atendimento.paciente.nome}
                        </p>
                        {pagamentoInfo.existe && (
                            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                                <p className="text-sm font-medium text-green-800">
                                    💰 Pagamento: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pagamentoInfo.valor || 0)}
                                </p>
                                <p className="text-xs text-green-600">
                                    Método: {pagamentoInfo.metodo?.replace('_', ' ')} | Status: {pagamentoInfo.status}
                                </p>
                            </div>
                        )}
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Diagnóstico */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Diagnóstico
                        </label>
                        <textarea
                            value={formData.diagnostico}
                            onChange={(e) => setFormData({ ...formData, diagnostico: e.target.value })}
                            className="input-field"
                            rows={3}
                            placeholder="Descreva o diagnóstico do paciente..."
                        />
                    </div>

                    {/* Prescrição */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Prescrição / Receita
                        </label>
                        <textarea
                            value={formData.prescricao}
                            onChange={(e) => setFormData({ ...formData, prescricao: e.target.value })}
                            className="input-field"
                            rows={4}
                            placeholder="Medicamentos, dosagem, orientações..."
                        />
                    </div>

                    {/* Procedimentos Realizados */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Procedimentos Realizados
                            </label>
                            <button
                                type="button"
                                onClick={adicionarProcedimento}
                                className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Adicionar Procedimento
                            </button>
                        </div>
                        
                        <div className="space-y-3">
                            {formData.procedimentos?.map((proc, index) => (
                                <div key={index} className="flex gap-2 items-start p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-1 grid grid-cols-3 gap-2">
                                        <div>
                                            <select
                                                value={proc.procedimentoId}
                                                onChange={(e) => atualizarProcedimento(index, 'procedimentoId', Number(e.target.value))}
                                                className="input-field"
                                                required
                                            >
                                                <option value={0}>Selecione...</option>
                                                {procedimentos.map(p => (
                                                    <option key={p.id} value={p.id}>
                                                        {p.nome}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <input
                                                type="number"
                                                value={proc.denteNumero || ''}
                                                onChange={(e) => atualizarProcedimento(index, 'denteNumero', e.target.value ? Number(e.target.value) : undefined)}
                                                className="input-field"
                                                placeholder="Dente (opcional)"
                                                min={11}
                                                max={48}
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="text"
                                                value={proc.observacoes || ''}
                                                onChange={(e) => atualizarProcedimento(index, 'observacoes', e.target.value)}
                                                className="input-field"
                                                placeholder="Observações"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removerProcedimento(index)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Data de Retorno */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Data de Retorno Sugerida
                        </label>
                        <input
                            type="date"
                            value={formData.dataRetornoSugerida}
                            onChange={(e) => setFormData({ ...formData, dataRetornoSugerida: e.target.value })}
                            className="input-field"
                        />
                    </div>

                    {/* Observações Finais */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Observações Finais
                        </label>
                        <textarea
                            value={formData.observacoesFinais}
                            onChange={(e) => setFormData({ ...formData, observacoesFinais: e.target.value })}
                            className="input-field"
                            rows={3}
                            placeholder="Observações sobre o atendimento..."
                        />
                    </div>

                    {/* Botões de Ação */}
                    <div className="border-t pt-4">
                        <div className="flex gap-2 mb-4">
                            <button
                                type="button"
                                onClick={() => imprimirDocumento('receita')}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
                            >
                                <Printer className="w-4 h-4" />
                                Imprimir Receita
                            </button>
                            <button
                                type="button"
                                onClick={() => imprimirDocumento('atestado')}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
                            >
                                <Printer className="w-4 h-4" />
                                Imprimir Atestado
                            </button>
                            <button
                                type="button"
                                onClick={irParaOdontograma}
                                className="flex-1 px-4 py-2 border border-blue-300 rounded-lg text-blue-700 hover:bg-blue-50 flex items-center justify-center gap-2"
                            >
                                <Heart className="w-4 h-4" />
                                Abrir Odontograma
                            </button>
                            <button
                                type="button"
                                onClick={irParaPagamento}
                                disabled={jaCobrado}
                                className={`flex-1 px-4 py-2 rounded-lg flex items-center justify-center gap-2 ${
                                    jaCobrado 
                                        ? 'bg-gray-400 text-white cursor-not-allowed' 
                                        : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                            >
                                {jaCobrado ? (
                                    <>
                                        <Check className="w-4 h-4" />
                                        Já Cobrado
                                    </>
                                ) : (
                                    <>
                                        <DollarSign className="w-4 h-4" />
                                        Cobrar
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="flex gap-3">
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
                                {loading 
                                    ? 'Salvando...' 
                                    : atendimento.status === 'FINALIZADO' 
                                        ? 'Salvar Alterações' 
                                        : 'Finalizar Atendimento'
                                }
                            </button>
                        </div>
                    </div>
                </form>
            </div>

{/* Modal de Pagamento */}
            {showPagamentoModal && (
                <PagamentoModal
                    isOpen={showPagamentoModal}
                    onClose={() => setShowPagamentoModal(false)}
                    onSuccess={() => {
                        setShowPagamentoModal(false);
                        setJaCobrado(true);
                        // Recarregar informações de pagamento
                        verificarPagamentoExistente();
                    }}
                    pacienteId={atendimento.paciente.id}
                    dentistaId={atendimento.dentista.id}
                />
            )}

            {/* Modal de Odontograma */}
            {showOdontogramaModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900">
                                Odontograma - {atendimento.paciente.nome}
                            </h2>
                            <button
                                onClick={() => setShowOdontogramaModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6">
                            <OdontogramaVisual
                                pacienteId={atendimento.paciente.id}
                            />
                        </div>
                        <div className="flex justify-end p-6 border-t border-gray-200">
                            <button
                                onClick={() => setShowOdontogramaModal(false)}
                                className="btn-primary"
                            >
                                Voltar para Finalizar Atendimento
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinalizarAtendimentoModal;

