import prisma from '../config/prisma.js';
import logger from '../utils/logger.js';
import bcrypt from 'bcryptjs';
async function seedServices() {
    logger.info('🌱 SEEDING SERVICES AND STAFF RELATIONSHIPS...');
    const servicesData = [
        { name: 'MICRO_BRAZ', label: 'Microblading Elite', duration: 120, price: 250, category: 'Sobrancelhas' },
        { name: 'LIMPEZA_BRONZE', label: 'Limpeza de Pele Profunda', duration: 60, price: 60, category: 'Estética' },
        { name: 'UNHAS_GEL', label: 'Unhas de Gel (Manutenção)', duration: 90, price: 35, category: 'Unhas' },
        { name: 'PIERCING_LUXO', label: 'Piercing Avançado', duration: 30, price: 50, category: 'Piercing' },
        { name: 'TATTOO_FINE_LINE', label: 'Tatuagem Fine Line', duration: 180, price: 150, category: 'Tattoo' }
    ];
    try {
        // 1. Create Services
        const createdServices = [];
        for (const s of servicesData) {
            const service = await prisma.service.upsert({
                where: { name: s.name },
                update: s,
                create: s
            });
            createdServices.push(service);
        }
        // 2. Clear existing staff (except admin) for a clean test
        const hashedPassword = await bcrypt.hash('PasswordElite123!', 12);
        const staffData = [
            {
                email: 'lara@studiobraz.com',
                displayName: 'Lara Santos',
                photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200',
                role: 'ADMIN_STAFF'
            },
            {
                email: 'gabriela@studiobraz.com',
                displayName: 'Gabriela M.',
                photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
                role: 'ADMIN_STAFF'
            }
        ];
        for (const staff of staffData) {
            const user = await prisma.user.upsert({
                where: { email: staff.email },
                update: {
                    displayName: staff.displayName,
                    photoUrl: staff.photoUrl
                },
                create: {
                    email: staff.email,
                    password: hashedPassword,
                    role: staff.role,
                    displayName: staff.displayName,
                    photoUrl: staff.photoUrl
                }
            });
            // Link to some initial services
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    providedServices: {
                        connect: createdServices.slice(0, 3).map(s => ({ id: s.id }))
                    }
                }
            });
        }
        // 3. Link Mariana to everything
        const mariana = await prisma.user.findUnique({ where: { email: 'admin@studiobraz.com' } });
        if (mariana) {
            await prisma.user.update({
                where: { id: mariana.id },
                data: {
                    providedServices: {
                        connect: createdServices.map(s => ({ id: s.id }))
                    }
                }
            });
        }
        logger.info('🚀 SEEDING COMPLETED SUCCESSFULLY.');
        process.exit(0);
    }
    catch (error) {
        logger.error('❌ SEEDING FAILED:', error);
        process.exit(1);
    }
}
seedServices();
