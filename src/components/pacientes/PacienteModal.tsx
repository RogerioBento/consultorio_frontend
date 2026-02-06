import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { pacienteService } from '../../services/pacienteService';
import { usuarioService } from '../../services/usuarioService';
import { mascaraCPF, mascaraTelefone, validarCPF } from '../../utils/formatters';
import SearchableSelect from '../common/SearchableSelect';
import type { Paciente, Usuario, AtualizarPacienteDTO } from '../../types';
import axios from 'axios';

interface PacienteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    paciente?: Paciente; // ✅ CORREÇÃO: 'paciente' pode ser Paciente ou undefined
}

const PacienteModal: React.FC<PacienteModalProps> = ({ isOpen, onClose, onSuccess, paciente }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [dentistas, setDentistas] = useState<Usuario[]>([]);
    const [pacientesRelacionados, setPacientesRelacionados] = useState<Paciente[]>([]);

    const [formData, setFormData] = useState({
        nome: '',
        dataNascimento: '',
        cpf: '',
        telefone: '',
        email: '',
        endereco: '',
        observacoes: '',
        declaraIr: false,
        dentistaResponsavelId: undefined as number | undefined,
        paiId: undefined as number | undefined,
        maeId: undefined as number | undefined,
        conjugeId: undefined as number | undefined,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen) {
            const loadData = async () => {
                try {
                    setError(''); // Limpar erro anterior
                    const [dentistasData, pacientesData] = await Promise.all([
                        usuarioService.getAllDentistas(),
                        pacienteService.getAll(),
                    ]);
                    setDentistas(dentistasData);
                    // Filtrar o próprio paciente da lista de relacionados para evitar auto-referência
                    setPacientesRelacionados(pacientesData.filter(p => p.id !== paciente?.id));
                } catch (err: unknown) {
                    console.error('Erro ao carregar dados para o modal:', err);
                    if (axios.isAxiosError(err)) {
                        if (err.response?.status === 401) {
                            setError('Sessão expirada. Faça login novamente.');
                        } else if (err.response?.status === 404) {
                            setError('Endpoints não encontrados. Verifique se o backend está rodando.');
                        } else if (err.code === 'ERR_NETWORK') {
                            setError('Erro de conexão. Verifique se o backend está rodando em http://localhost:8080');
                        } else {
                            setError(err.response?.data?.message || 'Erro ao carregar opções de seleção.');
                        }
                    } else {
                        setError('Erro inesperado ao carregar opções de seleção.');
                    }
                }
            };
            loadData();

            if (paciente) {
                setFormData({
                    nome: paciente.nome || '',
                    dataNascimento: paciente.dataNascimento || '',
                    cpf: paciente.cpf ? mascaraCPF(paciente.cpf) : '',
                    telefone: paciente.telefone ? mascaraTelefone(paciente.telefone) : '',
                    email: paciente.email || '',
                    endereco: paciente.endereco || '',
                    observacoes: paciente.observacoes || '',
                    declaraIr: paciente.declaraIr || false,
                    dentistaResponsavelId: paciente.dentistaResponsavel?.id || paciente.dentistaResponsavelId,
                    paiId: paciente.pai?.id || paciente.paiId,
                    maeId: paciente.mae?.id || paciente.maeId,
                    conjugeId: paciente.conjuge?.id || paciente.conjugeId,
                });
            } else {
                setFormData({
                    nome: '',
                    dataNascimento: '',
                    cpf: '',
                    telefone: '',
                    email: '',
                    endereco: '',
                    observacoes: '',
                    declaraIr: false,
                    dentistaResponsavelId: undefined,
                    paiId: undefined,
                    maeId: undefined,
                    conjugeId: undefined,
                });
            }
            setErrors({});
            setError('');
        }
    }, [isOpen, paciente]);

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
        } else if (name === 'cpf') {
            const maskedValue = mascaraCPF(value);
            setFormData({
                ...formData,
                [name]: maskedValue,
            });
            
            // Validar CPF em tempo real
            if (maskedValue && !validarCPF(maskedValue)) {
                setErrors(prev => ({
                    ...prev,
                    cpf: 'CPF inválido. Verifique os números digitados.'
                }));
            } else if (!maskedValue) {
                // Limpar erro se o campo for vazio
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.cpf;
                    return newErrors;
                });
            } else {
                // Limpar erro se o CPF for válido
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.cpf;
                    return newErrors;
                });
            }
        } else if (name === 'telefone') {
            setFormData({
                ...formData,
                [name]: mascaraTelefone(value),
            });
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }
    };

const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.nome) newErrors.nome = 'Nome é obrigatório.';
        if (!formData.dataNascimento) newErrors.dataNascimento = 'Data de Nascimento é obrigatória.';
        
        // CPF é obrigatório
        if (!formData.cpf) {
            newErrors.cpf = 'CPF é obrigatório.';
        } else if (!validarCPF(formData.cpf)) {
            newErrors.cpf = 'CPF inválido. Verifique os números digitados.';
        }
        
        // Dentista responsável agora é opcional
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

