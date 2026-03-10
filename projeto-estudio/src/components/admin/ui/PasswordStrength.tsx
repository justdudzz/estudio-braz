import React from 'react';
import { motion } from 'framer-motion';

interface PasswordStrengthProps {
    password?: string;
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password = '' }) => {
    const getStrength = (p: string) => {
        if (!p) return { score: 0, label: '', color: 'bg-white/10' };
        let score = 0;
        if (p.length > 8) score++;
        if (/[A-Z]/.test(p)) score++;
        if (/[0-9]/.test(p)) score++;
        if (/[^A-Za-z0-9]/.test(p)) score++;

        if (score <= 1) return { score: 25, label: 'Fraca', color: 'bg-red-500' };
        if (score === 2) return { score: 50, label: 'Média', color: 'bg-yellow-500' };
        if (score === 3) return { score: 75, label: 'Forte', color: 'bg-emerald-500' };
        return { score: 100, label: 'Elite', color: 'bg-braz-gold' };
    };

    const strength = getStrength(password);

    if (!password) return null;

    return (
        <div className="space-y-1.5 mt-2 px-2">
            <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest">
                <span className="text-white/30">Segurança da Password</span>
                <span className={strength.label === 'Fraca' ? 'text-red-400' : strength.label === 'Média' ? 'text-yellow-400' : 'text-emerald-400'}>
                    {strength.label}
                </span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${strength.score}%` }}
                    className={`h-full ${strength.color} shadow-[0_0_10px_rgba(0,0,0,0.5)]`}
                />
            </div>
        </div>
    );
};

export default PasswordStrength;
