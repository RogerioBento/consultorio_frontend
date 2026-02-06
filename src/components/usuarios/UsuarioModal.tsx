import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { usuarioService, type CriarUsuarioDTO, type AtualizarUsuarioDTO } from '../../services/usuarioService';
import type { Usuario } from '../../types';
import axios from 'axios';

interface UsuarioModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    usuario?: Usuario;
}

const UsuarioModal: React.FC<UsuarioModalProps> = ({ isOpen, onClose, onSuccess, usuario }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        senha: '',
        confirmarSenha: '',
        cargo: 'RECEPCIONISTA' as 'DENTISTA' | 'RECEPCIONISTA' | 'ADMIN',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen) {
            if (usuario) {
                // Modo edição
                setFormData({
                    nome: usuario.nome,
                    email: usuario.email,
                    senha: '',
                    confirmarSenha: '',
                    cargo: usuario.cargo,
                });
            } else {
                // Modo criação
                setFormData({
                    nome: '',
                    email: '',
                    senha: '',
                    confirmarSenha: '',
                    cargo: 'RECEPCIONISTA',
                });
            }

            setErrors({});
            setError('');
        }
    }, [isOpen, usuario]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.nome) newErrors.nome = 'Nome é obrigatório.';
        if (!formData.email) newErrors.email = 'Email é obrigatório.';
        if (!formData.cargo) newErrors.cargo = 'Cargo é obrigatório.';

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.email && !emailRegex.test(formData.email)) {
            newErrors.email = 'Email inválido.';
        }

        // Validar senha (apenas se for novo usuário ou se preencheu o campo senha)
        if (!usuario && !formData.senha) {
            newErrors.senha = 'Senha é obrigatória para novos usuários.';
        } else if (formData.senha) {
            if (formData.senha.length < 6) {
                newErrors.senha = 'A senha deve ter no mínimo 6 caracteres.';
            }
            if (formData.senha !== formData.confirmarSenha) {
                newErrors.confirmarSenha = 'As senhas não coincidem.';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            if (usuario) {
                // Atualizar usuário existente
                const atualizarDTO: AtualizarUsuarioDTO = {
                    nome: formData.nome,
                    email: formData.email,
                    cargo: formData.cargo,
                };

                // Só envia senha se foi preenchida
                if (formData.senha) {
                    atualizarDTO.senha = formData.senha;
                }

                await usuarioService.update(usuario.id, atualizarDTO);
            } else {
                // Criar novo usuário
                const criarDTO: CriarUsuarioDTO = {
                    nome: formData.nome,
                    email: formData.email,
                    senha: formData.senha,
                    cargo: formData.cargo,
                };

                await usuarioService.create(criarDTO);
            }

            onSuccess();
        } catch (err: unknown) {
            if (axios.isAxiosError(err) && err.response) {
                console.error('Erro ao salvar usuário:', err.response.data);
                setError(err.response.data?.message || 'Erro ao salvar usuário.');
            } else {
                console.error('Erro ao salvar usuário:', err);
                setError('Erro inesperado ao salvar usuário.');
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
                        {usuario ? 'Editar Usuário' : 'Novo Usuário'}
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
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nome Completo *
                            </label>
                            <input
                                type="text"
                                name="nome"
                                value={formData.nome}
                                onChange={handleChange}
                                className={`input-field ${errors.nome ? 'border-red-500' : ''}`}
                                placeholder="João Silva"
                                disabled={loading}
                            />
                            {errors.nome && (
                                <p className="text-sm text-red-600 mt-1">{errors.nome}</p>
                            )}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email *
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                                placeholder="joao@exemplo.com"
                                disabled={loading}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                            )}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Cargo *
                            </label>
                            <select
                                name="cargo"
                                value={formData.cargo}
                                onChange={handleChange}
                                className={`input-field ${errors.cargo ? 'border-red-500' : ''}`}
                                disabled={loading}
                            >
                                <option value="RECEPCIONISTA">Recepcionista</option>
                                <option value="DENTISTA">Dentista</option>
                                <option value="ADMIN">Administrador</option>
                            </select>
                            {errors.cargo && (
                                <p className="text-sm text-red-600 mt-1">{errors.cargo}</p>
                            )}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Senha {usuario ? '(deixe vazio para manter a atual)' : '*'}
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="senha"
                                    value={formData.senha}
                                    onChange={handleChange}
                                    className={`input-field pr-10 ${errors.senha ? 'border-red-500' : ''}`}
                                    placeholder="Mínimo 6 caracteres"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            {errors.senha && (
                                <p className="text-sm text-red-600 mt-1">{errors.senha}</p>
                            )}
                        </div>

                        {formData.senha && (
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirmar Senha *
                                </label>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="confirmarSenha"
                                    value={formData.confirmarSenha}
                                    onChange={handleChange}
                                    className={`input-field ${errors.confirmarSenha ? 'border-red-500' : ''}`}
                                    placeholder="Digite a senha novamente"
                                    disabled={loading}
                                />
                                {errors.confirmarSenha && (
                                    <p className="text-sm text-red-600 mt-1">{errors.confirmarSenha}</p>
                                )}
                            </div>
                        )}
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
                            {loading ? 'Salvando...' : usuario ? 'Atualizar' : 'Criar Usuário'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UsuarioModal;

