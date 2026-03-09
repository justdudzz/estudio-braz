import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Star, Sparkles, ArrowRight, Plus, Package } from 'lucide-react';
import { BUSINESS_INFO } from '../../utils/constants';
import { useAuth } from '../../contexts/AuthContext';

const products = [
  { id: 1, name: 'Perfume Luxury Gold', category: 'Chogan Perfumaria', price: '30.00€', image: '/assets/boutique/perfume1.png', stock: 12 },
  { id: 2, name: 'Creme de Rosto Bio', category: 'Cuidados de Pele', price: '25.00€', image: '/assets/boutique/creme1.png', stock: 5 },
  { id: 3, name: 'Óleo de Argan Puro', category: 'Cabelo', price: '18.00€', image: '/assets/boutique/oleo1.png', stock: 0 },
  { id: 4, name: 'Sérum Anti-Aging', category: 'Chogan Beauty', price: '45.00€', image: '/assets/boutique/serum1.png', stock: 8 },
];

const BoutiquePage: React.FC = () => {
    const { isAdmin } = useAuth();
    useEffect(() => { document.title = `Boutique Chogan | ${BUSINESS_INFO.name}`; }, []);

    return (
        <div className="bg-[#050505] min-h-screen">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-braz-gold/5 to-transparent pointer-events-none" />
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-braz-gold/10 border border-braz-gold/20 mb-6">
                        <Star size={14} className="text-braz-gold" />
                        <span className="text-braz-gold text-[10px] font-black uppercase tracking-[0.3em]">Exclusividade Chogan</span>
                    </motion.div>
                    <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-8xl font-montserrat font-black text-white uppercase tracking-tighter mb-8 italic">
                        The Boutique
                    </motion.h1>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-white/40 text-sm md:text-lg max-w-2xl mx-auto font-medium leading-relaxed uppercase tracking-widest mb-10">
                        Uma curadoria de produtos de qualidade, selecionados pessoalmente pela Mariana para prolongar a sua experiência de beleza em casa.
                    </motion.p>

                    {isAdmin && (
                        <div className="flex justify-center gap-4">
                            <button className="bg-braz-gold text-black px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-white transition-all">
                                <Plus size={14} /> Adicionar Produto
                            </button>
                            <button className="bg-white/5 border border-white/10 text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-white/10 transition-all">
                                <Package size={14} /> Gerir Stock
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* Products Grid */}
            <section className="pb-32 container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.map((h, i) => (
                        <motion.div 
                          key={h.id} 
                          initial={{ opacity: 0, y: 30 }} 
                          animate={{ opacity: 1, y: 0 }} 
                          transition={{ delay: i * 0.1 }}
                          className="group relative"
                        >
                            <div className="aspect-[3/4] rounded-[2rem] overflow-hidden bg-[#121212] border border-white/5 transition-all duration-700 group-hover:border-braz-gold/30">
                                <div className="absolute inset-0 bg-braz-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                <div className="w-full h-full flex items-center justify-center p-12">
                                    {/* Placeholder para imagem real */}
                                    <div className="w-full h-full border border-dashed border-white/10 rounded-2xl flex items-center justify-center relative overflow-hidden">
                                        <ShoppingBag size={48} className="text-white/5 opacity-20 group-hover:opacity-100 transition-opacity group-hover:text-braz-gold/20" />
                                        <div className="absolute bottom-4 right-4 animate-pulse">
                                           <Sparkles size={16} className="text-braz-gold/40" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 space-y-2">
                                <p className="text-[10px] font-black text-braz-gold uppercase tracking-[0.2em]">{h.category}</p>
                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <h3 className="text-white text-lg font-bold uppercase tracking-tight">{h.name}</h3>
                                        <p className={`text-[9px] font-bold uppercase tracking-widest ${h.stock > 0 ? 'text-green-500/60' : 'text-red-500/60'}`}>
                                            {h.stock > 0 ? `Em Stock: ${h.stock}` : 'Esgotado'}
                                        </p>
                                    </div>
                                    <p className="text-white font-black text-xl">{h.price}</p>
                                </div>
                                <button className="w-full mt-4 bg-white/5 border border-white/5 py-4 rounded-xl text-white text-[10px] font-black uppercase tracking-widest hover:bg-braz-gold hover:text-black hover:border-braz-gold transition-all flex items-center justify-center gap-2 group-hover:shadow-[0_0_20px_rgba(197,160,89,0.1)]">
                                    Pedir Informações <ArrowRight size={12} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-20 p-12 bg-braz-gold/5 rounded-[3rem] border border-braz-gold/10 text-center max-w-4xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter mb-4">Interessada nos produtos Chogan?</h2>
                    <p className="text-white/50 text-sm mb-8">Todos os produtos estão disponíveis para compra direta no Studio ou via encomenda personalizada.</p>
                    <a href={`https://wa.me/${BUSINESS_INFO.whatsapp}?text=${encodeURIComponent('Olá Mariana! Gostaria de saber mais sobre os produtos Chogan disponíveis no Studio Braz.')}`} target="_blank" rel="noopener noreferrer" className="bg-braz-gold text-black px-10 py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] hover:scale-105 transition-transform shadow-xl shadow-braz-gold/20 inline-block">
                        Falar com a Mariana no WhatsApp
                    </a>
                </div>
            </section>
        </div>
    );
};

export default BoutiquePage;
