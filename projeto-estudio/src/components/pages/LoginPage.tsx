import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Para navegação veloz
import { useAuth } from '../../contexts/AuthContext'; // O cérebro da autenticação
import { loginDirector } from '../../services/authService';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
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
      const data = await loginDirector(email, password, requires2FA ? twoFactorCode : undefined);

      // 2. Interceta se o 2FA for exigido pela conta
      if (data.requires2FA) {
        setRequires2FA(true);
        setLoading(false);
        return;
      }

      // 3. AVISA O CONTEXTO (Importante!)
      login(data);

      // 3. Redireciona via React Router (sem refresh de página)
      navigate('/dashboard');

    } catch (err: any) {
      // Captura a mensagem de erro vinda do servidor ou erro de rede
      const message = err.response?.data?.message || 'Falha na ligação ao servidor.';
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
          <div className="inline-flex p-4 bg-braz-gold/10 rounded-2xl mb-4">
            <Lock className="text-braz-gold" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-tighter">
            Área Reservada
          </h2>
          <p className="text-white/40 text-[10px] mt-2 uppercase tracking-[0.3em]">
            Equipa Studio Braz
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {!requires2FA ? (
            <>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="diretor@studiobraz.com"
                    className="w-full p-4 pl-12 bg-white/5 rounded-xl text-white outline-none border border-white/5 focus:border-braz-gold/50 transition-all placeholder:text-white/10 text-[16px]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">Palavra-passe</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-4 pl-12 bg-white/5 rounded-xl text-white outline-none border border-white/5 focus:border-braz-gold/50 transition-all placeholder:text-white/10 text-[16px]"
                    required
                  />
                </div>
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-2"
            >
              <label className="block text-[10px] font-bold text-braz-gold uppercase tracking-widest ml-1 text-center">Código de Segurança (2FA)</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-braz-gold" size={18} />
                <input
                  type="text"
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full p-4 pl-12 bg-white/5 rounded-xl text-white outline-none border border-white/20 focus:border-braz-gold transition-all placeholder:text-white/10 text-center text-2xl tracking-[0.5em] font-mono !text-white"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'white' }}
                  required
                />
              </div>
              <p className="text-center text-[10px] text-white/40 mt-3 mix-blend-screen">
                Abra a sua aplicação Authenticator no telemóvel e introduza o código de 6 dígitos.
              </p>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-red-400 text-[11px] text-center font-bold uppercase tracking-wider"
            >
              {error}
            </motion.div>
          )}

          <motion.button
            whileTap={{ scale: 0.98, opacity: 0.9 }}
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black py-5 rounded-xl font-black uppercase tracking-[0.2em] hover:bg-braz-gold hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'ENTRAR NO PAINEL'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;
