import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import Breadcrumbs from './Breadcrumbs';
import NotificationBell from './NotificationBell';

interface AdminLayoutProps {
    pendingCount?: number;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ pendingCount = 0 }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-braz-black text-white font-montserrat">
            {/* Sidebar */}
            <AdminSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                isCollapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
                pendingCount={pendingCount}
            />

            {/* Main Content */}
            <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-64'
                }`}>
                {/* Top bar (mobile) */}
                <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0a0a0a] border-b border-white/5 sticky top-0 z-30">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                        <Menu size={22} className="text-white/60" />
                    </button>
                    <span className="text-xs font-black text-white/40 uppercase tracking-widest">Painel Admin</span>
                    <NotificationBell />
                </header>

                {/* Page Content */}
                <main className="p-4 md:p-8 lg:p-10 max-w-7xl">
                    <Breadcrumbs />
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
