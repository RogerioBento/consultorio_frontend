import React, { useState, useEffect } from 'react';
import { X, User, Calendar, Phone, Mail, MapPin, FileText, DollarSign, Plus, CreditCard, AlertCircle, CheckCircle, Activity } from 'lucide-react';
import type { Paciente, Pagamento } from '../../types';
import { formatCPF, formatPhone, formatDate, calcularIdade, formatCurrency, formatMetodoPagamento } from '../../utils/formatters';
import { pagamentoService } from '../../services/pagamentoService';
import PagamentoModal from '../pagamentos/PagamentoModal';
import ParcelasModal from '../pagamentos/ParcelasModal';
import OdontogramaVisual from '../odontograma/OdontogramaVisual';

interface PacienteDetalhesModalProps {
    isOpen: boolean;
    onClose: () => void;
    paciente?: Paciente; // ✅ CORREÇÃO: Usar 'Paciente | undefined'
}

const PacienteDetalhesModal: React.FC<PacienteDetalhesModalProps> = ({
                                                                         isOpen,
                                                                         onClose,
                                                                         paciente,
                                                                     }) => {
    const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
    const [loadingPagamentos, setLoadingPagamentos] = useState(false);
    const [showPagamentoModal, setShowPagamentoModal] = useState(false);
    const [showParcelasModal, setShowParcelasModal] = useState(false);
    const [pagamentoSelecionado, setPagamentoSelecionado] = useState<Pagamento | null>(null);
    const [activeTab, setActiveTab] = useState<'info' | 'odontograma' | 'pagamentos'>('info');

    useEffect(() => {
        if (isOpen && paciente) {
            carregarPagamentos();
        }
    }, [isOpen, paciente]);

    const carregarPagamentos = async () => {
        if (!paciente) return;
        
        try {
            setLoadingPagamentos(true);
            const data = await pagamentoService.getByPaciente(paciente.id);
            setPagamentos(data);
        } catch (error) {
            console.error('Erro ao carregar pagamentos:', error);
        } finally {
            setLoadingPagamentos(false);
        }
    };

    const calcularTotalPago = () => {
        return pagamentos.reduce((acc, pagamento) => {
            if (!pagamento.parcelado || !pagamento.parcelas || pagamento.parcelas.length === 0) {
                return acc + Number(pagamento.valorTotal);
            }
            const totalPago = pagamento.parcelas
                .filter(p => p.status === 'PAGO')
                .reduce((sum, p) => sum + Number(p.valorParcela), 0);
            return acc + totalPago;
        }, 0);
    };

    const calcularTotalPendente = () => {
        return pagamentos.reduce((acc, pagamento) => {
            if (!pagamento.parcelado || !pagamento.parcelas || pagamento.parcelas.length === 0) {
                return acc;
            }
            const totalPendente = pagamento.parcelas
                .filter(p => p.status === 'PENDENTE' || p.status === 'ATRASADO' || p.status === 'ESTORNADO')
                .reduce((sum, p) => sum + Number(p.valorParcela), 0);
            return acc + totalPendente;
        }, 0);
    };

    const abrirParcelasModal = (pagamento: Pagamento) => {
        setPagamentoSelecionado(pagamento);
        setShowParcelasModal(true);
    };

    if (!isOpen || !paciente) return null;

    const idade = calcularIdade(paciente.dataNascimento);

    return (
        <>
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">Detalhes do Paciente</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('info')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'info'
                                    ? 'border-primary-600 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <div className="flex items-center space-x-2">
                                <User className="w-4 h-4" />
                                <span>Informações</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('odontograma')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'odontograma'
                                    ? 'border-primary-600 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <div className="flex items-center space-x-2">
                                <Activity className="w-4 h-4" />
                                <span>Odontograma</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('pagamentos')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'pagamentos'
                                    ? 'border-primary-600 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <div className="flex items-center space-x-2">
                                <DollarSign className="w-4 h-4" />
                                <span>Pagamentos</span>
                            </div>
                        </button>
                    </nav>
                </div>

                {/* Conteúdo das Tabs */}
                <div className="p-6">
                    {/* Tab de Informações */}
                    {activeTab === 'info' && (
                        <div className="space-y-6">
                    {/* Nome e Idade */}
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                            <User className="w-8 h-8 text-primary-600" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900">{paciente.nome}</h3>
                            <p className="text-gray-600">{idade} anos</p>
                        </div>
                    </div>

                    {/* Informações Pessoais */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start space-x-3">
                            <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                            <div>
                                <p className="text-sm text-gray-500">Data de Nascimento</p>
                                <p className="font-medium text-gray-900">{formatDate(paciente.dataNascimento)}</p>
                            </div>
                        </div>

                        {paciente.cpf && (
                            <div className="flex items-start space-x-3">
                                <FileText className="w-5 h-5 text-gray-400 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-500">CPF</p>
                                    <p className="font-medium text-gray-900">{formatCPF(paciente.cpf)}</p>
                                </div>
                            </div>
                        )}

                        {paciente.telefone && (
                            <div className="flex items-start space-x-3">
                                <Phone className="w-5 h-5 text-gray-400 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-500">Telefone</p>
                                    <p className="font-medium text-gray-900">{formatPhone(paciente.telefone)}</p>
                                </div>
                            </div>
                        )}

                        {paciente.email && (
                            <div className="flex items-start space-x-3">
                                <Mail className="w-5 h-5 text-gray-400 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="font-medium text-gray-900">{paciente.email}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Endereço */}
                    {paciente.endereco && (
                        <div className="flex items-start space-x-3">
                            <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                            <div>
                                <p className="text-sm text-gray-500">Endereço</p>
                                <p className="font-medium text-gray-900">{paciente.endereco}</p>
                            </div>
                        </div>
                    )}

                    {/* Observações */}
                    {paciente.observacoes && (
                        <div>
                            <p className="text-sm text-gray-500 mb-2">Observações</p>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-gray-900">{paciente.observacoes}</p>
                            </div>
                        </div>
                    )}

                    {/* Informações Adicionais */}
                    <div className="border-t border-gray-200 pt-6 mt-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Informações Adicionais</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Declara IR */}
                            <div className="flex items-start space-x-3">
                                <FileText className="w-5 h-5 text-gray-400 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-500">Declara Imposto de Renda</p>
                                    <p className="font-medium text-gray-900">
                                        {paciente.declaraIr ? 'Sim' : 'Não'}
                                    </p>
                                </div>
                            </div>

                            {/* Dentista Responsável */}
                            {paciente.dentistaResponsavel && (
                                <div className="flex items-start space-x-3">
                                    <User className="w-5 h-5 text-gray-400 mt-1" />
                                    <div>
                                        <p className="text-sm text-gray-500">Dentista Responsável</p>
                                        <p className="font-medium text-gray-900">
                                            {paciente.dentistaResponsavel.nome}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Pai */}
                            {paciente.pai && (
                                <div className="flex items-start space-x-3">
                                    <User className="w-5 h-5 text-gray-400 mt-1" />
                                    <div>
                                        <p className="text-sm text-gray-500">Pai</p>
                                        <p className="font-medium text-gray-900">{paciente.pai.nome}</p>
                                    </div>
                                </div>
                            )}

                            {/* Mãe */}
                            {paciente.mae && (
                                <div className="flex items-start space-x-3">
                                    <User className="w-5 h-5 text-gray-400 mt-1" />
                                    <div>
                                        <p className="text-sm text-gray-500">Mãe</p>
                                        <p className="font-medium text-gray-900">{paciente.mae.nome}</p>
                                    </div>
                                </div>
                            )}

                            {/* Cônjuge */}
                            {paciente.conjuge && (
                                <div className="flex items-start space-x-3">
                                    <User className="w-5 h-5 text-gray-400 mt-1" />
                                    <div>
                                        <p className="text-sm text-gray-500">Cônjuge</p>
                                        <p className="font-medium text-gray-900">{paciente.conjuge.nome}</p>
                                    </div>
                                </div>
                            )}

                            {/* Data de Cadastro */}
                            {paciente.dataCadastro && (
                                <div className="flex items-start space-x-3">
                                    <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                                    <div>
                                        <p className="text-sm text-gray-500">Data de Cadastro</p>
                                        <p className="font-medium text-gray-900">
                                            {formatDate(paciente.dataCadastro)}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                        </div>
                    )}

                    {/* Tab de Odontograma */}
                    {activeTab === 'odontograma' && (
                        <div>
                            <OdontogramaVisual pacienteId={paciente.id} />
                        </div>
                    )}

                    {/* Tab de Pagamentos */}
                    {activeTab === 'pagamentos' && (
                        <div className="space-y-6">
                            {/* Seção de Pagamentos */}
                    <div className="border-t border-gray-200 pt-6 mt-6">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-gray-900">Pagamentos</h4>
                            <button
                                onClick={() => setShowPagamentoModal(true)}
                                className="btn-primary flex items-center space-x-2 text-sm"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Novo Pagamento</span>
                            </button>
                        </div>

                        {loadingPagamentos ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500">Carregando pagamentos...</p>
                            </div>
                        ) : pagamentos.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-lg">
                                <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                <p className="text-gray-500">Nenhum pagamento registrado</p>
                                <p className="text-gray-400 text-sm mt-1">
                                    Clique em "Novo Pagamento" para começar
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Resumo Financeiro */}
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <p className="text-sm text-blue-600 mb-1">Total</p>
                                        <p className="text-xl font-bold text-blue-900">
                                            {formatCurrency(pagamentos.reduce((acc, p) => acc + Number(p.valorTotal), 0))}
                                        </p>
                                    </div>
                                    <div className="bg-green-50 rounded-lg p-4">
                                        <p className="text-sm text-green-600 mb-1">Pago</p>
                                        <p className="text-xl font-bold text-green-900">
                                            {formatCurrency(calcularTotalPago())}
                                        </p>
                                    </div>
                                    <div className="bg-yellow-50 rounded-lg p-4">
                                        <p className="text-sm text-yellow-600 mb-1">Pendente</p>
                                        <p className="text-xl font-bold text-yellow-900">
                                            {formatCurrency(calcularTotalPendente())}
                                        </p>
                                    </div>
                                </div>

                                {/* Lista de Pagamentos */}
                                <div className="space-y-3">
                                    {pagamentos.map((pagamento) => {
                                        const temPendencia = pagamento.parcelas && pagamento.parcelas.some(
                                            p => p.status === 'PENDENTE' || p.status === 'ATRASADO'
                                        );
                                        const temAtraso = pagamento.parcelas && pagamento.parcelas.some(
                                            p => p.status === 'ATRASADO'
                                        );

                                        return (
                                            <div
                                                key={pagamento.id}
                                                className={`border rounded-lg p-4 ${
                                                    temAtraso ? 'border-red-300 bg-red-50' :
                                                    temPendencia ? 'border-yellow-300 bg-yellow-50' :
                                                    'border-gray-200 bg-white'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2 mb-2">
                                                            <CreditCard className="w-5 h-5 text-gray-400" />
                                                            <span className="font-medium text-gray-900">
                                                                {formatMetodoPagamento(pagamento.metodoPagamento)}
                                                            </span>
                                                            <span className="text-gray-500">•</span>
                                                            <span className="text-sm text-gray-600">
                                                                {formatDate(pagamento.dataLancamento)}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center space-x-4 text-sm">
                                                            <div>
                                                                <span className="text-gray-500">Valor: </span>
                                                                <span className="font-semibold text-gray-900">
                                                                    {formatCurrency(Number(pagamento.valorTotal))}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500">Parcelas: </span>
                                                                <span className="text-gray-900">
                                                                    {pagamento.parcelado ? `${pagamento.numeroParcelas}x` : 'À Vista'}
                                                                </span>
                                                            </div>
                                                            {pagamento.dentista && (
                                                                <div>
                                                                    <span className="text-gray-500">Dentista: </span>
                                                                    <span className="text-gray-900">{pagamento.dentista.nome}</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {pagamento.observacoes && (
                                                            <p className="text-sm text-gray-600 mt-2 italic">
                                                                {pagamento.observacoes}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-col items-end space-y-2">
                                                        {temAtraso ? (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                <AlertCircle className="w-3 h-3 mr-1" />
                                                                Atrasado
                                                            </span>
                                                        ) : temPendencia ? (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                                <AlertCircle className="w-3 h-3 mr-1" />
                                                                Pendente
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                                Pago
                                                            </span>
                                                        )}

                                                        {pagamento.parcelado && (
                                                            <button
                                                                onClick={() => abrirParcelasModal(pagamento)}
                                                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                                            >
                                                                Ver Parcelas
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                        </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end p-6 border-t border-gray-200">
                    <button onClick={onClose} className="btn-primary">
                        Fechar
                    </button>
                </div>
            </div>
        </div>

        {/* Modal de Novo Pagamento */}
            {showPagamentoModal && (
                <PagamentoModal
                    isOpen={showPagamentoModal}
                    onClose={() => setShowPagamentoModal(false)}
                    onSuccess={() => {
                        setShowPagamentoModal(false);
                        carregarPagamentos();
                    }}
                    pacienteId={paciente.id}
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
        </>
    );
};

export default PacienteDetalhesModal;
