import React from 'react';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';  // ✅ Corretodw
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <h1 className="text-2xl font-bold text-primary-600">
                            Consultório Odontológico
                        </h1>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 text-gray-700">
                            <User className="w-5 h-5" />
                            <span className="text-sm font-medium">Dr. Usuário</span>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="text-sm font-medium">Sair</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
