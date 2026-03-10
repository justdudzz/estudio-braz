import React from 'react';
import { motion } from 'framer-motion';
import { Shield, LayoutDashboard, LogOut, Edit, Eye, User, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminToolbar: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();

  if (!user || user.role === 'CLIENT') return null;

  const isPublicSite = !location.pathname.startsWith('/dashboard');

  return (
    <motion.div 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 w-full z-[1000] bg-black/95 backdrop-blur-xl border-b border-braz-gold/20 h-14 flex items-center px-4 md:px-8 justify-between shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-braz-gold/10 px-3 py-1.5 rounded-full border border-braz-gold/20">
          <Shield size={14} className="text-braz-gold" />
          <span className="text-[10px] font-black uppercase tracking-widest text-braz-gold">
            {isAdmin ? 'Modo Diretora' : 'Modo Equipa'}
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-1">
          <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Olá,</span>
          <span className="text-[10px] text-white font-black uppercase tracking-widest">{user.displayName || user.email.split('@')[0]}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {isPublicSite ? (
           <Link 
             to="/dashboard" 
             className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-braz-gold transition-all bg-white/5 px-4 py-2 rounded-lg border border-white/5 hover:border-braz-gold/20"
           >
             <LayoutDashboard size={14} />
             PAINEL ADMINISTRATIVO
           </Link>
        ) : (
          <Link 
            to="/" 
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-braz-gold transition-all bg-white/5 px-4 py-2 rounded-lg border border-white/5 hover:border-braz-gold/20"
          >
            <Eye size={14} />
            VER SITE PÚBLICO
          </Link>
        )}

        <div className="w-[1px] h-6 bg-white/10 mx-1" />

        <button 
          onClick={() => {
            if (window.confirm('⚠️ DESEJA MESMO SAIR?\nA sua sessão será encerrada e precisará de novos acessos para entrar no painel.')) {
              logout();
            }
          }}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500/60 hover:text-red-500 transition-all hover:bg-red-500/5 px-4 py-2 rounded-lg"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">SAIR</span>
        </button>
      </div>
    </motion.div>
  );
};

export default AdminToolbar;
