import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, Calendar, Activity, FileText, DollarSign, UserCog, BarChart3, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Sidebar: React.FC = () => {
    const { user } = useAuth();

    const menuItems = [
        { path: '/dashboard', icon: Home, label: 'Dashboard', roles: ['ADMIN', 'DENTISTA'] }, // Removido RECEPCIONISTA
        { path: '/pacientes', icon: Users, label: 'Pacientes', roles: ['ADMIN', 'DENTISTA', 'RECEPCIONISTA'] },
        { path: '/atendimentos', icon: Calendar, label: 'Atendimentos', roles: ['ADMIN', 'DENTISTA', 'RECEPCIONISTA'] },
        { path: '/agendas', icon: Calendar, label: 'Agendas', roles: ['ADMIN', 'DENTISTA', 'RECEPCIONISTA'] },
        { path: '/odontograma', icon: Activity, label: 'Odontograma', roles: ['ADMIN', 'DENTISTA', 'RECEPCIONISTA'] },
        { path: '/procedimentos', icon: FileText, label: 'Procedimentos', roles: ['ADMIN', 'DENTISTA'] },
        { path: '/pagamentos', icon: DollarSign, label: 'Pagamentos', roles: ['ADMIN', 'DENTISTA', 'RECEPCIONISTA'] },
        { path: '/inadimplentes', icon: AlertTriangle, label: 'Inadimplentes', roles: ['ADMIN', 'DENTISTA', 'RECEPCIONISTA'] },
        { path: '/relatorios', icon: BarChart3, label: 'Relatórios', roles: ['ADMIN', 'DENTISTA'] },
        { path: '/usuarios', icon: UserCog, label: 'Usuários', roles: ['ADMIN'] },
    ];

    return (
        <aside className="w-64 bg-gray-50 border-r border-gray-200 min-h-screen">
            <nav className="p-4 space-y-2">
                {menuItems
                    .filter((item) => !item.roles || item.roles.includes(user?.cargo || ''))
                    .map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                                    isActive
                                        ? 'bg-primary-600 text-white'
                                        : 'text-gray-700 hover:bg-gray-200'
                                }`
                            }
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                        </NavLink>
                    ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
