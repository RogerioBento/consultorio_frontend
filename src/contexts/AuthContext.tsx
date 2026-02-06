/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ Importar useNavigate
import { authService } from '../services/authService';
import type { Usuario, AuthContextData } from '../types';
import api from '../services/api'; // ✅ Importar a instância do Axios para configurar o token

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<Usuario | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); // ✅ Instanciar useNavigate

    useEffect(() => {
        const loadStorageData = () => {
            console.log('AuthContext: Iniciando loadStorageData...');
            try {
                const storedUser = localStorage.getItem('@ConsultorioOdonto:user');
                const storedToken = localStorage.getItem('@ConsultorioOdonto:token');

                console.log('AuthContext: storedToken do localStorage:', storedToken);
                console.log('AuthContext: storedUser do localStorage:', storedUser);

                // ✅ CORREÇÃO: Verificar se o item existe E é uma string não vazia antes de fazer JSON.parse
                if (storedUser && storedToken && storedUser !== 'undefined' && storedToken !== 'undefined') {
                    try {
                        const parsedUser = JSON.parse(storedUser) as Usuario;
                        setUser(parsedUser);
                        // ✅ Configurar o token no Axios para requisições futuras
                        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
                        console.log('AuthContext: Dados de autenticação carregados do localStorage e Axios configurado.');
                    } catch (parseError) {
                        console.error("AuthContext: Erro ao parsear storedUser do localStorage:", parseError);
                        // Limpar dados inválidos se houver erro de parsing
                        localStorage.removeItem('@ConsultorioOdonto:user');
                        localStorage.removeItem('@ConsultorioOdonto:token');
                        setUser(null); // Garante que o estado user seja null
                        api.defaults.headers.common['Authorization'] = ''; // Limpa o token do Axios
                    }
                } else {
                    console.log('AuthContext: Nenhum dado de autenticação válido encontrado no localStorage.');
                    setUser(null); // Garante que o estado user seja null
                    api.defaults.headers.common['Authorization'] = ''; // Limpa o token do Axios
                }
            } catch (error) {
                console.error("AuthContext: Erro geral ao carregar dados do localStorage:", error);
                localStorage.removeItem('@ConsultorioOdonto:user');
                localStorage.removeItem('@ConsultorioOdonto:token');
                setUser(null);
                api.defaults.headers.common['Authorization'] = '';
            } finally {
                setLoading(false);
                console.log('AuthContext: loadStorageData finalizado.');
            }
        };
        loadStorageData();
    }, []);

    const login = async (email: string, senha: string) => {
        setLoading(true); // Opcional: mostrar loading durante o login
        console.log('AuthContext: Tentando login para:', email);
        try {
            const response = await authService.login({ email, senha });
            const { token, usuario } = response; // ✅ Desestruturar diretamente de response, que já é LoginResponse

            console.log('AuthContext: Resposta do authService.login:', response);
            console.log('AuthContext: Token recebido:', token);
            console.log('AuthContext: Usuário recebido:', usuario);

            if (token && usuario) {
                localStorage.setItem('@ConsultorioOdonto:user', JSON.stringify(usuario));
                localStorage.setItem('@ConsultorioOdonto:token', token);
                // ✅ Configurar o token no Axios para requisições futuras
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                setUser(usuario); // ✅ Atualizar o estado 'user'
                console.log('AuthContext: Login bem-sucedido. Dados salvos e estado atualizado.');
                return usuario; // Retornar os dados do usuário para o LoginForm fazer o redirecionamento
            } else {
                console.error('AuthContext: Token ou usuário não recebidos na resposta do login.');
                // Limpar qualquer dado parcial que possa ter sido salvo
                localStorage.removeItem('@ConsultorioOdonto:user');
                localStorage.removeItem('@ConsultorioOdonto:token');
                setUser(null);
                api.defaults.headers.common['Authorization'] = '';
                throw new Error('Credenciais inválidas ou resposta incompleta do servidor.');
            }
        } catch (error) {
            console.error('AuthContext: Erro durante o login:', error);
            // ✅ Melhorar o tratamento de erro para exibir mensagens mais amigáveis
            // Você pode querer lançar um erro mais específico ou retornar false
            throw error; // Re-lança o erro para ser tratado no LoginForm
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        console.log('AuthContext: Realizando logout...');
        setUser(null);
        localStorage.removeItem('@ConsultorioOdonto:user');
        localStorage.removeItem('@ConsultorioOdonto:token');
        api.defaults.headers.common['Authorization'] = ''; // ✅ Limpar o token do Axios
        navigate('/login'); // ✅ Redirecionar para a tela de login
        console.log('AuthContext: Logout concluído. Redirecionando para /login.');
    };

    const isAuthenticated = !!user; // Derivado do estado 'user'

    return (
        <AuthContext.Provider value={{ user, loading, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
