import React from 'react';
import { motion } from 'framer-motion';
import { Users, Sparkles, Award, Clock } from 'lucide-react';

const stats = [
    {
        icon: <Users className="w-8 h-8 md:w-10 md:h-10 text-braz-gold mb-4" strokeWidth={1.5} />,
        value: "2000+",
        label: "Clientes Satisfeitas",
    },
    {
        icon: <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-braz-gold mb-4" strokeWidth={1.5} />,
        value: "5000+",
        label: "Tratamentos Realizados",
    },
    {
        icon: <Award className="w-8 h-8 md:w-10 md:h-10 text-braz-gold mb-4" strokeWidth={1.5} />,
        value: "5",
        label: "Estrelas no Google",
    },
    {
        icon: <Clock className="w-8 h-8 md:w-10 md:h-10 text-braz-gold mb-4" strokeWidth={1.5} />,
        value: "4+",
        label: "Anos de Experiência",
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const StatsBar: React.FC = () => {
    return (
        <section className="py-20 bg-[#050505] border-y border-white/5 relative z-10 font-montserrat">
            <div className="container mx-auto px-6">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4"
                >
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            className="flex flex-col items-center text-center p-6 rounded-3xl hover:bg-white/5 transition-colors group"
                        >
                            <motion.div
                                whileTap={{ scale: 0.9 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                {stat.icon}
                            </motion.div>
                            <h3 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-2 group-hover:text-braz-gold transition-colors">
                                {stat.value}
                            </h3>
                            <p className="text-[10px] md:text-xs text-white/50 uppercase tracking-[0.2em] font-bold">
                                {stat.label}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default StatsBar;
