import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift } from 'lucide-react';
import GiftCards from '../sections/GiftCards';
import { BUSINESS_INFO } from '../../utils/constants';

const GiftCardsPage: React.FC = () => {
    useEffect(() => { document.title = `Cartões Presente | ${BUSINESS_INFO.name}`; }, []);

    return (
        <>
            {/* Hero */}
            <section className="pt-[112px] pb-8 bg-gradient-to-b from-[#0A0A0A] to-[#080808]">
                <div className="container mx-auto px-6 text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <Gift className="text-braz-gold mx-auto mb-4" size={28} strokeWidth={1.5} />
                        <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">Cartões Presente</h1>
                        <p className="text-white/40 text-sm max-w-lg mx-auto">
                            Ofereça uma experiência de luxo a quem mais gosta. O presente perfeito para qualquer ocasião.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Gift Cards Component */}
            <GiftCards />
        </>
    );
};

export default GiftCardsPage;
