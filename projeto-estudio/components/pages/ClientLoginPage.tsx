import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../src/services/api';

const ClientLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/client/login', { email, password });
      login(response.data);
      window.location.href = '/vip';
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao aceder ao Salão VIP.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6 font-montserrat">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-[#121212] p-10 rounded-[2.5rem] border border-white/5 shadow-2xl"
      >
        <div className="text-center mb-10">
          <div className="inline-flex p-4 bg-braz-pink/10 rounded-2xl mb-6">
            <Sparkles className="text-braz-pink" size={32} />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tighter text-white">Salão VIP</h1>
          <p className="text-white/40 text-xs uppercase tracking-widest mt-2">A sua beleza, recompensada.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Email de Cliente</label>
            <input 
              type="email" 
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-braz-pink/50 outline-none transition-all mt-2"
              placeholder="exemplo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Chave de Acesso</label>
            <input 
              type="password" 
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-braz-pink/50 outline-none transition-all mt-2"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-red-500 text-xs text-center font-medium">{error}</p>}

          <button 
            type="submit"
            className="w-full bg-white text-black font-bold py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-braz-pink hover:text-white transition-all group"
          >
            ENTRAR NO CLUBE <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <p className="text-center text-white/20 text-[10px] mt-10 uppercase tracking-widest leading-relaxed">
          Acesso exclusivo para clientes registadas no Studio Braz.
        </p>
      </motion.div>
    </div>
  );
};

export default ClientLoginPage;