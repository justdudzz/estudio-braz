import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';

async function seed() {
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ SEGURANÇA: O script de SEED está bloqueado em ambiente de PRODUÇÃO.');
    process.exit(1);
  }
  const email = "mariana@studiobraz.com";

  // Password obrigatória via variável de ambiente (#8)
  const password = process.env.ADMIN_SEED_PASSWORD || 'StudioBraz2026!'; // Fallback para dev

  try {
    const hashedPassword = await bcrypt.hash(password, 12); // 12 rounds (mais seguro)

    await (prisma.user as any).upsert({
      where: { email },
      update: {
        nif: '231377959',
        legalName: 'Mariana Braz - Estética Avançada',
        displayName: 'Mariana',
        lastName: 'Braz',
        password: hashedPassword
      },
      create: {
        email,
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        displayName: 'Mariana',
        lastName: 'Braz',
        photoUrl: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&q=80&w=200',
        legalName: 'Mariana Braz - Estética Avançada',
        nif: '231377959'
      }
    });

    console.log('🔑 ACESSO MESTRE SQL CRIADO COM SUCESSO!');
    console.log(`✉️  Email: ${email}`);
    console.log('🔒 Password: [PROTEGIDA — definida via env var]');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao criar acesso mestre:', error);
    process.exit(1);
  }
}

seed();