import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, Loader2 } from 'lucide-react';
import { loginDirector } from '../services/authService';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await loginDirector(email, password);
      window.location.href = '/dashboard'; // Redireciona para a área de gestão
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-braz-black flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-[#121212] p-10 rounded-3xl border border-white/5 shadow-2xl"
      >
        <div className="text-center mb-10">
          <div className="inline-flex p-4 bg-braz-pink/10 rounded-2xl mb-4">
            <Lock className="text-braz-pink" size={32} />
          </div>
          <h2 className="text-2xl font-montserrat font-bold text-white uppercase tracking-tighter">
            Acesso do Diretor
          </h2>
          <p className="text-white/40 text-sm mt-2 font-montserrat uppercase tracking-widest">
            Autenticação Soberana
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Email de Elite</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 pl-12 bg-white/5 rounded-xl text-white outline-none border border-white/5 focus:border-braz-pink transition-all"
                required 
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Chave Mestre</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 pl-12 bg-white/5 rounded-xl text-white outline-none border border-white/5 focus:border-braz-pink transition-all"
                required 
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-xs text-center">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-braz-pink text-black py-5 rounded-xl font-bold uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Entrar na Fortaleza'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;