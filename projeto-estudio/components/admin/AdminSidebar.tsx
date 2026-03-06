import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Calendar, Users, Lock, Settings,
    LogOut, X, Crown, ChevronLeft, BarChart3, CheckSquare
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { BUSINESS_INFO } from '../../utils/constants';

interface AdminSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
    pendingCount?: number;
}

const NAV_ITEMS = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Visão Central' },
    { path: '/dashboard/agenda', icon: Calendar, label: 'Histórico & Pesquisa' },
    { path: '/dashboard/clientes', icon: Users, label: 'Base VIP' },
    { path: '/dashboard/bloqueios', icon: Lock, label: 'Bloqueios' },
    { path: '/dashboard/configuracoes', icon: Settings, label: 'Configurações' },
    { path: '/dashboard/relatorios', icon: BarChart3, label: 'Estatísticas' },
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({
    isOpen, onClose, isCollapsed, onToggleCollapse, pendingCount = 0
}) => {
    const { logout, user } = useAuth();
    const location = useLocation();
    const diretorNome = user?.email ? user.email.split('@')[0] : 'Diretor';

    const sidebarContent = (
        <div className="flex flex-col h-full bg-[#0a0a0a] border-r border-white/5">

            {/* Logo / Brand */}
            <div className="p-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-braz-gold/10 flex items-center justify-center">
                        <Crown className="text-braz-gold" size={20} strokeWidth={1.5} />
                    </div>
                    {!isCollapsed && (
                        <div>
                            <h2 className="text-sm font-black text-white uppercase tracking-wider">{BUSINESS_INFO.name}</h2>
                            <p className="text-[9px] text-white/30 uppercase tracking-widest">Painel de Gestão</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map(item => {
                    const isActive = location.pathname === item.path ||
                        (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                    const isExactDashboard = item.path === '/dashboard' && location.pathname === '/dashboard';
                    const active = isActive || isExactDashboard;

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={onClose}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group ${active
                                ? 'bg-braz-gold/10 text-braz-gold border border-braz-gold/20'
                                : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'
                                }`}
                        >
                            <item.icon size={18} className={active ? 'text-braz-gold' : 'text-white/30 group-hover:text-white/60'} strokeWidth={1.5} />
                            {!isCollapsed && (
                                <>
                                    <span className="flex-1">{item.label}</span>
                                    {item.label === 'Dashboard' && pendingCount > 0 && (
                                        <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full min-w-[20px] text-center">
                                            {pendingCount}
                                        </span>
                                    )}
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {/* User / Logout */}
            <div className="p-4 border-t border-white/5">
                {!isCollapsed && (
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-braz-gold/20 flex items-center justify-center text-braz-gold text-xs font-black uppercase">
                            {diretorNome.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate capitalize">{diretorNome}</p>
                            <p className="text-[9px] text-white/30 truncate">{user?.email}</p>
                        </div>
                    </div>
                )}
                <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm font-semibold"
                >
                    <LogOut size={18} strokeWidth={1.5} />
                    {!isCollapsed && <span>Sair</span>}
                </button>
            </div>

            {/* Collapse toggle (desktop only) */}
            <button
                onClick={onToggleCollapse}
                className="hidden lg:flex items-center justify-center py-3 border-t border-white/5 text-white/20 hover:text-white/60 transition-colors"
            >
                <ChevronLeft size={16} className={`transition-transform ${isCollapsed ? 'rotate-180' : ''}`} strokeWidth={1.5} />
            </button>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className={`hidden lg:block fixed top-0 left-0 h-screen z-40 transition-all duration-300 ${isCollapsed ? 'w-[72px]' : 'w-64'
                }`}>
                {sidebarContent}
            </aside>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        />
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="lg:hidden fixed top-0 left-0 w-64 h-screen z-50"
                        >
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 text-white/40 hover:text-white z-10"
                            >
                                <X size={20} strokeWidth={1.5} />
                            </button>
                            {sidebarContent}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default AdminSidebar;
