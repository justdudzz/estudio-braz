import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Para navegação veloz
import { useAuth } from '../../contexts/AuthContext'; // O cérebro da autenticação
import { loginDirector } from '../../src/services/authService';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { login } = useAuth(); // Função que espalha o estado de "logado" pelo site

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Faz a chamada ao servidor
      const data = await loginDirector(email, password);
      
      // 2. AVISA O CONTEXTO (Importante!)
      // Isso salva o token no localStorage e muda o estado global para 'logado'
      login(data); 

      // 3. Redireciona via React Router (sem refresh de página)
      navigate('/dashboard'); 
      
    } catch (err: any) {
      // Captura a mensagem de erro vinda do servidor ou erro de rede
      const message = err.response?.data?.message || 'Falha na conexão com a fortaleza.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-braz-black flex items-center justify-center p-6 font-montserrat">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-[#121212] p-10 rounded-3xl border border-white/5 shadow-2xl"
      >
        <div className="text-center mb-10">
          <div className="inline-flex p-4 bg-braz-pink/10 rounded-2xl mb-4">
            <Lock className="text-braz-pink" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-tighter">
            Acesso do Diretor
          </h2>
          <p className="text-white/40 text-[10px] mt-2 uppercase tracking-[0.3em]">
            Autenticação Soberana
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">Email de Elite</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="diretor@studiobraz.com"
                className="w-full p-4 pl-12 bg-white/5 rounded-xl text-white outline-none border border-white/5 focus:border-braz-pink/50 transition-all placeholder:text-white/10"
                required 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">Chave Mestre</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-4 pl-12 bg-white/5 rounded-xl text-white outline-none border border-white/5 focus:border-braz-pink/50 transition-all placeholder:text-white/10"
                required 
              />
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-red-400 text-[11px] text-center font-bold uppercase tracking-wider"
            >
              {error}
            </motion.div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-white text-black py-5 rounded-xl font-black uppercase tracking-[0.2em] hover:bg-braz-pink hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'ENTRAR NA FORTALEZA'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;