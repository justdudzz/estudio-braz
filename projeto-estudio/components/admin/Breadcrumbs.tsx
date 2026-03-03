import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, LayoutDashboard } from 'lucide-react';

const ROUTE_LABELS: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/dashboard/agenda': 'Agenda',
    '/dashboard/clientes': 'Clientes VIP',
    '/dashboard/bloqueios': 'Bloqueios',
    '/dashboard/configuracoes': 'Configurações',
    '/dashboard/relatorios': 'Relatórios',
};

const Breadcrumbs: React.FC = () => {
    const location = useLocation();
    const pathSegments = location.pathname.split('/').filter(Boolean);

    // Build breadcrumb items
    const crumbs: { label: string; path: string }[] = [];
    let currentPath = '';

    for (const segment of pathSegments) {
        currentPath += `/${segment}`;
        const label = ROUTE_LABELS[currentPath];
        if (label) {
            crumbs.push({ label, path: currentPath });
        }
    }

    if (crumbs.length <= 1) return null; // Don't show breadcrumbs on dashboard home

    return (
        <nav className="flex items-center gap-2 text-xs text-white/30 mb-6">
            <Link to="/dashboard" className="flex items-center gap-1 hover:text-white/60 transition-colors">
                <LayoutDashboard size={12} />
                <span>Dashboard</span>
            </Link>
            {crumbs.slice(1).map((crumb, i) => (
                <React.Fragment key={crumb.path}>
                    <ChevronRight size={12} className="text-white/15" />
                    <Link
                        to={crumb.path}
                        className={`hover:text-white/60 transition-colors ${i === crumbs.length - 2 ? 'text-braz-gold font-semibold' : ''
                            }`}
                    >
                        {crumb.label}
                    </Link>
                </React.Fragment>
            ))}
        </nav>
    );
};

export default Breadcrumbs;
