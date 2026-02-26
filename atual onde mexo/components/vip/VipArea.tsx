import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async'; // Importação do Helmet
import { motion, AnimatePresence } from 'framer-motion';
import { User, Star, Gift, ShieldCheck, Lock, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { sanitizeInput, validateEmail, checkRateLimit } from '../../utils/security';
import { BUSINESS_INFO } from '../../utils/constants';
import { useAuth } from '../../contexts/AuthContext';

const VipArea: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { user, login, logout, isAuthenticated } = useAuth();

  // Redirecionar Admin se tentar aceder à área de cliente
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      navigate('/admin');
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Segurança: Rate limiting
    if (!checkRateLimit('vip_login', 5)) {
      setError('Muitas tentativas. Por favor, tente novamente mais tarde.');
      return;
    }

    const sanitizedEmail = sanitizeInput(email);
    if (!validateEmail(sanitizedEmail)) {
      setError('Por favor, insira um endereço de email válido.');
      return;
    }

    setIsLoading(true);
    try {
      // Simulação de chamada de API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Lógica de demonstração (Mock)
      if (sanitizedEmail === 'maria.antunes@example.com') {
        login({
          id: '101',
          email: sanitizedEmail,
          name: 'Maria Antunes',
          role: 'client'
        });
      } else if (sanitizedEmail === 'admin@estudiobraz.pt') {
        login({
          id: '000',
          email: sanitizedEmail,
          name: BUSINESS_INFO.owner,
          role: 'admin'
        });
      } else {
        setError('Acesso não autorizado. Verifique se o email está registado no estúdio.');
      }
    } catch (err) {
      setError('Ocorreu um erro de sistema. Por favor, contacte o suporte.');
    } finally {
      setIsLoading(false);
    }
  };

  // Dados VIP temporários (Mock)
  const mockVipDetails = {
    points: 750,
    nextReward: 'Voucher 20€',
    history: [
      { service: 'Limpeza de Pele Profunda', date: '2024-03-10', pts: 150 },
      { service: 'Unhas de Gel (Manutenção)', date: '2024-02-28', pts: 100 }
    ]
  };

  return (
    <div className="min-h-screen bg-braz-black pt-32 pb-16 px-8">
      
      {/* Gestão de Meta Tags: Área Privada (NoIndex) */}
      <Helmet>
        <title>Área de Cliente VIP | {BUSINESS_INFO.name}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="container mx-auto max-w-4xl">
        
        {/* Cabeçalho da Área VIP */}
        <motion.div 
            className="text-center mb-12" 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center space-x-2 bg-braz-pink/10 px-4 py-2 rounded-full mb-6 border border-braz-pink/20">
            <ShieldCheck className="w-4 h-4 text-braz-pink" />
            <span className="text-braz-pink text-xs font-bold tracking-widest uppercase">Acesso Seguro SSL</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold mb-4 text-white uppercase tracking-tighter">
            Área do <span className="text-braz-pink">Cliente</span>
          </h1>
          <p className="text-white/50 font-montserrat">Consulte os seus pontos e benefícios exclusivos no {BUSINESS_INFO.name}.</p>
        </motion.div>

        {!isAuthenticated || !user ? (
          /* Formulário de Login VIP */
          <motion.div 
            className="bg-[#171717] p-10 rounded-2xl border border-white/5 max-w-md mx-auto shadow-2xl"
            initial={{ y: 20, opacity: 0 }} 
            animate={{ opacity: 1, y: 0 }}
          >
            <form onSubmit={handleLogin} className="space-y-6">
              <Input 
                id="vip-email" 
                label="Email de Registo" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="exemplo@email.com"
                className="bg-braz-black border-white/10 text-white focus:border-braz-pink"
              />
              
              <AnimatePresence>
                {error && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-red-400 text-xs bg-red-400/10 p-3 rounded-lg border border-red-400/20"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <Button 
                type="submit" 
                variant="primary" 
                className="w-full bg-braz-pink text-braz-black font-bold uppercase py-4" 
                disabled={isLoading}
              >
                {isLoading ? 'A autenticar...' : 'Entrar na Área VIP'}
              </Button>
              
              <p className="text-center text-white/30 text-[10px] uppercase tracking-widest flex items-center justify-center space-x-2">
                <Lock className="w-3 h-3" />
                <span>Os seus dados estão encriptados e seguros</span>
              </p>
            </form>
          </motion.div>
        ) : (
          /* Dashboard do Cliente VIP */
          <AnimatePresence>
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, scale: 0.98 }} 
              animate={{ opacity: 1, scale: 1 }}
            >
              {/* Cartões de Estatísticas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#171717] p-8 rounded-2xl border border-white/5 text-center shadow-xl">
                  <User className="w-10 h-10 text-braz-pink mx-auto mb-4" />
                  <h3 className="text-white/40 text-xs uppercase tracking-widest mb-1">Cliente VIP</h3>
                  <p className="text-2xl font-bold text-white">{user.name}</p>
                </div>
                <div className="bg-[#171717] p-8 rounded-2xl border border-white/5 text-center shadow-xl">
                  <Star className="w-10 h-10 text-braz-pink mx-auto mb-4" />
                  <h3 className="text-white/40 text-xs uppercase tracking-widest mb-1">Pontos Fidelidade</h3>
                  <p className="text-4xl font-bold text-white">{mockVipDetails.points}</p>
                </div>
                <div className="bg-[#171717] p-8 rounded-2xl border border-white/5 text-center shadow-xl">
                  <Gift className="w-10 h-10 text-braz-pink mx-auto mb-4" />
                  <h3 className="text-white/40 text-xs uppercase tracking-widest mb-1">Próxima Oferta</h3>
                  <p className="text-xl font-bold text-braz-pink">{mockVipDetails.nextReward}</p>
                </div>
              </div>

              {/* Histórico de Visitas */}
              <div className="bg-[#171717] p-8 rounded-2xl border border-white/5 shadow-xl">
                <h3 className="text-2xl font-bold mb-8 text-white flex items-center">
                    <span className="w-2 h-2 bg-braz-pink rounded-full mr-3" />
                    Histórico de Visitas
                </h3>
                <div className="space-y-4">
                  {mockVipDetails.history.map((item, i) => (
                    <div key={i} className="flex justify-between items-center border-b border-white/5 pb-4 last:border-0 last:pb-0">
                      <div>
                        <p className="font-bold text-white">{item.service}</p>
                        <p className="text-xs text-white/40 uppercase tracking-wider">{item.date}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-braz-pink font-bold">+{item.pts} pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Botão de Logout Global */}
              <div className="text-center">
                <button 
                    onClick={logout}
                    className="inline-flex items-center space-x-2 text-white/30 hover:text-braz-pink transition-colors uppercase text-xs font-bold tracking-widest outline-none focus:ring-2 focus:ring-braz-pink p-2 rounded"
                >
                    <LogOut size={16} />
                    <span>Sair com Segurança</span>
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default VipArea;