if (!validateForm()) {
            const camposComErro = Object.keys(errors);
            if (camposComErro.length > 0) {
                setError(`Por favor, corrija os erros no formulário: ${camposComErro.join(', ')}.`);
            } else {
                setError('Por favor, corrija os erros no formulário.');
            }
            setLoading(false);
            return;
        }

        try {
            const pacienteData: AtualizarPacienteDTO = {
                nome: formData.nome,
                dataNascimento: formData.dataNascimento,
                cpf: formData.cpf ? formData.cpf.replace(/[^\d]/g, '') : undefined,
                telefone: formData.telefone ? formData.telefone.replace(/[^\d]/g, '') : undefined,
                email: formData.email || undefined,
                endereco: formData.endereco || undefined,
                observacoes: formData.observacoes || undefined,
                declaraIr: formData.declaraIr,
                dentistaResponsavelId: formData.dentistaResponsavelId || undefined,
                paiId: formData.paiId || undefined,
                maeId: formData.maeId || undefined,
                conjugeId: formData.conjugeId || undefined,
            };

            if (paciente) {
                await pacienteService.update(paciente.id, pacienteData);
            } else {
                await pacienteService.create(pacienteData);
            }
            onSuccess();
            onClose();
        } catch (err: unknown) { // ✅ CORREÇÃO: Usando 'unknown' em vez de 'any'
            if (axios.isAxiosError(err) && err.response) {
                setError(err.response.data?.message || 'Erro ao salvar paciente.');
            } else {
                setError('Erro inesperado ao salvar paciente.');
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
                    <h2 className="text-2xl font-bold text-gray-900">
                        {paciente ? 'Editar Paciente' : 'Novo Paciente'}
                    </h2>
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
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nome Completo *
                            </label>
                            <input
                                type="text"
                                name="nome"
                                value={formData.nome}
                                onChange={handleChange}
                                className="input-field"
                                required
                                disabled={loading}
                            />
                            {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Data de Nascimento *
                            </label>
                            <input
                                type="date"
                                name="dataNascimento"
                                value={formData.dataNascimento}
                                onChange={handleChange}
                                className="input-field"
                                required
                                disabled={loading}
                            />
                            {errors.dataNascimento && <p className="text-red-500 text-xs mt-1">{errors.dataNascimento}</p>}
                        </div>

<div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                CPF *
                            </label>
                            <input
                                type="text"
                                name="cpf"
                                value={formData.cpf}
                                onChange={handleChange}
                                className={`input-field ${errors.cpf ? 'border-red-500 border-2 focus:border-red-500 focus:ring-red-500' : ''}`}
                                placeholder="000.000.000-00"
                                maxLength={14}
                                disabled={loading}
                                required
                            />
                            {errors.cpf && <p className="text-red-500 text-xs mt-1">{errors.cpf}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                            <input
                                type="text"
                                name="telefone"
                                value={formData.telefone}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="(00) 00000-0000"
                                maxLength={15}
                                disabled={loading}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="email@exemplo.com"
                                disabled={loading}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
                            <input
                                type="text"
                                name="endereco"
                                value={formData.endereco}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Rua, Número, Bairro, Cidade - UF"
                                disabled={loading}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
                            <textarea
                                name="observacoes"
                                value={formData.observacoes}
                                onChange={handleChange}
                                className="input-field"
                                rows={3}
                                placeholder="Informações adicionais sobre o paciente"
                                disabled={loading}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    name="declaraIr"
                                    checked={formData.declaraIr}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                    disabled={loading}
                                />
                                <span className="text-sm font-medium text-gray-700">
                  Declara Imposto de Renda
                </span>
                            </label>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Dentista Responsável
                            </label>
                            <select
                                name="dentistaResponsavelId"
                                value={formData.dentistaResponsavelId || ''}
                                onChange={handleChange}
                                className="input-field"
                                disabled={loading}
                            >
                                <option value="">Selecione um dentista</option>
                                {dentistas.map((dentista) => (
                                    <option key={dentista.id} value={dentista.id}>
                                        {dentista.nome}
                                    </option>
                                ))}
                            </select>
                            {errors.dentistaResponsavelId && <p className="text-red-500 text-xs mt-1">{errors.dentistaResponsavelId}</p>}
                        </div>

                        <div>
                            <SearchableSelect
                                label="Pai"
                                options={pacientesRelacionados.map((p) => ({
                                    value: p.id,
                                    label: p.nome,
                                }))}
                                value={formData.paiId}
                                onChange={(value) =>
                                    setFormData({ ...formData, paiId: value as number | undefined })
                                }
                                placeholder="Selecione o pai"
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <SearchableSelect
                                label="Mãe"
                                options={pacientesRelacionados.map((p) => ({
                                    value: p.id,
                                    label: p.nome,
                                }))}
                                value={formData.maeId}
                                onChange={(value) =>
                                    setFormData({ ...formData, maeId: value as number | undefined })
                                }
                                placeholder="Selecione a mãe"
                                disabled={loading}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <SearchableSelect
                                label="Cônjuge"
                                options={pacientesRelacionados.map((p) => ({
                                    value: p.id,
                                    label: p.nome,
                                }))}
                                value={formData.conjugeId}
                                onChange={(value) =>
                                    setFormData({ ...formData, conjugeId: value as number | undefined })
                                }
                                placeholder="Selecione o cônjuge"
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
                            {loading ? 'Salvando...' : 'Salvar Paciente'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PacienteModal;
