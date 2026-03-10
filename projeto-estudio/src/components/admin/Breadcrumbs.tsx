import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';

const Breadcrumbs: React.FC = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    // Mapeamento de nomes amigáveis
    const routeLabels: { [key: string]: string } = {
        dashboard: 'Gestão',
        agenda: 'Agenda',
        staff: 'Equipa',
        contabilidade: 'Caixa & Faturas',
        relatorios: 'Análise de Performance',
        vips: 'Base de Clientes VIP',
        settings: 'Configurações',
        perfil: 'Meu Perfil'
    };

    if (pathnames.length <= 1) return null;

    return (
        <nav className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-6">
            <Link 
                to="/dashboard" 
                className="hover:text-braz-gold transition-colors flex items-center gap-1 group"
            >
                <Home size={12} className="group-hover:scale-110 transition-transform" />
                <span>Início</span>
            </Link>

            {pathnames.map((value, index) => {
                const isLast = index === pathnames.length - 1;
                const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                const label = routeLabels[value] || value.charAt(0).toUpperCase() + value.slice(1);

                return (
                    <React.Fragment key={to}>
                        <ChevronRight size={10} className="text-white/10" />
                        {isLast ? (
                            <motion.span 
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-braz-gold font-black"
                            >
                                {label}
                            </motion.span>
                        ) : (
                            <Link 
                                to={to} 
                                className="hover:text-white/60 transition-colors"
                            >
                                {label}
                            </Link>
                        )}
                    </React.Fragment>
                );
            })}
        </nav>
    );
};

export default Breadcrumbs;
