import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import LoginForm from './components/auth/LoginForm';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Pacientes from './pages/Pacientes';
import Atendimentos from './pages/Atendimentos';
import Agendas from './pages/Agendas';
import Procedimentos from './pages/Procedimentos';
import Pagamentos from './pages/Pagamentos';
import Inadimplentes from './pages/Inadimplentes';
import Usuarios from './pages/Usuarios';
import Odontograma from './pages/Odontograma';
import Relatorios from './pages/Relatorios';
import React from 'react'; // Certifique-se de importar React se estiver usando JSX

// Componente para rotas protegidas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl text-gray-600">Carregando...</div>
            </div>
        );
    }

    return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// Componente para redirecionar para a página inicial correta baseada no cargo
const DefaultRedirect = () => {
    const { user } = useAuth();
    
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    
    // Secretárias não têm acesso ao Dashboard, então redirecionam para Atendimentos
    if (user.cargo === 'RECEPCIONISTA') {
        return <Navigate to="/atendimentos" replace />;
    }
    
    // Admin e Dentistas vão para o Dashboard
    return <Navigate to="/dashboard" replace />;
};

function App() {
    return (
        <BrowserRouter> {/* ✅ BrowserRouter agora envolve AuthProvider */}
            <AuthProvider> {/* AuthProvider agora está dentro do BrowserRouter */}
                <Routes>
                    {/* Rota pública */}
                    <Route path="/login" element={<LoginForm />} />

                    {/* Rotas protegidas */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Dashboard />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/pacientes"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Pacientes />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/atendimentos"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Atendimentos />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/agendas"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Agendas />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/odontograma"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Odontograma />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/procedimentos"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Procedimentos />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/pagamentos"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Pagamentos />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/inadimplentes"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Inadimplentes />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/usuarios"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Usuarios />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/relatorios"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Relatorios />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />

                    {/* Rota padrão - redireciona baseado no cargo do usuário */}
                    <Route 
                        path="/" 
                        element={
                            <ProtectedRoute>
                                <DefaultRedirect />
                            </ProtectedRoute>
                        } 
                    />
                    {/* Rota para qualquer outra URL não encontrada */}
                    <Route 
                        path="*" 
                        element={
                            <ProtectedRoute>
                                <DefaultRedirect />
                            </ProtectedRoute>
                        } 
                    />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
