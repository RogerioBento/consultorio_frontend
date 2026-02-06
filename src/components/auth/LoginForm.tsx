import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import axios from 'axios'; // Importar axios para tipagem de erro

const LoginForm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const userData = await login(email, senha); // ✅ CORREÇÃO: Passando email e senha como argumentos separados
            console.log('LoginForm: userData recebido:', userData);
            // Aguardar um pouco para garantir que o estado foi atualizado
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Redirecionar baseado no cargo do usuário
            if (userData?.cargo === 'RECEPCIONISTA') {
                console.log('LoginForm: Redirecionando RECEPCIONISTA para /atendimentos');
                navigate('/atendimentos');
            } else {
                console.log('LoginForm: Redirecionando para /dashboard, cargo:', userData?.cargo);
                navigate('/dashboard');
            }
        } catch (err: unknown) { // ✅ CORREÇÃO: Usando 'unknown' em vez de 'any'
            console.error('Erro no login:', err);

            if (axios.isAxiosError(err) && err.response) {
                // Erro da API (Axios)
                if (err.response.status === 401) {
                    setError('Email ou senha incorretos. Tente novamente.');
                } else if (err.response.status === 404) {
                    setError('Usuário não encontrado.');
                } else {
                    setError(err.response.data?.message || 'Erro ao fazer login. Tente novamente.');
                }
            } else if (axios.isAxiosError(err) && err.request) {
                // Erro de rede (Axios)
                setError('Não foi possível conectar ao servidor. Verifique sua conexão.');
            } else {
                // Outro erro
                setError('Erro inesperado. Tente novamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                            <LogIn className="w-8 h-8 text-primary-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Bem-vindo</h2>
                        <p className="text-gray-600 mt-2">Faça login para continuar</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2 animate-shake">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-red-600">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-field pl-10"
                                    placeholder="seu@email.com"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Senha
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    className="input-field pl-10"
                                    placeholder="••••••••"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Entrando...
                                </>
                            ) : (
                                'Entrar'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
