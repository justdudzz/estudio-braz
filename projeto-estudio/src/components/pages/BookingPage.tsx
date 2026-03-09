import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import BookingForm from '../sections/BookingForm';
import { BUSINESS_INFO } from '../../utils/constants';

const BookingPage: React.FC = () => {
    useEffect(() => { document.title = `Agendar | ${BUSINESS_INFO.name}`; }, []);

    return (
        <>
            {/* Hero */}
            <section className="pt-12 pb-8 bg-gradient-to-b from-[#0A0A0A] to-[#080808]">
                <div className="container mx-auto px-6 text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <Calendar className="text-braz-gold mx-auto mb-4" size={28} strokeWidth={1.5} />
                        <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">Agende o Seu Momento</h1>
                        <p className="text-white/40 text-sm max-w-lg mx-auto">
                            Preencha os dados abaixo para aceder à agenda e confirmar o seu horário no Studio Braz.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Booking Form */}
            <BookingForm />
        </>
    );
};

export default BookingPage;
