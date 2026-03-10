import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';
async function seed() {
    const password = process.env.ADMIN_SEED_PASSWORD || 'StudioBraz2026!';
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('🌱 Começando o Seeding de Elite...');
    // 1. Criar Utilizadores (Staff)
    const mariana = await prisma.user.upsert({
        where: { email: 'mariana@studiobraz.com' },
        update: {},
        create: {
            email: 'mariana@studiobraz.com',
            password: hashedPassword,
            role: 'SUPER_ADMIN',
            legalName: 'Mariana Braz Unipessoal Lda',
            nif: '254123456',
            address: 'Rua do Estúdio, 123, Lisboa',
            phone: '912345678'
        }
    });
    const tatuadora = await prisma.user.upsert({
        where: { email: 'tatuadora@studiobraz.com' },
        update: {},
        create: {
            email: 'tatuadora@studiobraz.com',
            password: hashedPassword,
            role: 'ADMIN_STAFF',
            legalName: 'Ana Silva (Tatuagens de Elite)',
            nif: '265987654',
            phone: '921456789'
        }
    });
    const esteticista = await prisma.user.upsert({
        where: { email: 'admin1@studiobraz.com' },
        update: {},
        create: {
            email: 'admin1@studiobraz.com',
            password: hashedPassword,
            role: 'ADMIN_STAFF',
            legalName: 'Carla Santos Estética',
            nif: '231789456',
            phone: '931741852'
        }
    });
    console.log('✅ Staff criado.');
    // 2. Criar Serviços e associar ao Staff
    const servicesData = [
        { name: 'Microblading', label: 'Microblading', duration: 150, price: 250, staffEmails: ['mariana@studiobraz.com'] },
        { name: 'Unhas de Gel', label: 'Unhas de Gel', duration: 90, price: 35, staffEmails: ['mariana@studiobraz.com', 'admin1@studiobraz.com'] },
        { name: 'Tatuagem Fine Line', label: 'Tatuagem Fine Line', duration: 120, price: 100, staffEmails: ['tatuadora@studiobraz.com'] },
        { name: 'Limpeza de Pele', label: 'Limpeza de Pele', duration: 90, price: 60, staffEmails: ['admin1@studiobraz.com'] },
        { name: 'Verniz Gel', label: 'Verniz Gel', duration: 45, price: 20, staffEmails: ['mariana@studiobraz.com', 'admin1@studiobraz.com'] },
    ];
    for (const s of servicesData) {
        await prisma.service.upsert({
            where: { name: s.name },
            update: {
                staff: {
                    connect: s.staffEmails.map(email => ({ email }))
                }
            },
            create: {
                name: s.name,
                label: s.label,
                duration: s.duration,
                price: s.price,
                staff: {
                    connect: s.staffEmails.map(email => ({ email }))
                }
            }
        });
    }
    console.log('✅ Serviços e atribuições concluídos.');
    console.log('🚀 Seeding finalizado com sucesso!');
}
seed()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
